/**
 * Estado local das animações do bottom sheet. Fica numa classe porque o componente tem uma
 * prop chamada `state`, que esconderia a runa `$state` lá dentro.
 */
export class DockMotion {
	/** De que lado o conteúdo novo entra: 1 da direita (avançou), -1 da esquerda (voltou). */
	direction = $state(1);
	/** Botões das abas, para o indicador ativo deslizar até o escolhido. */
	triggers = $state<(HTMLElement | null)[]>([]);
	/** Largura da janela: muda no redimensionamento e faz o indicador medir de novo. */
	viewport = $state(0);
	/** Altura do conteúdo da aba; a área anima até ela na troca. */
	panelHeight = $state(0);

	constructor(tabs: number) {
		this.triggers = Array.from({ length: tabs }, () => null);
	}
}
