import type { VercelRequest } from '@vercel/node'

export function isAuthorized(req: VercelRequest): boolean {
  const providedPin = req.headers['x-app-pin']
  const expectedPin = process.env.APP_PIN

  return (
    typeof providedPin === 'string' &&
    typeof expectedPin === 'string' &&
    expectedPin !== '' &&
    providedPin === expectedPin
  )
}
