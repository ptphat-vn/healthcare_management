/**
 * Generate a random CAS Number in the format: number-number-number
 * Format: 2-7 digits - 2 digits - 1 digit
 * @returns A valid CAS Number string
 */
export function generateRandomCasNumber(): string {
  // First part: 2-7 digits (10 to 9999999)
  // To ensure it's between 2-7 digits, we use range 10 to 9999999
  const firstPartMin = 10
  const firstPartMax = 9999999
  const firstPart = Math.floor(Math.random() * (firstPartMax - firstPartMin + 1)) + firstPartMin
  
  // Second part: 2 digits (00-99)
  const secondPart = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  
  // Third part: 1 digit (0-9)
  const thirdPart = Math.floor(Math.random() * 10)
  
  return `${firstPart}-${secondPart}-${thirdPart}`
}

/**
 * Generate a unique CAS Number that doesn't exist in the database
 * @param checkExists - Function to check if CAS Number exists
 * @param maxAttempts - Maximum number of attempts to generate unique CAS (default: 100)
 * @returns A unique CAS Number string
 */
export async function generateUniqueCasNumber(
  checkExists: (casNumber: string) => Promise<boolean>,
  maxAttempts: number = 100
): Promise<string> {
  let attempts = 0
  let casNumber: string
  
  do {
    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique CAS Number after maximum attempts')
    }
    
    casNumber = generateRandomCasNumber()
    const exists = await checkExists(casNumber)
    
    if (!exists) {
      return casNumber
    }
    
    attempts++
  } while (true)
}

