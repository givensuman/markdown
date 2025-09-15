import { useCallback, useEffect, useRef, useState } from 'react'
import { Editor, loader } from '@monaco-editor/react'
// monaco-themes exports a JSON mapping; import as JSON
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import themeList from 'monaco-themes/themes/themelist.json'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sun, Moon, FileDown, FileText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import 'github-markdown-css/github-markdown.css'
import html2pdf from 'html2pdf.js'

const DEFAULT_MD = `# Markdown Studio\n\n- Live preview on the right\n- Monaco editor on the left\n\nMath: $\\int_0^1 x^2 \\mathrm{d}x = \\tfrac{1}{3}$\n\n\n\n\n`;

function useTheme() {
	const [theme, setTheme] = useState<'light' | 'dark'>(() =>
		document.documentElement.classList.contains('dark') ? 'dark' : 'light',
	)
	useEffect(() => {
		if (theme === 'dark') document.documentElement.classList.add('dark')
		else document.documentElement.classList.remove('dark')
	}, [theme])
	return { theme, setTheme }
}

export default function App() {
	const { theme, setTheme } = useTheme()
	const [content, setContent] = useState<string>(DEFAULT_MD)
	const [filename, setFilename] = useState<string>('document')
	const previewRef = useRef<HTMLDivElement | null>(null)

	const monacoThemeName = theme === 'dark' ? 'GitHub Dark' : 'GitHub Light'

	useEffect(() => {
		const applyTheme = async () => {
			const monaco = await loader.init()
			const themeDataPath = (themeList as any)[monacoThemeName]
			if (themeDataPath) {
				const data = await fetch(themeDataPath).then((r) => r.json())
				monaco.editor.defineTheme('github-theme', data)
				monaco.editor.setTheme('github-theme')
			}
		}
		applyTheme()
	}, [monacoThemeName])

	const onChange = useCallback((value?: string) => setContent(value ?? ''), [])

	const exportMarkdown = useCallback(() => {
		const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
		const link = document.createElement('a')
		link.href = URL.createObjectURL(blob)
		link.download = `${filename || 'document'}.md`
		link.click()
		URL.revokeObjectURL(link.href)
	}, [content, filename])

	const exportPdf = useCallback(() => {
		if (!previewRef.current) return
		html2pdf()
			.set({
				margin: [10, 10],
				filename: `${filename || 'document'}.pdf`,
				image: { type: 'jpeg', quality: 0.98 },
				html2canvas: { scale: 2, useCORS: true },
				jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
			})
			.from(previewRef.current)
			.save()
	}, [filename])

	return (
		<div className="flex h-screen w-screen flex-col">
			<header className="border-b bg-background">
				<div className="mx-auto flex max-w-[1400px] items-center gap-3 p-3">
					<div className="font-medium">Markdown Studio</div>
					<Separator orientation="vertical" className="h-6" />
					<div className="flex items-center gap-2">
						<Label htmlFor="filename" className="sr-only">Filename</Label>
						<Input id="filename" value={filename} onChange={(e) => setFilename(e.target.value)} className="w-[200px]" placeholder="document" />
						<Button variant="secondary" onClick={exportMarkdown} title="Export Markdown"><FileText className="mr-2 h-4 w-4" />MD</Button>
						<Button onClick={exportPdf} title="Export PDF"><FileDown className="mr-2 h-4 w-4" />PDF</Button>
					</div>
					<div className="ml-auto" />
					<Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
						{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
					</Button>
				</div>
			</header>
			<main className="flex h-[calc(100vh-52px)] w-full">
				<section className="h-full w-1/2 border-r">
					<Editor
						height="100%"
						defaultLanguage="markdown"
						value={content}
						onChange={onChange}
						options={{
							minimap: { enabled: false },
							scrollBeyondLastLine: false,
							wordWrap: 'on',
							fontSize: 14,
							theme: 'github-theme',
						}}
					/>
				</section>
				<section className="h-full w-1/2 overflow-auto">
					<div ref={previewRef} className={`markdown-body p-6 ${theme === 'dark' ? 'bg-[#0d1117] text-[#c9d1d9]' : 'bg-white text-black'}`}>
						<ReactMarkdown
							remarkPlugins={[remarkGfm, remarkMath]}
							rehypePlugins={[rehypeRaw, rehypeKatex]}
						>
							{content}
						</ReactMarkdown>
					</div>
				</section>
			</main>
		</div>
	)
}
