import { useState } from 'react'
import { useWordTranslation } from '../hooks/useTranslation'
import TranslationTooltip from './TranslationTooltip'

type WordSpanProps = {
  word: string
}

export default function WordSpan(props: WordSpanProps) {
  const { word } = props
  const { translation, isLoading, error, requestTranslation, cancelPending } =
    useWordTranslation(word)
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseEnter = () => {
    setIsHovering(true)
    requestTranslation()
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    cancelPending()
  }

  return (
    <span
      className="relative cursor-help rounded-sm hover:bg-gold-400/20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {word}
      {isHovering ? (
        <TranslationTooltip translation={translation} isLoading={isLoading} error={error} />
      ) : null}
    </span>
  )
}
