/**
 * Ícones (Lucide) de padrões e acabamentos. Ficam fora dos dados de tema de propósito: o kit
 * exportado não depende de biblioteca de ícone, só a interface da ferramenta.
 */
import {
	BrickWall,
	CircleOff,
	Cloud,
	Component,
	DraftingCompass,
	Gem,
	GlassWater,
	Grid3x3,
	Grip,
	Landmark,
	LayoutPanelTop,
	Rainbow,
	ScrollText,
	Shapes,
	Smartphone,
	Square,
	SquareCode,
	Zap
} from '@lucide/svelte';
import type { PatternId, VisualStyleId } from '#lib/types/design.type.ts';

export type IconComponent = typeof Square;

export const PATTERN_ICONS: Record<PatternId, IconComponent> = {
	simples: Square,
	material: Shapes,
	fluent: LayoutPanelTop,
	carbon: Grid3x3,
	primer: SquareCode,
	shadcn: Component,
	cupertino: Smartphone,
	govuk: Landmark,
	bruto: BrickWall,
	blueprint: DraftingCompass
};

export const STYLE_ICONS: Record<VisualStyleId, IconComponent> = {
	none: CircleOff,
	suave: Cloud,
	neon: Zap,
	textura: Grip,
	vidro: GlassWater,
	metalico: Gem,
	holografico: Rainbow,
	papel: ScrollText
};
