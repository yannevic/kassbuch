import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import {
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

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  ipcMain.handle('entries:get', (_event, date: string) => {
    return getEntry(date)
  })

  ipcMain.handle(
    'entries:save',
    (_event, { date, title, text }: { date: string; title: string; text: string }) => {
      return saveEntry(date, title, text)
    }
  )

  ipcMain.handle('entries:getAllDates', () => {
    return getAllEntryDates()
  })

  ipcMain.handle('translation:getCached', (_event, word: string) => {
    return getCachedTranslation(word)
  })

  ipcMain.handle(
    'translation:setCached',
    (_event, { word, translation }: { word: string; translation: string }) => {
      setCachedTranslation(word, translation)
    }
  )

  ipcMain.handle('settings:get', (_event, key: string) => {
    return getSetting(key)
  })

  ipcMain.handle('settings:set', (_event, { key, value }: { key: string; value: string }) => {
    setSetting(key, value)
  })

  ipcMain.handle('backup:export', () => {
    return {
      entries: getAllEntriesForBackup(),
      translations: getAllTranslationsForBackup(),
    }
  })

  ipcMain.handle(
    'backup:import',
    (
      _event,
      data: {
        entries: { date: string; title: string; text: string; updatedAt: string }[]
        translations: { word: string; translation: string; updatedAt: string }[]
      }
    ) => {
      restoreFromBackup(data.entries, data.translations)
    }
  )

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
