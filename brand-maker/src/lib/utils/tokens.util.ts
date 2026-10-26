/**
 * Gera os tokens de tema (os mesmos nomes do `tokens.css` dos projetos) a partir de uma
 * paleta e de uma escala de neutros, e valida as regras da marca.
 */
import { STATUS_COLORS } from '#lib/theme/foundation.ts';
import type {
	BrandRuleResult,
	ContrastRow,
	Mode,
	Neutral,
	Palette,
	Tokens,
	WcagLevel
} from '#lib/types/design.type.ts';
import { contrast, fitContrast, hueOf, isPureExtreme, mix } from './color.util.ts';

export const MODES: Mode[] = ['dark', 'light'];

const AA = 4.5;
const AA_LARGE = 3;
/** No claro um pastel some no fundo: a cor cheia escurece até destacar como forma. */
const FILL_ON_LIGHT = 1.7;
/** Quanto da cor entra no fundo `-soft` (selo, cartão de indicador). Sólido, sem opacidade. */
const SOFT_WEIGHT: Record<Mode, number> = { dark: 0.16, light: 0.18 };

/** Texto sobre uma cor cheia: o fundo neutro (claro ou escuro) com mais contraste. */
function foregroundOn(fill: string, neutral: Neutral): string {
	const dark = neutral.dark.background;
	const light = neutral.light.background;
	return contrast(fill, dark) >= contrast(fill, light) ? dark : light;
}

export function buildTokens(palette: Palette, mode: Mode, neutral: Neutral): Tokens {
	const base = neutral[mode];
	const bg = base.background;
	/**
	 * Cor cheia (botão): no claro escurece até destacar do fundo; e, se nenhum texto neutro
	 * passa sobre ela (tons médios, como um roxo de luminosidade média), afasta a cor do texto
	 * até passar.
	 */
	const asFill = (hex: string) => {
		const fill = mode === 'light' ? fitContrast(hex, bg, FILL_ON_LIGHT) : hex;
		const text = foregroundOn(fill, neutral);
		return contrast(fill, text) >= AA ? fill : fitContrast(fill, text, AA);
	};
	const soft = (hex: string) => mix(hex, base.card, SOFT_WEIGHT[mode]);
	/** Cor como texto: precisa passar no fundo da página E no cartão (no escuro o cartão é mais claro). */
	const asText = (hex: string) => fitContrast(fitContrast(hex, bg, AA), base.card, AA);

	const primary = asFill(palette.primary);
	const accent = asFill(palette.accent);
	const tertiary = asFill(palette.tertiary);

	const tokens: Tokens = {
		...base,
		primary,
		'primary-foreground': foregroundOn(primary, neutral),
		'primary-strong': asText(palette.primary),
		'primary-soft': soft(primary),
		'accent-hero': accent,
		'accent-hero-foreground': foregroundOn(accent, neutral),
		'accent-strong': asText(palette.accent),
		tertiary,
		'tertiary-strong': asText(palette.tertiary),
		ring: primary,
		// Cor das sombras nos dois modos: o tom mais escuro da marca, nunca preto puro.
		shadow: neutral.dark.background
	};

	// Estado: o texto precisa passar sobre o próprio fundo suave E sobre o fundo da página.
	for (const [name, hex] of Object.entries(STATUS_COLORS[mode])) {
		const softBg = soft(hex);
		tokens[`${name}-soft`] = softBg;
		tokens[name] = fitContrast(fitContrast(hex, softBg, AA), bg, AA);
	}
	tokens['destructive-foreground'] = foregroundOn(tokens.destructive, neutral);

	const chartSources = [
		palette.primary,
		palette.accent,
		palette.tertiary,
		STATUS_COLORS[mode].info,
		STATUS_COLORS[mode].destructive
	];
	chartSources.forEach((hex, i) => {
		tokens[`chart-${i + 1}`] = fitContrast(hex, base.card, AA_LARGE);
	});

	return tokens;
}

/** Pares texto/fundo que precisam passar: [rótulo, texto, fundo, mínimo]. */
const CONTRAST_PAIRS: [string, string, string, number][] = [
	['Texto no fundo', 'foreground', 'background', AA],
	['Texto secundário no cartão', 'muted-foreground', 'card', AA],
	['Botão primário', 'primary-foreground', 'primary', AA],
	['Link / texto na primária', 'primary-strong', 'background', AA],
	['Link no cartão', 'primary-strong', 'card', AA],
	['Texto na cor de destaque', 'accent-strong', 'background', AA],
	['Botão de destaque', 'accent-hero-foreground', 'accent-hero', AA],
	['Texto na terceira cor', 'tertiary-strong', 'card', AA],
	['Botão de perigo', 'destructive-foreground', 'destructive', AA],
	['Selo de sucesso', 'success', 'success-soft', AA],
	['Selo de aviso', 'warning', 'warning-soft', AA],
	['Selo de erro', 'destructive', 'destructive-soft', AA]
];

export function contrastReport(tokens: Tokens): ContrastRow[] {
	return CONTRAST_PAIRS.map(([label, fg, bg, min]) => ({
		label,
		fg,
		bg,
		min,
		ratio: contrast(tokens[fg], tokens[bg])
	}));
}

export function wcagLevel(ratio: number): WcagLevel {
	if (ratio >= 7) return 'AAA';
	if (ratio >= AA) return 'AA';
	if (ratio >= AA_LARGE) return 'large';
	return 'fail';
}

/** Roxo e azul são as primárias mais comuns; a marca quer fugir delas. */
function commonHue(hex: string): 'roxa' | 'azul' | null {
	const { hue, saturation } = hueOf(hex);
	if (saturation <= 0.3) return null;
	if (hue >= 250 && hue <= 300) return 'roxa';
	if (hue >= 200 && hue < 250) return 'azul';
	return null;
}

/** As regras da marca, checadas nos dois modos. */
export function checkBrandRules(palette: Palette, neutral: Neutral): BrandRuleResult[] {
	const all = MODES.map((mode) => buildTokens(palette, mode, neutral));
	const pure = all.flatMap((t) => Object.values(t)).filter(isPureExtreme);
	const failing = all.flatMap(contrastReport).filter((row) => row.ratio < row.min);
	const hue = commonHue(palette.primary);

	return [
		{
			ok: pure.length === 0,
			label: pure.length ? 'Tem preto/branco puro' : 'Sem preto/branco puro'
		},
		{
			ok: failing.length === 0,
			label: failing.length ? `${failing.length} contraste(s) abaixo do AA` : 'Contraste AA ok'
		},
		{
			ok: hue === null,
			advisory: true,
			label: hue ? `Primária ${hue} (comum)` : 'Foge do roxo e do azul'
		}
	];
}
