import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getCachedTranslation, setCachedTranslation } from './_db'
import { isAuthorized } from './_authCheck'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'UNAUTHORIZED' })
    return
  }

  if (req.method === 'GET') {
    const word = req.query.word

    if (typeof word !== 'string') {
      res.status(400).json({ error: 'MISSING_WORD' })
      return
    }

    const translation = await getCachedTranslation(word)
    res.status(200).json(translation ?? null)
    return
  }

  if (req.method === 'POST') {
    const { word, translation } = req.body as { word: string; translation: string }
    await setCachedTranslation(word, translation)
    res.status(200).json({ ok: true })
    return
  }

  res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
}
