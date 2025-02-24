/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: true,
		port: 8080,
		strictPort: true,
		origin: 'http://0.0.0.0:8080',
	},
	preview: {
		port: 8080,
		strictPort: true,
	},
	resolve: {
		alias: {
			'@components': path.resolve(__dirname, './src/components'),
			'@utils': path.resolve(__dirname, './src/utils'),
			'@types': path.resolve(__dirname, './src/types'),
			'@assets': path.resolve(__dirname, './src/assets'),
			'@routes': path.resolve(__dirname, './src/routes'),
			'@contexts': path.resolve(__dirname, './src/contexts'),
			'@api': path.resolve(__dirname, './src/api'),
			'@helpers': path.resolve(__dirname, './src/helpers'),
			'@apiSchema': path.resolve(__dirname, './src/types/api'),
		},
	},
	build: { outDir: 'build' },
	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
			},
		},
	},
	test: {
		dir: 'src',
		environment: 'jsdom',
		globals: true,
		include: ['**/*.{test,spec}.ts(|x)'],
		setupFiles: ['tests/setup.ts'],
		reporters: process.env.CI ? ['basic', 'html', 'github-actions'] : ['basic'],
		outputFile: {
			html: '.vitest-report/index.html',
		},
	},
})
