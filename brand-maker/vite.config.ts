import { readFile } from 'node:fs/promises';
import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { transformWithOxc, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

/**
 * Caminho base do site. Vazio para domínio próprio ou Cloudflare Workers; no GitHub Pages de
 * repositório o site mora em /<repo>, então o build roda com BASE_PATH=/<repo>.
 */
const base = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

/**
 * Endereço público completo (com o caminho base), usado no canonical, nas metatags de
 * compartilhamento, no sitemap.xml e no robots.txt. No GitHub Pages o workflow passa
 * SITE_URL=https://<usuario>.github.io/<repo>; no Docker, o build arg SITE_URL.
 */
const siteUrl = (process.env.SITE_URL ?? `http://localhost:5173${base}`).replace(/\/+$/, '');

/**
 * `import src from './x.mts?mjs'`: o texto do script do agente já em JavaScript. Os scripts são
 * escritos e testados em TypeScript, mas o kit entrega `.mjs`, que roda em qualquer Node sem
 * compilar. Tira os tipos, mantém o comentário de abertura e troca `.mts` por `.mjs`.
 */
function agentMjs(): Plugin {
	return {
		name: 'agent-mjs',
		enforce: 'pre',
		async load(id) {
			const [file, query] = id.split('?');
			if (query !== 'mjs' || !file.endsWith('.mts')) return;
			const source = await readFile(file, 'utf8');
			const { code } = await transformWithOxc(source, file, { lang: 'ts' });
			const header = source.match(/^\/\*\*[\s\S]*?\*\//)?.[0];
			const js = header && !code.startsWith(header) ? `${header}\n${code}` : code;
			return `export default ${JSON.stringify(js.replaceAll('.mts', '.mjs'))};`;
		}
	};
}

export default defineConfig({
	define: { __SITE_URL__: JSON.stringify(siteUrl) },
	plugins: [
		agentMjs(),
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Runes em todo o projeto, menos nas bibliotecas. Pode sair no Svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
			paths: { base }
		})
	],
	test: {
		expect: { requireAssertions: true },
		coverage: {
			provider: 'v8',
			include: ['src/**/*.{ts,svelte}'],
			exclude: [
				// Só tipos, sem código executável.
				'src/**/*.type.ts',
				'src/app.d.ts',
				// Testes e harness de teste não contam como código testado.
				'src/**/*.test.ts',
				'src/**/*.test.svelte'
			],
			reporter: ['text', 'html', 'json-summary'],
			// Mínimo do projeto: abaixo disso `npm run test:coverage` (e o CI) falha.
			thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 }
		},
		projects: [
			{
				// Lógica pura (cor, tokens, kit, harmonia): Node, sem DOM.
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					// O kit importa CSS com `?raw`; sem isto o Vitest entrega o arquivo vazio.
					css: true,
					include: ['src/**/*.{test,spec}.ts'],
					exclude: ['src/**/*.svelte.{test,spec}.ts']
				}
			},
			{
				// Componentes e estado com runes: jsdom + Testing Library.
				extends: './vite.config.ts',
				plugins: [svelteTesting()],
				test: {
					name: 'client',
					environment: 'jsdom',
					include: ['src/**/*.svelte.{test,spec}.ts'],
					setupFiles: ['./vitest.setup.ts']
				}
			}
		]
	}
});
