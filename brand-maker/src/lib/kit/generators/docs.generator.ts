/**
 * Os Markdown do kit: as skills, o atalho em português e o README. Os textos moram em
 * `kit/templates/*.md` (Mustache) para poderem ser editados como documento, não como string.
 */
import Mustache from 'mustache';
import { RULES } from '#lib/kit/agent/design-rules.mts';
import { UX_LAWS, renderPractice } from '#lib/theme/ux-laws.ts';
import type { DesignSelection, KitFile } from '#lib/types/design.type.ts';
import commandTemplate from '../templates/command.md?raw';
import designSkillTemplate from '../templates/design-skill.md?raw';
import readmeTemplate from '../templates/readme.md?raw';
import uxLawsTemplate from '../templates/ux-laws-skill.md?raw';
import { HOOKS_DIR, SKILLS } from './agent.generator.ts';
import { TOKEN_ROLES } from './token-roles.ts';
import { themeTokens } from './tokens.generator.ts';

/** Markdown não é HTML: nada de trocar `&` por `&amp;`. */
const render = (template: string, view: object) =>
	Mustache.render(template, view, undefined, { escape: (text: string) => text });

const SEVERITY_LABEL = { error: 'erro', warning: 'aviso' } as const;

const ruleView = (id: string) => {
	const rule = RULES.find((r) => r.id === id);
	return {
		id,
		severity: rule ? SEVERITY_LABEL[rule.severity] : '',
		description: rule?.description ?? ''
	};
};

/** `logoFile` é o caminho da logo dentro do kit, ou null quando a marca não tem logo. */
const SHAPE_LABELS: Record<string, string> = {
	control: 'Campos',
	button: 'Botões',
	card: 'Cartões',
	dialog: 'Diálogos',
	chip: 'Chips e tags',
	badge: 'Selos'
};

/** O padrão como a skill descreve: regras, forma por papel e de onde veio a inspiração. */
function patternView({ pattern }: DesignSelection) {
	return {
		name: pattern.name,
		summary: pattern.summary,
		inspiredBy: pattern.inspiredBy,
		rules: pattern.rules,
		shapes: Object.entries(pattern.shape).map(([role, value]) => ({
			role,
			label: SHAPE_LABELS[role],
			value
		})),
		controlHeight: pattern.controlHeight,
		motion: `${pattern.motion.duration} ${pattern.motion.easing}`,
		cardShadow: pattern.elevation.card,
		inputStyle:
			pattern.border.input === 'underline'
				? 'preenchido, só a linha de baixo'
				: 'em caixa, com borda'
	};
}

export function designSkill(selection: DesignSelection, logoFile: string | null = null): string {
	const { light, dark } = themeTokens(selection);
	const keyColors = [
		['Primária', 'primary', 'primary-strong'],
		['Destaque', 'accent-hero', 'accent-strong'],
		['Terceira', 'tertiary', 'tertiary-strong']
	].map(([label, fill, text]) => ({
		label,
		dark: dark[fill],
		light: light[fill],
		darkText: dark[text],
		lightText: light[text]
	}));

	return render(designSkillTemplate, {
		skill: SKILLS.design.name,
		brand: selection.brand.name,
		paletteName: selection.palette.name,
		paletteGroup: selection.palette.group.name,
		neutralName: selection.neutral.name,
		pattern: patternView(selection),
		styleName: selection.style.name,
		styleSummary: selection.style.summary,
		hasFinish: selection.style.id !== 'none',
		fontName: selection.font.name,
		fontSans: selection.font.sans,
		fontHeading: selection.font.heading,
		keyColors,
		tagline: selection.brand.tagline,
		description: selection.brand.description,
		logoFile,
		tokens: Object.keys(light).map((name) => ({
			name,
			role: TOKEN_ROLES[name] ?? '',
			light: light[name],
			dark: dark[name]
		})),
		laws: UX_LAWS.filter((law) => selection.laws[law.id].enabled),
		minTargetPx: selection.laws.fitts.params.minTargetPx,
		hooksDir: HOOKS_DIR
	});
}

export function uxLawsSkill(selection: DesignSelection): string {
	const enabled = UX_LAWS.filter((law) => selection.laws[law.id].enabled);
	const disabled = UX_LAWS.filter((law) => !selection.laws[law.id].enabled);

	return render(uxLawsTemplate, {
		brand: selection.brand.name,
		hooksDir: HOOKS_DIR,
		laws: enabled.map((law) => {
			const values = selection.laws[law.id].params;
			return {
				name: law.name,
				principle: law.principle,
				practices: law.practices.map((p) => renderPractice(p, values)),
				hasParams: law.params.length > 0,
				params: law.params.map((p) => ({ label: p.label, value: values[p.key], unit: p.unit })),
				hasChecks: law.checks.length > 0,
				checks: law.checks.map(ruleView)
			};
		}),
		disabled
	});
}

/** A `description` do frontmatter de uma skill já renderizada. */
const skillDescription = (skill: string) => skill.match(/^description: (.+)$/m)?.[1] ?? '';

/** Atalho em português para uma skill: mesmo gatilho, e só delega (a regra mora na skill). */
export function commandShortcut(skill: string, skillContent: string): string {
	return render(commandTemplate, { skill, description: skillDescription(skillContent) });
}

/** O README lista os outros arquivos do kit, então recebe a lista pronta. */
export function readme(selection: DesignSelection, files: KitFile[], generatedAt: Date): string {
	const activeRuleIds = [
		'brand/no-pure-black-white',
		'brand/tokens-only',
		'brand/no-arbitrary-values',
		...UX_LAWS.filter((law) => selection.laws[law.id].enabled).flatMap((law) => law.checks)
	];

	return render(readmeTemplate, {
		brand: selection.brand.name,
		paletteName: selection.palette.name,
		patternName: selection.pattern.name,
		styleName: selection.style.name,
		fontName: selection.font.name,
		neutralName: selection.neutral.name,
		generatedAt: generatedAt.toLocaleDateString('pt-BR'),
		files,
		skill: SKILLS.design.name,
		uxSkill: SKILLS.uxLaws.name,
		shortcut: SKILLS.design.shortcut,
		uxShortcut: SKILLS.uxLaws.shortcut,
		rules: activeRuleIds.map(ruleView)
	});
}
