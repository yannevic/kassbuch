type SelectionTranslatePopupProps = {
  top: number
  left: number
  translation: string | null
  isLoading: boolean
  error: boolean
  onTranslate: () => void
}

export default function SelectionTranslatePopup(props: SelectionTranslatePopupProps) {
  const { top, left, translation, isLoading, error, onTranslate } = props

  return (
    <div
      className="absolute z-30 -translate-x-1/2 -translate-y-full"
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      {!isLoading && !error && translation === null ? (
        <button
          type="button"
          onClick={onTranslate}
          className="whitespace-nowrap rounded-md bg-rift-500 px-3 py-1 font-sans text-xs text-page-50 shadow-lg transition-colors hover:bg-rift-400"
        >
          Traduzir
        </button>
      ) : null}

      {isLoading ? (
        <span className="whitespace-nowrap rounded-md bg-void-950 px-3 py-1 font-sans text-xs text-page-50 shadow-lg">
          Traduzindo&hellip;
        </span>
      ) : null}

      {error ? (
        <span className="whitespace-nowrap rounded-md bg-void-950 px-3 py-1 font-sans text-xs text-page-50 shadow-lg">
          Erro ao traduzir
        </span>
      ) : null}

      {!isLoading && !error && translation !== null ? (
        <span className="block max-w-xs whitespace-normal rounded-md bg-void-950 px-3 py-2 font-sans text-xs text-page-50 shadow-lg">
          {translation}
        </span>
      ) : null}
    </div>
  )
}
