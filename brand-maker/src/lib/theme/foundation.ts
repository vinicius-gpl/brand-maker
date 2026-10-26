/**
 * O que vale para qualquer paleta: neutros, cores de estado, fontes e estilos visuais.
 * Regra da marca: nenhum valor aqui é #000 ou #fff (checado em tokens.util.test.ts).
 */
import type {
	FontPairing,
	Mode,
	Neutral,
	StatusName,
	VisualStyle
} from '#lib/types/design.type.ts';

/** `tinta` é o fundo escuro escolhido (#11111a); os outros existem para comparar. */
export const NEUTRALS: Neutral[] = [
	{
		id: 'tinta',
		name: 'Tinta azulada',
		dark: {
			background: '#11111a',
			card: '#181824',
			muted: '#1e1e2d',
			border: '#2b2c3d',
			foreground: '#f1f5f9',
			'muted-foreground': '#94a3b8',
			sidebar: '#13131c'
		},
		light: {
			background: '#f5f6fa',
			card: '#fbfbfd',
			muted: '#eceef4',
			border: '#dfe2ea',
			foreground: '#11111a',
			'muted-foreground': '#5b6276',
			sidebar: '#eff1f6'
		}
	},
	{
		id: 'grafite',
		name: 'Grafite puro',
		dark: {
			background: '#121214',
			card: '#19191c',
			muted: '#202024',
			border: '#2c2c31',
			foreground: '#f2f2f0',
			'muted-foreground': '#a1a1a6',
			sidebar: '#141417'
		},
		light: {
			background: '#f4f4f3',
			card: '#fafaf9',
			muted: '#ebebe9',
			border: '#dcdcd8',
			foreground: '#141416',
			'muted-foreground': '#626267',
			sidebar: '#efefed'
		}
	},
	{
		id: 'quente',
		name: 'Quente (marrom)',
		dark: {
			background: '#141211',
			card: '#1c1917',
			muted: '#23201d',
			border: '#332e2a',
			foreground: '#f5f0eb',
			'muted-foreground': '#a8a29e',
			sidebar: '#171413'
		},
		light: {
			background: '#f8f5f1',
			card: '#fcfaf7',
			muted: '#efeae3',
			border: '#e2dbd0',
			foreground: '#1c1917',
			'muted-foreground': '#6b625a',
			sidebar: '#f3efe9'
		}
	}
];

/** Cores de estado de partida; `tokens.util.ts` ajusta cada uma até passar no contraste. */
export const STATUS_COLORS: Record<Mode, Record<StatusName, string>> = {
	dark: { success: '#4ade80', warning: '#fbbf24', info: '#60a5fa', destructive: '#f87171' },
	light: { success: '#15803d', warning: '#b45309', info: '#1d4ed8', destructive: '#dc2626' }
};

export const FONTS: FontPairing[] = [
	{
		id: 'inter',
		name: 'Inter + JetBrains Mono',
		sans: "'Inter', system-ui, sans-serif",
		heading: "'Inter', system-ui, sans-serif"
	},
	{
		id: 'grotesk',
		name: 'Space Grotesk + Inter',
		sans: "'Inter', system-ui, sans-serif",
		heading: "'Space Grotesk', 'Inter', sans-serif"
	},
	{
		id: 'dm',
		name: 'DM Sans + Noto Serif',
		sans: "'DM Sans', sans-serif",
		heading: "'Noto Serif', serif"
	},
	{
		id: 'plex',
		name: 'IBM Plex Sans + Plex Mono',
		sans: "'IBM Plex Sans', system-ui, sans-serif",
		heading: "'IBM Plex Sans', system-ui, sans-serif"
	}
];

/**
 * Acabamentos: efeitos opcionais por cima do padrão. O CSS de cada um mora em
 * `theme/preview/styles.css` e não mexe em forma nem borda (isso é do padrão).
 */
export const STYLES: VisualStyle[] = [
	{ id: 'none', name: 'Nenhum', summary: 'Sem efeito: o padrão como ele é.' },
	{
		id: 'suave',
		name: 'Suave (pastel)',
		summary: 'Cartões tingidos com a cor da marca, sombras difusas e manchas de cor ao fundo.'
	},
	{
		id: 'neon',
		name: 'Neon',
		summary:
			'Grade luminosa ao fundo, brilho na cor primária em botões e títulos, selos com contorno aceso.'
	},
	{
		id: 'textura',
		name: 'Texturizado',
		summary:
			'Grão de papel por cima, fundo pontilhado, contornos tracejados e destaque em marca-texto.'
	},
	{
		id: 'vidro',
		name: 'Vidro',
		summary: 'Cartões translúcidos com desfoque (backdrop-filter) sobre manchas de cor.'
	},
	{
		id: 'metalico',
		name: 'Metálico',
		summary:
			'Metal escovado: fios finos ao fundo, brilho especular nos botões, aro metálico nos cartões e título cromado.'
	},
	{
		id: 'holografico',
		name: 'Holográfico',
		summary:
			'Iridescência: manchas que passam pelas três cores da marca, aro arco-íris nos cartões e título furta-cor.'
	},
	{
		id: 'papel',
		name: 'Papel',
		summary:
			'Fibras de papel por cima, pauta de caderno no topo, cartões levemente tortos e sublinhado ondulado.'
	}
];
