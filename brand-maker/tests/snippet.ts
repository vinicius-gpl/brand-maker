/** Snippet de texto para passar como `children` nos testes de componente. */
import { createRawSnippet } from 'svelte';

export const textSnippet = (text: string) =>
	createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));
