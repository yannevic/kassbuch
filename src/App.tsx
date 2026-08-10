import { useState } from 'react'
import Diary, { addDays } from './pages/Diary'
import TitlePage from './pages/TitlePage'

type View = 'home' | 'diary'

function App() {
  const [view, setView] = useState<View>('home')
  const [targetAnchorDate, setTargetAnchorDate] = useState<string | undefined>(undefined)
  const [diaryKey, setDiaryKey] = useState(0)

  const handleOpenDiary = (date: string) => {
    setTargetAnchorDate(addDays(date, -1))
    setDiaryKey((current) => current + 1)
    setView('diary')
  }

  const handleOpenFirstDay = () => {
    setTargetAnchorDate('2026-01-01')
    setDiaryKey((current) => current + 1)
    setView('diary')
  }

  const handleNavigateHome = () => {
    setView('home')
  }

  if (view === 'home') {
    return <TitlePage onOpenDiary={handleOpenDiary} onOpenFirstDay={handleOpenFirstDay} />
  }

  return (
    <Diary
      key={diaryKey}
      initialAnchorDate={targetAnchorDate}
      onNavigateHome={handleNavigateHome}
    />
  )
}

export default App
