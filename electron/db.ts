import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

const dbPath = join(app.getPath('userData'), 'diario.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    date TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    text TEXT NOT NULL DEFAULT '',
    updatedAt TEXT NOT NULL
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS translation_cache (
    word TEXT PRIMARY KEY,
    translation TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`)

export interface DiaryEntry {
  date: string
  title: string
  text: string
  updatedAt: string
}

export function getEntry(date: string): DiaryEntry | undefined {
  const stmt = db.prepare('SELECT * FROM entries WHERE date = ?')
  return stmt.get(date) as DiaryEntry | undefined
}

export function saveEntry(date: string, title: string, text: string): DiaryEntry {
  const updatedAt = new Date().toISOString()
  const stmt = db.prepare(`
    INSERT INTO entries (date, title, text, updatedAt)
    VALUES (@date, @title, @text, @updatedAt)
    ON CONFLICT(date) DO UPDATE SET
      title = @title,
      text = @text,
      updatedAt = @updatedAt
  `)
  stmt.run({ date, title, text, updatedAt })
  return { date, title, text, updatedAt }
}

export function getAllEntryDates(): string[] {
  const stmt = db.prepare('SELECT date FROM entries ORDER BY date')
  const rows = stmt.all() as { date: string }[]
  return rows.map((row) => row.date)
}

export function getCachedTranslation(word: string): string | undefined {
  const stmt = db.prepare('SELECT translation FROM translation_cache WHERE word = ?')
  const row = stmt.get(word) as { translation: string } | undefined
  if (row === undefined) {
    return undefined
  }
  return row.translation
}

export function setCachedTranslation(word: string, translation: string): void {
  const updatedAt = new Date().toISOString()
  const stmt = db.prepare(`
    INSERT INTO translation_cache (word, translation, updatedAt)
    VALUES (@word, @translation, @updatedAt)
    ON CONFLICT(word) DO UPDATE SET
      translation = @translation,
      updatedAt = @updatedAt
  `)
  stmt.run({ word, translation, updatedAt })
}

export function getSetting(key: string): string | undefined {
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?')
  const row = stmt.get(key) as { value: string } | undefined
  if (row === undefined) {
    return undefined
  }
  return row.value
}

export function setSetting(key: string, value: string): void {
  const stmt = db.prepare(`
    INSERT INTO settings (key, value)
    VALUES (@key, @value)
    ON CONFLICT(key) DO UPDATE SET
      value = @value
  `)
  stmt.run({ key, value })
}

export function getAllEntriesForBackup(): DiaryEntry[] {
  const stmt = db.prepare('SELECT * FROM entries ORDER BY date')
  return stmt.all() as DiaryEntry[]
}

export function getAllTranslationsForBackup(): {
  word: string
  translation: string
  updatedAt: string
}[] {
  const stmt = db.prepare('SELECT * FROM translation_cache')
  return stmt.all() as { word: string; translation: string; updatedAt: string }[]
}

export function restoreFromBackup(
  entries: DiaryEntry[],
  translations: { word: string; translation: string; updatedAt: string }[]
): void {
  const insertEntry = db.prepare(`
    INSERT INTO entries (date, title, text, updatedAt)
    VALUES (@date, @title, @text, @updatedAt)
    ON CONFLICT(date) DO UPDATE SET
      title = @title,
      text = @text,
      updatedAt = @updatedAt
  `)
  const insertTranslation = db.prepare(`
    INSERT INTO translation_cache (word, translation, updatedAt)
    VALUES (@word, @translation, @updatedAt)
    ON CONFLICT(word) DO UPDATE SET
      translation = @translation,
      updatedAt = @updatedAt
  `)

  const restoreAll = db.transaction(() => {
    entries.forEach((entry) => {
      insertEntry.run(entry)
    })
    translations.forEach((translation) => {
      insertTranslation.run(translation)
    })
  })

  restoreAll()
}
