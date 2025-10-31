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

// Unified AI function: returns a single compact JSON string containing
// suggestedAdjustments, diagnoses, and summaryNotes as requested.
export async function generateUnifiedLabAIJson(testResults: AiInputTestResult[]): Promise<string | null> {
  if (!env.GEMINI_API_KEY) {
    return null
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY as string })

  const prompt = `Bạn là một chuyên gia đánh giá kết quả phòng thí nghiệm (Clinical Pathologist) cho một Hệ thống Thông tin Phòng thí nghiệm. Nhiệm vụ của bạn là đánh giá kết quả xét nghiệm đã hoàn thành của bệnh nhân và cung cấp cả **sự điều chỉnh dữ liệu** (nếu cần) và **đánh giá lâm sàng**.

Trả về DUY NHẤT một chuỗi JSON gọn nhẹ với cấu trúc và các khóa sau. KHÔNG bao gồm bất kỳ văn bản hoặc định dạng bổ sung nào (ví dụ: code fences, chú thích, hay tiêu đề).

{
  "suggestedAdjustments": [
    { "testName": string, "suggestedResult": number }
    // Chỉ bao gồm các bài kiểm tra có dấu hiệu "độ trôi đo lường nhỏ" (minor measurement drift) và cần điều chỉnh.
    // Giữ sự thay đổi nhỏ và hợp lý. Bỏ qua các bài kiểm tra không thể điều chỉnh tự tin.
  ],
  "diagnoses": [
    { "name": string, "confidence": number, "rationale": string }
    // Đề xuất các tình trạng lâm sàng tiềm năng dựa trên kết quả.
    // Sử dụng confidence 0..1. Giữ rationale ngắn gọn.
  ],
  "summaryNotes": string 
  // Cung cấp một tóm tắt chuyên nghiệp ngắn gọn về các phát hiện quan trọng nhất. 
  // Bình luận về bất kỳ mô hình bất thường nào hoặc đề xuất các bước lâm sàng tiếp theo (ví dụ: "Cần theo dõi thêm về chức năng thận").
}

Kết quả Xét nghiệm để phân tích:
${testResults.map((r) => `${r.testName}: ${r.result}${r.unit ? ' ' + r.unit : ''}`).join('\n')}`

  try {
    const contents = [{ role: 'user', parts: [{ text: prompt }] }]
    const result = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents })
    let text = (result as any).text?.trim?.() || ''
    // Strip code fences if any
    if (text.startsWith('```')) {
      text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '').trim()
    }
    // Extract JSON object
    const objStart = text.indexOf('{')
    const objEnd = text.lastIndexOf('}')
    if (objStart === -1 || objEnd === -1) return null

    const jsonStr = text.slice(objStart, objEnd + 1)
    // Validate minimal structure
    try {
      const parsed = JSON.parse(jsonStr)
      const ok = parsed && typeof parsed === 'object'
      if (!ok) return null
      // Ensure required keys exist; if missing, coerce to expected structure
      const normalized = {
        suggestedAdjustments: Array.isArray(parsed.suggestedAdjustments) ? parsed.suggestedAdjustments : [],
        diagnoses: Array.isArray(parsed.diagnoses) ? parsed.diagnoses : [],
        summaryNotes: typeof parsed.summaryNotes === 'string' ? parsed.summaryNotes : ''
      }
      return JSON.stringify(normalized)
    } catch {
      return null
    }
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


