import { describe, expect, it } from 'vitest';
import { FONTS, STYLES } from '#lib/theme/foundation.ts';
import { DEFAULT_PALETTE_ID, PALETTE_GROUPS } from '#lib/theme/palettes.ts';
import { PATTERNS } from '#lib/theme/patterns.ts';
import { CUSTOM_GROUP, DesignState } from './use-design.svelte.ts';

const presetIds = PALETTE_GROUPS.flatMap((g) => g.palettes.map((p) => p.id));

function keydown(key: string, target: EventTarget = document.body) {
	const event = new KeyboardEvent('keydown', { key, cancelable: true });
	Object.defineProperty(event, 'target', { value: target });
	return event;
}

describe('DesignState', () => {
	it('starts from the default palette and a sample identity', () => {
		const design = new DesignState();
		expect(design.presetId).toBe(DEFAULT_PALETTE_ID);
		expect(design.palette.id).toBe(DEFAULT_PALETTE_ID);
		expect(design.brand.slug).toBe('minha-marca');
	});

	it('derives the slug from the brand name', () => {
		const design = new DesignState();
		design.setIdentity('name', 'Café do Zé');
		expect(design.brand.slug).toBe('cafe-do-ze');
	});

	it('fills the three colors when a preset is picked', () => {
		// feliz
		const design = new DesignState();
		design.pickPalette('jade');
		expect(design.presetId).toBe('jade');
		expect(design.colors).toEqual({ primary: '#3ecf8e', accent: '#e08e5a', tertiary: '#f2d06b' });
	});

	it('ignores an unknown preset', () => {
		// triste
		const design = new DesignState();
		design.pickPalette('nao-existe');
		expect(design.presetId).toBe(DEFAULT_PALETTE_ID);
	});

	it('turns into a custom palette when a color is edited', () => {
		const design = new DesignState();
		design.setColor('accent', '#ABCDEF');
		expect(design.presetId).toBeNull();
		expect(design.colors.accent).toBe('#abcdef');
		expect(design.palette.group).toBe(CUSTOM_GROUP);
	});

	it('rejects a color that is not a 6-digit hex', () => {
		// triste
		const design = new DesignState();
		const before = { ...design.colors };
		design.setColor('primary', 'vermelho');
		design.setColor('primary', '#fff');
		expect(design.colors).toEqual(before);
		expect(design.presetId).toBe(DEFAULT_PALETTE_ID);
	});

	it('generates accent and tertiary from the primary by harmony', () => {
		const design = new DesignState();
		const primary = design.colors.primary;
		design.applyHarmony('triade');
		expect(design.colors.primary).toBe(primary);
		expect(design.colors.accent).not.toBe(primary);
		expect(design.presetId).toBeNull();
	});

	it('cycles through the visible palettes, wrapping at the ends', () => {
		const design = new DesignState();
		design.setCategory('neon');
		const neon = PALETTE_GROUPS.find((g) => g.id === 'neon')!.palettes.map((p) => p.id);
		design.pickPalette(neon.at(-1)!);
		design.stepPalette(1);
		expect(design.presetId).toBe(neon[0]);
		design.stepPalette(-1);
		expect(design.presetId).toBe(neon.at(-1));
	});

	it('cycles patterns with wrap-around', () => {
		const design = new DesignState();
		design.stepPattern(-1);
		expect(design.patternId).toBe(PATTERNS.at(-1)!.id);
	});

	it('handles arrow keys but never while typing in a field', () => {
		const design = new DesignState();
		design.handleKeydown(keydown('ArrowDown'));
		expect(design.patternId).toBe(PATTERNS[1].id);

		// triste: dentro de um campo, a seta é do campo
		const input = document.createElement('input');
		const typing = design.patternId;
		design.handleKeydown(keydown('ArrowDown', input));
		expect(design.patternId).toBe(typing);
	});

	it('round-trips a snapshot through restore', () => {
		const design = new DesignState();
		design.setIdentity('name', 'Aurora');
		design.pickPalette('opala');
		design.setMode('light');
		design.setStyle('metalico');
		design.setLawParam('fitts', 'minTargetPx', 48);
		design.toggleLaw('tesler');

		const restored = new DesignState();
		restored.restore(JSON.parse(JSON.stringify(design.snapshot())));
		expect(restored.snapshot()).toEqual(design.snapshot());
	});

	it('drops saved values that no longer exist or are out of range', () => {
		// triste: estado salvo de uma versão antiga não pode quebrar a tela
		const design = new DesignState();
		design.restore({
			presetId: 'paleta-removida',
			colors: { primary: 'azul', accent: '#000000', tertiary: '#111111' },
			styleId: 'estilo-removido' as never,
			mode: 'sepia' as never,
			laws: { fitts: { enabled: true, params: { minTargetPx: 999 } } } as never,
			identity: { name: 'Ok', tagline: 'T', description: 'D', logo: 'javascript:alert(1)' }
		});
		expect(design.presetId).toBe(DEFAULT_PALETTE_ID);
		expect(design.styleId).toBe(STYLES[0].id);
		expect(design.mode).toBe('dark');
		expect(design.laws.fitts.params.minTargetPx).toBe(40);
		expect(design.identity.name).toBe('Ok');
		expect(design.identity.logo).toBeNull();
	});

	it('keeps every preset reachable and passing the brand rules', () => {
		const design = new DesignState();
		for (const id of presetIds) {
			design.pickPalette(id);
			expect(design.brandRules.slice(0, 2).every((rule) => rule.ok)).toBe(true);
		}
	});

	it('falls back to defaults for unknown neutral, font and style ids', () => {
		// triste
		const design = new DesignState();
		design.setNeutral('inexistente');
		design.setFont('inexistente');
		design.setStyle('inexistente' as never);
		expect(design.neutral.id).toBe('tinta');
		expect(design.font.id).toBe('inter');
		expect(design.style.id).toBe('none');
	});

	it('does nothing when the category has no palettes', () => {
		const design = new DesignState();
		design.setCategory('categoria-vazia');
		design.stepPalette(1);
		expect(design.presetId).toBe(DEFAULT_PALETTE_ID);
	});

	it('steps into the catalog from a custom palette', () => {
		const design = new DesignState();
		design.setColor('primary', '#123456');
		design.stepPalette(1);
		expect(design.presetId).toBe(presetIds[0]);
		design.setColor('primary', '#123456');
		design.stepPalette(-1);
		expect(design.presetId).toBe(presetIds.at(-1));
	});

	it('ignores keys without a shortcut', () => {
		const design = new DesignState();
		const event = keydown('a');
		design.handleKeydown(event);
		expect(event.defaultPrevented).toBe(false);
		expect(design.styleId).toBe(STYLES[0].id);
	});

	it('restores a valid logo, custom colors and the saved category', () => {
		const design = new DesignState();
		design.restore({
			identity: {
				name: 'Aurora',
				tagline: 'T',
				description: 'D',
				logo: 'data:image/png;base64,AAAA'
			},
			colors: { primary: '#e2725b', accent: '#b5c18e', tertiary: '#f2c57c' },
			presetId: null,
			category: 'joia'
		});
		expect(design.identity.logo).toBe('data:image/png;base64,AAAA');
		expect(design.presetId).toBeNull();
		expect(design.colors.primary).toBe('#e2725b');
		expect(design.category).toBe('joia');
	});

	it('ignores saved colors with a missing field', () => {
		// triste
		const design = new DesignState();
		design.restore({ colors: { primary: '#e2725b', accent: '#b5c18e' } as never });
		expect(design.presetId).toBe(DEFAULT_PALETTE_ID);
	});

	it('uses the font recommended by the pattern until another is chosen', () => {
		// feliz
		const design = new DesignState();
		design.setPattern('carbon');
		expect(design.fontId).toBe('pattern');
		expect(design.font.name).toBe('IBM Plex Sans');
		design.setFont(FONTS[2].id);
		expect(design.font).toBe(FONTS[2]);
	});

	it('restores the saved pattern and the "from pattern" font, ignoring unknown ones', () => {
		const design = new DesignState();
		design.restore({ patternId: 'material', fontId: 'pattern' });
		expect(design.pattern.name).toBe('Material 3 Expressive');
		design.restore({ patternId: 'removido' as never });
		expect(design.patternId).toBe('material');
	});

	it('shuffles pattern and colors but keeps identity and finish', () => {
		const design = new DesignState();
		design.setIdentity('name', 'Aurora');
		design.setStyle('vidro');
		design.shuffle();
		expect(design.identity.name).toBe('Aurora');
		expect(design.styleId).toBe('vidro');
		expect(design.presetId).toBeNull();
	});

	it('remembers the open tab of the bottom sheet, ignoring unknown tabs', () => {
		const design = new DesignState();
		expect(design.dockTab).toBe('cor');
		design.setDockTab('padrao');
		const restored = new DesignState();
		restored.restore(design.snapshot());
		expect(restored.dockTab).toBe('padrao');
		restored.restore({ dockTab: 'inexistente' as never });
		expect(restored.dockTab).toBe('padrao');
	});

	it('does not steal arrow keys from tabs, lists and sliders', () => {
		// triste: setas nas abas trocam de aba, não de padrão
		const design = new DesignState();
		const tablist = document.createElement('div');
		tablist.setAttribute('role', 'tablist');
		const tab = document.createElement('button');
		tablist.append(tab);
		design.handleKeydown(keydown('ArrowDown', tab));
		expect(design.patternId).toBe('simples');
	});
});
