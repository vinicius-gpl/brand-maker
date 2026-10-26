/** Aviso curto e passageiro ("Copiado", "Kit baixado"). */

const VISIBLE_MS = 1600;

export class ToastState {
	message = $state('');
	visible = $state(false);
	#timer: ReturnType<typeof setTimeout> | undefined;

	show = (message: string) => {
		this.message = message;
		this.visible = true;
		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => (this.visible = false), VISIBLE_MS);
	};

	/** Copia para a área de transferência e avisa o resultado. */
	copy = async (text: string, message = 'Copiado') => {
		try {
			await navigator.clipboard.writeText(text);
			this.show(message);
		} catch {
			this.show('Não deu para copiar: abra o site por https ou localhost');
		}
	};
}

export function useToast(): ToastState {
	return new ToastState();
}
