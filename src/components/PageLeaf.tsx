import HomeButton from './HomeButton'

type PageLeafProps = {
  title: string
  text: string
  dateLabel: string
  onTitleChange: (value: string) => void
  onTextChange: (value: string) => void
  backgroundClassName: string
  textPageStyle: React.CSSProperties
  hiddenOnNarrow?: boolean
  onHome?: () => void
}

export default function PageLeaf(props: PageLeafProps) {
  const {
    title,
    text,
    dateLabel,
    onTitleChange,
    onTextChange,
    backgroundClassName,
    textPageStyle,
    hiddenOnNarrow,
    onHome,
  } = props

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(event.target.value)
  }

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(event.target.value)
  }

  const containerClassName = hiddenOnNarrow
    ? `relative hidden flex-1 flex-col p-10 md:flex ${backgroundClassName}`
    : `relative flex flex-1 flex-col p-10 ${backgroundClassName}`

  return (
    <div className={containerClassName}>
      {onHome ? <HomeButton onClick={onHome} /> : null}

      <div
        className="mb-2 flex items-end gap-4 border-b-2 border-gold-400"
        style={{ paddingLeft: '8px', paddingRight: '24px', paddingBottom: '18px' }}
      >
        <span className="invisible shrink-0 whitespace-nowrap font-handwriting text-lg">
          {dateLabel}
        </span>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Título do dia&hellip;"
          maxLength={30}
          className="w-full flex-1 bg-transparent text-center font-handwriting text-3xl text-ink-900 placeholder-ink-900/30 outline-none"
          style={{ transform: 'translateY(27px)' }}
        />
        <span
          className="shrink-0 whitespace-nowrap font-handwriting text-lg text-ink-900/60"
          style={{ transform: 'translateY(14px)' }}
        >
          {dateLabel}
        </span>
      </div>

      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Schreib hier&hellip;"
        style={textPageStyle}
        className="flex-1 resize-none bg-transparent font-handwriting text-xl leading-9 text-ink-900 placeholder-ink-900/30 outline-none"
      />
    </div>
  )
}
