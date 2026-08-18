import { Request, Response } from 'express'
import { underwritingService } from '../services/underwriting/engine'

export async function createUnderwritingCase(req: Request, res: Response) {
  try {
    const caseRecord = await underwritingService.createCase(req.body)
    res.status(201).json(caseRecord)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export async function runUnderwriting(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const result = await underwritingService.run(id)
    res.status(200).json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
