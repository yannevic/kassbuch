import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAllEntriesForBackup, getAllTranslationsForBackup, restoreFromBackup } from './_db'
import { isAuthorized } from './_authCheck'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'UNAUTHORIZED' })
    return
  }

  if (req.method === 'GET') {
    const entries = await getAllEntriesForBackup()
    const translations = await getAllTranslationsForBackup()
    res.status(200).json({ entries, translations })
    return
  }

  if (req.method === 'POST') {
    const { entries, translations } = req.body as {
      entries: { date: string; title: string; text: string; updatedAt: string }[]
      translations: { word: string; translation: string; updatedAt: string }[]
    }
    await restoreFromBackup(entries, translations)
    res.status(200).json({ ok: true })
    return
  }

  res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
}
