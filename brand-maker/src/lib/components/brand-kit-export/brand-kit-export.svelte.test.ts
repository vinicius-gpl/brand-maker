import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { KitFile } from '#lib/types/design.type.ts';
import BrandKitExport from './brand-kit-export.svelte';

const files: KitFile[] = [
	{ path: 'README.md', content: '# Kit de design', description: 'Como usar' },
	{ path: 'design/tokens.css', content: ':root { --primary: #f2b84b; }', description: 'Tokens' },
	{
		path: 'design/logo.png',
		content: 'data:image/png;base64,AAAA',
		binary: new Uint8Array(2048),
		description: 'Logo'
	}
];

function setup() {
	const actions = { onDownload: vi.fn(), onCopy: vi.fn() };
	render(BrandKitExport, { data: { files, fileName: 'aurora-design-kit.zip' }, actions });
	return actions;
}

describe('BrandKitExport', () => {
	it('lists every file with its size and opens the README first', () => {
		setup();
		const list = screen.getByRole('list', { name: 'Arquivos do kit' });
		expect(list.querySelectorAll('li')).toHaveLength(files.length);
		expect(screen.getByText('2.0 KB')).toBeInTheDocument();
		expect(screen.getByText('# Kit de design')).toBeInTheDocument();
	});

	it('shows the chosen file and copies it', async () => {
		// feliz
		const actions = setup();
		await userEvent.click(screen.getByRole('button', { name: /design\/tokens\.css/ }));
		expect(screen.getByText(':root { --primary: #f2b84b; }')).toBeInTheDocument();
		await userEvent.click(screen.getByRole('button', { name: 'Copiar' }));
		expect(actions.onCopy).toHaveBeenCalledWith(':root { --primary: #f2b84b; }');
	});

	it('previews a binary file as an image, without the copy button', async () => {
		// triste: binário não é texto para copiar
		setup();
		await userEvent.click(screen.getByRole('button', { name: /design\/logo\.png/ }));
		expect(screen.getByRole('img', { name: 'Logo da marca' })).toHaveAttribute(
			'src',
			files[2].content
		);
		expect(screen.queryByRole('button', { name: 'Copiar' })).not.toBeInTheDocument();
	});

	it('downloads the zip', async () => {
		const actions = setup();
		await userEvent.click(screen.getByRole('button', { name: 'Baixar aurora-design-kit.zip' }));
		expect(actions.onDownload).toHaveBeenCalledOnce();
	});
});
