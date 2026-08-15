import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { getSetting, setSetting } from '../lib/db'
import { testDeeplApiKey } from '../lib/translate'

type SettingsModalProps = {
  onClose: () => void
  onOpenBackup: () => void
}

const DEEPL_API_KEY_SETTING = 'deepl_api_key'

export default function SettingsModal(props: SettingsModalProps) {
  const { onClose, onOpenBackup } = props

  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const [testState, setTestState] = useState<'idle' | 'testing' | 'success' | 'quota' | 'invalid'>(
    'idle'
  )

  useEffect(() => {
    getSetting(DEEPL_API_KEY_SETTING)
      .then((value) => {
        setApiKey(value ?? '')
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Erro ao carregar configurações:', error)
        setIsLoading(false)
      })
  }, [])

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value)
    setTestState('idle')
  }

  const handleTest = () => {
    const trimmedKey = apiKey.trim()

    if (trimmedKey === '') {
      return
    }

    setTestState('testing')

    testDeeplApiKey(trimmedKey)
      .then((result) => {
        if (result.success) {
          setTestState('success')
          return
        }
        setTestState(result.reason)
      })
      .catch((error) => {
        console.error('Erro ao testar a chave:', error)
        setTestState('invalid')
      })
  }

  const handleSave = () => {
    setIsSaving(true)
    setSavedMessage(false)

    setSetting(DEEPL_API_KEY_SETTING, apiKey.trim())
      .then(() => {
        setIsSaving(false)
        setSavedMessage(true)
      })
      .catch((error) => {
        console.error('Erro ao salvar configurações:', error)
        setIsSaving(false)
      })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void-950/70 p-8">
      <div className="w-full max-w-md rounded-lg bg-page-50 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-handwriting text-2xl text-ink-900">Configurações</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-900/50 transition-colors hover:bg-ink-900/10 hover:text-ink-900"
          >
            <X size={18} />
          </button>
        </div>

        <label className="mb-2 block font-sans text-sm text-ink-900/70">
          Chave da API do DeepL
        </label>
        <input
          type="text"
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder={isLoading ? 'Carregando…' : 'Cole sua chave aqui…'}
          disabled={isLoading}
          className="mb-1 w-full rounded-md border border-gold-400/40 bg-transparent px-3 py-2 font-sans text-sm text-ink-900 outline-none placeholder-ink-900/30 focus:border-gold-400"
        />
        <p className="mb-2 font-sans text-xs text-ink-900/50">
          Sem chave configurada, as traduções usam o MyMemory (gratuito, sem cadastro, porém com
          limite menor e qualidade um pouco inferior).
        </p>

        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={isLoading || testState === 'testing' || apiKey.trim() === ''}
            className="rounded-md border border-gold-400/40 px-3 py-1.5 font-sans text-xs text-ink-900 transition-colors hover:bg-ink-900/5 disabled:opacity-40"
          >
            {testState === 'testing' ? 'Testando…' : 'Testar chave'}
          </button>

          {testState === 'success' ? (
            <span className="font-sans text-xs text-emerald-600">
              Chave funcionando — usando DeepL
            </span>
          ) : null}
          {testState === 'quota' ? (
            <span className="font-sans text-xs text-amber-600">
              Chave válida, mas a cota acabou
            </span>
          ) : null}
          {testState === 'invalid' ? (
            <span className="font-sans text-xs text-red-600">Chave inválida</span>
          ) : null}
        </div>

        <div className="mb-4 flex items-center justify-between border-t border-gold-400/20 pt-4">
          <button
            type="button"
            onClick={onOpenBackup}
            className="font-sans text-xs text-ink-900/60 underline transition-colors hover:text-ink-900"
          >
            Fazer backup dos dados
          </button>
        </div>

        <div className="flex items-center justify-end gap-3">
          {savedMessage ? <span className="font-sans text-xs text-emerald-600">Salvo!</span> : null}
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="rounded-md bg-rift-500 px-4 py-2 font-sans text-sm text-page-50 transition-colors hover:bg-rift-400 disabled:opacity-40"
          >
            {isSaving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
