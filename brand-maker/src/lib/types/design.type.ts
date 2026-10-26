/** Tipos do domínio de design: identidade da marca, paletas, estilos e as leis de UX do kit. */

export type Mode = 'dark' | 'light';

/** As três cores de identidade, no tom do tema escuro. O claro é derivado. */
export type PaletteColors = {
	primary: string;
	accent: string;
	tertiary: string;
};

export type Palette = PaletteColors & {
	id: string;
	name: string;
};

export type PaletteGroup = {
	id: string;
	name: string;
	palettes: Palette[];
};

/** Paleta com o grupo a que pertence, como aparece no carrossel. */
export type PaletteEntry = Palette & { group: PaletteGroup };

export type NeutralScale = {
	background: string;
	card: string;
	muted: string;
	border: string;
	foreground: string;
	'muted-foreground': string;
	sidebar: string;
};

export type Neutral = {
	id: string;
	name: string;
	dark: NeutralScale;
	light: NeutralScale;
};

export type StatusName = 'success' | 'warning' | 'info' | 'destructive';

export type FontPairing = {
	id: string;
	name: string;
	sans: string;
	heading: string;
};

/** Acabamento: efeito opcional por cima do padrão (textura, vidro, brilho). Não mexe em forma. */
export type VisualStyleId =
	'none' | 'suave' | 'neon' | 'textura' | 'vidro' | 'metalico' | 'holografico' | 'papel';

export type VisualStyle = {
	id: VisualStyleId;
	name: string;
	/** O que o acabamento faz, em uma frase. Vai para a skill exportada. */
	summary: string;
};

/** Padrão: a estrutura da interface (forma, borda, sombra, densidade, tipografia, movimento). */
export type PatternId =
	| 'simples'
	| 'material'
	| 'fluent'
	| 'carbon'
	| 'primer'
	| 'shadcn'
	| 'cupertino'
	| 'govuk'
	| 'bruto'
	| 'blueprint';

export type DesignPattern = {
	id: PatternId;
	name: string;
	/** Sistema de design de referência, ou null para os padrões próprios. Nunca oficial. */
	inspiredBy: { name: string; url: string } | null;
	summary: string;
	/** Regras do padrão, em frases. Vão para a skill exportada. */
	rules: string[];
	/** Raio de canto por papel (CSS: um valor ou os quatro cantos). */
	shape: {
		control: string;
		button: string;
		card: string;
		dialog: string;
		chip: string;
		badge: string;
	};
	border: {
		width: string;
		style: 'solid' | 'dashed';
		/** Cor da borda do cartão; `transparent` quando ele se separa por tom ou sombra. */
		cardColor: string;
		/** Campo de texto em caixa ou só com a linha de baixo (Material, Carbon). */
		input: 'box' | 'underline';
	};
	/** Fundo do cartão: `card`, `muted` (camada) ou tingido pela cor da marca (superfície tonal). */
	cardBackground: string;
	/** Sombras; usam `var(--shadow)`, o tom escuro da marca, nunca preto puro. */
	elevation: { card: string; button: string };
	controlHeight: string;
	typography: {
		font: FontPairing;
		headingWeight: number;
		headingTracking: string;
		headingCase: 'none' | 'uppercase';
		bodySize: string;
	};
	motion: { duration: string; easing: string };
	focus: { width: string; color: 'ring' | 'warning' };
	links: 'underline' | 'none';
};

/** O que a pessoa escreve sobre a marca. Tudo aparece na prévia e no kit. */
export type BrandIdentity = {
	name: string;
	/** Frase de efeito; a última palavra vira o destaque do título da prévia. */
	tagline: string;
	description: string;
	/** Logo enviada pela pessoa, como data URL (svg, png ou webp). */
	logo: string | null;
};

/** A identidade com o nome já convertido para arquivo e skill (`Café do Zé` → `cafe-do-ze`). */
export type Brand = BrandIdentity & { slug: string };

/** Mapa token → hex, sem o prefixo `--`. */
export type Tokens = Record<string, string>;

export type ContrastRow = {
	label: string;
	fg: string;
	bg: string;
	min: number;
	ratio: number;
};

export type WcagLevel = 'AAA' | 'AA' | 'large' | 'fail';

/** `advisory`: só um aviso (a escolha é válida, mas comum); não conta como violação. */
export type BrandRuleResult = { ok: boolean; label: string; advisory?: boolean };

export type UxLawId =
	'hick' | 'fitts' | 'jakob' | 'miller' | 'vonRestorff' | 'uniformConnectedness' | 'tesler';

export type UxLawParam = {
	key: string;
	label: string;
	unit: string;
	min: number;
	max: number;
	step: number;
	default: number;
};

export type UxLaw = {
	id: UxLawId;
	name: string;
	/** A lei em uma frase. */
	principle: string;
	/** O que o projeto passa a exigir; `{{param}}` é trocado pelo valor configurado. */
	practices: string[];
	/** Ids das regras de `kit/agent/design-rules.mts` que cobrem esta lei. */
	checks: string[];
	params: UxLawParam[];
};

export type UxLawSetting = { enabled: boolean; params: Record<string, number> };
export type UxLawSettings = Record<UxLawId, UxLawSetting>;

/** Tudo o que a pessoa escolheu na tela: a entrada do kit exportado. */
export type DesignSelection = {
	brand: Brand;
	palette: PaletteEntry;
	neutral: Neutral;
	pattern: DesignPattern;
	font: FontPairing;
	style: VisualStyle;
	laws: UxLawSettings;
};

/** Um arquivo do kit exportado. `path` é relativo à raiz do zip. */
export type KitFile = {
	path: string;
	/** Texto do arquivo. Para binário (a logo), o data URL usado na pré-visualização. */
	content: string;
	/** Conteúdo binário, quando o arquivo não é texto (a logo em png/webp). */
	binary?: Uint8Array;
	/** Para que serve, mostrado na lista de arquivos da tela. */
	description: string;
};
