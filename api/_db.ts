import { createClient } from '@libsql/client'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
})

export interface DiaryEntry {
  date: string
  title: string
  text: string
  updatedAt: string
}

export async function getEntry(date: string): Promise<DiaryEntry | undefined> {
  const result = await db.execute({
    sql: 'SELECT * FROM entries WHERE date = ?',
    args: [date],
  })
  return result.rows[0] as unknown as DiaryEntry | undefined
}

export async function saveEntry(date: string, title: string, text: string): Promise<DiaryEntry> {
  const updatedAt = new Date().toISOString()
  await db.execute({
    sql: `
      INSERT INTO entries (date, title, text, updatedAt)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        title = excluded.title,
        text = excluded.text,
        updatedAt = excluded.updatedAt
    `,
    args: [date, title, text, updatedAt],
  })
  return { date, title, text, updatedAt }
}

export async function getAllEntryDates(): Promise<string[]> {
  const result = await db.execute('SELECT date FROM entries ORDER BY date')
  return result.rows.map((row) => row.date as string)
}

export async function getCachedTranslation(word: string): Promise<string | undefined> {
  const result = await db.execute({
    sql: 'SELECT translation FROM translation_cache WHERE word = ?',
    args: [word],
  })
  const row = result.rows[0]
  if (row === undefined) {
    return undefined
  }
  return row.translation as string
}

export async function setCachedTranslation(word: string, translation: string): Promise<void> {
  const updatedAt = new Date().toISOString()
  await db.execute({
    sql: `
      INSERT INTO translation_cache (word, translation, updatedAt)
      VALUES (?, ?, ?)
      ON CONFLICT(word) DO UPDATE SET
        translation = excluded.translation,
        updatedAt = excluded.updatedAt
    `,
    args: [word, translation, updatedAt],
  })
}

export async function getSetting(key: string): Promise<string | undefined> {
  const result = await db.execute({
    sql: 'SELECT value FROM settings WHERE key = ?',
    args: [key],
  })
  const row = result.rows[0]
  if (row === undefined) {
    return undefined
  }
  return row.value as string
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.execute({
    sql: `
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value
    `,
    args: [key, value],
  })
}

export async function getAllEntriesForBackup(): Promise<DiaryEntry[]> {
  const result = await db.execute('SELECT * FROM entries ORDER BY date')
  return result.rows as unknown as DiaryEntry[]
}

export async function getAllTranslationsForBackup(): Promise<
  { word: string; translation: string; updatedAt: string }[]
> {
  const result = await db.execute('SELECT * FROM translation_cache')
  return result.rows as unknown as { word: string; translation: string; updatedAt: string }[]
}

export async function restoreFromBackup(
  entries: DiaryEntry[],
  translations: { word: string; translation: string; updatedAt: string }[]
): Promise<void> {
  const entryStatements = entries.map((entry) => ({
    sql: `
      INSERT INTO entries (date, title, text, updatedAt)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        title = excluded.title,
        text = excluded.text,
        updatedAt = excluded.updatedAt
    `,
    args: [entry.date, entry.title, entry.text, entry.updatedAt],
  }))

  const translationStatements = translations.map((translation) => ({
    sql: `
      INSERT INTO translation_cache (word, translation, updatedAt)
      VALUES (?, ?, ?)
      ON CONFLICT(word) DO UPDATE SET
        translation = excluded.translation,
        updatedAt = excluded.updatedAt
    `,
    args: [translation.word, translation.translation, translation.updatedAt],
  }))

  await db.batch([...entryStatements, ...translationStatements], 'write')
}
