import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root')!

// Respect prefers-color-scheme on first load
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
if (prefersDark) {
	document.documentElement.classList.add('dark')
} else {
	document.documentElement.classList.remove('dark')
}

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
)
