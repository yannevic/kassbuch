import { Home, Settings } from 'lucide-react'

type MobileNavBarProps = {
  onHome?: () => void
  onSettings: () => void
}

export default function MobileNavBar(props: MobileNavBarProps) {
  const { onHome, onSettings } = props

  return (
    <div className="flex items-center justify-between bg-void-900 px-4 py-2 md:hidden">
      {onHome ? (
        <button
          type="button"
          onClick={onHome}
          aria-label="Voltar para a página inicial"
          className="flex h-9 w-9 items-center justify-center rounded-full text-page-50/70 transition-colors hover:bg-page-50/10 hover:text-page-50"
        >
          <Home size={18} />
        </button>
      ) : (
        <span className="h-9 w-9" />
      )}

      <span className="font-handwriting text-sm text-page-50/50">KassBuch</span>

      <button
        type="button"
        onClick={onSettings}
        aria-label="Abrir configurações"
        className="flex h-9 w-9 items-center justify-center rounded-full text-page-50/70 transition-colors hover:bg-page-50/10 hover:text-page-50"
      >
        <Settings size={18} />
      </button>
    </div>
  )
}
