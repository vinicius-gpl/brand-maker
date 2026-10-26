import { describe, expect, it } from 'vitest';
import { RULES } from '#lib/kit/agent/design-rules.mts';
import { NEUTRALS } from '#lib/theme/foundation.ts';
import { PALETTE_GROUPS } from '#lib/theme/palettes.ts';
import { UX_LAWS } from '#lib/theme/ux-laws.ts';
import { buildTokens } from '#lib/utils/tokens.util.ts';
import { TOKEN_ROLES } from './token-roles.ts';

/** O catálogo da tela, as skills e o verificador precisam falar das mesmas coisas. */
describe('consistência entre tela, skills e verificador', () => {
	it('every check cited by a law exists in the checker', () => {
		const ids = RULES.map((rule) => rule.id);
		for (const law of UX_LAWS) for (const check of law.checks) expect(ids).toContain(check);
	});

	it('every checker rule is cited by a law or is a brand rule', () => {
		const cited = new Set(UX_LAWS.flatMap((law) => law.checks));
		for (const rule of RULES) expect(cited.has(rule.id) || rule.id.startsWith('brand/')).toBe(true);
	});

	it('every generated token has a documented role', () => {
		const tokens = buildTokens(PALETTE_GROUPS[0].palettes[0], 'dark', NEUTRALS[0]);
		for (const name of Object.keys(tokens)) expect(TOKEN_ROLES[name], name).toBeTruthy();
	});
});
