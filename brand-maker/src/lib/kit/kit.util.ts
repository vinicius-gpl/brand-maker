/**
 * Monta o kit de design a partir da escolha feita na tela e empacota em zip, tudo no navegador
 * (o site é estático: GitHub Pages ou Cloudflare Workers, sem servidor).
 */
import { strToU8, zipSync } from 'fflate';
import previewBaseCss from '#lib/theme/preview/base.css?raw';
import previewPatternCss from '#lib/theme/preview/patterns.css?raw';
import previewStyleCss from '#lib/theme/preview/styles.css?raw';
import type { DesignSelection, KitFile } from '#lib/types/design.type.ts';
import { dataUrlToBytes } from '#lib/utils/file.util.ts';
// Os scripts do agente são escritos em TypeScript aqui e vão no kit como JavaScript (.mjs):
// o `?mjs` (plugin em vite.config.ts) tira os tipos no build. Roda em qualquer Node, sem nada.
import checkDesignSource from './agent/check-design.mts?mjs';
import designRulesSource from './agent/design-rules.mts?mjs';
import checkDesignTestSource from './agent/check-design.test.mts?mjs';
import designRulesTestSource from './agent/design-rules.test.mts?mjs';
import { claudeSettings, designConfig, HOOKS_DIR, SKILLS } from './generators/agent.generator.ts';
import { commandShortcut, designSkill, readme, uxLawsSkill } from './generators/docs.generator.ts';
import { tailwindCss, tokensCss } from './generators/tokens.generator.ts';

/** Só o trecho `@<marker> <id>` de um arquivo de CSS da prévia (vazio se não houver). */
function section(css: string, marker: 'style' | 'pattern', id: string): string {
	const part = css
		.split(new RegExp(`(?=/\\* @${marker} )`))
		.find((p) => p.startsWith(`/* @${marker} ${id} `));
	return part?.trim() ?? '';
}

function referenceCss(selection: DesignSelection): string {
	const { pattern, style } = selection;
	const parts = [
		previewBaseCss.trim(),
		section(previewPatternCss, 'pattern', pattern.id),
		section(previewStyleCss, 'style', style.id)
	];
	return `/* Padrão ${pattern.name} · acabamento ${style.name}
 * Referência tirada da prévia do brand design kit. As classes .pv-* são da prévia: use como
 * modelo nos componentes do projeto, sempre com os tokens (design/tokens.css).
 * Requer Tailwind v4 com design/tailwind.css importado (usa @apply, --alpha() e as cores de token).
 * As texturas (grain.svg, paper.svg) não vão no kit: troque o url() pelo arquivo do projeto. */

${parts.filter(Boolean).join('\n\n')}
`;
}

export function kitRootFolder(selection: DesignSelection): string {
	return `${selection.brand.slug}-design-kit`;
}

export function buildKit(selection: DesignSelection, generatedAt = new Date()): KitFile[] {
	const logoUrl = selection.brand.logo;
	const logo = logoUrl ? dataUrlToBytes(logoUrl) : null;
	const logoFile = logo ? `design/logo.${logo.extension}` : null;
	const designContent = designSkill(selection, logoFile);
	const uxContent = uxLawsSkill(selection);

	const files: KitFile[] = [
		{
			path: `.claude/skills/${SKILLS.design.name}/SKILL.md`,
			content: designContent,
			description: 'Skill da marca: identidade, tokens, estilo, tipografia e proibições'
		},
		{
			path: `.claude/skills/${SKILLS.uxLaws.name}/SKILL.md`,
			content: uxContent,
			description: 'Skill das leis de UX como regras do projeto'
		},
		{
			path: `.claude/commands/${SKILLS.design.shortcut}.md`,
			content: commandShortcut(SKILLS.design.name, designContent),
			description: `Atalho /${SKILLS.design.shortcut} para a skill ${SKILLS.design.name}`
		},
		{
			path: `.claude/commands/${SKILLS.uxLaws.shortcut}.md`,
			content: commandShortcut(SKILLS.uxLaws.name, uxContent),
			description: `Atalho /${SKILLS.uxLaws.shortcut} para a skill ${SKILLS.uxLaws.name}`
		},
		{
			path: '.claude/settings.json',
			content: claudeSettings(),
			description: 'Liga os hooks SessionStart e PostToolUse'
		},
		{
			path: `${HOOKS_DIR}/design.config.json`,
			content: JSON.stringify(designConfig(selection), null, 2) + '\n',
			description: 'Limites e leis ligadas (lido pelo verificador)'
		},
		{
			path: `${HOOKS_DIR}/design-rules.mjs`,
			content: designRulesSource,
			description: 'As regras de design (JavaScript puro, sem dependência)'
		},
		{
			path: `${HOOKS_DIR}/check-design.mjs`,
			content: checkDesignSource,
			description: 'Verificador: varredura, hook e resumo para o agente'
		},
		{
			path: `${HOOKS_DIR}/design-rules.test.mjs`,
			content: designRulesTestSource,
			description: 'Testes das regras (node --test)'
		},
		{
			path: `${HOOKS_DIR}/check-design.test.mjs`,
			content: checkDesignTestSource,
			description: 'Testes do verificador: hook, varredura e resumo (node --test)'
		},
		{
			path: 'design/tokens.css',
			content: tokensCss(selection),
			description: 'Tokens em CSS puro, claro e escuro'
		},
		{
			path: 'design/tailwind.css',
			content: tailwindCss(selection),
			description: 'Tokens + tema do Tailwind v4 (bg-primary, text-foreground…)'
		},
		{
			path: 'design/reference.css',
			content: referenceCss(selection),
			description: `Referência do padrão ${selection.pattern.name} e do acabamento ${selection.style.name}`
		}
	];

	if (logoUrl && logo && logoFile) {
		files.push({
			path: logoFile,
			content: logoUrl,
			binary: logo.bytes,
			description: 'A logo enviada, sem alteração'
		});
	}

	const readmeFile: KitFile = {
		path: 'README.md',
		content: '',
		description: 'Como instalar e usar o kit'
	};
	readmeFile.content = readme(selection, [readmeFile, ...files], generatedAt);
	return [readmeFile, ...files];
}

export function zipKit(files: KitFile[], rootFolder: string): Uint8Array {
	const entries = Object.fromEntries(
		files.map((file) => [`${rootFolder}/${file.path}`, file.binary ?? strToU8(file.content)])
	);
	return zipSync(entries, { level: 6 });
}
