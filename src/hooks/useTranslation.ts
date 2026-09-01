import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  translateWord,
  subscribeToLastSource,
  getLastSourceSnapshot,
  subscribeToQuotaExceeded,
  getQuotaExceededSnapshot,
} from '../lib/translate'
import type { TranslationSource } from '../lib/translate'

type TranslationState = {
  translation: string
  isLoading: boolean
  error: boolean
}

const HOVER_DEBOUNCE_MS = 300

const memoryCache = new Map<string, string>()

export function useDeeplQuotaExceeded(): boolean {
  return useSyncExternalStore(subscribeToQuotaExceeded, getQuotaExceededSnapshot)
}

export function useLastTranslationSource(): TranslationSource | null {
  return useSyncExternalStore(subscribeToLastSource, getLastSourceSnapshot)
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
