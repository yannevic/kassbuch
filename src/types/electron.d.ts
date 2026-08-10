export interface DiaryEntry {
  date: string
  title: string
  text: string
  updatedAt: string
}

export interface TranslationCacheEntry {
  word: string
  translation: string
  updatedAt: string
}

export interface BackupData {
  entries: DiaryEntry[]
  translations: TranslationCacheEntry[]
}

export interface ElectronApi {
  send: (channel: string, data?: unknown) => void
  on: (channel: string, callback: (...args: unknown[]) => void) => void
  invoke: (channel: string, data?: unknown) => Promise<unknown>
}

declare global {
  interface Window {
    api: ElectronApi
  }
}
