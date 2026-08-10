import type { DiaryEntry, TranslationCacheEntry, BackupData } from '../types/electron'

export async function getEntry(date: string): Promise<DiaryEntry | undefined> {
  const result = await window.api.invoke('entries:get', date)
  return result as DiaryEntry | undefined
}

export async function saveEntry(date: string, title: string, text: string): Promise<DiaryEntry> {
  const result = await window.api.invoke('entries:save', { date, title, text })
  return result as DiaryEntry
}

export async function getAllEntryDates(): Promise<string[]> {
  const result = await window.api.invoke('entries:getAllDates')
  return result as string[]
}

export async function getCachedTranslation(word: string): Promise<string | undefined> {
  const result = await window.api.invoke('translation:getCached', word)
  return result as string | undefined
}

export async function setCachedTranslation(word: string, translation: string): Promise<void> {
  await window.api.invoke('translation:setCached', { word, translation })
}

export async function getSetting(key: string): Promise<string | undefined> {
  const result = await window.api.invoke('settings:get', key)
  return result as string | undefined
}

export async function setSetting(key: string, value: string): Promise<void> {
  await window.api.invoke('settings:set', { key, value })
}

export async function exportBackup(): Promise<BackupData> {
  const result = await window.api.invoke('backup:export')
  return result as BackupData
}

export async function importBackup(data: BackupData): Promise<void> {
  await window.api.invoke('backup:import', data)
}
