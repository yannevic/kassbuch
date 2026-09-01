import {
  getCachedTranslation,
  getSetting,
  setCachedTranslation,
  setSetting,
  isElectron,
  PIN_STORAGE_KEY,
} from './db'

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get'
const DEEPL_API_KEY_SETTING = 'deepl_api_key'
const DEEPL_QUOTA_EXCEEDED_SETTING = 'deepl_quota_exceeded'

export type TranslationSource = 'cache' | 'deepl' | 'mymemory'

export type TranslationResult = {
  translation: string
  source: TranslationSource
  deeplQuotaExceeded: boolean
}

let lastSource: TranslationSource | null = null
const sourceListeners = new Set<() => void>()

function setLastSource(source: TranslationSource) {
  lastSource = source
  sourceListeners.forEach((listener) => listener())
}

export function subscribeToLastSource(listener: () => void) {
  sourceListeners.add(listener)
  return () => {
    sourceListeners.delete(listener)
  }
}

export function getLastSourceSnapshot(): TranslationSource | null {
  return lastSource
}

let quotaExceeded = false
const quotaListeners = new Set<() => void>()

function setQuotaExceededState(value: boolean) {
  if (quotaExceeded === value) {
    return
  }
  quotaExceeded = value
  quotaListeners.forEach((listener) => listener())
}

export function subscribeToQuotaExceeded(listener: () => void) {
  quotaListeners.add(listener)
  return () => {
    quotaListeners.delete(listener)
  }
}

export function getQuotaExceededSnapshot(): boolean {
  return quotaExceeded
}

export async function loadPersistedQuotaExceeded(): Promise<void> {
  const stored = await getSetting(DEEPL_QUOTA_EXCEEDED_SETTING)
  if (stored === 'true') {
    setQuotaExceededState(true)
  }
}

async function translateWithDeepL(word: string, apiKey: string): Promise<string> {
  if (isElectron()) {
    const translated = await window.api.invoke('translation:deepl', { word, apiKey })
    return translated as string
  }

  const pin = typeof window !== 'undefined' ? window.localStorage.getItem(PIN_STORAGE_KEY) : null

  const response = await fetch('/api/translate-deepl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(pin ? { 'X-App-Pin': pin } : {}),
    },
    body: JSON.stringify({ word, apiKey }),
  })

  if (response.status === 456) {
    throw new Error('DEEPL_QUOTA_EXCEEDED')
  }

  if (!response.ok) {
    throw new Error(`DEEPL_ERROR_${response.status}`)
  }

  const data = await response.json()
  return data.translation as string
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
    setLastSource('cache')
    return { translation: cached, source: 'cache', deeplQuotaExceeded: false }
  }

  const apiKey = await getSetting(DEEPL_API_KEY_SETTING)
  let deeplQuotaExceeded = false

  if (apiKey) {
    try {
      const translation = await translateWithDeepL(word, apiKey)
      await setCachedTranslation(word, translation)
      setLastSource('deepl')

      if (quotaExceeded) {
        setQuotaExceededState(false)
        setSetting(DEEPL_QUOTA_EXCEEDED_SETTING, 'false').catch(() => {})
      }

      return { translation, source: 'deepl', deeplQuotaExceeded: false }
    } catch (error) {
      if (error instanceof Error && error.message.includes('DEEPL_QUOTA_EXCEEDED')) {
        deeplQuotaExceeded = true
        setQuotaExceededState(true)
        setSetting(DEEPL_QUOTA_EXCEEDED_SETTING, 'true').catch(() => {})
      }
      console.error('Erro ao traduzir com DeepL, caindo para MyMemory:', error)
    }
  }

  const fallbackTranslation = await translateWithMyMemory(word)
  await setCachedTranslation(word, fallbackTranslation)
  setLastSource('mymemory')
  return { translation: fallbackTranslation, source: 'mymemory', deeplQuotaExceeded }
}
