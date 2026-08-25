import { useEffect, useMemo, useRef, useState } from 'react'
import PageView from '../components/PageView'
import { getEntry, saveEntry } from '../lib/db'

export function getTodayDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(dateString: string, delta: number) {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + delta)
  const newYear = date.getFullYear()
  const newMonth = String(date.getMonth() + 1).padStart(2, '0')
  const newDay = String(date.getDate()).padStart(2, '0')
  return `${newYear}-${newMonth}-${newDay}`
}

export function getAnchorForDate(dateString: string) {
  const [refYear, refMonth, refDay] = '2026-01-01'.split('-').map(Number)
  const referenceUtc = Date.UTC(refYear, refMonth - 1, refDay)
  const [year, month, day] = dateString.split('-').map(Number)
  const targetUtc = Date.UTC(year, month - 1, day)
  const diffDays = Math.round((targetUtc - referenceUtc) / 86400000)
  const parity = ((diffDays % 2) + 2) % 2

  if (parity === 0) {
    return addDays(dateString, -1)
  }

  return dateString
}

function formatDateBR(dateString: string) {
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}

type DiaryProps = {
  initialAnchorDate?: string
  onNavigateHome: () => void
  onOpenSettings: () => void
}

export default function Diary(props: DiaryProps) {
  const { initialAnchorDate, onNavigateHome, onOpenSettings } = props

  const [anchorDate, setAnchorDate] = useState(
    initialAnchorDate ?? addDays(getTodayDateString(), -1)
  )
  const [leftTitle, setLeftTitle] = useState('')
  const [leftText, setLeftText] = useState('')
  const [rightTitle, setRightTitle] = useState('')
  const [rightText, setRightText] = useState('')
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isSwitching, setIsSwitching] = useState(true)

  const leftDate = anchorDate
  const rightDate = useMemo(() => addDays(anchorDate, 1), [anchorDate])

  const leftDateLabel = useMemo(() => formatDateBR(leftDate), [leftDate])
  const rightDateLabel = useMemo(() => formatDateBR(rightDate), [rightDate])

  const leftTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leftValuesRef = useRef({ date: leftDate, title: leftTitle, text: leftText })
  const rightValuesRef = useRef({ date: rightDate, title: rightTitle, text: rightText })

  useEffect(() => {
    leftValuesRef.current = { date: leftDate, title: leftTitle, text: leftText }
  }, [leftDate, leftTitle, leftText])

  useEffect(() => {
    rightValuesRef.current = { date: rightDate, title: rightTitle, text: rightText }
  }, [rightDate, rightTitle, rightText])

  useEffect(() => {
    setIsSwitching(true)

    Promise.all([getEntry(leftDate), getEntry(rightDate)])
      .then(([leftEntry, rightEntry]) => {
        if (leftEntry) {
          setLeftTitle(leftEntry.title)
          setLeftText(leftEntry.text)
        } else {
          setLeftTitle('')
          setLeftText('')
        }

        if (rightEntry) {
          setRightTitle(rightEntry.title)
          setRightText(rightEntry.text)
        } else {
          setRightTitle('')
          setRightText('')
        }

        setIsInitialLoading(false)
        setIsSwitching(false)
      })
      .catch((error) => {
        console.error('Erro ao carregar entradas:', error)
        setIsInitialLoading(false)
        setIsSwitching(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftDate, rightDate])

  useEffect(() => {
    if (isInitialLoading) {
      return undefined
    }

    leftTimeoutRef.current = setTimeout(() => {
      if (leftTitle === '' && leftText === '') {
        return
      }
      saveEntry(leftDate, leftTitle, leftText).catch((error) => {
        console.error('Erro ao salvar entrada (esquerda):', error)
      })
    }, 600)

    return () => {
      if (leftTimeoutRef.current) {
        clearTimeout(leftTimeoutRef.current)
        leftTimeoutRef.current = null
      }
    }
  }, [leftTitle, leftText, leftDate, isInitialLoading])

  useEffect(() => {
    if (isInitialLoading) {
      return undefined
    }

    rightTimeoutRef.current = setTimeout(() => {
      if (rightTitle === '' && rightText === '') {
        return
      }
      saveEntry(rightDate, rightTitle, rightText).catch((error) => {
        console.error('Erro ao salvar entrada (direita):', error)
      })
    }, 600)

    return () => {
      if (rightTimeoutRef.current) {
        clearTimeout(rightTimeoutRef.current)
        rightTimeoutRef.current = null
      }
    }
  }, [rightTitle, rightText, rightDate, isInitialLoading])

  const flushPendingSaves = () => {
    if (leftTimeoutRef.current) {
      clearTimeout(leftTimeoutRef.current)
      leftTimeoutRef.current = null
    }

    if (rightTimeoutRef.current) {
      clearTimeout(rightTimeoutRef.current)
      rightTimeoutRef.current = null
    }

    const left = leftValuesRef.current
    const right = rightValuesRef.current

    if (left.title !== '' || left.text !== '') {
      saveEntry(left.date, left.title, left.text).catch((error) => {
        console.error('Erro ao salvar entrada (esquerda):', error)
      })
    }

    if (right.title !== '' || right.text !== '') {
      saveEntry(right.date, right.title, right.text).catch((error) => {
        console.error('Erro ao salvar entrada (direita):', error)
      })
    }
  }

  const handlePrevDay = () => {
    if (leftDate <= '2026-01-01') {
      flushPendingSaves()
      onNavigateHome()
      return
    }
    flushPendingSaves()
    setAnchorDate((current) => addDays(current, -2))
  }

  const handleNextDay = () => {
    flushPendingSaves()
    setAnchorDate((current) => addDays(current, 2))
  }

  const handleNavigateHome = () => {
    flushPendingSaves()
    onNavigateHome()
  }

  return (
    <div className="flex h-full w-full justify-center bg-void-950 p-0 md:p-8">
      <PageView
        leftTitle={leftTitle}
        leftText={leftText}
        leftDateLabel={leftDateLabel}
        onLeftTitleChange={setLeftTitle}
        onLeftTextChange={setLeftText}
        rightTitle={rightTitle}
        rightText={rightText}
        rightDateLabel={rightDateLabel}
        onRightTitleChange={setRightTitle}
        onRightTextChange={setRightText}
        onNavigatePrev={handlePrevDay}
        onNavigateNext={handleNextDay}
        onNavigateHome={handleNavigateHome}
        onOpenSettings={onOpenSettings}
        isSwitching={isSwitching}
      />
    </div>
  )
}
