/** O kit de design derivado da escolha atual: a lista de arquivos e o download do zip. */
import { buildKit, kitRootFolder, zipKit } from '#lib/kit/kit.util.ts';
import type { DesignSelection } from '#lib/types/design.type.ts';
import { downloadBytes } from '#lib/utils/download.util.ts';

export function useKit(selection: () => DesignSelection) {
	const files = $derived(buildKit(selection()));
	const rootFolder = $derived(kitRootFolder(selection()));
	const fileName = $derived(`${rootFolder}.zip`);

	return {
		get files() {
			return files;
		},
		get fileName() {
			return fileName;
		},
		download() {
			downloadBytes(zipKit(files, rootFolder), fileName, 'application/zip');
		}
	};
}

export type KitState = ReturnType<typeof useKit>;
