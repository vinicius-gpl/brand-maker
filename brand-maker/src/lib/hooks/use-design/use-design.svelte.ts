/**
 * Estado do brand maker: identidade da marca, cores, padrão, acabamento, modo, neutros, fonte e
 * as leis de UX. Os componentes só recebem o que precisam daqui; nenhum guarda escolha própria.
 *
 * As cores da marca são sempre editáveis. Escolher uma paleta do catálogo preenche as três
 * cores e lembra de onde vieram (`presetId`); mexer em qualquer cor vira "Personalizada".
 *
 * A escolha fica salva no navegador (localStorage). O site é pré-renderizado com o estado
 * padrão; a escolha salva só é aplicada depois de montar, para o HTML estático bater com a
 * primeira renderização.
 */
import { onMount } from 'svelte';
import { FONTS, NEUTRALS, STYLES } from '#lib/theme/foundation.ts';
import { DEFAULT_PALETTE_ID, PALETTE_GROUPS } from '#lib/theme/palettes.ts';
import { DEFAULT_PATTERN, PATTERNS, patternById } from '#lib/theme/patterns.ts';
import { DEFAULT_IDENTITY } from '#lib/theme/preview-sample.ts';
import { defaultLawSettings, UX_LAWS } from '#lib/theme/ux-laws.ts';
import type {
	Brand,
	BrandIdentity,
	DesignSelection,
	Mode,
	PaletteColors,
	PaletteEntry,
	PaletteGroup,
	PatternId,
	UxLawId,
	UxLawSettings,
	VisualStyleId
} from '#lib/types/design.type.ts';
import { harmonize, randomPalette, type HarmonyId } from '#lib/utils/harmony.util.ts';
import { slugify } from '#lib/utils/slug.util.ts';
import { buildTokens, checkBrandRules, contrastReport } from '#lib/utils/tokens.util.ts';

const STORAGE_KEY = 'brand-maker/v1';
const ALL_CATEGORIES = 'all';

/** Abas do bottom sheet (padrão, acabamento, cor). */
export type DockTab = 'padrao' | 'acabamento' | 'cor';
const DOCK_TABS: DockTab[] = ['padrao', 'acabamento', 'cor'];
/** Fonte "do padrão": usa a tipografia que o padrão escolhido recomenda. */
export const PATTERN_FONT = 'pattern';
const HEX = /^#[0-9a-f]{6}$/i;

/** Grupo das cores feitas à mão (não estão no catálogo). */
export const CUSTOM_GROUP: PaletteGroup = { id: 'custom', name: 'Personalizada', palettes: [] };

const PALETTES: PaletteEntry[] = PALETTE_GROUPS.flatMap((group) =>
	group.palettes.map((palette) => ({ ...palette, group }))
);
const DEFAULT_PALETTE = PALETTES.find((p) => p.id === DEFAULT_PALETTE_ID) ?? PALETTES[0];

type Snapshot = {
	identity: BrandIdentity;
	colors: PaletteColors;
	presetId: string | null;
	patternId: PatternId;
	mode: Mode;
	neutralId: string;
	fontId: string;
	styleId: VisualStyleId;
	category: string;
	dockCollapsed: boolean;
	dockTab: DockTab;
	laws: UxLawSettings;
};

const colorsOf = ({ primary, accent, tertiary }: PaletteColors): PaletteColors => ({
	primary,
	accent,
	tertiary
});
const cycle = <T>(list: T[], current: T, step: number): T =>
	list[(list.indexOf(current) + step + list.length) % list.length];
const randomOf = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

export class DesignState {
	identity = $state<BrandIdentity>({ ...DEFAULT_IDENTITY });
	colors = $state<PaletteColors>(colorsOf(DEFAULT_PALETTE));
	presetId = $state<string | null>(DEFAULT_PALETTE.id);
	patternId = $state<PatternId>(DEFAULT_PATTERN);
	mode = $state<Mode>('dark');
	neutralId = $state(NEUTRALS[0].id);
	fontId = $state(PATTERN_FONT);
	styleId = $state<VisualStyleId>(STYLES[0].id);
	category = $state(ALL_CATEGORIES);
	dockCollapsed = $state(false);
	/** Começa em Cor, a escolha mais frequente. */
	dockTab = $state<DockTab>('cor');
	laws = $state(defaultLawSettings());

	readonly groups = PALETTE_GROUPS;
	readonly brand: Brand = $derived({ ...this.identity, slug: slugify(this.identity.name) });
	readonly preset = $derived(PALETTES.find((p) => p.id === this.presetId) ?? null);
	readonly palette: PaletteEntry = $derived(
		this.preset ?? {
			id: CUSTOM_GROUP.id,
			name: CUSTOM_GROUP.name,
			group: CUSTOM_GROUP,
			...this.colors
		}
	);
	readonly visiblePalettes = $derived(
		this.category === ALL_CATEGORIES
			? PALETTES
			: PALETTES.filter((p) => p.group.id === this.category)
	);
	readonly neutral = $derived(NEUTRALS.find((n) => n.id === this.neutralId) ?? NEUTRALS[0]);
	readonly pattern = $derived(patternById(this.patternId));
	readonly font = $derived(FONTS.find((f) => f.id === this.fontId) ?? this.pattern.typography.font);
	readonly style = $derived(STYLES.find((s) => s.id === this.styleId) ?? STYLES[0]);
	readonly tokens = $derived(buildTokens(this.palette, this.mode, this.neutral));
	readonly brandRules = $derived(checkBrandRules(this.palette, this.neutral));
	readonly contrast = $derived(contrastReport(this.tokens));
	readonly selection: DesignSelection = $derived({
		brand: this.brand,
		palette: this.palette,
		neutral: this.neutral,
		pattern: this.pattern,
		font: this.font,
		style: this.style,
		laws: this.laws
	});

	/* ---------------------------------------------------------------- identidade */

	setIdentity = <K extends keyof BrandIdentity>(key: K, value: BrandIdentity[K]) => {
		this.identity[key] = value;
	};

	/* ---------------------------------------------------------------- cores */

	pickPalette = (id: string) => {
		const preset = PALETTES.find((p) => p.id === id);
		if (!preset) return;
		this.colors = colorsOf(preset);
		this.presetId = preset.id;
	};

	setColor = (key: keyof PaletteColors, hex: string) => {
		if (!HEX.test(hex)) return;
		this.colors[key] = hex.toLowerCase();
		this.presetId = null;
	};

	applyHarmony = (harmony: HarmonyId) => {
		this.colors = harmonize(this.colors.primary, harmony);
		this.presetId = null;
	};

	randomizeColors = () => {
		this.colors = colorsOf(randomPalette());
		this.presetId = null;
	};

	stepPalette = (step: number) => {
		const ids = this.visiblePalettes.map((p) => p.id);
		if (!ids.length) return;
		const current =
			this.presetId && ids.includes(this.presetId)
				? this.presetId
				: ids[step > 0 ? ids.length - 1 : 0];
		this.pickPalette(cycle(ids, current, step));
	};

	/* ---------------------------------------------------------------- aparência */

	setPattern = (id: PatternId) => (this.patternId = id);
	setMode = (mode: Mode) => (this.mode = mode);
	setNeutral = (id: string) => (this.neutralId = id);
	setFont = (id: string) => (this.fontId = id);
	setStyle = (id: VisualStyleId) => (this.styleId = id);
	setCategory = (id: string) => (this.category = id);
	toggleDock = () => (this.dockCollapsed = !this.dockCollapsed);
	setDockTab = (tab: DockTab) => (this.dockTab = tab);

	stepPattern = (step: number) => {
		this.patternId = cycle(
			PATTERNS.map((p) => p.id),
			this.patternId,
			step
		);
	};

	/** Sorteia padrão e cores novas (a identidade e o acabamento ficam). */
	shuffle = () => {
		this.patternId = randomOf(PATTERNS).id;
		this.randomizeColors();
	};

	/* ---------------------------------------------------------------- leis de UX */

	toggleLaw = (id: UxLawId) => {
		this.laws[id].enabled = !this.laws[id].enabled;
	};

	setLawParam = (id: UxLawId, key: string, value: number) => {
		this.laws[id].params[key] = value;
	};

	/**
	 * Atalhos: ←/→ trocam a paleta, ↑/↓ o padrão. Nunca roubam a seta de quem já usa: campos,
	 * abas, listas e sliders.
	 */
	handleKeydown = (event: KeyboardEvent) => {
		const typing =
			event.target instanceof Element &&
			event.target.closest(
				'input, select, textarea, [role="tablist"], [role="listbox"], [role="slider"]'
			);
		if (typing || event.altKey || event.ctrlKey || event.metaKey) return;
		const actions: Record<string, () => void> = {
			ArrowRight: () => this.stepPalette(1),
			ArrowLeft: () => this.stepPalette(-1),
			ArrowDown: () => this.stepPattern(1),
			ArrowUp: () => this.stepPattern(-1)
		};
		const action = actions[event.key];
		if (!action) return;
		event.preventDefault();
		action();
	};

	/* ---------------------------------------------------------------- persistência */

	snapshot(): Snapshot {
		return {
			identity: $state.snapshot(this.identity),
			colors: $state.snapshot(this.colors),
			presetId: this.presetId,
			patternId: this.patternId,
			mode: this.mode,
			neutralId: this.neutralId,
			fontId: this.fontId,
			styleId: this.styleId,
			category: this.category,
			dockCollapsed: this.dockCollapsed,
			dockTab: this.dockTab,
			laws: $state.snapshot(this.laws)
		};
	}

	/** Aplica um estado salvo, descartando o que não existe mais (paleta renomeada, lei nova…). */
	restore(saved: Partial<Snapshot>) {
		const identity = saved.identity;
		if (identity) {
			for (const key of ['name', 'tagline', 'description'] as const) {
				if (typeof identity[key] === 'string') this.identity[key] = identity[key];
			}
			if (typeof identity.logo === 'string' && identity.logo.startsWith('data:image/'))
				this.identity.logo = identity.logo;
		}

		const colors = saved.colors;
		if (
			colors &&
			[colors.primary, colors.accent, colors.tertiary].every((c) => HEX.test(c ?? ''))
		) {
			this.colors = colorsOf(colors);
			this.presetId = PALETTES.some((p) => p.id === saved.presetId) ? saved.presetId! : null;
		}

		if (saved.mode === 'light' || saved.mode === 'dark') this.mode = saved.mode;
		if (NEUTRALS.some((n) => n.id === saved.neutralId)) this.neutralId = saved.neutralId!;
		if (PATTERNS.some((p) => p.id === saved.patternId)) this.patternId = saved.patternId!;
		if (saved.fontId === PATTERN_FONT || FONTS.some((f) => f.id === saved.fontId))
			this.fontId = saved.fontId!;
		if (STYLES.some((s) => s.id === saved.styleId)) this.styleId = saved.styleId!;
		if (PALETTE_GROUPS.some((g) => g.id === saved.category)) this.category = saved.category!;
		if (typeof saved.dockCollapsed === 'boolean') this.dockCollapsed = saved.dockCollapsed;
		if (DOCK_TABS.includes(saved.dockTab as DockTab)) this.dockTab = saved.dockTab!;

		for (const law of UX_LAWS) {
			const savedLaw = saved.laws?.[law.id];
			if (!savedLaw) continue;
			if (typeof savedLaw.enabled === 'boolean') this.laws[law.id].enabled = savedLaw.enabled;
			for (const param of law.params) {
				const value = savedLaw.params?.[param.key];
				if (typeof value === 'number' && value >= param.min && value <= param.max)
					this.laws[law.id].params[param.key] = value;
			}
		}
	}
}

function readSaved(): Partial<Snapshot> {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<Snapshot>;
	} catch {
		return {};
	}
}

function writeSaved(snapshot: Snapshot) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
	} catch {
		// Aba privada, armazenamento cheio (logo grande) ou bloqueado: vale só nesta visita.
	}
}

/** Cria o estado, restaura a escolha salva e mantém tema, fonte e armazenamento em dia. */
export function useDesign(): DesignState {
	const design = new DesignState();
	let restored = $state(false);

	onMount(() => {
		design.restore(readSaved());
		restored = true;
	});

	$effect(() => {
		const snapshot = design.snapshot();
		if (restored) writeSaved(snapshot);
	});

	$effect(() => {
		const root = document.documentElement;
		for (const [name, value] of Object.entries(design.tokens))
			root.style.setProperty(`--${name}`, value);
		root.style.setProperty('--brand-font-sans', design.font.sans);
		root.style.setProperty('--brand-font-heading', design.font.heading);
		root.dataset.theme = design.mode;
	});

	return design;
}
