import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Sun, Moon, FileDown, FileText, Menu } from 'lucide-react'

type FileDoc = {
  id: string
  name: string
  content: string
}

type HeaderControlsProps = {
  activeFile: FileDoc | undefined
  theme: 'light' | 'dark'
  onFilenameChange: (name: string) => void
  onExportMarkdown: () => void
  onExportPdf: () => void
  onThemeToggle: () => void
}

export default function HeaderControls({ 
  activeFile, 
  theme, 
  onFilenameChange, 
  onExportMarkdown, 
  onExportPdf, 
  onThemeToggle 
}: HeaderControlsProps) {
  return (
    <>
      {/* Small screens: hamburger with actions */}
      <Sheet>
        <SheetTrigger asChild>
          <Button className="md:hidden" variant="ghost" size="icon" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64">
          <SheetHeader>
            <SheetTitle>Actions</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="secondary" onClick={onExportMarkdown} title="Export Markdown">
              <FileText className="mr-2 h-4 w-4" />Export Markdown
            </Button>
            <Button onClick={onExportPdf} title="Export PDF">
              <FileDown className="mr-2 h-4 w-4" />Export PDF
            </Button>
            <Button variant="outline" onClick={onThemeToggle} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}Toggle theme
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Desktop: inline controls */}
      <div className="hidden md:flex items-center gap-2">
        <Label htmlFor="filename" className="sr-only">Filename</Label>
        <Input 
          id="filename" 
          value={activeFile?.name ?? ''} 
          onChange={(e) => onFilenameChange(e.target.value)} 
          className="w-[200px]" 
          placeholder="New Document" 
        />
        <Button variant="secondary" onClick={onExportMarkdown} title="Export Markdown">
          <FileText className="mr-2 h-4 w-4" />MD
        </Button>
        <Button onClick={onExportPdf} title="Export PDF">
          <FileDown className="mr-2 h-4 w-4" />PDF
        </Button>
      </div>
      
      <Button className="hidden md:inline-flex" variant="ghost" size="icon" aria-label="Toggle theme" onClick={onThemeToggle}>
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    </>
  )
}
