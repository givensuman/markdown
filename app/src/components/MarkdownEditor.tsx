import { cn } from '@/lib/utils'

type Props = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function MarkdownEditor({ value, onChange, className }: Props) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn('h-full w-full resize-none bg-transparent px-3 py-2 text-[14px] leading-6 outline-none', className)}
      spellCheck={false}
    />
  )
}
