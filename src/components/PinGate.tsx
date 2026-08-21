import { useState } from 'react'
import type { ReactNode } from 'react'
import { PIN_STORAGE_KEY } from '../lib/db'

type PinGateProps = {
  children: ReactNode
}

export default function PinGate(props: PinGateProps) {
  const { children } = props

  const [isUnlocked, setIsUnlocked] = useState(() => {
    return window.localStorage.getItem(PIN_STORAGE_KEY) !== null
  })
  const [pin, setPin] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setIsChecking(true)
    setHasError(false)

    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('INVALID_PIN')
        }
        window.localStorage.setItem(PIN_STORAGE_KEY, pin)
        setIsUnlocked(true)
        setIsChecking(false)
      })
      .catch(() => {
        setHasError(true)
        setIsChecking(false)
      })
  }

  if (isUnlocked) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-void-950">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <span className="font-handwriting text-3xl text-page-50">KassBuch</span>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(event) => {
            setPin(event.target.value)
            setHasError(false)
          }}
          placeholder="PIN"
          autoFocus
          className="w-40 rounded-md border border-gold-400/40 bg-transparent px-3 py-2 text-center font-sans text-lg text-page-50 outline-none placeholder-page-50/30 focus:border-gold-400"
        />
        {hasError ? <span className="font-sans text-xs text-red-400">PIN incorreto</span> : null}
        <button
          type="submit"
          disabled={isChecking || pin === ''}
          className="rounded-md bg-rift-500 px-4 py-2 font-sans text-sm text-page-50 transition-colors hover:bg-rift-400 disabled:opacity-40"
        >
          {isChecking ? 'Verificando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
