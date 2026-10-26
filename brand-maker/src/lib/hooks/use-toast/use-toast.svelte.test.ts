import { afterEach, describe, expect, it, vi } from 'vitest';
import { useToast } from './use-toast.svelte.ts';

describe('useToast', () => {
	afterEach(() => vi.useRealTimers());

	it('shows a message and hides it after a while', () => {
		// feliz
		vi.useFakeTimers();
		const toast = useToast();
		toast.show('Kit baixado');
		expect(toast).toMatchObject({ message: 'Kit baixado', visible: true });
		vi.advanceTimersByTime(2000);
		expect(toast.visible).toBe(false);
	});

	it('restarts the timer when a new message arrives', () => {
		vi.useFakeTimers();
		const toast = useToast();
		toast.show('Primeiro');
		vi.advanceTimersByTime(1000);
		toast.show('Segundo');
		vi.advanceTimersByTime(1000);
		expect(toast).toMatchObject({ message: 'Segundo', visible: true });
	});

	it('copies to the clipboard and confirms', async () => {
		const writeText = vi.fn(() => Promise.resolve());
		Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
		const toast = useToast();
		await toast.copy('#f2b84b', '#f2b84b copiado');
		expect(writeText).toHaveBeenCalledWith('#f2b84b');
		expect(toast.message).toBe('#f2b84b copiado');
	});

	it('explains when the clipboard is not available', async () => {
		// triste: fora de https/localhost o navegador recusa
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText: () => Promise.reject(new Error('NotAllowed')) }
		});
		const toast = useToast();
		await toast.copy('texto');
		expect(toast.message).toMatch(/Não deu para copiar/);
	});
});
