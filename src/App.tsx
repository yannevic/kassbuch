import { useState } from 'react'
import Diary, { getAnchorForDate } from './pages/Diary'
import TitlePage from './pages/TitlePage'
import TitleBar from './components/TitleBar'
import SettingsModal from './components/SettingsModal'
import BackupModal from './components/BackupModal'

type View = 'home' | 'diary'

function App() {
  const [view, setView] = useState<View>('home')
  const [targetAnchorDate, setTargetAnchorDate] = useState<string | undefined>(undefined)
  const [diaryKey, setDiaryKey] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isBackupOpen, setIsBackupOpen] = useState(false)

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

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <TitleBar />
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
}

export default App
