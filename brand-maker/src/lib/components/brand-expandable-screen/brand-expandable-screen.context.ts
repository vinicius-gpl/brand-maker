/**
 * Contexto compartilhado pelas partes da tela expansível (raiz, gatilho, conteúdo), no formato
 * do ExpandableScreen da cult-ui: a raiz guarda o estado, as partes leem daqui.
 */
import { createContext } from 'svelte';

export type ExpandableScreenContext = {
	readonly expanded: boolean;
	/** Elemento de onde a tela cresce e para onde volta (o gatilho). */
	readonly origin: HTMLElement | null;
	readonly triggerRadius: string;
	readonly contentRadius: string;
	/** Duração da animação, em segundos. */
	readonly animationDuration: number;
	expand: () => void;
	collapse: () => void;
	setOrigin: (element: HTMLElement | null) => void;
};

const [getContext, setContext] = createContext<ExpandableScreenContext>();

export const setExpandableScreen = setContext;

/** Acesso ao estado da tela expansível de dentro de qualquer parte dela. */
export function useExpandableScreen(): ExpandableScreenContext {
	return getContext();
}
