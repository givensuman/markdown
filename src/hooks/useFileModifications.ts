import { useCallback, useState } from 'react'

const DEFAULT_MD = `# Markdown Studio\n\n- Live preview on the right\n- Monaco editor on the left\n\nMath: $\\int_0^1 x^2 \\mathrm{d}x = \\tfrac{1}{3}$\n\n\n\n\n`

export function useFileModifications() {
  const [modifiedFiles, setModifiedFiles] = useState<Set<string>>(new Set())
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [fileToClose, setFileToClose] = useState<string | null>(null)
  const [disablePrompt, setDisablePrompt] = useState(false)

  const markFileModified = useCallback((fileId: string, content: string, name: string) => {
    const isContentModified = content !== DEFAULT_MD
    const isNameModified = name.trim() !== ''

    if (isContentModified || isNameModified) {
      setModifiedFiles(prev => new Set(prev).add(fileId))
    } else {
      setModifiedFiles(prev => {
        const next = new Set(prev)
        next.delete(fileId)
        return next
      })
    }
  }, [])

  const checkAndPromptClose = useCallback((fileId: string, onClose: () => void) => {
    if (modifiedFiles.has(fileId) && !disablePrompt) {
      setFileToClose(fileId)
      setShowCloseDialog(true)
      return false
    }
    onClose()
    return true
  }, [modifiedFiles, disablePrompt])

  const confirmClose = useCallback(() => {
    if (!fileToClose) return

    setModifiedFiles(prev => {
      const next = new Set(prev)
      next.delete(fileToClose)
      return next
    })

    setShowCloseDialog(false)
    setFileToClose(null)
  }, [fileToClose])

  const cleanupClosedFile = useCallback((fileId: string) => {
    setModifiedFiles(prev => {
      const next = new Set(prev)
      next.delete(fileId)
      return next
    })
  }, [])

  return {
    modifiedFiles,
    showCloseDialog,
    setShowCloseDialog,
    fileToClose,
    disablePrompt,
    setDisablePrompt,
    markFileModified,
    checkAndPromptClose,
    confirmClose,
    cleanupClosedFile,
  }
}
