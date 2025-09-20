import { cn } from '@/lib/utils'
import { forwardRef, useRef, type ForwardedRef } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import { useTheme } from '@/hooks/useTheme'
import type { editor } from 'monaco-editor'
import * as monaco from 'monaco-editor'



type Props = {
  value: string
  onChange: (value: string) => void
  className?: string
}

const MarkdownEditor = forwardRef(function MarkdownEditor(
  { value, onChange, className }: Props,
  ref: ForwardedRef<editor.IStandaloneCodeEditor>,
) {
  const { theme } = useTheme()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor

    if (ref) {
      if (typeof ref === 'function') {
        ref(editor)
      } else {
        ref.current = editor
      }
    }

    // Configure enhanced Markdown support
    monaco.languages.setMonarchTokensProvider('markdown', {
      tokenizer: {
        root: [
          // Headers
          [/^#{1,6}\s+.*$/, 'keyword.control'],

          // Bold
          [/\*\*([^*]+)\*\*/, 'string'],
          [/__([^_]+)__/, 'string'],

          // Italic
          [/\*([^*]+)\*/, 'string.italic'],
          [/_([^_]+)_/, 'string.italic'],

          // Code blocks
          [/```[\s\S]*?```/, 'string'],
          [/`[^`]+`/, 'string'],

          // Links
          [/\[([^\]]+)\]\(([^)]+)\)/, ['string.link', 'string']],

          // Lists
          [/^\s*[-*+]\s+/, 'keyword'],
          [/^\s*\d+\.\s+/, 'keyword'],

          // Blockquotes
          [/^\s*>\s+/, 'comment'],
        ]
      }
    })

    // Enable folding for Markdown
    monaco.languages.setLanguageConfiguration('markdown', {
      folding: {
        markers: {
          start: /^\s*#+\s+.*/,
          end: /^\s*#+\s+.*/
        }
      }
    })


  }



  return (
    <div className={cn('h-full w-full', className)}>
      <Editor
        height="100%"
        language="markdown"
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        value={value}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 1.6,
          padding: { top: 16, bottom: 16 },
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true
          }
        }}
      />
    </div>
  )
})

export default MarkdownEditor
