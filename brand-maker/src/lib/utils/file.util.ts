/** Leitura de arquivo escolhido pela pessoa (a logo), com limite de tamanho e de tipo. */

export const LOGO_TYPES = ['image/svg+xml', 'image/png', 'image/webp'];
/** O data URL vai para o localStorage (≈5 MB no total): 300 KB deixa folga. */
export const LOGO_MAX_BYTES = 300 * 1024;

export type ReadResult = { ok: true; dataUrl: string } | { ok: false; error: string };

export function readImageAsDataUrl(file: File): Promise<ReadResult> {
	if (!LOGO_TYPES.includes(file.type)) {
		return Promise.resolve({ ok: false, error: 'Use uma logo em SVG, PNG ou WebP.' });
	}
	if (file.size > LOGO_MAX_BYTES) {
		return Promise.resolve({
			ok: false,
			error: 'A logo passa de 300 KB: exporte menor ou em SVG.'
		});
	}
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = () => resolve({ ok: true, dataUrl: String(reader.result) });
		reader.onerror = () => resolve({ ok: false, error: 'Não deu para ler o arquivo.' });
		reader.readAsDataURL(file);
	});
}

/** `data:image/png;base64,...` → bytes e extensão, para a logo entrar no zip. */
export function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; extension: string } | null {
	const match = dataUrl.match(/^data:image\/(svg\+xml|png|webp);base64,(.+)$/);
	if (!match) return null;
	const binary = atob(match[2]);
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return { bytes, extension: match[1] === 'svg+xml' ? 'svg' : match[1] };
}
