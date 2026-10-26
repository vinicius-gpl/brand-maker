/**
 * Setup dos testes de componente (jsdom). O jsdom não implementa algumas APIs que o app usa;
 * aqui entram versões mínimas, só o bastante para os componentes rodarem.
 */
import '@testing-library/jest-dom/vitest';

// matchMedia: usado para respeitar prefers-reduced-motion. Nos testes, movimento reduzido:
// as transições terminam na hora e o teste não depende de tempo.
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: (query: string) => ({
		matches: query.includes('reduce'),
		media: query,
		onchange: null,
		addEventListener: () => {},
		removeEventListener: () => {},
		addListener: () => {},
		removeListener: () => {},
		dispatchEvent: () => false
	})
});

// Element.animate: o Svelte 5 roda as transições pela Web Animations API.
if (!Element.prototype.animate) {
	Element.prototype.animate = function animate() {
		const animation = {
			finished: Promise.resolve(),
			onfinish: null as null | (() => void),
			cancel: () => {},
			finish: () => {},
			play: () => {},
			pause: () => {},
			currentTime: 0
		};
		queueMicrotask(() => animation.onfinish?.());
		return animation as unknown as Animation;
	};
}

// scrollTo em elementos: usado pelo carrossel para centralizar a paleta ativa.
Element.prototype.scrollTo ??= function scrollTo() {};

// Clipboard: o botão "copiar" usa navigator.clipboard.
Object.defineProperty(navigator, 'clipboard', {
	configurable: true,
	value: { writeText: () => Promise.resolve() }
});

// ResizeObserver: usado pelo `bind:offsetHeight` da barra de baixo.
globalThis.ResizeObserver ??= class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

// localStorage: o Node 25 tem um global próprio que, sem `--localstorage-file`, vem sem métodos
// e encobre o do jsdom. Nos testes, um Storage em memória com a mesma API.
class MemoryStorage implements Storage {
	#items = new Map<string, string>();
	get length() {
		return this.#items.size;
	}
	clear() {
		this.#items.clear();
	}
	getItem(key: string) {
		return this.#items.get(key) ?? null;
	}
	key(index: number) {
		return [...this.#items.keys()][index] ?? null;
	}
	removeItem(key: string) {
		this.#items.delete(key);
	}
	setItem(key: string, value: string) {
		this.#items.set(key, String(value));
	}
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
	const storage = new MemoryStorage();
	Object.defineProperty(globalThis, name, { configurable: true, value: storage });
	Object.defineProperty(window, name, { configurable: true, value: storage });
}

// Ponteiro e rolagem: o Select e o Tooltip do bits-ui usam ao abrir e destacar opções.
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.setPointerCapture ??= () => {};
Element.prototype.releasePointerCapture ??= () => {};
Element.prototype.scrollIntoView ??= () => {};
