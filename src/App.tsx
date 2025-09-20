import { useRef } from 'react'
import MarkdownEditor from '@/components/MarkdownEditor'
import FileTabs from '@/components/FileTabs'
import HeaderControls from '@/components/HeaderControls'
import CloseDialog from '@/components/CloseDialog'
import { Separator } from '@/components/ui/separator'
import FormattingToolbar from '@/components/FormattingToolbar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import 'github-markdown-css/github-markdown-dark.css'
 import { useFiles } from '@/hooks/useFiles'
 import { useTheme } from '@/hooks/useTheme'
 import { useFileModifications } from '@/hooks/useFileModifications'
 import { useExports } from '@/hooks/useExports'
 import type { editor } from 'monaco-editor'

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
   const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleContentChange = (value?: string) => {
    const newValue = value ?? ''
    const fileId = activeFile?.id ?? ''
    updateFileContent(fileId, newValue)
    markFileModified(fileId, newValue, activeFile?.name ?? '')
  }

   const wrapSelection = (before: string, after?: string) => {
     const editor = editorRef.current
     if (!editor || !activeFile) return
     const selection = editor.getSelection()
     if (!selection) return

     const suffix = after ?? before
     const range = {
       startLineNumber: selection.startLineNumber,
       startColumn: selection.startColumn,
       endLineNumber: selection.endLineNumber,
       endColumn: selection.endColumn
     }

     const textToInsert = before + suffix
     const newStartColumn = selection.startColumn + before.length
     const newEndColumn = selection.endColumn + before.length

     editor.executeEdits('wrap-selection', [{
       range,
       text: textToInsert,
       forceMoveMarkers: true
     }])

     // Restore selection to the original text inside the wrappers
     requestAnimationFrame(() => {
       try {
         editor.focus()
         editor.setSelection({
           startLineNumber: selection.startLineNumber,
           startColumn: newStartColumn,
           endLineNumber: selection.endLineNumber,
           endColumn: newEndColumn
         })
       } catch (error) { console.error(error) }
     })
   }

   const insertAtLineStart = (prefix: string) => {
     const editor = editorRef.current
     if (!editor || !activeFile) return

     const selection = editor.getSelection()
     if (!selection) return

     const model = editor.getModel()
     if (!model) return

     const startLine = selection.startLineNumber
     const endLine = selection.endLineNumber

     // Get all lines in the selection
     const lines: string[] = []
     for (let i = startLine; i <= endLine; i++) {
       lines.push(model.getLineContent(i))
     }

     // Add prefix to each line
     const prefixedLines = lines.map((line) => prefix + line)

     // Create edits for each line
     const edits = prefixedLines.map((line, index) => ({
       range: {
         startLineNumber: startLine + index,
         startColumn: 1,
         endLineNumber: startLine + index,
         endColumn: lines[index].length + 1
       },
       text: line
     }))

     editor.executeEdits('insert-at-line-start', edits)

     // Update selection
     const newStartColumn = selection.startColumn + prefix.length
     const newEndColumn = selection.endColumn + prefix.length

     requestAnimationFrame(() => {
       try {
         editor.focus()
         editor.setSelection({
           startLineNumber: selection.startLineNumber,
           startColumn: newStartColumn,
           endLineNumber: selection.endLineNumber,
           endColumn: newEndColumn
         })
       } catch (error) { console.error(error) }
     })
   }

   const insertBlock = (block: string) => {
     const editor = editorRef.current
     if (!editor || !activeFile) return

     const selection = editor.getSelection()
     if (!selection) return

     const range = {
       startLineNumber: selection.endLineNumber,
       startColumn: selection.endColumn,
       endLineNumber: selection.endLineNumber,
       endColumn: selection.endColumn
     }

     editor.executeEdits('insert-block', [{
       range,
       text: block,
       forceMoveMarkers: true
     }])

     // Move cursor to end of inserted block
     const lines = block.split('\n')
     const lastLineLength = lines[lines.length - 1].length
     const newPosition = {
       lineNumber: selection.endLineNumber + lines.length - 1,
       column: selection.endColumn + lastLineLength
     }

     requestAnimationFrame(() => {
       try {
         editor.focus()
         editor.setPosition(newPosition)
       } catch (error) { console.error(error) }
     })
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

      {/* Shared formatting toolbar above editor and preview */}
      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 p-2">
          <FormattingToolbar
            wrapSelection={wrapSelection}
            insertAtLineStart={insertAtLineStart}
            insertBlock={insertBlock}
          />
        </div>
      </div>

      <main className="flex h-[calc(100vh-52px)] w-full">
        <section className="h-full w-1/2 border-r">
          <MarkdownEditor ref={editorRef} value={activeFile?.content ?? ''} onChange={handleContentChange} />
        </section>
         <section className="h-full w-1/2 overflow-auto bg-background">
           <div ref={previewRef} className="markdown-body min-h-full p-6">
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
