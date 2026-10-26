import { describe, expect, it } from 'vitest';
import { dataUrlToBytes } from './file.util.ts';

describe('dataUrlToBytes', () => {
	it('decodes a base64 svg and maps the extension', () => {
		// feliz
		const svg = '<svg xmlns="http://www.w3.org/2000/svg"/>';
		const result = dataUrlToBytes(`data:image/svg+xml;base64,${btoa(svg)}`);
		expect(result?.extension).toBe('svg');
		expect(new TextDecoder().decode(result?.bytes)).toBe(svg);
	});

	it('keeps png and webp extensions as they are', () => {
		expect(dataUrlToBytes('data:image/png;base64,AAAA')?.extension).toBe('png');
		expect(dataUrlToBytes('data:image/webp;base64,AAAA')?.extension).toBe('webp');
	});

	it('rejects anything that is not a supported base64 image', () => {
		// triste
		expect(dataUrlToBytes('data:text/plain;base64,aGk=')).toBeNull();
		expect(dataUrlToBytes('https://exemplo.com/logo.png')).toBeNull();
	});
});
