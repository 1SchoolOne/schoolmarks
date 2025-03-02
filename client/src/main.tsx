import { ThemeProvider } from '@1schoolone/ui'
import { App as AppProvider } from 'antd'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App.tsx'

import './index.css'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ThemeProvider>
			<AppProvider rootClassName="app-container" notification={{ placement: 'bottomRight' }}>
				<App />
			</AppProvider>
		</ThemeProvider>
	</StrictMode>,
)
