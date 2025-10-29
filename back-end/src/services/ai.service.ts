import { GoogleGenAI } from '@google/genai'
import { env } from '~/configs/environment.config'

interface AiInputTestResult {
  testName: string
  result: string
  unit?: string
}

interface AiSuggestion {
  testName: string
  suggestedResult?: number
}

export async function analyzeTestResultsWithAI(testResults: AiInputTestResult[]): Promise<AiSuggestion[]> {
  if (!env.GEMINI_API_KEY) {
    return []
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY as string })

  const prompt = `You are assisting a laboratory information system.
Given a list of lab test results (name, numeric value, unit), suggest corrected numeric values only when there is clear minor measurement drift. Keep changes small and reasonable; omit tests you cannot confidently adjust. Respond strictly as JSON array of objects with keys: testName, suggestedResult (number). Do not include any other text.

Examples input:
Hemoglobin: 15.2 g/dL -> ok
Glucose: 99 mg/dL -> ok

Now analyze these:
${testResults.map((r) => `${r.testName}: ${r.result}${r.unit ? ' ' + r.unit : ''}`).join('\n')}`

  try {
    const contents = [{ role: 'user', parts: [{ text: prompt }] }]
    const result = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents })
    let text = (result as any).text?.trim?.() || ''
    // Strip code fences if model wraps JSON
    if (text.startsWith('```')) {
      text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '').trim()
    }
    // Attempt to parse a JSON array; if fails, return empty
    const jsonStart = text.indexOf('[')
    const jsonEnd = text.lastIndexOf(']')
    if (jsonStart === -1 || jsonEnd === -1) return []
    const json = text.slice(jsonStart, jsonEnd + 1)
    const parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x: any) => x && typeof x.testName === 'string' && typeof x.suggestedResult === 'number')
  } catch {
    return []
  }
}


export async function generateDiagnosisJson(testResults: AiInputTestResult[]): Promise<string | null> {
  if (!env.GEMINI_API_KEY) {
    return null
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY as string })

  const prompt = `You are a clinical assistant for a laboratory.
Based on the following lab test results, return ONLY a compact JSON string with this shape and keys:
{
  "diagnoses": [{ "name": string, "confidence": number, "rationale": string }],
  "notes": string
}
Rules:
- Be conservative; suggest likely conditions only.
- Use confidence 0..1.
- Keep rationale short.
- No extra text or formatting, only JSON string.

Results:\n${testResults.map((r) => `${r.testName}: ${r.result}${r.unit ? ' ' + r.unit : ''}`).join('\n')}`

  try {
    const contents = [{ role: 'user', parts: [{ text: prompt }] }]
    const result = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents })
    let text = (result as any).text?.trim?.() || ''
    if (text.startsWith('```')) {
      text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '').trim()
    }
    // Return raw JSON string if looks like JSON object
    if (text.startsWith('{') && text.endsWith('}')) return text
    // Attempt to extract first JSON object
    const objStart = text.indexOf('{')
    const objEnd = text.lastIndexOf('}')
    if (objStart !== -1 && objEnd !== -1) {
      return text.slice(objStart, objEnd + 1)
    }
    return null
  } catch {
    return null
  }
}

export async function pingAI(): Promise<{ ok: boolean; model: string; sample: string | null }> {
  try {
    if (!env.GEMINI_API_KEY) return { ok: false, model: 'gemini-2.5-pro', sample: null }
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY as string })
    const contents = [{ role: 'user', parts: [{ text: 'Say OK and the model name' }] }]
    const model = 'gemini-2.5-pro'
    const res = await ai.models.generateContent({ model, contents })
    const text = (res as any).text?.trim?.() || ''
    return { ok: text.length > 0, model, sample: text.slice(0, 120) || null }
  } catch {
    return { ok: false, model: 'gemini-2.5-pro', sample: null }
  }
}


