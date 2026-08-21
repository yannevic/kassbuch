import type { DiaryEntry, BackupData } from '../types/electron'

export const PIN_STORAGE_KEY = 'kassbuch_pin'

export function isElectron(): boolean {
  return typeof window !== 'undefined' && Boolean(window.api)
}

async function fetchJson(url: string, options?: RequestInit): Promise<unknown> {
  const pin = typeof window !== 'undefined' ? window.localStorage.getItem(PIN_STORAGE_KEY) : null

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.headers ?? {}),
      ...(pin ? { 'X-App-Pin': pin } : {}),
    },
  })

  if (!response.ok) {
    throw new Error(`REQUEST_FAILED_${response.status}`)
  }

  return response.json()
}

export async function getEntry(date: string): Promise<DiaryEntry | undefined> {
  if (isElectron()) {
    const result = await window.api.invoke('entries:get', date)
    return result as DiaryEntry | undefined
  }

  const result = await fetchJson(`/api/entries?date=${encodeURIComponent(date)}`)
  return (result ?? undefined) as DiaryEntry | undefined
}

export async function saveEntry(date: string, title: string, text: string): Promise<DiaryEntry> {
  if (isElectron()) {
    const result = await window.api.invoke('entries:save', { date, title, text })
    return result as DiaryEntry
  }

  const result = await fetchJson('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, title, text }),
  })
  return result as DiaryEntry
}

export async function getAllEntryDates(): Promise<string[]> {
  if (isElectron()) {
    const result = await window.api.invoke('entries:getAllDates')
    return result as string[]
  }

  const result = await fetchJson('/api/entries-dates')
  return result as string[]
}

export async function getCachedTranslation(word: string): Promise<string | undefined> {
  if (isElectron()) {
    const result = await window.api.invoke('translation:getCached', word)
    return result as string | undefined
  }

  const result = await fetchJson(`/api/translation?word=${encodeURIComponent(word)}`)
  return (result ?? undefined) as string | undefined
}

export async function setCachedTranslation(word: string, translation: string): Promise<void> {
  if (isElectron()) {
    await window.api.invoke('translation:setCached', { word, translation })
    return
  }

  await fetchJson('/api/translation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, translation }),
  })
}

export async function getSetting(key: string): Promise<string | undefined> {
  if (isElectron()) {
    const result = await window.api.invoke('settings:get', key)
    return result as string | undefined
  }

  const result = await fetchJson(`/api/settings?key=${encodeURIComponent(key)}`)
  return (result ?? undefined) as string | undefined
}

export async function setSetting(key: string, value: string): Promise<void> {
  if (isElectron()) {
    await window.api.invoke('settings:set', { key, value })
    return
  }

  await fetchJson('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  })
}

export async function exportBackup(): Promise<BackupData> {
  if (isElectron()) {
    const result = await window.api.invoke('backup:export')
    return result as BackupData
  }

  const result = await fetchJson('/api/backup')
  return result as BackupData
}

export async function importBackup(data: BackupData): Promise<void> {
  if (isElectron()) {
    await window.api.invoke('backup:import', data)
    return
  }

  await fetchJson('/api/backup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
