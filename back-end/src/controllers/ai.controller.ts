import { Request, Response, NextFunction } from 'express'
import { pingAI } from '~/services/ai/ai.service'

export const aiDiagnosticsController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pingAI()
    return res.status(200).json({ message: 'AI diagnostics', data: result })
  } catch (err) {
    next(err)
  }
}


