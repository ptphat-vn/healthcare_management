import { generateUnifiedLabAIJson, pingAI } from './ai.service'
import { GoogleGenAI } from '@google/genai'
import { env } from '~/configs/environment.config'

// Mock dependencies
jest.mock('@google/genai')
jest.mock('~/configs/environment.config', () => ({
  env: {
    GEMINI_API_KEY: 'test-api-key'
  }
}))

describe('AI Service', () => {
  let mockGenerateContent: jest.Mock
  let mockModels: { generateContent: jest.Mock }
  let mockAIInstance: { models: { generateContent: jest.Mock } }

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock for generateContent
    mockGenerateContent = jest.fn()
    mockModels = {
      generateContent: mockGenerateContent
    }
    mockAIInstance = {
      models: mockModels
    }

    // Mock GoogleGenAI constructor
    ;(GoogleGenAI as jest.MockedClass<typeof GoogleGenAI>).mockImplementation(() => mockAIInstance as any)
  })

  describe('generateUnifiedLabAIJson', () => {
    const mockTestResults = [
      { testName: 'Hemoglobin', result: '12.5', unit: 'g/dL' },
      { testName: 'WBC', result: '5000', unit: '/μL' },
      { testName: 'Glucose', result: '95' }
    ]

    it('should return plain text summary when API call succeeds with plain text response', async () => {
      const expectedText = 'Nồng độ Hemoglobin giảm nhẹ, gợi ý thiếu máu mức độ nhẹ'
      mockGenerateContent.mockResolvedValue({
        text: expectedText
      })

      const result = await generateUnifiedLabAIJson(mockTestResults)

      expect(result).toBe(expectedText)
      expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: 'test-api-key' })
      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.5-pro',
        contents: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            parts: expect.arrayContaining([
              expect.objectContaining({
                text: expect.stringContaining('Hemoglobin: 12.5 g/dL')
              })
            ])
          })
        ])
      })
    })

    it('should remove markdown code fences from response', async () => {
      const textWithFences = '```\nNồng độ Hemoglobin giảm nhẹ\n```'
      mockGenerateContent.mockResolvedValue({
        text: textWithFences
      })

      const result = await generateUnifiedLabAIJson(mockTestResults)

      expect(result).toBe('Nồng độ Hemoglobin giảm nhẹ')
    })

    it('should parse JSON response and extract summaryNotes', async () => {
      const jsonResponse = JSON.stringify({ summaryNotes: 'Kết quả xét nghiệm bình thường' })
      mockGenerateContent.mockResolvedValue({
        text: jsonResponse
      })

      const result = await generateUnifiedLabAIJson(mockTestResults)

      expect(result).toBe('Kết quả xét nghiệm bình thường')
    })

    it('should handle JSON response without summaryNotes field', async () => {
      const jsonResponse = JSON.stringify({ otherField: 'value' })
      mockGenerateContent.mockResolvedValue({
        text: jsonResponse
      })

      const result = await generateUnifiedLabAIJson(mockTestResults)

      // When summaryNotes is not found, text becomes empty string, which then returns null
      expect(result).toBeNull()
    })

    it('should normalize newlines to single line', async () => {
      const textWithNewlines = 'Line 1\nLine 2\r\nLine 3'
      mockGenerateContent.mockResolvedValue({
        text: textWithNewlines
      })

      const result = await generateUnifiedLabAIJson(mockTestResults)

      expect(result).toBe('Line 1 Line 2 Line 3')
    })

    it('should remove surrounding quotes from response', async () => {
      const quotedText = '"This is a quoted text"'
      mockGenerateContent.mockResolvedValue({
        text: quotedText
      })

      const result = await generateUnifiedLabAIJson(mockTestResults)

      expect(result).toBe('This is a quoted text')
    })

    it('should remove single quotes from response', async () => {
      const singleQuotedText = "'This is a single quoted text'"
      mockGenerateContent.mockResolvedValue({
        text: singleQuotedText
      })

      const result = await generateUnifiedLabAIJson(mockTestResults)

      expect(result).toBe('This is a single quoted text')
    })

    it('should remove backticks from response', async () => {
      const backtickText = '`This is a backtick text`'
      mockGenerateContent.mockResolvedValue({
        text: backtickText
      })

      const result = await generateUnifiedLabAIJson(mockTestResults)

      expect(result).toBe('This is a backtick text')
    })

    it('should handle complex response with multiple formatting issues', async () => {
      // The code removes code fences first, then parses JSON, then normalizes newlines
      // Using actual newline characters in the JSON string value
      const jsonWithNewlines = JSON.stringify({ summaryNotes: 'Line 1\nLine 2' })
      const complexText = `\`\`\`json\n${jsonWithNewlines}\n\`\`\``
      mockGenerateContent.mockResolvedValue({
        text: complexText
      })

      const result = await generateUnifiedLabAIJson(mockTestResults)

      // After removing code fences: {"summaryNotes":"Line 1\nLine 2"}
      // After parsing JSON and extracting: "Line 1\nLine 2" (string with actual newline)
      // After normalizing newlines: "Line 1 Line 2"
      // After removing quotes: Line 1 Line 2
      expect(result).toBe('Line 1 Line 2')
    })

    it('should return null when GEMINI_API_KEY is not set', async () => {
      // Temporarily override env
      const originalEnv = { ...env }
      ;(env as any).GEMINI_API_KEY = undefined

      const result = await generateUnifiedLabAIJson(mockTestResults)

      expect(result).toBeNull()
      expect(mockGenerateContent).not.toHaveBeenCalled()

      // Restore env
      Object.assign(env, originalEnv)
    })

    it('should return null when API call throws an error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'))

      const result = await generateUnifiedLabAIJson(mockTestResults)

      expect(result).toBeNull()
    })

    it('should handle empty text response', async () => {
      mockGenerateContent.mockResolvedValue({
        text: ''
      })

      const result = await generateUnifiedLabAIJson(mockTestResults)

      expect(result).toBeNull()
    })

    it('should handle response with only whitespace', async () => {
      mockGenerateContent.mockResolvedValue({
        text: '   \n\t  '
      })

      const result = await generateUnifiedLabAIJson(mockTestResults)

      expect(result).toBeNull()
    })

    it('should handle response without text property', async () => {
      mockGenerateContent.mockResolvedValue({})

      const result = await generateUnifiedLabAIJson(mockTestResults)

      expect(result).toBeNull()
    })

    it('should include all test results in prompt', async () => {
      const testResults = [
        { testName: 'Test1', result: '100', unit: 'mg/dL' },
        { testName: 'Test2', result: '200' },
        { testName: 'Test3', result: '300', unit: 'U/L' }
      ]

      mockGenerateContent.mockResolvedValue({
        text: 'Summary'
      })

      await generateUnifiedLabAIJson(testResults)

      const callArgs = mockGenerateContent.mock.calls[0][0]
      const promptText = callArgs.contents[0].parts[0].text

      expect(promptText).toContain('Test1: 100 mg/dL')
      expect(promptText).toContain('Test2: 200')
      expect(promptText).toContain('Test3: 300 U/L')
    })

    it('should handle empty test results array', async () => {
      mockGenerateContent.mockResolvedValue({
        text: 'No test results provided'
      })

      const result = await generateUnifiedLabAIJson([])

      expect(result).toBe('No test results provided')
      expect(mockGenerateContent).toHaveBeenCalled()
    })

    it('should handle invalid JSON in response', async () => {
      const invalidJson = '{invalid json}'
      mockGenerateContent.mockResolvedValue({
        text: invalidJson
      })

      const result = await generateUnifiedLabAIJson(mockTestResults)

      // Should return the raw text after cleaning
      expect(result).toBe('{invalid json}')
    })
  })

  describe('pingAI', () => {
    it('should return success response when API call succeeds', async () => {
      const mockResponse = 'OK, this is gemini-2.5-pro model'
      mockGenerateContent.mockResolvedValue({
        text: mockResponse
      })

      const result = await pingAI()

      expect(result).toEqual({
        ok: true,
        model: 'gemini-2.5-pro',
        sample: mockResponse
      })
      expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: 'test-api-key' })
      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.5-pro',
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Say OK and the model name' }]
          }
        ]
      })
    })

    it('should truncate sample text to 120 characters', async () => {
      const longText = 'A'.repeat(150)
      mockGenerateContent.mockResolvedValue({
        text: longText
      })

      const result = await pingAI()

      expect(result.sample).toBe('A'.repeat(120))
      expect(result.sample?.length).toBe(120)
    })

    it('should return ok: false when response is empty', async () => {
      mockGenerateContent.mockResolvedValue({
        text: ''
      })

      const result = await pingAI()

      expect(result).toEqual({
        ok: false,
        model: 'gemini-2.5-pro',
        sample: null
      })
    })

    it('should return ok: false when GEMINI_API_KEY is not set', async () => {
      // Temporarily override env
      const originalEnv = { ...env }
      ;(env as any).GEMINI_API_KEY = undefined

      const result = await pingAI()

      expect(result).toEqual({
        ok: false,
        model: 'gemini-2.5-pro',
        sample: null
      })
      expect(mockGenerateContent).not.toHaveBeenCalled()

      // Restore env
      Object.assign(env, originalEnv)
    })

    it('should return ok: false when API call throws an error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Network error'))

      const result = await pingAI()

      expect(result).toEqual({
        ok: false,
        model: 'gemini-2.5-pro',
        sample: null
      })
    })

    it('should handle response without text property', async () => {
      mockGenerateContent.mockResolvedValue({})

      const result = await pingAI()

      expect(result).toEqual({
        ok: false,
        model: 'gemini-2.5-pro',
        sample: null
      })
    })

    it('should handle response with whitespace-only text', async () => {
      mockGenerateContent.mockResolvedValue({
        text: '   \n\t  '
      })

      const result = await pingAI()

      expect(result).toEqual({
        ok: false,
        model: 'gemini-2.5-pro',
        sample: null
      })
    })

    it('should return sample as null when text is empty after trim', async () => {
      mockGenerateContent.mockResolvedValue({
        text: '   '
      })

      const result = await pingAI()

      expect(result.sample).toBeNull()
      expect(result.ok).toBe(false)
    })

    it('should return sample text when response is exactly 120 characters', async () => {
      const exactText = 'A'.repeat(120)
      mockGenerateContent.mockResolvedValue({
        text: exactText
      })

      const result = await pingAI()

      expect(result.sample).toBe(exactText)
      expect(result.ok).toBe(true)
    })

    it('should return sample text when response is less than 120 characters', async () => {
      const shortText = 'Short response'
      mockGenerateContent.mockResolvedValue({
        text: shortText
      })

      const result = await pingAI()

      expect(result.sample).toBe(shortText)
      expect(result.ok).toBe(true)
    })
  })
})

