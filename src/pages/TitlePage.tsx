import { useEffect, useRef, useState } from 'react'
import { ChevronRight, Settings } from 'lucide-react'
import { getAllEntryDates, getSetting, setSetting } from '../lib/db'
import { getTodayDateString } from './Diary'
import YearCalendar from '../components/YearCalendar'

type TitlePageProps = {
  onOpenDiary: (date: string) => void
  onOpenFirstDay: () => void
  onOpenSettings: () => void
}

export default function TitlePage(props: TitlePageProps) {
  const { onOpenDiary, onOpenFirstDay, onOpenSettings } = props

  const [pertenceA, setPertenceA] = useState('')
  const [namoradaFavorita, setNamoradaFavorita] = useState('')
  const [entryDates, setEntryDates] = useState<string[]>([])
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(true)

  const pertenceARef = useRef('')
  const namoradaFavoritaRef = useRef('')
  const pertenceATimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const namoradaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    pertenceARef.current = pertenceA
  }, [pertenceA])

  useEffect(() => {
    namoradaFavoritaRef.current = namoradaFavorita
  }, [namoradaFavorita])

  useEffect(() => {
    Promise.all([getSetting('pertence_a'), getSetting('namorada_favorita'), getAllEntryDates()])
      .then(([pertenceAValue, namoradaValue, dates]) => {
        setPertenceA(pertenceAValue ?? '')
        setNamoradaFavorita(namoradaValue ?? '')
        setEntryDates(dates)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Erro ao carregar página inicial:', error)
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    if (isLoading) {
      return undefined
    }

    pertenceATimeoutRef.current = setTimeout(() => {
      setSetting('pertence_a', pertenceA).catch((error) => {
        console.error('Erro ao salvar pertence_a:', error)
      })
    }, 600)

    return () => {
      if (pertenceATimeoutRef.current) {
        clearTimeout(pertenceATimeoutRef.current)
        pertenceATimeoutRef.current = null
      }
    }
  }, [pertenceA, isLoading])

  useEffect(() => {
    if (isLoading) {
      return undefined
    }

    namoradaTimeoutRef.current = setTimeout(() => {
      setSetting('namorada_favorita', namoradaFavorita).catch((error) => {
        console.error('Erro ao salvar namorada_favorita:', error)
      })
    }, 600)

    return () => {
      if (namoradaTimeoutRef.current) {
        clearTimeout(namoradaTimeoutRef.current)
        namoradaTimeoutRef.current = null
      }
    }
  }, [namoradaFavorita, isLoading])

  const flushPendingSettings = () => {
    if (pertenceATimeoutRef.current) {
      clearTimeout(pertenceATimeoutRef.current)
      pertenceATimeoutRef.current = null
    }

    if (namoradaTimeoutRef.current) {
      clearTimeout(namoradaTimeoutRef.current)
      namoradaTimeoutRef.current = null
    }

    setSetting('pertence_a', pertenceARef.current).catch((error) => {
      console.error('Erro ao salvar pertence_a:', error)
    })

    setSetting('namorada_favorita', namoradaFavoritaRef.current).catch((error) => {
      console.error('Erro ao salvar namorada_favorita:', error)
    })
  }

  const handleDayClick = (date: string) => {
    flushPendingSettings()
    onOpenDiary(date)
  }

  const handleOpenFirstDay = () => {
    flushPendingSettings()
    onOpenFirstDay()
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-void-950">
        <span className="text-void-800">Carregando&hellip;</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-void-950 p-8">
      <div className="mx-auto flex w-full max-w-350 flex-col items-center gap-2">
        <div className="flex h-[78vh] w-full shrink-0 items-stretch">
          <div className="relative grid w-full grid-cols-1 overflow-hidden rounded-lg shadow-2xl md:grid-cols-2">
            <div className="relative hidden bg-page-100 md:block">
              <button
                type="button"
                onClick={onOpenSettings}
                aria-label="Abrir configurações"
                className="group absolute z-10 flex h-8 w-8 items-center justify-center rounded-full outline-none transition-colors hover:bg-ink-900/10"
                style={{ bottom: '10px', left: '10px' }}
              >
                <Settings
                  size={16}
                  className="text-ink-900/40 transition-colors group-hover:text-ink-900/70"
                />
              </button>
            </div>

            <div className="flex min-w-0 flex-col overflow-y-auto bg-page-50 p-10">
              <div className="flex flex-1 flex-col items-center gap-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="font-handwriting text-lg text-ink-900/70">
                    Este diário pertence a:
                  </span>
                  <input
                    type="text"
                    value={pertenceA}
                    onChange={(event) => setPertenceA(event.target.value)}
                    placeholder="seu nome aqui&hellip;"
                    maxLength={40}
                    className="w-full max-w-xs border-b-2 border-gold-400 bg-transparent text-center font-handwriting text-2xl text-ink-900 placeholder-ink-900/30 outline-none"
                  />
                </div>

                <div className="flex flex-col items-center gap-2">
                  <span className="font-handwriting text-lg text-ink-900/70">
                    E a namorada favorita e mais legal é:
                  </span>
                  <input
                    type="text"
                    value={namoradaFavorita}
                    onChange={(event) => setNamoradaFavorita(event.target.value)}
                    placeholder="o nome dela aqui&hellip;"
                    maxLength={40}
                    className="w-full max-w-xs border-b-2 border-gold-400 bg-transparent text-center font-handwriting text-2xl text-ink-900 placeholder-ink-900/30 outline-none"
                  />
                </div>

                <YearCalendar
                  year={year}
                  onYearChange={setYear}
                  entryDates={entryDates}
                  todayDate={getTodayDateString()}
                  onDayClick={handleDayClick}
                />
              </div>
            </div>

            <div
              className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-6 -translate-x-1/2 md:block"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(43,33,24,0.18) 45%, rgba(43,33,24,0.28) 50%, rgba(43,33,24,0.18) 55%, transparent)',
              }}
            />

            <button
              type="button"
              onClick={handleOpenFirstDay}
              aria-label="Abrir o diário no dia 1"
              className="group absolute inset-y-0 right-0 flex w-8 items-center justify-center outline-none"
            >
              <ChevronRight
                size={22}
                className="text-ink-900/0 transition-colors group-hover:text-ink-900/40"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
