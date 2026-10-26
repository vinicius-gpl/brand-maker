import { describe, expect, it, vi } from 'vitest';
import { FONTS, NEUTRALS, STYLES } from '#lib/theme/foundation.ts';
import { PALETTE_GROUPS } from '#lib/theme/palettes.ts';
import { PATTERNS } from '#lib/theme/patterns.ts';
import { defaultLawSettings } from '#lib/theme/ux-laws.ts';
import type { DesignSelection } from '#lib/types/design.type.ts';
import { useKit } from './use-kit.svelte.ts';

const group = PALETTE_GROUPS[0];
const selection: DesignSelection = {
	brand: { name: 'Aurora', slug: 'aurora', tagline: 'Luz.', description: 'Desc.', logo: null },
	palette: { ...group.palettes[0], group },
	neutral: NEUTRALS[0],
	pattern: PATTERNS[0],
	font: FONTS[0],
	style: STYLES[0],
	laws: defaultLawSettings()
};

describe('useKit', () => {
	it('derives the files and the zip name from the selection', () => {
		const kit = useKit(() => selection);
		expect(kit.fileName).toBe('aurora-design-kit.zip');
		expect(kit.files.map((f) => f.path)).toContain('.claude/skills/brand-design/SKILL.md');
	});

	it('downloads the zip as a file', () => {
		// feliz
		const createObjectURL = vi.fn(() => 'blob:kit');
		Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
		useKit(() => selection).download();
		const blob = (createObjectURL.mock.calls[0] as unknown as [Blob])[0];
		expect(blob.type).toBe('application/zip');
		expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe('aurora-design-kit.zip');
	});
});
