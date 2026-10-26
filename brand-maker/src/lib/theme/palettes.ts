/**
 * Catálogo de paletas de identidade. Cada uma tem três cores no tom do tema ESCURO; o claro
 * é derivado em `utils/tokens.util.ts` (mesmo matiz, escurecido até passar no contraste).
 */
import type { PaletteGroup } from '#lib/types/design.type.ts';

export const GENERAL_GROUPS: PaletteGroup[] = [
	{
		id: 'pastel',
		name: 'Pastel',
		palettes: [
			{
				id: 'pessego',
				name: 'Pêssego & Menta',
				primary: '#ffb59e',
				accent: '#9fe3c4',
				tertiary: '#f7d794'
			},
			{
				id: 'limao',
				name: 'Sorvete de Limão',
				primary: '#e6f28c',
				accent: '#f4a7c0',
				tertiary: '#9fd8e6'
			},
			{
				id: 'salvia',
				name: 'Sálvia & Areia',
				primary: '#a8d5ba',
				accent: '#e9c79e',
				tertiary: '#d9a5a0'
			},
			{
				id: 'coral',
				name: 'Coral Algodão',
				primary: '#ff9aa2',
				accent: '#ffdac1',
				tertiary: '#b5ead7'
			}
		]
	},
	{
		id: 'neon',
		name: 'Neon',
		palettes: [
			{
				id: 'lima',
				name: 'Lima Ácida',
				primary: '#c6ff3d',
				accent: '#ff4fd8',
				tertiary: '#2ef2d0'
			},
			{
				id: 'laranja',
				name: 'Laranja Elétrico',
				primary: '#ff7a1a',
				accent: '#2ef2d0',
				tertiary: '#ffe14d'
			},
			{
				id: 'choque',
				name: 'Rosa Choque',
				primary: '#ff2e88',
				accent: '#ffe14d',
				tertiary: '#3dffb5'
			},
			{
				id: 'sinal',
				name: 'Verde Sinal',
				primary: '#39ff88',
				accent: '#ff6b3d',
				tertiary: '#f9f871'
			}
		]
	},
	{
		id: 'terroso',
		name: 'Terroso',
		palettes: [
			{
				id: 'terracota',
				name: 'Terracota & Oliva',
				primary: '#e2725b',
				accent: '#b5c18e',
				tertiary: '#f2c57c'
			},
			{
				id: 'ambar',
				name: 'Âmbar & Petróleo',
				primary: '#f2b84b',
				accent: '#4fb3a9',
				tertiary: '#e07a5f'
			},
			{
				id: 'ferrugem',
				name: 'Ferrugem & Creme',
				primary: '#d9653b',
				accent: '#efe0c4',
				tertiary: '#8fae8b'
			}
		]
	},
	{
		id: 'joia',
		name: 'Joia',
		palettes: [
			{
				id: 'jade',
				name: 'Jade & Cobre',
				primary: '#3ecf8e',
				accent: '#e08e5a',
				tertiary: '#f2d06b'
			},
			{
				id: 'rubi',
				name: 'Rubi & Ouro',
				primary: '#ff5c7a',
				accent: '#f2c14e',
				tertiary: '#7fd1b9'
			},
			{
				id: 'turquesa',
				name: 'Turquesa & Tangerina',
				primary: '#2ad4c2',
				accent: '#ff9f43',
				tertiary: '#ff7aa8'
			}
		]
	},
	{
		id: 'corporativo',
		name: 'Corporativo',
		palettes: [
			{
				id: 'azul-real',
				name: 'Azul Real & Ouro',
				primary: '#4f7cff',
				accent: '#f5b942',
				tertiary: '#5fd3c6'
			},
			{
				id: 'marinho',
				name: 'Marinho & Âmbar',
				primary: '#6a95e8',
				accent: '#ffb547',
				tertiary: '#a9b8c9'
			},
			{
				id: 'cobalto',
				name: 'Cobalto & Coral',
				primary: '#3d7bff',
				accent: '#ff7a6b',
				tertiary: '#f6c85f'
			},
			{
				id: 'petroleo',
				name: 'Petróleo & Cobre',
				primary: '#2bb3c0',
				accent: '#f28c5b',
				tertiary: '#c3cfdc'
			},
			{
				id: 'floresta',
				name: 'Verde Floresta',
				primary: '#4cc38a',
				accent: '#e6b450',
				tertiary: '#8fa8c4'
			},
			{
				id: 'bordo',
				name: 'Bordô Executivo',
				primary: '#e05a72',
				accent: '#d9b26a',
				tertiary: '#8ab4d6'
			}
		]
	}
];

/**
 * Metálicos e iridescentes: tons de metal (ouro rosé, cobre, bronze, titânio…) e de
 * superfícies furta-cor. Combinam com os estilos Metálico e Holográfico, mas valem em qualquer um.
 */
export const SPECIAL_GROUPS: PaletteGroup[] = [
	{
		id: 'metalico',
		name: 'Metálico',
		palettes: [
			{
				id: 'ouro-rose',
				name: 'Ouro Rosé',
				primary: '#e6a28c',
				accent: '#f1d9a7',
				tertiary: '#b8c4cc'
			},
			{
				id: 'cobre',
				name: 'Cobre & Pátina',
				primary: '#e0835a',
				accent: '#5fb3a1',
				tertiary: '#f0c987'
			},
			{
				id: 'bronze',
				name: 'Bronze Antigo',
				primary: '#c99a5b',
				accent: '#8fb5a3',
				tertiary: '#e3a98a'
			},
			{
				id: 'titanio',
				name: 'Titânio & Âmbar',
				primary: '#aeb8c4',
				accent: '#e0a96d',
				tertiary: '#8fd3c7'
			},
			{
				id: 'champanhe',
				name: 'Champanhe & Vinho',
				primary: '#f2d7a0',
				accent: '#e08a9b',
				tertiary: '#a9c7b5'
			},
			{
				id: 'prata',
				name: 'Prata Lunar',
				primary: '#cfd6dd',
				accent: '#f2b84b',
				tertiary: '#9fd8c6'
			}
		]
	},
	{
		id: 'iridescente',
		name: 'Iridescente',
		palettes: [
			{ id: 'opala', name: 'Opala', primary: '#8ee3d4', accent: '#f7a8d8', tertiary: '#d4c4f7' },
			{
				id: 'oleo',
				name: 'Óleo no Asfalto',
				primary: '#3fd0a8',
				accent: '#d08cff',
				tertiary: '#ffcf6b'
			},
			{ id: 'perola', name: 'Pérola', primary: '#f3d5e3', accent: '#bfe9e2', tertiary: '#e9dcb5' },
			{ id: 'besouro', name: 'Besouro', primary: '#7be0a0', accent: '#5ec8e8', tertiary: '#e8c25e' }
		]
	}
];

/** O catálogo inteiro, na ordem do carrossel. */
export const PALETTE_GROUPS: PaletteGroup[] = [...GENERAL_GROUPS, ...SPECIAL_GROUPS];

/** Paleta inicial de uma marca nova. */
export const DEFAULT_PALETTE_ID = 'ambar';
