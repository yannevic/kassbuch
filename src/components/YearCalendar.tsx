import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type YearCalendarProps = {
  year: number
  onYearChange: (year: number) => void
  entryDates: string[]
  todayDate: string
  onDayClick: (date: string) => void
}

const MIN_YEAR = 2026

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

function buildMonthDays(year: number, monthIndex: number): (string | null)[] {
  const firstDay = new Date(year, monthIndex, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells: (string | null)[] = []

  let emptyIndex = 0
  while (emptyIndex < startWeekday) {
    cells.push(null)
    emptyIndex += 1
  }

  let day = 1
  while (day <= daysInMonth) {
    cells.push(`${year}-${pad2(monthIndex + 1)}-${pad2(day)}`)
    day += 1
  }

  return cells
}

function getDayStatus(dateStr: string, todayDate: string, entrySet: Set<string>) {
  if (dateStr === todayDate) {
    return 'today'
  }
  if (dateStr < todayDate) {
    if (entrySet.has(dateStr)) {
      return 'written'
    }
    return 'missing'
  }
  return 'future'
}

function getStatusClassName(status: string) {
  const base =
    'flex h-5 w-5 items-center justify-center rounded-full font-handwriting text-[10px] transition-colors'

  if (status === 'today') {
    return `${base} border-2 border-emerald-500 text-emerald-700`
  }
  if (status === 'written') {
    return `${base} bg-gold-400/40 text-ink-900 hover:bg-gold-400/60`
  }
  if (status === 'missing') {
    return `${base} text-red-600/70 hover:bg-red-600/10`
  }
  return `${base} text-ink-900/25 hover:bg-ink-900/10`
}

export default function YearCalendar(props: YearCalendarProps) {
  const { year, onYearChange, entryDates, todayDate, onDayClick } = props

  const [semester, setSemester] = useState(() => (new Date().getMonth() < 6 ? 0 : 1))

  const entrySet = useMemo(() => new Set(entryDates), [entryDates])

  const isAtLowerBound = year <= MIN_YEAR && semester === 0

  const handlePrevYear = () => {
    if (year <= MIN_YEAR) {
      return
    }
    onYearChange(year - 1)
  }

  const handleNextYear = () => {
    onYearChange(year + 1)
  }

  const handlePrevBlock = () => {
    if (semester === 0) {
      if (year <= MIN_YEAR) {
        return
      }
      onYearChange(year - 1)
      setSemester(1)
      return
    }
    setSemester(0)
  }

  const handleNextBlock = () => {
    if (semester === 1) {
      onYearChange(year + 1)
      setSemester(0)
      return
    }
    setSemester(1)
  }

  const visibleMonths = MONTH_NAMES.slice(semester * 6, semester * 6 + 6)

  return (
    <div>
      <div className="mb-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={handlePrevYear}
          aria-label="Ano anterior"
          disabled={year <= MIN_YEAR}
          className="text-ink-900/50 transition-colors hover:text-ink-900 disabled:opacity-20 disabled:hover:text-ink-900/50"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-handwriting text-2xl text-ink-900">{year}</span>
        <button
          type="button"
          onClick={handleNextYear}
          aria-label="Próximo ano"
          className="text-ink-900/50 transition-colors hover:text-ink-900"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mb-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handlePrevBlock}
          aria-label="Semestre anterior"
          disabled={isAtLowerBound}
          className="text-ink-900/50 transition-colors hover:text-ink-900 disabled:opacity-20 disabled:hover:text-ink-900/50"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-handwriting text-sm text-ink-900/60">
          {semester === 0 ? 'Jan – Jun' : 'Jul – Dez'}
        </span>
        <button
          type="button"
          onClick={handleNextBlock}
          aria-label="Próximo semestre"
          className="text-ink-900/50 transition-colors hover:text-ink-900"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {visibleMonths.map((name, localIndex) => {
          const monthIndex = semester * 6 + localIndex

          return (
            <div key={name}>
              <p className="mb-1 text-center font-handwriting text-sm text-ink-900/70">{name}</p>
              <div className="grid grid-cols-7 gap-0.5">
                {WEEKDAY_LABELS.map((label, labelIndex) => (
                  <span
                    key={`${name}-weekday-${label}-${labelIndex}`}
                    className="text-center text-[9px] text-ink-900/40"
                  >
                    {label}
                  </span>
                ))}
                {buildMonthDays(year, monthIndex).map((dateStr, cellIndex) => {
                  if (dateStr === null) {
                    return <span key={`${name}-empty-${cellIndex}`} />
                  }

                  const status = getDayStatus(dateStr, todayDate, entrySet)

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => onDayClick(dateStr)}
                      className={getStatusClassName(status)}
                    >
                      {Number(dateStr.slice(-2))}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
