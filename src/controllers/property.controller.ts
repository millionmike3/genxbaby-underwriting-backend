import { Request, Response } from 'express'
import { propertyService } from '../services/property.service'

export async function createProperty(req: Request, res: Response) {
  try {
    const property = await propertyService.create(req.body)
    res.status(201).json(property)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
