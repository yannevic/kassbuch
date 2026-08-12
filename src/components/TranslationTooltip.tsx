type TranslationTooltipProps = {
  translation: string
  isLoading: boolean
  error: boolean
}

export default function TranslationTooltip(props: TranslationTooltipProps) {
  const { translation, isLoading, error } = props

  if (isLoading) {
    return (
      <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-void-950 px-2 py-1 font-sans text-xs text-page-50 shadow-lg">
        Traduzindo&hellip;
      </span>
    )
  }

  if (error) {
    return (
      <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-void-950 px-2 py-1 font-sans text-xs text-page-50 shadow-lg">
        Erro ao traduzir
      </span>
    )
  }

  if (translation === '') {
    return null
  }

  return (
    <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-void-950 px-2 py-1 font-sans text-xs text-page-50 shadow-lg">
      {translation}
    </span>
  )
}
