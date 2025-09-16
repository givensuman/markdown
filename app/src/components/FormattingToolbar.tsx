import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type FormattingToolbarProps = {
  wrapSelection: (before: string, after?: string) => void
  insertAtLineStart: (prefix: string) => void
  insertBlock: (block: string) => void
}

export default function FormattingToolbar({ wrapSelection, insertAtLineStart, insertBlock }: FormattingToolbarProps) {
  return (
    <div className="hidden lg:flex items-center gap-1 border-l pl-3">
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
        <div className="mx-1 h-4 w-px bg-border" />
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
        <div className="mx-1 h-4 w-px bg-border" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('> ')} title="Blockquote">""</Button>
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
  )
}