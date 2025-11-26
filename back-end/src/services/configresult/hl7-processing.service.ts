import { ObjectId } from 'mongodb'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import { getTestOrdersCollection, TestResult, getFlaggingConfigCollection, CBCPanelTestName } from '~/models/test-order.model'
import { getInstrumentsCollection } from '~/models/instrument.model'
import { getInstrumentReagentAssignmentCollection } from '~/models/instrument-reagent-assignment.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getUsersCollection } from '~/models/user.model'
import { recordReagentUsageFromTestResults } from '~/services/testorder/test-order.service'

export interface HL7Message {
  messageId: string
  patientId: string
  testResults: HL7TestResult[]
  timestamp: Date
  rawMessage: string
}

export interface HL7TestResult {
  testName: string
  result: string
  unit?: string
  normalRange?: string
  flag?: string
}

export interface ProcessedTestResult extends TestResult {
  hl7MessageId: string
  rawHl7Data: string
  processedData: any
}

// Simulate HL7 message processing with random test results
export function generateRandomHL7TestResults(): HL7TestResult[] {
  // CBC panel aligned with provided ranges
  const commonTests = [
    { name: 'White Blood Cell Count', unit: 'cells/µL', normalRange: '4000-10000' },
    { name: 'Red Blood Cell Count', unit: 'million/µL', normalRange: '4.2-6.1' },
    { name: 'Hemoglobin', unit: 'g/dL', normalRange: '12-18' },
    { name: 'Hematocrit', unit: '%', normalRange: '37-52' },
    { name: 'Platelet Count', unit: 'cells/µL', normalRange: '150000-350000' },
    { name: 'Mean Corpuscular Volume', unit: 'fL', normalRange: '80-100' },
    { name: 'Mean Corpuscular Haemoglobin', unit: 'pg', normalRange: '27-33' },
    { name: 'Mean Corpuscular Haemoglobin Concentration', unit: 'g/dL', normalRange: '32-36' }
  ]

  const results: HL7TestResult[] = []
  
  // Generate 4-8 random test results from the CBC panel  
  const numTests = Math.floor(Math.random() * 5) + 4
  const selectedTests = commonTests.sort(() => 0.5 - Math.random()).slice(0, numTests)
  
  for (const test of selectedTests) {
    let result: string
    let flag: string = ''
    
    // Generate random result based on test type
    if (test.name === 'White Blood Cell Count') {
      const value = Math.floor(Math.random() * (12000 - 3000 + 1)) + 3000 // 3,000-12,000
      result = String(value)
      if (value < 4000) flag = 'L'
      else if (value > 10000) flag = 'H'
    } else if (test.name === 'Red Blood Cell Count') {
      const value = Number((Math.random() * 3 + 3.5).toFixed(1)) // 3.5-6.5 million/µL
      result = String(value)
      if (value < 4.2) flag = 'L'
      else if (value > 6.1) flag = 'H'
    } else if (test.name === 'Hemoglobin') {
      const value = Number((Math.random() * 10 + 10).toFixed(1)) // 10.0-20.0 g/dL
      result = String(value)
      if (value < 12) flag = 'L'
      else if (value > 18) flag = 'H'
    } else if (test.name === 'Hematocrit') {
      const value = Number((Math.random() * 25 + 30).toFixed(1)) // 30-55 %
      result = String(value)
      if (value < 37) flag = 'L'
      else if (value > 52) flag = 'H'
    } else if (test.name === 'Platelet Count') {
      const value = Math.floor(Math.random() * (400000 - 100000 + 1)) + 100000 // 100,000-400,000
      result = String(value)
      if (value < 150000) flag = 'L'
      else if (value > 350000) flag = 'H'
    } else if (test.name === 'Mean Corpuscular Volume') {
      const value = Number((Math.random() * 40 + 70).toFixed(0)) // 70-110 fL
      result = String(value)
      if (value < 80) flag = 'L'
      else if (value > 100) flag = 'H'
    } else if (test.name === 'Mean Corpuscular Haemoglobin') {
      const value = Number((Math.random() * 16 + 20).toFixed(1)) // 20-36 pg
      result = String(value)
      if (value < 27) flag = 'L'
      else if (value > 33) flag = 'H'
    } else if (test.name === 'Mean Corpuscular Haemoglobin Concentration') {
      const value = Number((Math.random() * 10 + 28).toFixed(1)) // 28-38 g/dL
      result = String(value)
      if (value < 32) flag = 'L'
      else if (value > 36) flag = 'H'
    } else {
      // Fallback generic numeric result
      const value = Number((Math.random() * 100 + 10).toFixed(1))
      result = String(value)
      if (Math.random() < 0.1) flag = Math.random() < 0.5 ? 'L' : 'H'
    }
    
    results.push({
      testName: test.name,
      result,
      unit: test.unit,
      normalRange: test.normalRange,
      flag
    })
  }
  
  return results
}

// Generate HL7 results constrained to specific CBC test names
export function generateHL7ResultsForTests(testNames: CBCPanelTestName[]): HL7TestResult[] {
  const all = generateRandomHL7TestResults()
  if (!testNames || testNames.length === 0) return all
  const want = new Set(testNames)
  return all.filter(r => want.has(r.testName as CBCPanelTestName))
}

export async function processHL7Message(message: HL7Message): Promise<ProcessedTestResult[]> {
  const flaggingConfigs = getFlaggingConfigCollection()
  const processedResults: ProcessedTestResult[] = []
  
  for (const hl7Result of message.testResults) {
    // Get flagging configuration for this test
    const config = await flaggingConfigs.findOne({ 
      testName: hl7Result.testName, 
      isActive: true 
    })
    
    // Determine status based on flagging configuration
    let status: 'normal' | 'abnormal' | 'critical' = 'normal'
    let flag = hl7Result.flag || ''
    
    if (config) {
      const numericResult = parseFloat(hl7Result.result)
      if (!isNaN(numericResult)) {
        if (config.criticalRange && 
            ((config.criticalRange.min && numericResult < config.criticalRange.min) ||
             (config.criticalRange.max && numericResult > config.criticalRange.max))) {
          status = 'critical'
          flag = 'CRITICAL'
        } else if (config.abnormalRange && 
                   ((config.abnormalRange.min && numericResult < config.abnormalRange.min) ||
                    (config.abnormalRange.max && numericResult > config.abnormalRange.max))) {
          status = 'abnormal'
          flag = flag || 'ABNORMAL'
        } else if (numericResult >= config.normalRange.min && numericResult <= config.normalRange.max) {
          status = 'normal'
          flag = ''
        } else {
          status = 'abnormal'
          flag = flag || 'ABNORMAL'
        }
      }
    } else {
      // Use HL7 flag if no configuration available
      if (hl7Result.flag === 'H' || hl7Result.flag === 'L') {
        status = 'abnormal'
      } else if (hl7Result.flag === 'CRITICAL') {
        status = 'critical'
      }
    }
    
    const processedResult: ProcessedTestResult = {
      _id: new ObjectId(),
      testName: hl7Result.testName,
      result: hl7Result.result,
      unit: hl7Result.unit,
      normalRange: hl7Result.normalRange,
      status,
      flag,
      hl7MessageId: message.messageId,
      rawHl7Data: message.rawMessage,
      processedData: {
        originalFlag: hl7Result.flag,
        processingTimestamp: new Date(),
        configApplied: config ? config._id : null
      },
      createdAt: new Date()
    }
    
    processedResults.push(processedResult)
  }
  
  return processedResults
}

export async function addTestResultsFromHL7(testOrderId: string, addedBy: string): Promise<any> {
  const testOrders = getTestOrdersCollection()
  const eventLogs = getEventLogsCollection()
  
  // Verify test order exists
  const testOrder = await testOrders.findOne({ _id: new ObjectId(testOrderId) })
  if (!testOrder) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  const hadCompletedResults =
    testOrder.status === 'completed' && Array.isArray(testOrder.testResults) && testOrder.testResults.length > 0
  
  // Generate random HL7 message with ONLY ONE random test result
  const messageId = `HL7_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const generatedResults = generateRandomHL7TestResults()
  const singleRandomResult = generatedResults.length
    ? [generatedResults[Math.floor(Math.random() * generatedResults.length)]]
    : []

  const hl7Message: HL7Message = {
    messageId,
    patientId: testOrderId,
    testResults: singleRandomResult,
    timestamp: new Date(),
    rawMessage: `MSH|^~\\&|LAB|HOSPITAL|LIS|HOSPITAL|${new Date().toISOString()}|${messageId}|ORU^R01|${messageId}|P|2.5`
  }
  
  // Process HL7 message
  const processedResults = await processHL7Message(hl7Message)
  
  const now = new Date()
  const result = await testOrders.findOneAndUpdate(
    { _id: new ObjectId(testOrderId) },
    { 
      $set: { 
        testResults: processedResults,
        status: 'completed',
        runDate: now,
        runBy: new ObjectId(addedBy),
        updatedAt: now
      } 
    },
    { returnDocument: 'after' }
  )
  
  const updated: any = (result as any)?.value ?? result
  if (!updated) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  if (!hadCompletedResults) {
    await recordReagentUsageFromTestResults(updated, addedBy).catch((error) => {
      console.error('Failed to record reagent usage from HL7 results:', error)
    })
  }
  
  // Log the event
  try {
    const usersCol = getUsersCollection()
    const actorUser = await usersCol.findOne({ _id: new ObjectId(addedBy) })
    const roleCol = (await import('~/models/role.model')).getRolesCollection()
    const roleDoc = actorUser?.roleId ? await roleCol.findOne({ _id: actorUser.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: new ObjectId(addedBy), name: actorUser?.fullName || '', role: roleDoc?.code || '' },
      action: 'HL7_TEST_RESULTS_PROCESSED',
      details: `Processed HL7 message ${messageId} with ${processedResults.length} test results for patient: ${updated.patientName}`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }
  
  
  return {
    testOrder: updated,
    hl7Message,
    processedResults
  }
}

// Run a test order on a chosen instrument and attach instrument/reagent info
export async function addTestResultsFromHL7UsingInstrument(testOrderId: string, instrumentId: string, addedBy: string): Promise<any> {
  const testOrders = getTestOrdersCollection()
  const instrumentsCol = getInstrumentsCollection()
  const assignmentsCol = getInstrumentReagentAssignmentCollection()
  const eventLogs = getEventLogsCollection()

  // Verify test order and instrument
  const [testOrder, instrument] = await Promise.all([
    testOrders.findOne({ _id: new ObjectId(testOrderId) } as any),
    instrumentsCol.findOne({ _id: new ObjectId(instrumentId) } as any)
  ])
  if (!testOrder) throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  if (!instrument) throw new HttpError(404, 'Instrument not found')
  if (!instrument.isActive || instrument.status !== 'Active') throw new HttpError(409, 'Instrument is not active')

  const hadCompletedResults =
    testOrder.status === 'completed' && Array.isArray(testOrder.testResults) && testOrder.testResults.length > 0

  // Get active reagents on the instrument
  const reagents = await assignmentsCol
    .find({ instrumentId: new ObjectId(instrumentId), isActive: true } as any)
    .toArray()

  const messageId = `HL7_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Select tests from the order if present; otherwise random subset
  const requested = Array.isArray((testOrder as any).requestedTests) ? ((testOrder as any).requestedTests as CBCPanelTestName[]) : []
  const generated = requested.length > 0 ? generateHL7ResultsForTests(requested) : generateRandomHL7TestResults()

  const hl7Message: HL7Message = {
    messageId,
    patientId: testOrderId,
    testResults: generated,
    timestamp: new Date(),
    rawMessage: `MSH|^~\\&|LAB|HOSPITAL|LIS|HOSPITAL|${new Date().toISOString()}|${messageId}|ORU^R01|${messageId}|P|2.5`
  }

  // Process HL7 message
  const processedResults = await processHL7Message(hl7Message)

  // Attach instrument and reagent metadata into each processed result
  const processedWithMeta = processedResults.map(r => ({
    ...r,
    processedData: {
      ...r.processedData,
      instrument: {
        id: String(instrument._id),
        name: instrument.name,
        status: instrument.status
      },
      reagents: reagents.map((a: any) => ({
        id: String(a._id),
        reagentId: String(a.reagentId),
        reagentName: a.reagentName,
        lotNumber: a.lotNumber,
        unitOfMeasure: a.unitOfMeasure,
        expirationDate: a.expirationDate
      }))
    }
  }))

  const now = new Date()
  const result = await testOrders.findOneAndUpdate(
    { _id: new ObjectId(testOrderId) } as any,
    {
      $set: {
        testResults: processedWithMeta,
        status: 'completed',
        runDate: now,
        runBy: new ObjectId(addedBy),
        updatedAt: now
      }
    },
    { returnDocument: 'after' }
  )

  const updated: any = (result as any)?.value ?? result
  if (!updated) throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)

  if (!hadCompletedResults) {
    await recordReagentUsageFromTestResults(updated, addedBy).catch((error) => {
      console.error('Failed to record reagent usage from instrument HL7 results:', error)
    })
  }

  // Log the event
  try {
    const usersCol = getUsersCollection()
    const actorUser = await usersCol.findOne({ _id: new ObjectId(addedBy) })
    const roleCol = (await import('~/models/role.model')).getRolesCollection()
    const roleDoc = actorUser?.roleId ? await roleCol.findOne({ _id: actorUser.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: new ObjectId(addedBy), name: actorUser?.fullName || '', role: roleDoc?.code || '' },
      action: 'HL7_TEST_RESULTS_PROCESSED',
      details: `Processed HL7 on instrument ${instrument.name} with ${processedWithMeta.length} results for patient: ${updated.patientName}`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  return {
    testOrder: updated,
    instrument: { id: String(instrument._id), name: instrument.name, status: instrument.status },
    reagents: reagents.map((a: any) => ({ id: String(a._id), reagentId: String(a.reagentId), reagentName: a.reagentName, lotNumber: a.lotNumber, unitOfMeasure: a.unitOfMeasure, expirationDate: a.expirationDate })),
    hl7Message,
    processedResults: processedWithMeta
  }
}
