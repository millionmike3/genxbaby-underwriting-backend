import { Queue, connection } from './connection'

export const underwritingCaseQueue = new Queue('underwriting-case', { connection })
export const anchoringQueue = new Queue('anchoring', { connection })
export const notificationQueue = new Queue('notification', { connection })
