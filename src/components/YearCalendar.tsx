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

function getStatusClassName(status: string, sizeClassName: string) {
  const base = `flex items-center justify-center rounded-full font-handwriting transition-colors ${sizeClassName}`

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

type MonthGridProps = {
  year: number
  monthIndex: number
  todayDate: string
  entrySet: Set<string>
  onDayClick: (date: string) => void
  cellSizeClassName: string
  weekdayTextClassName: string
  gapClassName: string
}

function MonthGrid(props: MonthGridProps) {
  const {
    year,
    monthIndex,
    todayDate,
    entrySet,
    onDayClick,
    cellSizeClassName,
    weekdayTextClassName,
    gapClassName,
  } = props

  return (
    <div className={`grid grid-cols-7 ${gapClassName}`}>
      {WEEKDAY_LABELS.map((label, labelIndex) => (
        <span
          key={`weekday-${monthIndex}-${label}-${labelIndex}`}
          className={`text-center ${weekdayTextClassName}`}
        >
          {label}
        </span>
      ))}
      {buildMonthDays(year, monthIndex).map((dateStr, cellIndex) => {
        if (dateStr === null) {
          return <span key={`empty-${monthIndex}-${cellIndex}`} />
        }

        const status = getDayStatus(dateStr, todayDate, entrySet)

        return (
          <button
            key={dateStr}
            type="button"
            onClick={() => onDayClick(dateStr)}
            className={getStatusClassName(status, cellSizeClassName)}
          >
            {Number(dateStr.slice(-2))}
          </button>
        )
      })}
    </div>
  )
}

export default function YearCalendar(props: YearCalendarProps) {
  const { year, onYearChange, entryDates, todayDate, onDayClick } = props

  const [semester, setSemester] = useState(() => (new Date().getMonth() < 6 ? 0 : 1))
  const [mobileMonthIndex, setMobileMonthIndex] = useState(() => new Date().getMonth())

  const entrySet = useMemo(() => new Set(entryDates), [entryDates])

  const isAtLowerBound = year <= MIN_YEAR && semester === 0
  const isAtLowerBoundMobile = year <= MIN_YEAR && mobileMonthIndex === 0

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

  const handlePrevMonth = () => {
    if (mobileMonthIndex === 0) {
      if (year <= MIN_YEAR) {
        return
      }
      onYearChange(year - 1)
      setMobileMonthIndex(11)
      return
    }
    setMobileMonthIndex((current) => current - 1)
  }

  const handleNextMonth = () => {
    if (mobileMonthIndex === 11) {
      onYearChange(year + 1)
      setMobileMonthIndex(0)
      return
    }
    setMobileMonthIndex((current) => current + 1)
  }

  const visibleMonths = MONTH_NAMES.slice(semester * 6, semester * 6 + 6)

  return (
    <div className="w-full">
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

      <div className="hidden md:block">
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
                <MonthGrid
                  year={year}
                  monthIndex={monthIndex}
                  todayDate={todayDate}
                  entrySet={entrySet}
                  onDayClick={onDayClick}
                  cellSizeClassName="h-5 w-5 text-[10px]"
                  weekdayTextClassName="text-[9px] text-ink-900/40"
                  gapClassName="gap-0.5"
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="md:hidden">
        <div className="mb-3 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Mês anterior"
            disabled={isAtLowerBoundMobile}
            className="flex h-9 w-9 items-center justify-center text-ink-900/50 transition-colors hover:text-ink-900 disabled:opacity-20 disabled:hover:text-ink-900/50"
          >
            <ChevronLeft size={22} />
          </button>
          <span className="font-handwriting text-lg text-ink-900">
            {MONTH_NAMES[mobileMonthIndex]}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Próximo mês"
            className="flex h-9 w-9 items-center justify-center text-ink-900/50 transition-colors hover:text-ink-900"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <MonthGrid
          year={year}
          monthIndex={mobileMonthIndex}
          todayDate={todayDate}
          entrySet={entrySet}
          onDayClick={onDayClick}
          cellSizeClassName="h-10 w-10 text-sm"
          weekdayTextClassName="text-xs text-ink-900/40"
          gapClassName="gap-1"
        />
      </div>
    </div>
  )
}
