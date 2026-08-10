import { Home } from 'lucide-react'

type HomeButtonProps = {
  onClick: () => void
}

export default function HomeButton(props: HomeButtonProps) {
  const { onClick } = props

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Voltar para a página inicial"
      className="group absolute z-10 flex h-8 w-8 items-center justify-center rounded-full outline-none transition-colors hover:bg-ink-900/10"
      style={{ top: '10px', left: '10px' }}
    >
      <Home size={16} className="text-ink-900/40 transition-colors group-hover:text-ink-900/70" />
    </button>
  )
}
