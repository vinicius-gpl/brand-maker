import { describe, expect, it } from 'vitest';
import { cn } from './cn.util.ts';

describe('cn', () => {
	it('joins conditional classes', () => {
		// feliz
		expect(cn('px-3', { 'text-success': true, 'text-destructive': false }, ['rounded-full'])).toBe(
			'px-3 text-success rounded-full'
		);
	});

	it('drops falsy values', () => {
		expect(cn('px-3', undefined, null, false, '')).toBe('px-3');
	});

	it('keeps the last of conflicting tailwind classes', () => {
		// triste: classe de fora sobrescreve a do componente sem duplicar
		expect(cn('h-8 bg-card', 'h-10 bg-primary')).toBe('h-10 bg-primary');
	});

	it('treats the custom control height as height', () => {
		expect(cn('h-8', 'control')).toBe('control');
		expect(cn('control', 'control-sm')).toBe('control-sm');
		// triste: a altura de fora substitui a padrão, sem as duas brigarem no mesmo elemento
		expect(cn('control px-2', 'h-8')).toBe('px-2 h-8');
	});

	it('treats the custom radius tokens as radius', () => {
		expect(cn('rounded-md', 'rounded-surface')).toBe('rounded-surface');
	});
});
