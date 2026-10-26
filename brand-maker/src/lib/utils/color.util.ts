/**
 * Matemática de cor, sem DOM. Tudo trabalha com hex de 6 dígitos (`#rrggbb`).
 * Contraste e luminância seguem a definição do WCAG 2.x.
 */

type Rgb = [number, number, number];
type Hsl = [number, number, number];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** `#rrggbb` → canais 0–255. */
export function hexToRgb(hex: string): Rgb {
	const n = hex.replace('#', '');
	return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)) as Rgb;
}

/** Canais 0–255 → `#rrggbb` (valores fora da faixa são cortados). */
export function rgbToHex(rgb: readonly number[]): string {
	return (
		'#' +
		rgb
			.map((v) =>
				Math.round(clamp(v, 0, 255))
					.toString(16)
					.padStart(2, '0')
			)
			.join('')
	);
}

/** Canais 0–255 → h, s, l em 0–1. */
export function rgbToHsl([red, green, blue]: Rgb): Hsl {
	const r = red / 255;
	const g = green / 255;
	const b = blue / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	if (max === min) return [0, 0, l];

	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	if (max === r) return [((g - b) / d + (g < b ? 6 : 0)) / 6, s, l];
	if (max === g) return [((b - r) / d + 2) / 6, s, l];
	return [((r - g) / d + 4) / 6, s, l];
}

function hueChannel(p: number, q: number, hue: number): number {
	const t = hue < 0 ? hue + 1 : hue > 1 ? hue - 1 : hue;
	if (t < 1 / 6) return p + (q - p) * 6 * t;
	if (t < 1 / 2) return q;
	if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	return p;
}

/** h, s, l em 0–1 → canais 0–255. */
export function hslToRgb([h, s, l]: Hsl): Rgb {
	if (s === 0) return [l * 255, l * 255, l * 255];
	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;
	return [
		hueChannel(p, q, h + 1 / 3) * 255,
		hueChannel(p, q, h) * 255,
		hueChannel(p, q, h - 1 / 3) * 255
	];
}

const LUMINANCE_WEIGHTS = [0.2126, 0.7152, 0.0722];

/** Luminância relativa (WCAG), 0–1. */
export function luminance(hex: string): number {
	return hexToRgb(hex)
		.map((c) => c / 255)
		.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
		.reduce((sum, c, i) => sum + c * LUMINANCE_WEIGHTS[i], 0);
}

/** Razão de contraste WCAG entre duas cores, 1–21. */
export function contrast(a: string, b: string): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

/** Mistura `a` sobre `b`; `weight` é quanto de `a` entra (0–1). */
export function mix(a: string, b: string, weight: number): string {
	const A = hexToRgb(a);
	const B = hexToRgb(b);
	return rgbToHex(A.map((v, i) => v * weight + B[i] * (1 - weight)));
}

/** Matiz em graus (0–360) e saturação (0–1). */
export function hueOf(hex: string): { hue: number; saturation: number } {
	const [h, s] = rgbToHsl(hexToRgb(hex));
	return { hue: h * 360, saturation: s };
}

/**
 * Ajusta só a luminosidade (mantém matiz e saturação) até a cor atingir `target` de contraste
 * contra `bg`: clareia sobre fundo escuro e escurece sobre fundo claro. Se já passa, devolve a
 * mesma cor.
 */
export function fitContrast(hex: string, bg: string, target: number): string {
	if (contrast(hex, bg) >= target) return hex;

	const [h, s, start] = rgbToHsl(hexToRgb(hex));
	const lighten = luminance(bg) < 0.2;
	const step = lighten ? 0.01 : -0.01;
	const limit = lighten ? 0.97 : 0.05;
	const withinLimit = (l: number) => (lighten ? l <= limit : l >= limit);

	for (let l = start; withinLimit(l); l += step) {
		const candidate = rgbToHex(hslToRgb([h, s, l]));
		if (contrast(candidate, bg) >= target) return candidate;
	}
	return rgbToHex(hslToRgb([h, s, limit]));
}

/** Preto ou branco "de verdade" (todos os canais a até 2 do extremo). Proibido pela marca. */
export function isPureExtreme(hex: string): boolean {
	const rgb = hexToRgb(hex);
	return rgb.every((v) => v >= 0xfd) || rgb.every((v) => v <= 0x02);
}

/** Cor de rótulo legível sobre uma amostra qualquer (só para a interface desta ferramenta). */
export function labelColorOn(hex: string): string {
	return luminance(hex) > 0.35 ? '#11111a' : '#f1f5f9';
}
