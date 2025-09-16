import { useRef } from 'react'
import MarkdownEditor from '@/components/MarkdownEditor'
import FileTabs from '@/components/FileTabs'
import HeaderControls from '@/components/HeaderControls'
import CloseDialog from '@/components/CloseDialog'
import { Separator } from '@/components/ui/separator'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import 'github-markdown-css/github-markdown.css'
import { useFiles } from '@/hooks/useFiles'
import { useTheme } from '@/hooks/useTheme'
import { useFileModifications } from '@/hooks/useFileModifications'
import { useExports } from '@/hooks/useExports'

export default function App() {
  const { theme, setTheme } = useTheme()
  const { files, activeFile, setActiveId, updateFileContent, updateFileName, createFile, closeFile } = useFiles()
  const { 
    showCloseDialog, 
    setShowCloseDialog, 
    disablePrompt, 
    setDisablePrompt, 
    markFileModified, 
    checkAndPromptClose, 
    confirmClose, 
    cleanupClosedFile 
  } = useFileModifications()
  const { previewRef, exportMarkdown, exportPdf } = useExports()
  const editorRef = useRef<HTMLTextAreaElement | null>(null)

  const handleContentChange = (value?: string) => {
    const newValue = value ?? ''
    const fileId = activeFile?.id ?? ''
    updateFileContent(fileId, newValue)
    markFileModified(fileId, newValue, activeFile?.name ?? '')
  }

  const handleFilenameChange = (name: string) => {
    const fileId = activeFile?.id
    if (!fileId) return
    updateFileName(fileId, name)
    markFileModified(fileId, activeFile?.content ?? '', name)
  }

  const handleCloseFile = (id: string) => {
    checkAndPromptClose(id, () => {
      closeFile(id)
      cleanupClosedFile(id)
    })
  }

  const handleConfirmClose = () => {
    confirmClose()
  }

  return (
    <div className="flex h-screen w-screen flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 p-3">
          <img src="/markdown_logo.svg" alt="Markdown" className="h-10 w-auto dark:invert mr-3" />
          <Separator orientation="vertical" className="h-6" />
          
          <FileTabs
            files={files}
            activeFile={activeFile}
            onTabClick={setActiveId}
            onCloseTab={handleCloseFile}
            onCreateFile={createFile}
          />
          
          <div className="ml-auto" />
          
          <HeaderControls
            activeFile={activeFile}
            theme={theme}
            onFilenameChange={handleFilenameChange}
            onExportMarkdown={() => exportMarkdown(activeFile)}
            onExportPdf={() => exportPdf(activeFile)}
            onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        </div>
      </header>
      
      <CloseDialog
        open={showCloseDialog}
        onOpenChange={setShowCloseDialog}
        onConfirm={handleConfirmClose}
        disablePrompt={disablePrompt}
        onDisablePromptChange={setDisablePrompt}
      />
      
      <main className="flex h-[calc(100vh-52px)] w-full">
        <section className="h-full w-1/2 border-r">
          <MarkdownEditor ref={editorRef} value={activeFile?.content ?? ''} onChange={handleContentChange} />
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