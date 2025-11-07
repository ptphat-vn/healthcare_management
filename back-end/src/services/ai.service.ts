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

// Unified AI function: returns a single plain-text summary string (one line, no special chars)
export async function generateUnifiedLabAIJson(testResults: AiInputTestResult[]): Promise<string | null> {
  if (!env.GEMINI_API_KEY) {
    return null
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY as string })

  const prompt = `Bạn là một chuyên gia đánh giá kết quả xét nghiệm trong hệ thống LIS.

YÊU CẦU ĐẦU RA (BẮT BUỘC):
- CHỈ TRẢ VỀ MỘT CHUỖI TÓM TẮT LÂM SÀNG (summary) VĂN BẢN THUẦN, MỘT DÒNG.
- KHÔNG kèm JSON, KHÔNG backticks/code fences/markdown, KHÔNG ký tự xuống dòng (\\n, \\r), KHÔNG dấu ngoặc kép bao quanh.
- Ngắn gọn, chuyên nghiệp, dễ hiểu.

VÍ DỤ ĐẦU RA HỢP LỆ:
Nồng độ Hemoglobin giảm nhẹ, gợi ý thiếu máu mức độ nhẹ; nên đối chiếu theo tuổi/giới và lâm sàng.

DỮ LIỆU VÀO:
${testResults.map((r) => `${r.testName}: ${r.result}${r.unit ? ' ' + r.unit : ''}`).join('\n')}`

  try {
    const contents = [{ role: 'user', parts: [{ text: prompt }] }]
    const result = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents })
    let text = (result as any).text?.trim?.() || ''
    // Remove code fences/backticks/markdown-like wrappers if any
    text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '').trim()
    // If model still returned JSON, extract summaryNotes
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const parsed = JSON.parse(text)
        text = typeof parsed?.summaryNotes === 'string' ? parsed.summaryNotes : ''
      } catch {
        // keep raw text
      }
    }
    // Normalize to one line, strip quotes/backticks
    text = text.replace(/[\r\n]+/g, ' ').replace(/^"|"$/g, '').replace(/^'|'$/g, '').replace(/^`|`$/g, '').trim()
    return text || null
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


