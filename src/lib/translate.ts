import { getCachedTranslation, getSetting, setCachedTranslation } from './db'

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get'
const DEEPL_API_KEY_SETTING = 'deepl_api_key'

export type TranslationSource = 'cache' | 'deepl' | 'mymemory'

export type TranslationResult = {
  translation: string
  source: TranslationSource
  deeplQuotaExceeded: boolean
}

async function translateWithDeepL(word: string, apiKey: string): Promise<string> {
  const translated = await window.api.invoke('translation:deepl', { word, apiKey })
  return translated as string
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

export type ApiKeyTestResult = { success: true } | { success: false; reason: 'quota' | 'invalid' }

export async function testDeeplApiKey(apiKey: string): Promise<ApiKeyTestResult> {
  try {
    await translateWithDeepL('Hallo', apiKey)
    return { success: true }
  } catch (error) {
    console.error('Erro ao testar a chave do DeepL:', error)

    if (error instanceof Error && error.message.includes('DEEPL_QUOTA_EXCEEDED')) {
      return { success: false, reason: 'quota' }
    }
    return { success: false, reason: 'invalid' }
  }
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
      if (error instanceof Error && error.message.includes('DEEPL_QUOTA_EXCEEDED')) {
        deeplQuotaExceeded = true
      }
      console.error('Erro ao traduzir com DeepL, caindo para MyMemory:', error)
    }
  }

  const fallbackTranslation = await translateWithMyMemory(word)
  await setCachedTranslation(word, fallbackTranslation)

  return { translation: fallbackTranslation, source: 'mymemory', deeplQuotaExceeded }
}
