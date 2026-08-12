import { getCachedTranslation, getSetting, setCachedTranslation } from './db'

const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate'
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get'
const DEEPL_API_KEY_SETTING = 'deepl_api_key'

export type TranslationSource = 'cache' | 'deepl' | 'mymemory'

export type TranslationResult = {
  translation: string
  source: TranslationSource
  deeplQuotaExceeded: boolean
}

async function translateWithDeepL(word: string, apiKey: string): Promise<string> {
  const body = new URLSearchParams({
    auth_key: apiKey,
    text: word,
    source_lang: 'DE',
    target_lang: 'PT-BR',
  })

  const response = await fetch(DEEPL_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (response.status === 456) {
    throw new Error('DEEPL_QUOTA_EXCEEDED')
  }

  if (!response.ok) {
    throw new Error(`DEEPL_ERROR_${response.status}`)
  }

  const data = await response.json()
  const translated = data?.translations?.[0]?.text

  if (typeof translated !== 'string' || translated === '') {
    throw new Error('DEEPL_EMPTY_RESPONSE')
  }

  return translated
}

async function translateWithMyMemory(word: string): Promise<string> {
  const params = new URLSearchParams({
    q: word,
    langpair: 'de|pt-br',
  })

  const response = await fetch(`${MYMEMORY_API_URL}?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`MYMEMORY_ERROR_${response.status}`)
  }

  const data = await response.json()
  const translated = data?.responseData?.translatedText

  if (typeof translated !== 'string' || translated === '') {
    throw new Error('MYMEMORY_EMPTY_RESPONSE')
  }

  return translated
}

export async function translateWord(word: string): Promise<TranslationResult> {
  const cached = await getCachedTranslation(word)

  if (cached !== undefined) {
    return { translation: cached, source: 'cache', deeplQuotaExceeded: false }
  }

  const apiKey = await getSetting(DEEPL_API_KEY_SETTING)
  let deeplQuotaExceeded = false

  if (apiKey) {
    try {
      const translation = await translateWithDeepL(word, apiKey)
      await setCachedTranslation(word, translation)
      return { translation, source: 'deepl', deeplQuotaExceeded: false }
    } catch (error) {
      if (error instanceof Error && error.message === 'DEEPL_QUOTA_EXCEEDED') {
        deeplQuotaExceeded = true
      }
      console.error('Erro ao traduzir com DeepL, caindo para MyMemory:', error)
    }
  }

  const fallbackTranslation = await translateWithMyMemory(word)
  await setCachedTranslation(word, fallbackTranslation)

  return { translation: fallbackTranslation, source: 'mymemory', deeplQuotaExceeded }
}
