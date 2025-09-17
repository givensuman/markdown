import { useCallback, useEffect, useMemo, useState } from 'react'

export type FileDoc = {
  id: string
  name: string
  content: string
}

const DEFAULT_MD = `# Markdown Studio\n\n- Live preview on the right\n- Monaco editor on the left\n\nMath: $\\int_0^1 x^2 \\mathrm{d}x = \\tfrac{1}{3}$\n\n\n\n\n`

function createId() {
  if ('randomUUID' in crypto) {
    return (crypto as unknown as { randomUUID: () => string }).randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function useFiles() {
  const [files, setFiles] = useState<FileDoc[]>(() => {
    const stored = localStorage.getItem('mdstudio-files')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FileDoc[]
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {}
    }
    const oldContent = localStorage.getItem('mdstudio-content') ?? DEFAULT_MD
    const oldName = localStorage.getItem('mdstudio-filename') ?? ''
    return [
      {
        id: createId(),
        name: oldName,
        content: oldContent,
      },
    ]
  })

  const [activeId, setActiveId] = useState<string>(() => {
    const stored = localStorage.getItem('mdstudio-activeId')
    if (stored) return stored
    const storedFiles = localStorage.getItem('mdstudio-files')
    if (storedFiles) {
      try {
        const parsed = JSON.parse(storedFiles) as FileDoc[]
        if (Array.isArray(parsed) && parsed[0]) return parsed[0].id
      } catch {}
    }
    return ''
  })

  const activeFile = useMemo(() => files.find((f) => f.id === activeId) ?? files[0], [files, activeId])

  useEffect(() => {
    if (!activeId && files[0]) setActiveId(files[0].id)
    else if (activeId && !files.some((f) => f.id === activeId) && files[0]) setActiveId(files[0].id)
  }, [files, activeId])

  // Persist files and activeId with debounce
  useEffect(() => {
    const id = window.setTimeout(() => {
      localStorage.setItem('mdstudio-files', JSON.stringify(files))
    }, 300)
    return () => window.clearTimeout(id)
  }, [files])

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (activeId) localStorage.setItem('mdstudio-activeId', activeId)
    }, 150)
    return () => window.clearTimeout(id)
  }, [activeId])

  const updateFileContent = useCallback((fileId: string, content: string) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, content } : f)))
  }, [])

  const updateFileName = useCallback((fileId: string, name: string) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, name } : f)))
  }, [])

  const createFile = useCallback(() => {
    const newFile: FileDoc = { id: createId(), name: '', content: DEFAULT_MD }
    setFiles((prev) => [...prev, newFile])
    setActiveId(newFile.id)
  }, [])

  const closeFile = useCallback((id: string) => {
    setFiles((prev) => {
      if (prev.length <= 1) return prev
      const idx = prev.findIndex((f) => f.id === id)
      const next = prev.filter((f) => f.id !== id)
      if (id === activeFile?.id) {
        const neighbor = next[Math.max(0, idx - 1)] ?? next[0]
        if (neighbor) setActiveId(neighbor.id)
      }
      return next
    })
  }, [activeFile?.id])

  return {
    files,
    activeFile,
    activeId,
    setActiveId,
    updateFileContent,
    updateFileName,
    createFile,
    closeFile,
  }
}
