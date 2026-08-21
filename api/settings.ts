import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSetting, setSetting } from './_db'
import { isAuthorized } from './_authCheck'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'UNAUTHORIZED' })
    return
  }

  if (req.method === 'GET') {
    const key = req.query.key

    if (typeof key !== 'string') {
      res.status(400).json({ error: 'MISSING_KEY' })
      return
    }

    const value = await getSetting(key)
    res.status(200).json(value ?? null)
    return
  }

  if (req.method === 'POST') {
    const { key, value } = req.body as { key: string; value: string }
    await setSetting(key, value)
    res.status(200).json({ ok: true })
    return
  }

  res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
}
