import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAuthorized } from './_authCheck'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'UNAUTHORIZED' })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
    return
  }

  const { word, apiKey } = req.body as { word: string; apiKey: string }

  if (typeof word !== 'string' || typeof apiKey !== 'string' || apiKey === '') {
    res.status(400).json({ error: 'MISSING_PARAMS' })
    return
  }

  const body = new URLSearchParams({
    text: word,
    source_lang: 'DE',
    target_lang: 'PT-BR',
  })

  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `DeepL-Auth-Key ${apiKey}`,
    },
    body: body.toString(),
  })

  if (response.status === 456) {
    res.status(456).json({ error: 'DEEPL_QUOTA_EXCEEDED' })
    return
  }

  if (!response.ok) {
    res.status(502).json({ error: `DEEPL_ERROR_${response.status}` })
    return
  }

  const data = await response.json()
  const translated = data?.translations?.[0]?.text

  if (typeof translated !== 'string' || translated === '') {
    res.status(502).json({ error: 'DEEPL_EMPTY_RESPONSE' })
    return
  }

  res.status(200).json({ translation: translated })
}
