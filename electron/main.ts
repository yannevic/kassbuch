import 'dotenv/config'
import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import {
  initDb,
  getEntry,
  saveEntry,
  getAllEntryDates,
  getCachedTranslation,
  setCachedTranslation,
  getAllEntriesForBackup,
  getAllTranslationsForBackup,
  restoreFromBackup,
  getSetting,
  setSetting,
} from './db'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.maximize()
    mainWindow?.show()
  })

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximized')
  })

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:unmaximized')
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(async () => {
  await initDb()

  ipcMain.handle('entries:get', async (_event, date: string) => {
    return await getEntry(date)
  })

  ipcMain.handle(
    'entries:save',
    async (_event, { date, title, text }: { date: string; title: string; text: string }) => {
      return await saveEntry(date, title, text)
    }
  )

  ipcMain.handle('entries:getAllDates', async () => {
    return await getAllEntryDates()
  })

  ipcMain.handle('translation:getCached', async (_event, word: string) => {
    return await getCachedTranslation(word)
  })

  ipcMain.handle(
    'translation:setCached',
    async (_event, { word, translation }: { word: string; translation: string }) => {
      await setCachedTranslation(word, translation)
    }
  )

  ipcMain.handle(
    'translation:deepl',
    async (_event, { word, apiKey }: { word: string; apiKey: string }) => {
      const body = new URLSearchParams({
        text: word,
        source_lang: 'DE',
        target_lang: 'PT-BR',
      })

      const response = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `DeepL-Auth-Key ${apiKey}`,
        },
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
  )

  ipcMain.handle('settings:get', async (_event, key: string) => {
    return await getSetting(key)
  })

  ipcMain.handle('settings:set', async (_event, { key, value }: { key: string; value: string }) => {
    await setSetting(key, value)
  })

  ipcMain.handle('backup:export', async () => {
    return {
      entries: await getAllEntriesForBackup(),
      translations: await getAllTranslationsForBackup(),
    }
  })

  ipcMain.handle(
    'backup:import',
    async (
      _event,
      data: {
        entries: { date: string; title: string; text: string; updatedAt: string }[]
        translations: { word: string; translation: string; updatedAt: string }[]
      }
    ) => {
      await restoreFromBackup(data.entries, data.translations)
    }
  )

  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.handle('window:close', () => {
    mainWindow?.close()
  })

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow?.isMaximized() ?? false
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
