import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/**
 * E2E contra o build de produção (o mesmo site estático que vai para o GitHub Pages), servido
 * pelo `vite preview`. Os arquivos ficam em e2e/<fluxo>.e2e.ts.
 */
export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.e2e.ts',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: 'retain-on-failure',
		locale: 'pt-BR'
	},
	projects: [
		{
			name: 'desktop',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }
		},
		{ name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: '**/layout.e2e.ts' }
	],
	webServer: {
		command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
		port: PORT,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	}
});
