/**
 * A parte do kit que prende o agente ao design: a config do verificador e o settings.json do
 * Claude Code que liga os hooks.
 */
import type { DesignConfig } from '#lib/kit/agent/design-rules.mts';
import type { DesignSelection } from '#lib/types/design.type.ts';

export const HOOKS_DIR = '.claude/hooks/design';
/**
 * Skills com nome em inglês (o nome da marca fica no conteúdo); cada uma ganha um atalho em
 * português em `.claude/commands/`, que só delega (skill não aceita apelido).
 */
export const SKILLS = {
	design: { name: 'brand-design', shortcut: 'design-da-marca' },
	uxLaws: { name: 'ux-laws', shortcut: 'leis-de-ux' }
} as const;

export function designConfig(selection: DesignSelection): DesignConfig {
	const law = (id: keyof DesignSelection['laws']) => selection.laws[id];
	const params = (id: keyof DesignSelection['laws']) => law(id).params;

	return {
		brand: selection.brand.name,
		skill: SKILLS.design.name,
		scan: {
			dirs: ['src'],
			extensions: ['.svelte', '.tsx', '.jsx', '.vue', '.astro', '.html', '.css'],
			tokenFiles: ['tokens.css', 'tailwind.css', 'theme.css'],
			ignore: ['node_modules', '.svelte-kit', 'dist/', 'build/', '/components/ui/']
		},
		brandRules: { tokensOnly: true, noPureBlackWhite: true, noArbitraryValues: true },
		laws: {
			hick: {
				enabled: law('hick').enabled,
				maxNavItems: params('hick').maxNavItems,
				maxSelectOptions: params('hick').maxSelectOptions
			},
			fitts: { enabled: law('fitts').enabled, minTargetPx: params('fitts').minTargetPx },
			jakob: { enabled: law('jakob').enabled },
			miller: {
				enabled: law('miller').enabled,
				maxUngroupedFields: params('miller').maxUngroupedFields
			},
			vonRestorff: {
				enabled: law('vonRestorff').enabled,
				maxPrimaryActions: params('vonRestorff').maxPrimaryActions
			},
			uniformConnectedness: { enabled: law('uniformConnectedness').enabled },
			tesler: { enabled: law('tesler').enabled }
		}
	};
}

/**
 * Hooks do Claude Code:
 * - SessionStart: o resumo das regras entra no contexto no início de toda sessão;
 * - PostToolUse: todo arquivo editado é conferido; erro de design volta para o agente corrigir.
 */
export function claudeSettings(): string {
	const command = (flag: string) =>
		`node "$CLAUDE_PROJECT_DIR/${HOOKS_DIR}/check-design.mjs" ${flag}`;
	const settings = {
		hooks: {
			SessionStart: [{ hooks: [{ type: 'command', command: command('--summary') }] }],
			PostToolUse: [
				{
					matcher: 'Edit|MultiEdit|Write',
					hooks: [{ type: 'command', command: command('--hook') }]
				}
			]
		}
	};
	return JSON.stringify(settings, null, 2) + '\n';
}
