import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MarkdownEditor from '@/components/MarkdownEditor'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sun, Moon, FileDown, FileText, Plus, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import 'github-markdown-css/github-markdown.css'
import html2pdf from 'html2pdf.js'

const DEFAULT_MD = `# Markdown Studio\n\n- Live preview on the right\n- Monaco editor on the left\n\nMath: $\\int_0^1 x^2 \\mathrm{d}x = \\tfrac{1}{3}$\n\n\n\n\n`;

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('mdstudio-theme')
    if (stored === 'dark' || stored === 'light') return stored
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('mdstudio-theme', theme)
  }, [theme])
  return { theme, setTheme }
}

type FileDoc = {
  id: string
  name: string
  content: string
}

function createId() {
  if ('randomUUID' in crypto) {
    return (crypto as unknown as { randomUUID: () => string }).randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export default function App() {
  const { theme, setTheme } = useTheme()
  // Migration: build files array from prior single-doc keys if present
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
  const previewRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<HTMLTextAreaElement | null>(null)

  // Removed Monaco theme setup

  const activeFile = useMemo(() => files.find((f) => f.id === activeId) ?? files[0], [files, activeId])

  useEffect(() => {
    // Ensure activeId always points to an existing file
    if (!activeId && files[0]) setActiveId(files[0].id)
    else if (activeId && !files.some((f) => f.id === activeId) && files[0]) setActiveId(files[0].id)
  }, [files, activeId])

  const onChange = useCallback((value?: string) => {
    const newValue = value ?? ''
    setFiles((prev) => prev.map((f) => (f.id === (activeFile?.id ?? '') ? { ...f, content: newValue } : f)))
  }, [activeFile?.id])

  // Toolbar insertion helpers
  const wrapSelection = useCallback((before: string, after: string = before) => {
    const ta = editorRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const value = activeFile?.content ?? ''
    const selected = value.slice(start, end)
    const next = value.slice(0, start) + before + selected + after + value.slice(end)
    setFiles((prev) => prev.map((f) => (f.id === (activeFile?.id ?? '') ? { ...f, content: next } : f)))
    queueMicrotask(() => {
      const pos = start + before.length + selected.length
      ta.focus()
      ta.setSelectionRange(pos, pos)
    })
  }, [activeFile?.id, activeFile?.content])

  const insertAtLineStart = useCallback((prefix: string) => {
    const ta = editorRef.current
    if (!ta) return
    const value = activeFile?.content ?? ''
    const cursor = ta.selectionStart
    const lineStart = value.lastIndexOf('\n', Math.max(0, cursor - 1)) + 1
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    setFiles((prev) => prev.map((f) => (f.id === (activeFile?.id ?? '') ? { ...f, content: next } : f)))
    queueMicrotask(() => {
      const pos = cursor + prefix.length
      ta.focus()
      ta.setSelectionRange(pos, pos)
    })
  }, [activeFile?.id, activeFile?.content])

  const insertBlock = useCallback((block: string) => {
    const ta = editorRef.current
    if (!ta) return
    const value = activeFile?.content ?? ''
    const cursor = ta.selectionStart
    const next = value.slice(0, cursor) + block + value.slice(cursor)
    setFiles((prev) => prev.map((f) => (f.id === (activeFile?.id ?? '') ? { ...f, content: next } : f)))
    queueMicrotask(() => {
      const pos = cursor + block.length
      ta.focus()
      ta.setSelectionRange(pos, pos)
    })
  }, [activeFile?.id, activeFile?.content])

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

  const setFilename = useCallback((name: string) => {
    const id = activeFile?.id
    if (!id) return
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)))
  }, [activeFile?.id])

  const createFile = useCallback(() => {
    const newFile: FileDoc = { id: createId(), name: '', content: DEFAULT_MD }
    setFiles((prev) => [...prev, newFile])
    setActiveId(newFile.id)
  }, [])

  const closeFile = useCallback((id: string) => {
    setFiles((prev) => {
      if (prev.length <= 1) return prev // keep at least one file
      const idx = prev.findIndex((f) => f.id === id)
      const next = prev.filter((f) => f.id !== id)
      // adjust active
      if (id === activeFile?.id) {
        const neighbor = next[Math.max(0, idx - 1)] ?? next[0]
        if (neighbor) setActiveId(neighbor.id)
      }
      return next
    })
  }, [activeFile?.id])

  const exportMarkdown = useCallback(() => {
    const text = activeFile?.content ?? ''
    const name = (activeFile?.name?.trim() || activeFile?.id || 'document')
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${name}.md`
    link.click()
    URL.revokeObjectURL(link.href)
  }, [activeFile])

  const exportPdf = useCallback(() => {
    if (!previewRef.current) return
    const el = previewRef.current
    const filename = `${(activeFile?.name?.trim() || activeFile?.id || 'document')}.pdf`

    // Temporarily force light mode while exporting
    const wasDark = document.documentElement.classList.contains('dark')
    const prevClass = el.className
    document.documentElement.classList.remove('dark')
    el.className = 'markdown-body p-6 bg-white text-black'

    html2pdf()
      .set({
        margin: [10, 10],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(el)
      .save()
      .finally(() => {
        el.className = prevClass
        if (wasDark) document.documentElement.classList.add('dark')
      })
  }, [activeFile?.name, activeFile?.id])

  return (
    <div className="flex h-screen w-screen flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 p-3">
          <div className="font-medium">Markdown Studio</div>
          <Separator orientation="vertical" className="h-6" />
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
            {files.map((f) => (
              <div key={f.id} className={`shrink-0 group flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-1 text-sm ${f.id === activeFile?.id ? 'bg-accent text-accent-foreground' : 'bg-background'} `}>
                <button
                  className="px-1 max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap text-left"
                  onClick={() => setActiveId(f.id)}
                  title={f.name?.trim() || 'New Document'}
                >
                  {f.name?.trim() || 'New Document'}
                </button>
                <button
                  className="opacity-60 hover:opacity-100"
                  onClick={() => closeFile(f.id)}
                  disabled={files.length <= 1}
                  title={files.length <= 1 ? 'Cannot close last file' : 'Close'}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <Button className="shrink-0" variant="ghost" size="icon" onClick={createFile} title="New file">
            <Plus className="h-4 w-4" />
          </Button>
          <div className="ml-auto" />
          <div className="flex items-center gap-2">
            <Label htmlFor="filename" className="sr-only">Filename</Label>
            <Input id="filename" value={activeFile?.name ?? ''} onChange={(e) => setFilename(e.target.value)} className="w-[200px]" placeholder="New Document" />
            <Button variant="secondary" onClick={exportMarkdown} title="Export Markdown"><FileText className="mr-2 h-4 w-4" />MD</Button>
            <Button onClick={exportPdf} title="Export PDF"><FileDown className="mr-2 h-4 w-4" />PDF</Button>
          </div>
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>
      <main className="flex h-[calc(100vh-52px)] w-full">
        <section className="h-full w-1/2 border-r">
          <div className="flex h-full w-full flex-col">
            <div className="flex items-center gap-1 border-b p-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => wrapSelection('**')} title="Bold"><span className="font-bold">B</span></Button>
                  </TooltipTrigger>
                  <TooltipContent>Bold</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => wrapSelection('*')} title="Italic"><span className="italic">I</span></Button>
                  </TooltipTrigger>
                  <TooltipContent>Italic</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('# ')} title="Heading">H</Button>
                  </TooltipTrigger>
                  <TooltipContent>Heading</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => wrapSelection('~~')} title="Strikethrough"><span className="line-through">S</span></Button>
                  </TooltipTrigger>
                  <TooltipContent>Strikethrough</TooltipContent>
                </Tooltip>
                <div className="mx-2 h-5 w-px bg-border" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('- ')} title="Unordered list">•</Button>
                  </TooltipTrigger>
                  <TooltipContent>Unordered list</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('1. ')} title="Ordered list">1.</Button>
                  </TooltipTrigger>
                  <TooltipContent>Ordered list</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('- [ ] ')} title="Checklist">☑</Button>
                  </TooltipTrigger>
                  <TooltipContent>Checklist</TooltipContent>
                </Tooltip>
                <div className="mx-2 h-5 w-px bg-border" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('> ')} title="Blockquote">“”</Button>
                  </TooltipTrigger>
                  <TooltipContent>Blockquote</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => wrapSelection('`')} title="Inline code">{`</>`}</Button>
                  </TooltipTrigger>
                  <TooltipContent>Inline code</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertBlock('\n\n```\n\n```\n')} title="Code block">{`{ }`}</Button>
                  </TooltipTrigger>
                  <TooltipContent>Code block</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertBlock('\n\n| Column | Column |\n| ------ | ------ |\n| Cell | Cell |\n\n')} title="Table">▦</Button>
                  </TooltipTrigger>
                  <TooltipContent>Table</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => wrapSelection('[', '](url)')} title="Link">🔗</Button>
                  </TooltipTrigger>
                  <TooltipContent>Link</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertBlock('![](url)')} title="Image">🖼️</Button>
                  </TooltipTrigger>
                  <TooltipContent>Image</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex-1">
              <MarkdownEditor ref={editorRef} value={activeFile?.content ?? ''} onChange={(v) => onChange(v)} />
            </div>
          </div>
        </section>
        <section className="h-full w-1/2 overflow-auto">
          <div ref={previewRef} className={`markdown-body min-h-full p-6 ${theme === 'dark' ? 'bg-[#0d1117] text-[#c9d1d9]' : 'bg-gray-50 text-black'}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
            >
              {activeFile?.content ?? ''}
            </ReactMarkdown>
          </div>
        </section>
      </main>
    </div>
  )
}
