import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PageLeaf from './PageLeaf'

type PageViewProps = {
  leftTitle: string
  leftText: string
  leftDateLabel: string
  onLeftTitleChange: (value: string) => void
  onLeftTextChange: (value: string) => void
  rightTitle: string
  rightText: string
  rightDateLabel: string
  onRightTitleChange: (value: string) => void
  onRightTextChange: (value: string) => void
  onNavigatePrev: () => void
  onNavigateNext: () => void
  onNavigateHome: () => void
  onOpenSettings: () => void
  isSwitching: boolean
}

export default function PageView(props: PageViewProps) {
  const {
    leftTitle,
    leftText,
    leftDateLabel,
    onLeftTitleChange,
    onLeftTextChange,
    rightTitle,
    rightText,
    rightDateLabel,
    onRightTitleChange,
    onRightTextChange,
    onNavigatePrev,
    onNavigateNext,
    onNavigateHome,
    onOpenSettings,
    isSwitching,
  } = props

  const lineBackgroundStyle = useMemo(() => {
    return {
      backgroundImage:
        'repeating-linear-gradient(to bottom, transparent, transparent 35px, var(--color-line-300) 35px, var(--color-line-300) 36px)',
      backgroundPosition: '0 8px',
      backgroundOrigin: 'border-box' as const,
    }
  }, [])

  const textPageStyle = useMemo(() => {
    return {
      ...lineBackgroundStyle,
      paddingTop: '55px',
      paddingLeft: '20px',
      paddingRight: '20px',
    }
  }, [lineBackgroundStyle])

  return (
    <div className="relative mx-auto flex h-full w-full max-w-350 flex-col items-center">
      <span
        className={`pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-sm text-rift-300 transition-opacity ${isSwitching ? 'opacity-100' : 'opacity-0'}`}
      >
        Carregando&hellip;
      </span>
      <div className="flex h-full w-full shrink-0 items-stretch md:h-[78vh]">
        <div className="relative flex w-full overflow-hidden md:rounded-lg md:shadow-2xl">
          <PageLeaf
            title={leftTitle}
            text={leftText}
            dateLabel={leftDateLabel}
            onTitleChange={onLeftTitleChange}
            onTextChange={onLeftTextChange}
            backgroundClassName="bg-page-100"
            textPageStyle={textPageStyle}
            hiddenOnNarrow
            onHome={onNavigateHome}
            onSettings={onOpenSettings}
          />
          <PageLeaf
            title={rightTitle}
            text={rightText}
            dateLabel={rightDateLabel}
            onTitleChange={onRightTitleChange}
            onTextChange={onRightTextChange}
            backgroundClassName="bg-page-50"
            textPageStyle={textPageStyle}
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-6 -translate-x-1/2 md:block"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(43,33,24,0.18) 45%, rgba(43,33,24,0.28) 50%, rgba(43,33,24,0.18) 55%, transparent)',
            }}
          />
          <button
            type="button"
            onClick={onNavigatePrev}
            aria-label="Dia anterior"
            className="group absolute inset-y-0 left-0 flex w-8 items-center justify-center outline-none"
          >
            <ChevronLeft
              size={22}
              className="text-ink-900/0 transition-colors group-hover:text-ink-900/40"
            />
          </button>
          <button
            type="button"
            onClick={onNavigateNext}
            aria-label="Próximo dia"
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
  )
}
