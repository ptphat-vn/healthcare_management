import { ObjectId } from 'mongodb'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import { getTestOrdersCollection, TestResult, getFlaggingConfigCollection } from '~/models/test-order.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getUsersCollection } from '~/models/user.model'

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
  const commonTests = [
    { name: 'Hemoglobin', unit: 'g/dL', normalRange: '12.0-16.0' },
    { name: 'White Blood Cell Count', unit: 'K/uL', normalRange: '4.5-11.0' },
    { name: 'Platelet Count', unit: 'K/uL', normalRange: '150-450' },
    { name: 'Glucose', unit: 'mg/dL', normalRange: '70-100' },
    { name: 'Cholesterol', unit: 'mg/dL', normalRange: '<200' },
    { name: 'Creatinine', unit: 'mg/dL', normalRange: '0.6-1.2' },
    { name: 'Sodium', unit: 'mEq/L', normalRange: '136-145' },
    { name: 'Potassium', unit: 'mEq/L', normalRange: '3.5-5.0' },
    { name: 'ALT', unit: 'U/L', normalRange: '7-56' },
    { name: 'AST', unit: 'U/L', normalRange: '10-40' }
  ]

  const results: HL7TestResult[] = []
  
  // Generate 3-6 random test results
  const numTests = Math.floor(Math.random() * 4) + 3
  const selectedTests = commonTests.sort(() => 0.5 - Math.random()).slice(0, numTests)
  
  for (const test of selectedTests) {
    let result: string
    let flag: string = ''
    
    // Generate random result based on test type
    if (test.name === 'Hemoglobin') {
      const value = (Math.random() * 6 + 8).toFixed(1) // 8.0-14.0
      result = value
      if (parseFloat(value) < 10) flag = 'L' // Low
      else if (parseFloat(value) > 16) flag = 'H' // High
    } else if (test.name === 'White Blood Cell Count') {
      const value = (Math.random() * 8 + 3).toFixed(1) // 3.0-11.0
      result = value
      if (parseFloat(value) < 4.5) flag = 'L'
      else if (parseFloat(value) > 11) flag = 'H'
    } else if (test.name === 'Glucose') {
      const value = (Math.random() * 80 + 60).toFixed(0) // 60-140
      result = value
      if (parseFloat(value) < 70) flag = 'L'
      else if (parseFloat(value) > 100) flag = 'H'
    } else if (test.name === 'Cholesterol') {
      const value = (Math.random() * 200 + 100).toFixed(0) // 100-300
      result = value
      if (parseFloat(value) > 200) flag = 'H'
    } else {
      // Generic numeric result
      const value = (Math.random() * 100 + 10).toFixed(1)
      result = value
      if (Math.random() < 0.1) flag = Math.random() < 0.5 ? 'L' : 'H' // 10% chance of flag
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
  
  // Log the event
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
  
  
  return {
    testOrder: updated,
    hl7Message,
    processedResults
  }
}
