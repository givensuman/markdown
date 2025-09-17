import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'

type FileDoc = {
  id: string
  name: string
  content: string
}

type FileTabsProps = {
  files: FileDoc[]
  activeFile: FileDoc | undefined
  onTabClick: (id: string) => void
  onCloseTab: (id: string) => void
  onCreateFile: () => void
}

export default function FileTabs({ files, activeFile, onTabClick, onCloseTab, onCreateFile }: FileTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0 py-3">
      {files.map((f) => (
        <div 
          key={f.id} 
          className={`shrink-0 group flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-1 text-sm ${f.id === activeFile?.id ? 'bg-accent text-accent-foreground' : 'bg-background'} `}
          onMouseDown={(e) => {
            if (e.button === 1) { // middle click
              e.preventDefault()
              onCloseTab(f.id)
            }
          }}
        >
          <button
            className="px-1 max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap text-left"
            onClick={() => onTabClick(f.id)}
            title={f.name?.trim() || 'New Document'}
          >
            {f.name?.trim() || 'New Document'}
          </button>
          {files.length > 1 && (
            <button
              className="opacity-60 hover:opacity-100"
              onClick={() => onCloseTab(f.id)}
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}
      <Button className="shrink-0" variant="ghost" size="icon" onClick={onCreateFile} title="New file">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
