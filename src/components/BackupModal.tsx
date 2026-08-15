import { useRef, useState } from 'react'
import { X, Download, Upload } from 'lucide-react'
import { exportBackup, importBackup } from '../lib/db'
import type { BackupData } from '../types/electron'

type BackupModalProps = {
  onClose: () => void
}

type Message = {
  type: 'success' | 'error'
  text: string
}

export default function BackupModal(props: BackupModalProps) {
  const { onClose } = props

  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleExport = () => {
    setIsExporting(true)
    setMessage(null)

    exportBackup()
      .then((data) => {
        const json = JSON.stringify(data, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const today = new Date().toISOString().slice(0, 10)

        const link = document.createElement('a')
        link.href = url
        link.download = `kassbuch-backup-${today}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setIsExporting(false)
        setMessage({ type: 'success', text: 'Backup exportado com sucesso.' })
      })
      .catch((error) => {
        console.error('Erro ao exportar backup:', error)
        setIsExporting(false)
        setMessage({ type: 'error', text: 'Não foi possível exportar o backup.' })
      })
  }

  const handleImportClick = () => {
    setMessage(null)
    fileInputRef.current?.click()
  }

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setMessage(null)

    file
      .text()
      .then((text) => {
        const data = JSON.parse(text)

        if (!data || !Array.isArray(data.entries) || !Array.isArray(data.translations)) {
          throw new Error('INVALID_BACKUP_FORMAT')
        }

        setPendingImport(data as BackupData)
      })
      .catch((error) => {
        console.error('Erro ao ler arquivo de backup:', error)

        if (error instanceof Error && error.message === 'INVALID_BACKUP_FORMAT') {
          setMessage({
            type: 'error',
            text: 'Esse arquivo não parece ser um backup válido do KassBuch.',
          })
          return
        }

        setMessage({ type: 'error', text: 'Não foi possível ler esse arquivo.' })
      })
  }

  const handleConfirmImport = () => {
    if (!pendingImport) {
      return
    }

    setIsImporting(true)

    importBackup(pendingImport)
      .then(() => {
        setIsImporting(false)
        setPendingImport(null)
        setMessage({ type: 'success', text: 'Backup importado com sucesso.' })
      })
      .catch((error) => {
        console.error('Erro ao importar backup:', error)
        setIsImporting(false)
        setMessage({ type: 'error', text: 'Não foi possível importar esse backup.' })
      })
  }

  const handleCancelImport = () => {
    setPendingImport(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void-950/70 p-8">
      <div className="w-full max-w-md rounded-lg bg-page-50 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-handwriting text-2xl text-ink-900">Backup</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-900/50 transition-colors hover:bg-ink-900/10 hover:text-ink-900"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 font-sans text-xs text-ink-900/50">
          Exporta todas as entradas e o cache de tradução num arquivo .json, ou importa um arquivo
          exportado antes pra restaurar os dados.
        </p>

        <div className="mb-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 rounded-md bg-rift-500 px-4 py-2 font-sans text-sm text-page-50 transition-colors hover:bg-rift-400 disabled:opacity-40"
          >
            <Download size={16} />
            {isExporting ? 'Exportando…' : 'Exportar backup'}
          </button>

          <button
            type="button"
            onClick={handleImportClick}
            disabled={isImporting}
            className="flex items-center justify-center gap-2 rounded-md border border-gold-400/40 px-4 py-2 font-sans text-sm text-ink-900 transition-colors hover:bg-ink-900/5 disabled:opacity-40"
          >
            <Upload size={16} />
            Importar backup
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>

        {pendingImport ? (
          <div className="mb-3 rounded-md border border-gold-400/40 p-3">
            <p className="mb-2 font-sans text-xs text-ink-900/70">
              Esse arquivo tem {pendingImport.entries.length} entrada(s) e{' '}
              {pendingImport.translations.length} tradução(ões) em cache. Importar vai substituir os
              dados existentes com o mesmo dia ou palavra. Confirma?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="rounded-md bg-rift-500 px-3 py-1.5 font-sans text-xs text-page-50 transition-colors hover:bg-rift-400 disabled:opacity-40"
              >
                {isImporting ? 'Importando…' : 'Confirmar importação'}
              </button>
              <button
                type="button"
                onClick={handleCancelImport}
                disabled={isImporting}
                className="rounded-md border border-gold-400/40 px-3 py-1.5 font-sans text-xs text-ink-900 transition-colors hover:bg-ink-900/5 disabled:opacity-40"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : null}

        {message ? (
          <p
            className={`font-sans text-xs ${
              message.type === 'success' ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {message.text}
          </p>
        ) : null}
      </div>
    </div>
  )
}
