import { useState } from 'react'
import Diary, { getAnchorForDate } from './pages/Diary'
import TitlePage from './pages/TitlePage'
import TitleBar from './components/TitleBar'

type View = 'home' | 'diary'

function App() {
  const [view, setView] = useState<View>('home')
  const [targetAnchorDate, setTargetAnchorDate] = useState<string | undefined>(undefined)
  const [diaryKey, setDiaryKey] = useState(0)

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

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <TitleBar />
      <div className="flex-1 overflow-hidden">
        {view === 'home' ? (
          <TitlePage onOpenDiary={handleOpenDiary} onOpenFirstDay={handleOpenFirstDay} />
        ) : (
          <Diary
            key={diaryKey}
            initialAnchorDate={targetAnchorDate}
            onNavigateHome={handleNavigateHome}
          />
        )}
      </div>
    </div>
  )
}

export default App
