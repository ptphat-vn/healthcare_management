import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { HttpError } from '~/models/error.model'
import { env } from '~/configs/environment.config'

const getStringeeConfig = () => {
  const apiKeySid = env.STRINGEE_API_KEY_SID
  const apiKeySecret = env.STRINGEE_API_KEY_SECRET
  // const appId = process.env.STRINGEE_APP_ID

  if (!apiKeySid || !apiKeySecret) {
    throw new HttpError(500, 'Stringee is not configured on the server')
  }

  return { apiKeySid, apiKeySecret }
}

export const generateStringeeAccessToken = (userId: string): string => {
  if (!userId) {
    throw new HttpError(400, 'userId is required to generate Stringee token')
  }

  const { apiKeySid, apiKeySecret} = getStringeeConfig()

  const now = Math.floor(Date.now() / 1000)
  const exp = now + 24 * 60 * 60

  const payload: Record<string, unknown> = {
    jti: randomUUID(),
    iss: apiKeySid,
    exp,
    nbf: now,
    userId: String(userId)
  }

  // if (appId) {
  //   payload.appId = appId
  // }

  return jwt.sign(payload, apiKeySecret, {
    algorithm: 'HS256'
  })
}

export default { generateStringeeAccessToken }


