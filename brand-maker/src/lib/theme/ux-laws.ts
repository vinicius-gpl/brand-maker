/**
 * As leis de UX que o kit transforma em regra. Cada lei diz o que o projeto exige
 * (`practices`, vai para a skill) e quais checagens automáticas a cobrem (`checks`, os ids
 * de `kit/agent/design-rules.mts`). Os `params` aparecem na tela e vão para o
 * `design.config.json` exportado.
 */
import type { UxLaw, UxLawSettings } from '#lib/types/design.type.ts';

export const UX_LAWS: UxLaw[] = [
	{
		id: 'hick',
		name: 'Lei de Hick',
		principle: 'O tempo para decidir cresce com o número e a complexidade das opções.',
		practices: [
			'Menu principal com no máximo {{maxNavItems}} itens; o resto vai para "Mais" ou para a página certa.',
			'Lista de escolha com mais de {{maxSelectOptions}} opções vira campo com busca (combobox).',
			'Uma tela, uma tarefa principal. Ações raras ficam em menu secundário.',
			'Destaque a opção recomendada em vez de apresentar todas com o mesmo peso.'
		],
		checks: ['hick/nav-items', 'hick/select-options'],
		params: [
			{
				key: 'maxNavItems',
				label: 'Itens no menu',
				unit: 'itens',
				min: 3,
				max: 12,
				step: 1,
				default: 7
			},
			{
				key: 'maxSelectOptions',
				label: 'Opções num select',
				unit: 'opções',
				min: 5,
				max: 30,
				step: 1,
				default: 10
			}
		]
	},
	{
		id: 'fitts',
		name: 'Lei de Fitts',
		principle: 'O tempo para acertar um alvo depende da distância até ele e do tamanho dele.',
		practices: [
			'Todo alvo de toque ou clique tem pelo menos {{minTargetPx}}px de altura (botão, item de menu, campo).',
			'A ação principal fica perto de onde a atenção já está (fim do formulário, canto da barra).',
			'Ações destrutivas ficam longe das frequentes e pedem confirmação.',
			'No celular, ações principais ficam ao alcance do polegar, na parte de baixo da tela.'
		],
		checks: ['fitts/target-size'],
		params: [
			{
				key: 'minTargetPx',
				label: 'Alvo mínimo',
				unit: 'px',
				min: 24,
				max: 56,
				step: 4,
				default: 40
			}
		]
	},
	{
		id: 'jakob',
		name: 'Lei de Jakob',
		principle:
			'As pessoas passam a maior parte do tempo em outros sites e esperam que o seu funcione igual.',
		practices: [
			'Link é <a href>, ação é <button>. Nada de <div> ou <span> clicável.',
			'Logo no canto superior esquerdo leva para o início; busca e conta ficam no canto direito.',
			'Todo campo tem rótulo visível ou aria-label; placeholder não é rótulo.',
			'Ícones consagrados mantêm o sentido de sempre: lixeira exclui, lupa busca.'
		],
		checks: [
			'jakob/clickable-non-interactive',
			'jakob/anchor-without-href',
			'jakob/placeholder-as-label'
		],
		params: []
	},
	{
		id: 'miller',
		name: 'Lei de Miller',
		principle: 'A memória de trabalho guarda poucos itens (7 ± 2) ao mesmo tempo.',
		practices: [
			'Formulário com mais de {{maxUngroupedFields}} campos é dividido em grupos (<fieldset> com <legend>) ou em etapas.',
			'Números longos aparecem em blocos (CPF, telefone, cartão).',
			'Listas longas ganham agrupamento, filtro ou paginação.'
		],
		checks: ['miller/ungrouped-fields'],
		params: [
			{
				key: 'maxUngroupedFields',
				label: 'Campos sem agrupar',
				unit: 'campos',
				min: 3,
				max: 12,
				step: 1,
				default: 7
			}
		]
	},
	{
		id: 'vonRestorff',
		name: 'Efeito Von Restorff',
		principle: 'Entre itens parecidos, o que é diferente é o que se lembra.',
		practices: [
			'No máximo {{maxPrimaryActions}} ação primária (bg-primary) por tela: o destaque só funciona se for raro.',
			'A cor de destaque (accent-hero) marca uma coisa por vez: o título, a novidade, o alerta.',
			'Estado (erro, sucesso) nunca depende só da cor: vem com ícone ou texto.'
		],
		checks: ['von-restorff/single-primary'],
		params: [
			{
				key: 'maxPrimaryActions',
				label: 'Ações primárias por tela',
				unit: 'ações',
				min: 1,
				max: 3,
				step: 1,
				default: 1
			}
		]
	},
	{
		id: 'uniformConnectedness',
		name: 'Conectividade Uniforme',
		principle:
			'Elementos ligados visualmente (mesmo contorno, mesma linha) são percebidos como um grupo.',
		practices: [
			'Opções do mesmo grupo (radio, checkbox) ficam dentro de <fieldset> ou role="radiogroup"/"group".',
			'Itens relacionados dividem o mesmo cartão ou a mesma borda; itens sem relação, não.',
			'As ações de um cartão ficam dentro dele, não soltas embaixo.'
		],
		checks: ['uniform-connectedness/choice-group'],
		params: []
	},
	{
		id: 'tesler',
		name: 'Lei de Tesler',
		principle:
			'Toda tarefa tem uma complexidade mínima; ela deve ficar com o sistema, não com quem usa.',
		practices: [
			'Campos de e-mail, telefone, nome e endereço têm type e autocomplete certos: o navegador preenche.',
			'O sistema deduz o que puder (CEP preenche o endereço, a data padrão é hoje).',
			'Valores padrão sensatos em vez de campos obrigatórios em branco.'
		],
		checks: ['tesler/autocomplete', 'tesler/input-type'],
		params: []
	}
];

export function defaultLawSettings(): UxLawSettings {
	return Object.fromEntries(
		UX_LAWS.map((law) => [
			law.id,
			{ enabled: true, params: Object.fromEntries(law.params.map((p) => [p.key, p.default])) }
		])
	) as UxLawSettings;
}

/** Troca `{{param}}` de uma prática pelo valor configurado. */
export function renderPractice(text: string, params: Record<string, number>): string {
	return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
		key in params ? String(params[key]) : match
	);
}
