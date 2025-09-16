import { useCallback, useRef } from 'react'
import html2pdf from 'html2pdf.js'
import type { FileDoc } from './useFiles'

export function useExports() {
  const previewRef = useRef<HTMLDivElement | null>(null)

  const exportMarkdown = useCallback((activeFile: FileDoc | undefined) => {
    const text = activeFile?.content ?? ''
    const name = (activeFile?.name?.trim() || activeFile?.id || 'document')
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${name}.md`
    link.click()
    URL.revokeObjectURL(link.href)
  }, [])

  const exportPdf = useCallback((activeFile: FileDoc | undefined) => {
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
  }, [])

  return {
    previewRef,
    exportMarkdown,
    exportPdf,
  }
}
