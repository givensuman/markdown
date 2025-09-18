 import { Button } from '@/components/ui/button'
 import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
 import { Bold, Italic, Heading, Strikethrough, List, ListOrdered, CheckSquare, Quote, Code, Code2, Table, Link, Image } from 'lucide-react'

type FormattingToolbarProps = {
  wrapSelection: (before: string, after?: string) => void
  insertAtLineStart: (prefix: string) => void
  insertBlock: (block: string) => void
}

export default function FormattingToolbar({ wrapSelection, insertAtLineStart, insertBlock }: FormattingToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => wrapSelection('**')} title="Bold"><Bold className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => wrapSelection('*')} title="Italic"><Italic className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('# ')} title="Heading"><Heading className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Heading</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => wrapSelection('~~')} title="Strikethrough"><Strikethrough className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Strikethrough</TooltipContent>
        </Tooltip>
        <div className="mx-1 h-4 w-px bg-border" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('- ')} title="Unordered list"><List className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Unordered list</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('1. ')} title="Ordered list"><ListOrdered className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Ordered list</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('- [ ] ')} title="Checklist"><CheckSquare className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Checklist</TooltipContent>
        </Tooltip>
        <div className="mx-1 h-4 w-px bg-border" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('> ')} title="Blockquote"><Quote className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Blockquote</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => wrapSelection('`')} title="Inline code"><Code className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Inline code</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => insertBlock('\n\n```\n\n```\n')} title="Code block"><Code2 className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Code block</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => insertBlock('\n\n| Column | Column |\n| ------ | ------ |\n| Cell | Cell |\n\n')} title="Table"><Table className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Table</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => wrapSelection('[', '](url)')} title="Link"><Link className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Link</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => insertBlock('![](url)')} title="Image"><Image className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Image</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}