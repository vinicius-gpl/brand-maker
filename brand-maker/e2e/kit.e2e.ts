import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { strFromU8, unzipSync } from 'fflate';
import { expect, openApp, test } from './fixtures.ts';

const LOGO = fileURLToPath(new URL('./assets/logo.svg', import.meta.url));

/** Descompacta o zip baixado numa pasta temporária e devolve a raiz do kit. */
function extract(zipPath: string): { root: string; files: Record<string, Uint8Array> } {
	const files = unzipSync(readFileSync(zipPath));
	const dir = mkdtempSync(join(tmpdir(), 'brand-kit-'));
	for (const [path, bytes] of Object.entries(files)) {
		mkdirSync(dirname(join(dir, path)), { recursive: true });
		writeFileSync(join(dir, path), bytes);
	}
	const folder = Object.keys(files)[0].split('/')[0];
	return { root: join(dir, folder), files };
}

test.describe('kit de design', () => {
	test.beforeEach(async ({ page }) => openApp(page));

	test('o zip leva a marca, os limites escolhidos e um hook que funciona', async ({ page }) => {
		test.slow();

		// Monta a marca na tela.
		await page.getByRole('textbox', { name: /Nome da marca/ }).fill('Café do Zé');
		await page.getByLabel(/^Logo/).setInputFiles(LOGO);
		const fitts = page.getByRole('heading', { name: 'Lei de Fitts' }).locator('xpath=ancestor::li');
		await fitts.getByRole('slider').fill('48');
		const tesler = page
			.getByRole('heading', { name: 'Lei de Tesler' })
			.locator('xpath=ancestor::li');
		await tesler.getByRole('checkbox').uncheck();

		// Baixa o kit.
		const download = page.waitForEvent('download');
		await page.getByRole('button', { name: 'Baixar cafe-do-ze-design-kit.zip' }).click();
		const zip = await (await download).path();
		const { root, files } = extract(zip);
		const read = (path: string) => strFromU8(files[`cafe-do-ze-design-kit/${path}`]);

		// O conteúdo reflete a tela.
		expect(Object.keys(files)).toEqual(
			expect.arrayContaining([
				'cafe-do-ze-design-kit/README.md',
				'cafe-do-ze-design-kit/.claude/settings.json',
				'cafe-do-ze-design-kit/.claude/skills/brand-design/SKILL.md',
				'cafe-do-ze-design-kit/.claude/skills/ux-laws/SKILL.md',
				'cafe-do-ze-design-kit/.claude/hooks/design/check-design.mjs',
				'cafe-do-ze-design-kit/design/logo.svg',
				'cafe-do-ze-design-kit/design/tailwind.css'
			])
		);
		expect(read('design/logo.svg')).toBe(readFileSync(LOGO, 'utf8'));
		const config = JSON.parse(read('.claude/hooks/design/design.config.json'));
		expect(config.laws.fitts.minTargetPx).toBe(48);
		expect(config.laws.tesler.enabled).toBe(false);
		expect(read('.claude/skills/ux-laws/SKILL.md')).toContain('48px');

		// O hook que veio no zip roda num projeto e barra código fora do design (como o Claude Code chama).
		mkdirSync(join(root, 'src'), { recursive: true });
		const page_ = join(root, 'src/page.svelte');
		writeFileSync(page_, '<button type="button" class="h-10 bg-black">Salvar</button>');
		const hook = (file: string) =>
			spawnSync(process.execPath, ['.claude/hooks/design/check-design.mjs', '--hook'], {
				cwd: root,
				input: JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: file } }),
				env: { ...process.env, CLAUDE_PROJECT_DIR: root },
				encoding: 'utf8'
			});

		const blocked = hook(page_);
		expect(blocked.status).toBe(2);
		expect(blocked.stderr).toContain('brand/no-pure-black-white');
		// 40px (h-10) passa no padrão, mas a marca pediu 48px.
		expect(blocked.stderr).toContain('fitts/target-size');

		writeFileSync(
			page_,
			'<button type="button" class="h-12 bg-primary text-primary-foreground">Salvar</button>'
		);
		const clean = hook(page_);
		expect(clean.status).toBe(0);
		expect(clean.stderr).toBe('');

		// Os testes das regras que vão no zip passam no projeto de destino.
		const tests = spawnSync(process.execPath, ['--test', '.claude/hooks/design/*.test.mjs'], {
			cwd: root,
			encoding: 'utf8'
		});
		expect(tests.status, tests.stdout + tests.stderr).toBe(0);
	});
});
