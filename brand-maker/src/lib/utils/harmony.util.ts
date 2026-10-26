/**
 * Gera cores de marca a partir de uma cor base, por harmonia do círculo cromático, e paletas
 * aleatórias que já respeitam as regras da marca (fogem do roxo e do azul como primária).
 *
 * As cores saem no tom do tema ESCURO (claras e vivas); o claro é derivado em tokens.util.ts.
 */
import type { PaletteColors } from '#lib/types/design.type.ts';
import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from './color.util.ts';

export type HarmonyId = 'complementar' | 'analoga' | 'triade' | 'dividida';

export const HARMONIES: {
	id: HarmonyId;
	name: string;
	description: string;
	offsets: [number, number];
}[] = [
	{
		id: 'complementar',
		name: 'Complementar',
		description: 'Oposta no círculo: contraste máximo',
		offsets: [180, 150]
	},
	{ id: 'analoga', name: 'Análoga', description: 'Vizinhas: calma e coesa', offsets: [30, -30] },
	{
		id: 'triade',
		name: 'Tríade',
		description: 'Três pontas iguais: viva e equilibrada',
		offsets: [120, 240]
	},
	{
		id: 'dividida',
		name: 'Dividida',
		description: 'Os dois lados da oposta: contraste mais suave',
		offsets: [150, 210]
	}
];

/** Faixa de tom das cores de identidade no escuro: vivas, mas sem estourar. */
const SATURATION = { min: 0.45, max: 0.88 };
const LIGHTNESS = { min: 0.6, max: 0.76 };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const wrapHue = (degrees: number) => (((degrees % 360) + 360) % 360) / 360;

function rotate(hex: string, degrees: number): string {
	const [h, s, l] = rgbToHsl(hexToRgb(hex));
	const hue = wrapHue(h * 360 + degrees);
	return rgbToHex(
		hslToRgb([
			hue,
			clamp(s, SATURATION.min, SATURATION.max),
			clamp(l, LIGHTNESS.min, LIGHTNESS.max)
		])
	);
}

/** Destaque e terceira cor a partir da primária. A primária volta igual. */
export function harmonize(primary: string, harmony: HarmonyId): PaletteColors {
	const { offsets } = HARMONIES.find((h) => h.id === harmony) ?? HARMONIES[0];
	return { primary, accent: rotate(primary, offsets[0]), tertiary: rotate(primary, offsets[1]) };
}

/**
 * Matiz da primária aleatória: tudo menos azul e roxo (200°–300°), os mais comuns. Sorteia
 * dentro dos 260° permitidos e pula a faixa proibida.
 */
const BLOCKED_HUES = { from: 200, to: 300 };
const ALLOWED_SPAN = 360 - (BLOCKED_HUES.to - BLOCKED_HUES.from);

function randomHue(random: () => number): number {
	const pick = random() * ALLOWED_SPAN;
	return pick < BLOCKED_HUES.from ? pick : pick + (BLOCKED_HUES.to - BLOCKED_HUES.from);
}

/** Uma paleta nova, com primária fora do roxo/azul e harmonia sorteada. */
export function randomPalette(
	random: () => number = Math.random
): PaletteColors & { harmony: HarmonyId } {
	const hue = randomHue(random) / 360;
	const saturation = SATURATION.min + random() * (SATURATION.max - SATURATION.min);
	const lightness = LIGHTNESS.min + random() * (LIGHTNESS.max - LIGHTNESS.min);
	const primary = rgbToHex(hslToRgb([hue, saturation, lightness]));
	const harmony = HARMONIES[Math.floor(random() * HARMONIES.length)].id;
	return { ...harmonize(primary, harmony), harmony };
}
