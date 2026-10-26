import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { PALETTE_GROUPS } from '#lib/theme/palettes.ts';
import { PATTERNS, patternById } from '#lib/theme/patterns.ts';
import { FONTS, NEUTRALS, STYLES } from '#lib/theme/foundation.ts';
import { defaultLawSettings } from '#lib/theme/ux-laws.ts';
import type { DesignSelection, PaletteEntry } from '#lib/types/design.type.ts';
import { isPureExtreme } from '#lib/utils/color.util.ts';
import { checkSource, type DesignConfig } from './agent/design-rules.mts';
import { buildKit, kitRootFolder, zipKit } from './kit.util.ts';

function selection(overrides: Partial<DesignSelection> = {}): DesignSelection {
	const group = PALETTE_GROUPS[2];
	const palette: PaletteEntry = { ...group.palettes[1], group };
	return {
		brand: {
			name: 'Café do Zé',
			slug: 'cafe-do-ze',
			tagline: 'Café coado, do jeito certo.',
			description: 'Cafeteria de bairro.',
			logo: null
		},
		palette,
		neutral: NEUTRALS[0],
		pattern: PATTERNS[0],
		font: FONTS[0],
		style: STYLES[2],
		laws: defaultLawSettings(),
		...overrides
	};
}

const fileByPath = (files: ReturnType<typeof buildKit>, path: string) =>
	files.find((f) => f.path === path)?.content ?? '';

describe('buildKit', () => {
	it('ships skills, hooks, config and tokens', () => {
		// feliz
		const paths = buildKit(selection()).map((f) => f.path);
		expect(paths).toEqual(
			expect.arrayContaining([
				'README.md',
				'.claude/settings.json',
				'.claude/skills/brand-design/SKILL.md',
				'.claude/skills/ux-laws/SKILL.md',
				'.claude/commands/design-da-marca.md',
				'.claude/commands/leis-de-ux.md',
				'.claude/hooks/design/design.config.json',
				'.claude/hooks/design/design-rules.mjs',
				'.claude/hooks/design/check-design.mjs',
				'.claude/hooks/design/check-design.test.mjs',
				'design/tokens.css',
				'design/tailwind.css',
				'design/reference.css'
			])
		);
	});

	it('names skills in English, each with a pt-BR shortcut that only delegates', () => {
		const files = buildKit(selection());
		const skills = files.filter((f) => f.path.startsWith('.claude/skills/'));
		expect(skills.map((f) => f.path.split('/')[2])).toEqual(['brand-design', 'ux-laws']);
		for (const [shortcut, skill] of [
			['design-da-marca', 'brand-design'],
			['leis-de-ux', 'ux-laws']
		]) {
			const command = fileByPath(files, `.claude/commands/${shortcut}.md`);
			const skillContent = fileByPath(files, `.claude/skills/${skill}/SKILL.md`);
			const description = skillContent.match(/^description: (.+)$/m)![1];
			expect(command).toContain(
				`description: Atalho em português para a skill \`${skill}\`. ${description}`
			);
			expect(command).toContain('disable-model-invocation: true');
			expect(command).toContain(`Use a skill \`${skill}\` e siga-a do começo ao fim.`);
		}
	});

	it('ships only CSS, skills and .mjs scripts: no Kotlin, JSON tokens or TypeScript', () => {
		// triste: nada de plataforma que o projeto não usa
		const paths = buildKit(selection()).map((f) => f.path);
		expect(paths.filter((p) => /\.(kt|mts|ts|svg)$|tokens\.json$/.test(p))).toEqual([]);
		const hooks = paths.filter((p) => p.startsWith('.claude/hooks/design/'));
		expect(hooks.filter((p) => !/\.(mjs|json)$/.test(p))).toEqual([]);
	});

	it('ships the agent scripts as plain JavaScript that imports .mjs', () => {
		const files = buildKit(selection());
		const checker = fileByPath(files, '.claude/hooks/design/check-design.mjs');
		expect(checker).toMatch(/^\/\*\*\n \* Verificador de design/);
		expect(checker).toMatch(/from ["']\.\/design-rules\.mjs["']/);
		expect(checker).not.toMatch(/\.mts\b|^\s*(export )?type |: DesignConfig/m);
	});

	it('writes skills with valid frontmatter and no unrendered placeholders', () => {
		const files = buildKit(selection());
		for (const path of [
			'.claude/skills/brand-design/SKILL.md',
			'.claude/skills/ux-laws/SKILL.md'
		]) {
			const content = fileByPath(files, path);
			expect(content).toMatch(/^---\nname: [a-z0-9-]+\ndescription: .+\n---\n/);
			expect(content).not.toMatch(/\{\{|\}\}/);
		}
	});

	it('carries the configured law limits into the config and the skill', () => {
		const laws = defaultLawSettings();
		laws.fitts.params.minTargetPx = 48;
		laws.tesler.enabled = false;
		const files = buildKit(selection({ laws }));
		const config = JSON.parse(
			fileByPath(files, '.claude/hooks/design/design.config.json')
		) as DesignConfig;
		expect(config.laws.fitts.minTargetPx).toBe(48);
		expect(config.laws.tesler.enabled).toBe(false);
		const uxSkill = fileByPath(files, '.claude/skills/ux-laws/SKILL.md');
		expect(uxSkill).toContain('48px');
		expect(uxSkill).toMatch(/Desligadas neste projeto[\s\S]*Lei de Tesler/);
	});

	it('generates token files without pure black or white', () => {
		const files = buildKit(selection());
		const hexes = fileByPath(files, 'design/tokens.css').match(/#[0-9a-f]{6}\b/gi) ?? [];
		expect(hexes.length).toBeGreaterThan(20);
		expect(hexes.filter(isPureExtreme)).toEqual([]);
	});

	it('hooks run the checker with node and the project dir', () => {
		const settings = JSON.parse(fileByPath(buildKit(selection()), '.claude/settings.json'));
		expect(settings.hooks.PostToolUse[0].matcher).toBe('Edit|MultiEdit|Write');
		expect(settings.hooks.PostToolUse[0].hooks[0].command).toContain('check-design.mjs" --hook');
		expect(settings.hooks.SessionStart[0].hooks[0].command).toContain('--summary');
	});

	it('produces a config the checker accepts', () => {
		// triste: o config exportado precisa pegar uma violação de verdade
		const config = JSON.parse(
			fileByPath(buildKit(selection()), '.claude/hooks/design/design.config.json')
		) as DesignConfig;
		const violations = checkSource(
			'src/routes/+page.svelte',
			'<button type="button" class="h-6 bg-black">x</button>',
			config
		);
		expect(violations.map((v) => v.rule)).toEqual(
			expect.arrayContaining(['fitts/target-size', 'brand/no-pure-black-white'])
		);
	});
});

describe('reference css and pattern', () => {
	it('ships the base, the pattern section and the finish section that were chosen', () => {
		const plain = fileByPath(buildKit(selection({ style: STYLES[0] })), 'design/reference.css');
		expect(plain).toContain('.pv {');
		expect(plain).not.toMatch(/@pattern|@style/);

		const css = fileByPath(
			buildKit(selection({ pattern: patternById('bruto'), style: STYLES[2] })),
			'design/reference.css'
		);
		expect(css).toContain('/* @pattern bruto');
		expect(css).not.toContain('@pattern blueprint');
		expect(css).toContain('/* @style neon');
		expect(css).not.toContain('@style suave');
	});

	it('exports the pattern as tokens and Tailwind theme', () => {
		const files = buildKit(selection({ pattern: patternById('material') }));
		const tokens = fileByPath(files, 'design/tokens.css');
		expect(tokens).toContain('--shape-button: 9999px;');
		expect(tokens).toContain('--control-height: 40px;');
		const tailwind = fileByPath(files, 'design/tailwind.css');
		expect(tailwind).toContain('--radius-button: var(--shape-button);');
		expect(tailwind).toContain('--shadow-card: var(--elevation-card);');
		expect(tokens).toContain('--shape-card: 28px;');
	});

	it('describes the pattern in the skill, crediting the inspiration as unofficial', () => {
		// feliz
		const skill = fileByPath(
			buildKit(selection({ pattern: patternById('carbon') })),
			'.claude/skills/brand-design/SKILL.md'
		);
		expect(skill).toContain('## 3. Padrão: Carbon');
		expect(skill).toContain('Carbon Design System (IBM)');
		expect(skill).toMatch(/não a implementação\s+oficial/);
		expect(skill).toContain('`rounded-button`');
	});

	it('does not credit anyone for an own pattern, and mentions the finish only when there is one', () => {
		// triste
		const own = fileByPath(
			buildKit(selection({ pattern: patternById('bruto'), style: STYLES[0] })),
			'.claude/skills/brand-design/SKILL.md'
		);
		expect(own).not.toContain('Inspirado em');
		expect(own).not.toContain('**Acabamento');
		const withFinish = fileByPath(
			buildKit(selection({ style: STYLES[4] })),
			'.claude/skills/brand-design/SKILL.md'
		);
		expect(withFinish).toContain(`**Acabamento ${STYLES[4].name}**`);
	});

	it('ignores a logo that is not a supported image', () => {
		// triste
		const base = selection();
		const files = buildKit(
			selection({ brand: { ...base.brand, logo: 'data:text/plain;base64,aGk=' } })
		);
		expect(files.some((f) => f.path.startsWith('design/logo.'))).toBe(false);
	});
});

describe('logo', () => {
	const svg =
		'<svg xmlns="http://www.w3.org/2000/svg"><rect width="8" height="8" fill="#e2725b"/></svg>';
	const withLogo = () => {
		const base = selection();
		return selection({ brand: { ...base.brand, logo: `data:image/svg+xml;base64,${btoa(svg)}` } });
	};

	it('ships the uploaded logo untouched and cites it in the skill', () => {
		// feliz
		const sel = withLogo();
		const files = buildKit(sel);
		const unzipped = unzipSync(zipKit(files, kitRootFolder(sel)));
		expect(strFromU8(unzipped['cafe-do-ze-design-kit/design/logo.svg'])).toBe(svg);
		expect(fileByPath(files, '.claude/skills/brand-design/SKILL.md')).toContain('design/logo.svg');
	});

	it('explains the monogram when there is no logo', () => {
		// triste
		const files = buildKit(selection());
		expect(files.some((f) => f.path.startsWith('design/logo.'))).toBe(false);
		expect(fileByPath(files, '.claude/skills/brand-design/SKILL.md')).toContain(
			'Sem logo definida'
		);
	});
});

describe('zipKit', () => {
	it('puts every file under the kit folder', () => {
		const sel = selection();
		const files = buildKit(sel);
		const unzipped = unzipSync(zipKit(files, kitRootFolder(sel)));
		expect(Object.keys(unzipped)).toHaveLength(files.length);
		expect(strFromU8(unzipped['cafe-do-ze-design-kit/README.md'])).toContain('Kit de design');
	});
});
