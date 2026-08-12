import { useEffect, useRef, useState } from 'react'
import { Languages } from 'lucide-react'
import HomeButton from './HomeButton'
import WordSpan from './WordSpan'
import SelectionTranslatePopup from './SelectionTranslatePopup'
import { tokenizeText } from '../lib/tokenize'
import { translateWord } from '../lib/translate'

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

type SelectionState = {
  text: string
  top: number
  left: number
  translation: string | null
  isLoading: boolean
  error: boolean
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

  const [isEditing, setIsEditing] = useState(false)
  const [selection, setSelection] = useState<SelectionState | null>(null)
  const [pageTranslation, setPageTranslation] = useState<string | null>(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [isTranslatingPage, setIsTranslatingPage] = useState(false)
  const [pageTranslationError, setPageTranslationError] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus()
    }
  }, [isEditing])

  useEffect(() => {
    setSelection(null)
    setPageTranslation(null)
    setShowTranslation(false)
    setPageTranslationError(false)
  }, [text])

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(event.target.value)
  }

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(event.target.value)
  }

  const handleEnterEdit = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  const handleOverlayMouseUp = () => {
    const windowSelection = window.getSelection()
    const selectedText = windowSelection ? windowSelection.toString().trim() : ''

    if (selectedText === '' || !windowSelection || windowSelection.rangeCount === 0) {
      setSelection(null)
      handleEnterEdit()
      return
    }

    const range = windowSelection.getRangeAt(0)
    const rangeRect = range.getBoundingClientRect()
    const containerRect = overlayRef.current?.getBoundingClientRect()

    if (!containerRect) {
      return
    }

    setSelection({
      text: selectedText,
      top: rangeRect.top - containerRect.top - 8,
      left: rangeRect.left - containerRect.left + rangeRect.width / 2,
      translation: null,
      isLoading: false,
      error: false,
    })
  }

  const handleTranslateSelection = () => {
    if (!selection) {
      return
    }

    const selectedText = selection.text

    setSelection((current) => (current ? { ...current, isLoading: true, error: false } : current))

    translateWord(selectedText)
      .then((result) => {
        setSelection((current) =>
          current && current.text === selectedText
            ? { ...current, translation: result.translation, isLoading: false, error: false }
            : current
        )
      })
      .catch((error) => {
        console.error('Erro ao traduzir seleção:', error)
        setSelection((current) =>
          current && current.text === selectedText
            ? { ...current, translation: null, isLoading: false, error: true }
            : current
        )
      })
  }

  const handleTogglePageTranslation = () => {
    if (showTranslation) {
      setShowTranslation(false)
      return
    }

    if (pageTranslation !== null) {
      setShowTranslation(true)
      return
    }

    setSelection(null)
    setIsTranslatingPage(true)
    setPageTranslationError(false)

    translateWord(text)
      .then((result) => {
        setPageTranslation(result.translation)
        setShowTranslation(true)
        setIsTranslatingPage(false)
      })
      .catch((error) => {
        console.error('Erro ao traduzir a página:', error)
        setPageTranslationError(true)
        setIsTranslatingPage(false)
      })
  }

  const containerClassName = hiddenOnNarrow
    ? `relative hidden flex-1 flex-col p-10 md:flex ${backgroundClassName}`
    : `relative flex flex-1 flex-col p-10 ${backgroundClassName}`

  const tokens = tokenizeText(text)

  return (
    <div className={containerClassName}>
      {onHome ? <HomeButton onClick={onHome} /> : null}

      {!isEditing && text !== '' ? (
        <button
          type="button"
          onClick={handleTogglePageTranslation}
          disabled={isTranslatingPage}
          aria-label={showTranslation ? 'Ver texto original' : 'Traduzir página inteira'}
          className="group absolute z-20 flex h-8 w-8 items-center justify-center rounded-full outline-none transition-colors hover:bg-ink-900/10 disabled:opacity-40"
          style={{ top: '10px', right: '10px' }}
        >
          <Languages
            size={16}
            className={`transition-colors group-hover:text-ink-900/70 ${
              showTranslation ? 'text-rift-500' : 'text-ink-900/40'
            }`}
          />
        </button>
      ) : null}

      {pageTranslationError ? (
        <span
          className="pointer-events-none absolute z-20 whitespace-nowrap rounded-md bg-void-950 px-2 py-1 font-sans text-xs text-page-50 shadow-lg"
          style={{ top: '44px', right: '10px' }}
        >
          Erro ao traduzir
        </span>
      ) : null}

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

      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder="Schreib hier&hellip;"
          style={textPageStyle}
          className={`absolute inset-0 resize-none bg-transparent font-handwriting text-xl leading-9 text-ink-900 placeholder-ink-900/30 outline-none ${
            isEditing ? '' : 'invisible'
          }`}
        />

        {isEditing || showTranslation ? null : (
          <div
            ref={overlayRef}
            onMouseUp={handleOverlayMouseUp}
            style={textPageStyle}
            className="absolute inset-0 cursor-text overflow-y-auto whitespace-pre-wrap font-handwriting text-xl leading-9 text-ink-900"
          >
            {text === '' ? (
              <span className="text-ink-900/30">Schreib hier&hellip;</span>
            ) : (
              tokens.map((token, index) => {
                if (token.type === 'word') {
                  return <WordSpan key={`${index}-${token.value}`} word={token.value} />
                }
                return <span key={`${index}-other`}>{token.value}</span>
              })
            )}
          </div>
        )}

        {!isEditing && showTranslation && pageTranslation !== null ? (
          <div
            style={textPageStyle}
            className="absolute inset-0 overflow-y-auto whitespace-pre-wrap font-handwriting text-xl italic leading-9 text-ink-900/80"
          >
            {pageTranslation}
          </div>
        ) : null}

        {selection && !showTranslation ? (
          <SelectionTranslatePopup
            top={selection.top}
            left={selection.left}
            translation={selection.translation}
            isLoading={selection.isLoading}
            error={selection.error}
            onTranslate={handleTranslateSelection}
          />
        ) : null}
      </div>
    </div>
  )
}
