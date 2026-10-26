/** Script do agente já em JavaScript, como texto (plugin `agent-mjs` em vite.config.ts). */
declare module '*.mts?mjs' {
	const source: string;
	export default source;
}
