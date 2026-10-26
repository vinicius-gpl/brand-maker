/** Utilitários que dependem do navegador: ler a logo e baixar arquivo (rodam no jsdom). */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadBytes } from './download.util.ts';
import { LOGO_MAX_BYTES, readImageAsDataUrl } from './file.util.ts';

describe('readImageAsDataUrl', () => {
	it('reads a supported image as a data URL', async () => {
		// feliz
		const file = new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'], 'logo.svg', {
			type: 'image/svg+xml'
		});
		const result = await readImageAsDataUrl(file);
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
	});

	it('refuses other file types', async () => {
		// triste
		const result = await readImageAsDataUrl(new File(['oi'], 'logo.txt', { type: 'text/plain' }));
		expect(result).toEqual({ ok: false, error: 'Use uma logo em SVG, PNG ou WebP.' });
	});

	it('refuses files over the size limit', async () => {
		// triste
		const big = new File([new Uint8Array(LOGO_MAX_BYTES + 1)], 'logo.png', { type: 'image/png' });
		const result = await readImageAsDataUrl(big);
		expect(result.ok).toBe(false);
	});

	it('reports a read failure', async () => {
		// triste: o FileReader falha (arquivo removido do disco no meio da leitura)
		const original = globalThis.FileReader;
		globalThis.FileReader = class {
			onload: (() => void) | null = null;
			onerror: (() => void) | null = null;
			readAsDataURL() {
				queueMicrotask(() => this.onerror?.());
			}
		} as unknown as typeof FileReader;
		const result = await readImageAsDataUrl(new File(['x'], 'logo.png', { type: 'image/png' }));
		globalThis.FileReader = original;
		expect(result).toEqual({ ok: false, error: 'Não deu para ler o arquivo.' });
	});
});

describe('downloadBytes', () => {
	afterEach(() => vi.useRealTimers());

	it('downloads through a temporary link and releases the object URL', () => {
		vi.useFakeTimers();
		const createObjectURL = vi.fn(() => 'blob:fake');
		const revokeObjectURL = vi.fn();
		Object.assign(URL, { createObjectURL, revokeObjectURL });
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

		downloadBytes(new Uint8Array([1, 2, 3]), 'kit.zip', 'application/zip');

		expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
		const link = click.mock.contexts[0] as HTMLAnchorElement;
		expect(link.download).toBe('kit.zip');
		expect(link.href).toBe('blob:fake');
		expect(revokeObjectURL).not.toHaveBeenCalled();
		vi.runAllTimers();
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake');
	});
});
