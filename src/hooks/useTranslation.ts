import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { translateWord } from '../lib/translate'

type TranslationState = {
  translation: string
  isLoading: boolean
  error: boolean
}

const HOVER_DEBOUNCE_MS = 300

const memoryCache = new Map<string, string>()

let deeplQuotaExceeded = false
const quotaListeners = new Set<() => void>()

function setDeeplQuotaExceeded(value: boolean) {
  if (deeplQuotaExceeded === value) {
    return
  }
  deeplQuotaExceeded = value
  quotaListeners.forEach((listener) => listener())
}

function subscribeToQuota(listener: () => void) {
  quotaListeners.add(listener)
  return () => {
    quotaListeners.delete(listener)
  }
}

function getQuotaSnapshot() {
  return deeplQuotaExceeded
}

export function useDeeplQuotaExceeded(): boolean {
  return useSyncExternalStore(subscribeToQuota, getQuotaSnapshot)
}

export function useWordTranslation(word: string) {
  const [state, setState] = useState<TranslationState>(() => {
    const cached = memoryCache.get(word)
    if (cached !== undefined) {
      return { translation: cached, isLoading: false, error: false }
    }
    return { translation: '', isLoading: false, error: false }
  })

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)

  const cancelPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const requestTranslation = useCallback(() => {
    const cached = memoryCache.get(word)
    if (cached !== undefined) {
      setState({ translation: cached, isLoading: false, error: false })
      return
    }

    cancelPending()
    const currentRequestId = requestIdRef.current + 1
    requestIdRef.current = currentRequestId

    timeoutRef.current = setTimeout(() => {
      setState((current) => ({ ...current, isLoading: true, error: false }))

      translateWord(word)
        .then((result) => {
          if (requestIdRef.current !== currentRequestId) {
            return
          }

          memoryCache.set(word, result.translation)

          if (result.deeplQuotaExceeded) {
            setDeeplQuotaExceeded(true)
          }

          setState({ translation: result.translation, isLoading: false, error: false })
        })
        .catch((error) => {
          if (requestIdRef.current !== currentRequestId) {
            return
          }

          console.error('Erro ao traduzir palavra:', error)
          setState({ translation: '', isLoading: false, error: true })
        })
    }, HOVER_DEBOUNCE_MS)
  }, [word, cancelPending])

  useEffect(() => {
    return () => {
      cancelPending()
    }
  }, [cancelPending])

  return {
    translation: state.translation,
    isLoading: state.isLoading,
    error: state.error,
    requestTranslation,
    cancelPending,
  }
}
