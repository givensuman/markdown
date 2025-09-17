import { useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('mdstudio-theme')
    if (stored === 'dark' || stored === 'light') return stored
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('mdstudio-theme', theme)
  }, [theme])

  return { theme, setTheme }
}
