import { useEffect, useState } from 'react'
import Diary, { getAnchorForDate } from './pages/Diary'
import TitlePage from './pages/TitlePage'
import TitleBar from './components/TitleBar'
import SettingsModal from './components/SettingsModal'
import BackupModal from './components/BackupModal'
import PinGate from './components/PinGate'
import MobileNavBar from './components/MobileNavBar'
import { isElectron } from './lib/db'
import { loadPersistedQuotaExceeded } from './lib/translate'

type View = 'home' | 'diary'

function App() {
  const [view, setView] = useState<View>('home')
  const [targetAnchorDate, setTargetAnchorDate] = useState<string | undefined>(undefined)
  const [diaryKey, setDiaryKey] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isBackupOpen, setIsBackupOpen] = useState(false)

  useEffect(() => {
    loadPersistedQuotaExceeded().catch((error) => {
      console.error('Erro ao carregar estado de cota da DeepL:', error)
    })
  }, [])

  const handleOpenDiary = (date: string) => {
    setTargetAnchorDate(getAnchorForDate(date))
    setDiaryKey((current) => current + 1)
    setView('diary')
  }

  const handleOpenFirstDay = () => {
    setTargetAnchorDate(getAnchorForDate('2026-01-01'))
    setDiaryKey((current) => current + 1)
    setView('diary')
  }

  const handleNavigateHome = () => {
    setView('home')
  }

  const handleOpenSettings = () => {
    setIsSettingsOpen(true)
  }

  const handleCloseSettings = () => {
    setIsSettingsOpen(false)
  }

  const handleOpenBackupFromSettings = () => {
    setIsSettingsOpen(false)
    setIsBackupOpen(true)
  }

  const handleCloseBackup = () => {
    setIsBackupOpen(false)
  }

  const content = (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      {isElectron() ? <TitleBar /> : null}
      <MobileNavBar
        onHome={view === 'diary' ? handleNavigateHome : undefined}
        onSettings={handleOpenSettings}
      />
      <div className="flex-1 overflow-hidden">
        {view === 'home' ? (
          <TitlePage
            onOpenDiary={handleOpenDiary}
            onOpenFirstDay={handleOpenFirstDay}
            onOpenSettings={handleOpenSettings}
          />
        ) : (
          <Diary
            key={diaryKey}
            initialAnchorDate={targetAnchorDate}
            onNavigateHome={handleNavigateHome}
            onOpenSettings={handleOpenSettings}
          />
        )}
      </div>

      {isSettingsOpen ? (
        <SettingsModal onClose={handleCloseSettings} onOpenBackup={handleOpenBackupFromSettings} />
      ) : null}

      {isBackupOpen ? <BackupModal onClose={handleCloseBackup} /> : null}
    </div>
  )

  if (isElectron()) {
    return content
  }

  return <PinGate>{content}</PinGate>
}

export default App
