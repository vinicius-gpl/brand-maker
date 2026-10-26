/**
 * Padrões de interface: a estrutura (forma, borda, sombra, densidade, tipografia, movimento),
 * independente da paleta e do acabamento.
 *
 * Os inspirados em sistemas de empresas usam só o que é público nos guias de cada um e nunca
 * se apresentam como oficiais: sem logo, sem fonte proprietária (cada um usa uma fonte livre
 * equivalente) e sem copiar componente. Dois ajustes valem para todos, por regra da casa:
 * - controles com no mínimo 40px (Lei de Fitts); onde o original usa 32px, vale o tamanho
 *   grande do próprio sistema;
 * - sombras com `var(--shadow)`, o tom escuro da marca, nunca preto puro.
 *
 * A prévia lê estes dados como variáveis CSS (`patternVars`) e o kit exporta como tokens
 * (`patternTokens`); o CSS que não cabe em variável mora em `preview/patterns.css`.
 */
import type { DesignPattern, PatternId } from '#lib/types/design.type.ts';

const shadow = (offset: string, alpha: number) =>
	`${offset} color-mix(in srgb, var(--shadow) ${alpha}%, transparent)`;

const CARD = 'var(--color-card)';
const LAYER = 'var(--color-muted)';
const BORDER = 'var(--color-border)';

const INTER = {
	id: 'inter',
	name: 'Inter',
	sans: "'Inter', system-ui, sans-serif",
	heading: "'Inter', system-ui, sans-serif"
};

export const PATTERNS: DesignPattern[] = [
	{
		id: 'simples',
		name: 'Simples',
		inspiredBy: null,
		summary: 'O padrão da casa: cantos médios, borda fina de 1px, sem sombra, foco no conteúdo.',
		rules: [
			'Cartões e campos com borda de 1px na cor `border`; nada de sombra.',
			'Botões e campos com cantos de 10px; cartões com 12px; selos em pílula.',
			'Títulos em negrito com espaçamento entre letras levemente apertado.'
		],
		shape: {
			control: '10px',
			button: '10px',
			card: '12px',
			dialog: '16px',
			chip: '9999px',
			badge: '9999px'
		},
		border: { width: '1px', style: 'solid', cardColor: BORDER, input: 'box' },
		cardBackground: CARD,
		elevation: { card: 'none', button: 'none' },
		controlHeight: '40px',
		typography: {
			font: INTER,
			headingWeight: 700,
			headingTracking: '-0.025em',
			headingCase: 'none',
			bodySize: '1rem'
		},
		motion: { duration: '250ms', easing: 'cubic-bezier(0.2, 0, 0, 1)' },
		focus: { width: '2px', color: 'ring' },
		links: 'underline'
	},
	{
		id: 'material',
		name: 'Material 3 Expressive',
		inspiredBy: { name: 'Material 3 Expressive (Google)', url: 'https://m3.material.io' },
		summary:
			'Formas grandes e variadas, superfícies em tons em vez de borda, botões em pílula que mudam de forma ao pressionar e movimento com mola.',
		rules: [
			'Botões em pílula; ao pressionar, o canto diminui (mudança de forma, assinatura do Expressive).',
			'Cartões sem borda e com cantos de 28px; a separação vem do tom (superfície tingida pela cor da marca).',
			'Campos preenchidos: fundo em tom, cantos de cima arredondados e só a linha de baixo.',
			'Chips com cantos de 8px; selos em pílula.',
			'Movimento com mola (passa um pouco do ponto e volta), nunca linear.',
			'Títulos grandes e pesados para dar ênfase; fonte Roboto Flex.'
		],
		shape: {
			control: '4px 4px 0 0',
			button: '9999px',
			card: '28px',
			dialog: '28px',
			chip: '8px',
			badge: '9999px'
		},
		border: { width: '1px', style: 'solid', cardColor: 'transparent', input: 'underline' },
		cardBackground: 'color-mix(in srgb, var(--color-card) 82%, var(--color-primary))',
		elevation: { card: 'none', button: 'none' },
		controlHeight: '40px',
		typography: {
			font: {
				id: 'roboto-flex',
				name: 'Roboto Flex',
				sans: "'Roboto Flex', 'Roboto', system-ui, sans-serif",
				heading: "'Roboto Flex', 'Roboto', system-ui, sans-serif"
			},
			headingWeight: 800,
			headingTracking: '-0.02em',
			headingCase: 'none',
			bodySize: '1rem'
		},
		motion: { duration: '350ms', easing: 'cubic-bezier(0.42, 1.67, 0.21, 0.9)' },
		focus: { width: '3px', color: 'ring' },
		links: 'underline'
	},
	{
		id: 'fluent',
		name: 'Fluent 2',
		inspiredBy: { name: 'Fluent 2 (Microsoft)', url: 'https://fluent2.microsoft.design' },
		summary: 'Cantos pequenos de 4px, borda sutil, sombra suave em camadas e movimento discreto.',
		rules: [
			'Botões e campos com cantos de 4px; cartões e diálogos com 8px.',
			'Cartões com borda sutil e sombra suave de duas camadas (luz ambiente + direcional).',
			'Tamanho de controle "grande" do Fluent (40px) para cumprir a Lei de Fitts.',
			'Movimento curto com curva suave; títulos em semi-negrito.'
		],
		shape: {
			control: '4px',
			button: '4px',
			card: '8px',
			dialog: '8px',
			chip: '4px',
			badge: '9999px'
		},
		border: { width: '1px', style: 'solid', cardColor: BORDER, input: 'box' },
		cardBackground: CARD,
		elevation: {
			card: `${shadow('0 0 2px', 12)}, ${shadow('0 2px 4px', 14)}`,
			button: shadow('0 1px 2px', 14)
		},
		controlHeight: '40px',
		typography: {
			font: {
				id: 'segoe',
				name: 'Segoe UI do sistema',
				sans: "'Segoe UI Variable', 'Segoe UI', 'Noto Sans', system-ui, sans-serif",
				heading: "'Segoe UI Variable', 'Segoe UI', 'Noto Sans', system-ui, sans-serif"
			},
			headingWeight: 600,
			headingTracking: '-0.01em',
			headingCase: 'none',
			bodySize: '1rem'
		},
		motion: { duration: '200ms', easing: 'cubic-bezier(0.33, 0, 0.67, 1)' },
		focus: { width: '2px', color: 'ring' },
		links: 'none'
	},
	{
		id: 'carbon',
		name: 'Carbon',
		inspiredBy: { name: 'Carbon Design System (IBM)', url: 'https://carbondesignsystem.com' },
		summary:
			'Cantos retos, grade rígida, camadas por tom sem sombra, botões altos com texto à esquerda e IBM Plex.',
		rules: [
			'Cantos retos em botões, campos, cartões e diálogos; só as tags são em pílula.',
			'Separação por camada de tom (fundo, camada 1, camada 2), sem sombra e sem borda em cartão.',
			'Campos preenchidos com só a linha de baixo.',
			'Botões de 48px com o texto alinhado à esquerda e espaço à direita para o ícone.',
			'Movimento "produtivo": rápido e funcional. Fontes IBM Plex Sans e IBM Plex Mono.'
		],
		shape: { control: '0', button: '0', card: '0', dialog: '0', chip: '9999px', badge: '9999px' },
		border: { width: '1px', style: 'solid', cardColor: 'transparent', input: 'underline' },
		cardBackground: LAYER,
		elevation: { card: 'none', button: 'none' },
		controlHeight: '48px',
		typography: {
			font: {
				id: 'plex',
				name: 'IBM Plex Sans',
				sans: "'IBM Plex Sans', system-ui, sans-serif",
				heading: "'IBM Plex Sans', system-ui, sans-serif"
			},
			headingWeight: 400,
			headingTracking: '0',
			headingCase: 'none',
			bodySize: '1rem'
		},
		motion: { duration: '110ms', easing: 'cubic-bezier(0.2, 0, 0.38, 0.9)' },
		focus: { width: '2px', color: 'ring' },
		links: 'none'
	},
	{
		id: 'primer',
		name: 'Primer',
		inspiredBy: { name: 'Primer (GitHub)', url: 'https://primer.style' },
		summary:
			'Neutro e técnico: borda fina em tudo (inclusive botões), cantos de 6px e fonte do sistema.',
		rules: [
			'Borda de 1px em cartões, campos e também nos botões secundários (fundo levemente cinza).',
			'Cantos de 6px em botões, campos e cartões; contadores e rótulos em pílula.',
			'Sombra mínima (quase uma linha) em cartões; nada de sombra grande.',
			'Tamanho "large" do Primer (40px) para cumprir a Lei de Fitts. Fonte do sistema.'
		],
		shape: {
			control: '6px',
			button: '6px',
			card: '6px',
			dialog: '12px',
			chip: '9999px',
			badge: '9999px'
		},
		border: { width: '1px', style: 'solid', cardColor: BORDER, input: 'box' },
		cardBackground: CARD,
		elevation: { card: shadow('0 1px 0', 6), button: shadow('0 1px 0', 6) },
		controlHeight: '40px',
		typography: {
			font: {
				// O Primer usa a fonte do sistema; aqui começa pela Noto Sans (carregada) para o
				// resultado ser o mesmo em qualquer máquina, sem cair numa fonte padrão qualquer.
				id: 'noto',
				name: 'Noto Sans',
				sans: "'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
				heading: "'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
			},
			headingWeight: 600,
			headingTracking: '0',
			headingCase: 'none',
			bodySize: '1rem'
		},
		motion: { duration: '80ms', easing: 'cubic-bezier(0.33, 1, 0.68, 1)' },
		focus: { width: '2px', color: 'ring' },
		links: 'underline'
	},
	{
		id: 'shadcn',
		name: 'shadcn',
		inspiredBy: { name: 'shadcn/ui + Radix', url: 'https://ui.shadcn.com' },
		summary:
			'Moderno e discreto: borda fina, cantos de 8 a 12px, sombra pequena e muito espaço em branco.',
		rules: [
			'Botões e campos com cantos de 8px; cartões com 12px e sombra pequena.',
			'Borda de 1px na cor `border` em cartões e campos.',
			'Selos com cantos de 6px; hierarquia por peso e cor de texto, não por enfeite.',
			'Transições curtas (150ms) em cor e opacidade.'
		],
		shape: {
			control: '8px',
			button: '8px',
			card: '12px',
			dialog: '12px',
			chip: '6px',
			badge: '6px'
		},
		border: { width: '1px', style: 'solid', cardColor: BORDER, input: 'box' },
		cardBackground: CARD,
		elevation: { card: shadow('0 1px 2px', 8), button: shadow('0 1px 2px', 8) },
		controlHeight: '40px',
		typography: {
			font: INTER,
			headingWeight: 600,
			headingTracking: '-0.025em',
			headingCase: 'none',
			bodySize: '0.9375rem'
		},
		motion: { duration: '150ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
		focus: { width: '3px', color: 'ring' },
		links: 'underline'
	},
	{
		id: 'cupertino',
		name: 'Cupertino',
		inspiredBy: {
			name: 'Apple Human Interface Guidelines',
			url: 'https://developer.apple.com/design/human-interface-guidelines'
		},
		summary:
			'Cantos contínuos grandes, barra translúcida, grupos em fundo cinza sem borda e alvos de 44px.',
		rules: [
			'Cantos grandes e contínuos (squircle onde o navegador suporta): 12px em botões, 20px em cartões.',
			'Grupos em fundo levemente cinza, sem borda; separação por espaço.',
			'Barra de navegação translúcida com desfoque.',
			'Alvos de toque de 44px (o mínimo do HIG). Fonte Inter no lugar da SF Pro.'
		],
		shape: {
			control: '10px',
			button: '12px',
			card: '20px',
			dialog: '14px',
			chip: '9999px',
			badge: '9999px'
		},
		border: { width: '1px', style: 'solid', cardColor: 'transparent', input: 'box' },
		cardBackground: LAYER,
		elevation: { card: 'none', button: 'none' },
		controlHeight: '44px',
		typography: {
			font: INTER,
			headingWeight: 700,
			headingTracking: '-0.02em',
			headingCase: 'none',
			bodySize: '1.0625rem'
		},
		motion: { duration: '350ms', easing: 'cubic-bezier(0.32, 0.72, 0, 1)' },
		focus: { width: '3px', color: 'ring' },
		links: 'none'
	},
	{
		id: 'govuk',
		name: 'GOV.UK',
		inspiredBy: { name: 'GOV.UK Design System', url: 'https://design-system.service.gov.uk' },
		summary:
			'Acessibilidade acima de tudo: cantos retos, texto grande, links sempre sublinhados e foco amarelo forte.',
		rules: [
			'Cantos retos em tudo; campos com borda grossa de 2px.',
			'Botões com "sombra de base" (uma faixa sólida embaixo) em vez de sombra difusa.',
			'Links sempre sublinhados; foco com contorno grosso na cor de aviso.',
			'Texto de corpo maior (19px) e alvos de 44px. Sem animação decorativa.'
		],
		shape: { control: '0', button: '0', card: '0', dialog: '0', chip: '0', badge: '0' },
		border: { width: '2px', style: 'solid', cardColor: BORDER, input: 'box' },
		cardBackground: CARD,
		elevation: { card: 'none', button: shadow('0 2px 0', 70) },
		controlHeight: '44px',
		typography: {
			font: {
				id: 'arial',
				name: 'Arial do sistema',
				sans: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
				heading: "Arial, 'Helvetica Neue', Helvetica, sans-serif"
			},
			headingWeight: 700,
			headingTracking: '0',
			headingCase: 'none',
			bodySize: '1.1875rem'
		},
		motion: { duration: '0ms', easing: 'linear' },
		focus: { width: '3px', color: 'warning' },
		links: 'underline'
	},
	{
		id: 'bruto',
		name: 'Brutalista',
		inspiredBy: null,
		summary: 'Cantos retos, bordas grossas, sombra dura deslocada e títulos em caixa alta.',
		rules: [
			'Cantos retos; bordas de 2px na cor do texto.',
			'Sombra dura deslocada (sem desfoque); cada cartão pode usar uma cor da marca na sombra.',
			'Botão "afunda" ao pressionar (some a sombra e ele desce).',
			'Títulos pesados em caixa alta; fonte Space Grotesk.'
		],
		shape: { control: '0', button: '0', card: '0', dialog: '0', chip: '0', badge: '0' },
		border: { width: '2px', style: 'solid', cardColor: 'var(--color-foreground)', input: 'box' },
		cardBackground: CARD,
		elevation: {
			card: '6px 6px 0 var(--color-foreground)',
			button: '3px 3px 0 var(--color-foreground)'
		},
		controlHeight: '44px',
		typography: {
			font: {
				id: 'grotesk',
				name: 'Space Grotesk',
				sans: "'Inter', system-ui, sans-serif",
				heading: "'Space Grotesk', 'Inter', sans-serif"
			},
			headingWeight: 900,
			headingTracking: '-0.03em',
			headingCase: 'uppercase',
			bodySize: '1rem'
		},
		motion: { duration: '100ms', easing: 'linear' },
		focus: { width: '3px', color: 'ring' },
		links: 'underline'
	},
	{
		id: 'blueprint',
		name: 'Blueprint',
		inspiredBy: null,
		summary:
			'Desenho técnico: grade fina e grossa, contornos tracejados, marcas de canto e títulos em mono.',
		rules: [
			'Contornos tracejados na cor primária; cantos retos (campos com 4px).',
			'Grade de fundo fina (20px) e grossa (100px) na cor primária, bem suave.',
			'Marcas de canto (cruz de registro) nos cartões.',
			'Títulos e botões em fonte mono, caixa alta.'
		],
		shape: { control: '4px', button: '4px', card: '0', dialog: '0', chip: '2px', badge: '2px' },
		border: {
			width: '1px',
			style: 'dashed',
			cardColor: 'color-mix(in srgb, var(--color-primary) 45%, transparent)',
			input: 'box'
		},
		cardBackground: CARD,
		elevation: { card: 'none', button: 'none' },
		controlHeight: '40px',
		typography: {
			font: {
				id: 'mono',
				name: 'JetBrains Mono + Inter',
				sans: "'Inter', system-ui, sans-serif",
				heading: "'JetBrains Mono', ui-monospace, monospace"
			},
			headingWeight: 700,
			headingTracking: '-0.01em',
			headingCase: 'uppercase',
			bodySize: '1rem'
		},
		motion: { duration: '150ms', easing: 'linear' },
		focus: { width: '2px', color: 'ring' },
		links: 'underline'
	}
];

export const DEFAULT_PATTERN: PatternId = 'simples';

export const patternById = (id: string): DesignPattern =>
	PATTERNS.find((p) => p.id === id) ?? PATTERNS[0];

const focusColor = (pattern: DesignPattern) =>
	pattern.focus.color === 'warning' ? 'var(--color-warning)' : 'var(--color-ring)';

/** Tokens do padrão, com nome de papel (o que vai para o tokens.css do kit). */
export function patternTokens(pattern: DesignPattern): Record<string, string> {
	return {
		'shape-control': pattern.shape.control,
		'shape-button': pattern.shape.button,
		'shape-card': pattern.shape.card,
		'shape-dialog': pattern.shape.dialog,
		'shape-chip': pattern.shape.chip,
		'shape-badge': pattern.shape.badge,
		'border-width': pattern.border.width,
		'border-style': pattern.border.style,
		'card-border-color': pattern.border.cardColor,
		'card-background': pattern.cardBackground,
		'elevation-card': pattern.elevation.card,
		'elevation-button': pattern.elevation.button,
		'control-height': pattern.controlHeight,
		'heading-weight': String(pattern.typography.headingWeight),
		'heading-tracking': pattern.typography.headingTracking,
		'heading-case': pattern.typography.headingCase,
		'body-size': pattern.typography.bodySize,
		'motion-duration': pattern.motion.duration,
		'motion-easing': pattern.motion.easing,
		'focus-width': pattern.focus.width,
		'focus-color': focusColor(pattern),
		'link-decoration': pattern.links
	};
}

/**
 * Variáveis da prévia (`--pv-*`): os tokens do padrão mais a borda e o fundo do campo, que
 * derivam do tipo de campo (caixa ou só a linha de baixo). A prévia aplica no `style` do `.pv`.
 */
export function patternVars(pattern: DesignPattern): Record<string, string> {
	const vars = Object.fromEntries(
		Object.entries(patternTokens(pattern)).map(([key, value]) => [`--pv-${key}`, value])
	);
	return {
		...vars,
		'--pv-input-border-width':
			pattern.border.input === 'underline' ? `0 0 ${pattern.border.width} 0` : pattern.border.width,
		'--pv-input-bg':
			pattern.border.input === 'underline' ? 'var(--color-muted)' : 'var(--color-background)'
	};
}

/** As variáveis como texto de `style` (para o atributo do elemento). */
export const toStyle = (vars: Record<string, string>) =>
	Object.entries(vars)
		.map(([key, value]) => `${key}: ${value}`)
		.join('; ');
