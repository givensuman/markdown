import { cn } from '@/lib/utils'
import { forwardRef, type ForwardedRef } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
  className?: string
}

const MarkdownEditor = forwardRef(function MarkdownEditor(
  { value, onChange, className }: Props,
  ref: ForwardedRef<HTMLTextAreaElement>,
) {
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn('h-full w-full resize-none bg-transparent px-3 py-2 text-[14px] leading-6 outline-none', className)}
      spellCheck={false}
    />
  )
})

export default MarkdownEditor
