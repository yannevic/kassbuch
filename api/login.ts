import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
    return
  }

  const body = req.body as { pin?: string } | undefined
  const pin = body?.pin
  const expectedPin = process.env.APP_PIN

  if (
    typeof pin !== 'string' ||
    typeof expectedPin !== 'string' ||
    expectedPin === '' ||
    pin !== expectedPin
  ) {
    res.status(401).json({ error: 'INVALID_PIN' })
    return
  }

  res.status(200).json({ ok: true })
}
