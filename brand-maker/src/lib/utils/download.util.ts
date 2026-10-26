/** Entrega bytes gerados no navegador como um arquivo para baixar. */
export function downloadBytes(bytes: Uint8Array, fileName: string, type: string) {
	const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], { type });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	link.click();
	// Dá tempo do navegador iniciar o download antes de soltar o objeto.
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
