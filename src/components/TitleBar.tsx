import { useEffect, useState } from 'react'
import { Copy, Minus, Square, X } from 'lucide-react'

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.api.invoke('window:isMaximized').then((maximized) => {
      setIsMaximized(Boolean(maximized))
    })

    window.api.on('window:maximized', () => {
      setIsMaximized(true)
    })

    window.api.on('window:unmaximized', () => {
      setIsMaximized(false)
    })
  }, [])

  const handleMinimize = () => {
    window.api.invoke('window:minimize')
  }

  const handleMaximize = () => {
    window.api.invoke('window:maximize')
  }

  const handleClose = () => {
    window.api.invoke('window:close')
  }

  return (
    <div className="app-drag flex h-9 w-full items-center justify-end bg-void-950">
      <div className="app-no-drag flex h-full">
        <button
          type="button"
          onClick={handleMinimize}
          className="flex h-full w-11 items-center justify-center text-rift-300 transition-colors hover:bg-void-900"
        >
          <Minus size={15} />
        </button>
        <button
          type="button"
          onClick={handleMaximize}
          className="flex h-full w-11 items-center justify-center text-rift-300 transition-colors hover:bg-void-900"
        >
          {isMaximized ? <Copy size={13} /> : <Square size={13} />}
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="flex h-full w-11 items-center justify-center text-rift-300 transition-colors hover:bg-rift-500 hover:text-void-950"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
