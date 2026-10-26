/** Os arquivos de token: CSS puro, tema do Tailwind v4 e JSON no formato DTCG. */
import { patternTokens } from '#lib/theme/patterns.ts';
import type { DesignSelection, Mode, Tokens } from '#lib/types/design.type.ts';
import { buildTokens } from '#lib/utils/tokens.util.ts';

export function themeTokens(selection: DesignSelection): Record<Mode, Tokens> {
	return {
		light: buildTokens(selection.palette, 'light', selection.neutral),
		dark: buildTokens(selection.palette, 'dark', selection.neutral)
	};
}

const declarations = (tokens: Tokens) =>
	Object.entries(tokens)
		.map(([name, hex]) => `\t--${name}: ${hex};`)
		.join('\n');

function header(selection: DesignSelection): string {
	const { brand, palette, pattern, style, neutral } = selection;
	return `/* ${brand.name} · padrão ${pattern.name} · ${palette.name} · acabamento ${style.name} · neutros ${neutral.name}
 * Gerado pelo brand design kit. Para mudar, gere o kit de novo em vez de editar à mão. */`;
}

/** CSS puro: `:root` claro e `[data-theme='dark']` escuro. */
export function tokensCss(selection: DesignSelection): string {
	const { light, dark } = themeTokens(selection);
	return `${header(selection)}

:root {
${declarations(light)}

	--brand-font-sans: ${selection.font.sans};
	--brand-font-heading: ${selection.font.heading};

	/* Padrão ${selection.pattern.name}: forma, borda, sombra, densidade, tipografia, movimento. */
${declarations(patternTokens(selection.pattern))}

	color-scheme: light;
}

:root[data-theme='dark'] {
${declarations(dark)}

	color-scheme: dark;
}
`;
}

/**
 * Tema do Tailwind v4: os tokens viram classes (`--color-primary` → `bg-primary`). Autossuficiente:
 * importe depois de `@import 'tailwindcss';`.
 */
export function tailwindCss(selection: DesignSelection): string {
	const { light } = themeTokens(selection);
	const colors = Object.keys(light)
		.map((name) => `\t--color-${name}: var(--${name});`)
		.join('\n');

	return `${tokensCss(selection)}
/* O tema escuro é marcado por data-theme no <html>, não pela classe .dark. */
@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));

@theme inline {
${colors}

	/* Forma por papel: rounded-button, rounded-card, rounded-control… */
	--radius-control: var(--shape-control);
	--radius-button: var(--shape-button);
	--radius-card: var(--shape-card);
	--radius-dialog: var(--shape-dialog);
	--radius-chip: var(--shape-chip);
	--radius-badge: var(--shape-badge);

	--shadow-card: var(--elevation-card);
	--shadow-button: var(--elevation-button);
	--ease-brand: var(--motion-easing);
	--spacing-control: var(--control-height);

	--font-sans: var(--brand-font-sans);
	--font-heading: var(--brand-font-heading);

	/* Reflexo que corre no título (estilos Metálico e Holográfico). */
	--animate-shimmer: shimmer 6s linear infinite;

	@keyframes shimmer {
		to {
			background-position: 200% center;
		}
	}
}
`;
}
