/**
 * Verificador de design. Três modos:
 *
 *   node .claude/hooks/design/check-design.mts            varre o projeto (CI, pre-push)
 *   node .claude/hooks/design/check-design.mts --hook     hook PostToolUse do Claude Code
 *   node .claude/hooks/design/check-design.mts --summary  hook SessionStart: regras no contexto
 *
 * No modo --hook o Claude Code manda no stdin o JSON da ferramenta que acabou de rodar
 * (Edit/Write/MultiEdit). Se o arquivo editado violar uma regra de nível "error", o script sai
 * com código 2 e escreve as violações no stderr: o Claude Code devolve isso ao agente, que
 * corrige na mesma tarefa. Avisos ("warning") vão como contexto adicional, sem bloquear.
 *
 * Sem dependências. No kit vai como JavaScript (.mjs): roda em qualquer Node 22+.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	checkSource,
	formatViolations,
	isInScope,
	summarize,
	type DesignConfig,
	type Violation
} from './design-rules.mts';

const HERE = dirname(fileURLToPath(import.meta.url));
const EXIT_BLOCK = 2;

export type HookPayload = {
	cwd?: string;
	tool_name?: string;
	tool_input?: { file_path?: string; path?: string };
};

/** Resultado de um modo do verificador: o que escrever e com que código sair. */
export type RunResult = { code: number; stdout: string; stderr: string };

const result = (code: number, stdout = '', stderr = ''): RunResult => ({ code, stdout, stderr });

/** Lê a config: `--config <arquivo>` ou o `design.config.json` ao lado deste script. */
export function loadConfig(argv: string[] = process.argv): DesignConfig {
	const flag = argv.indexOf('--config');
	const path = flag > -1 ? resolve(argv[flag + 1]) : join(HERE, 'design.config.json');
	return JSON.parse(readFileSync(path, 'utf8')) as DesignConfig;
}

function* walk(dir: string): Generator<string> {
	let entries: string[];
	try {
		entries = readdirSync(dir);
	} catch {
		return;
	}
	for (const name of entries) {
		if (name === 'node_modules' || name.startsWith('.')) continue;
		const full = join(dir, name);
		if (statSync(full).isDirectory()) yield* walk(full);
		else yield full;
	}
}

/**
 * Modo hook (PostToolUse): confere só o arquivo que a ferramenta acabou de editar. Erro →
 * código 2 e violações no stderr (o Claude Code devolve ao agente). Aviso → contexto adicional.
 */
export function runHook(payload: HookPayload, config: DesignConfig, root: string): RunResult {
	const target = payload.tool_input?.file_path ?? payload.tool_input?.path;
	if (!target) return result(0);

	const path = relative(root, resolve(root, target));
	if (path.startsWith('..') || !isInScope(path, config)) return result(0);

	let content: string;
	try {
		content = readFileSync(resolve(root, path), 'utf8');
	} catch {
		return result(0); // arquivo apagado ou movido
	}

	const violations = checkSource(path, content, config);
	const errors = violations.filter((v) => v.severity === 'error');
	const warnings = violations.filter((v) => v.severity === 'warning');

	if (errors.length) {
		return result(
			EXIT_BLOCK,
			'',
			`O arquivo editado viola o design de "${config.brand}". Corrija antes de seguir:\n\n${formatViolations(path, violations)}\n`
		);
	}
	if (warnings.length) {
		const additionalContext = `Avisos de design em ${path} (corrija se fizer sentido):\n${formatViolations(path, warnings)}`;
		return result(
			0,
			JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext } })
		);
	}
	return result(0);
}

/** Modo varredura (CI, pre-push): todas as pastas da config. Sai com 1 se houver erro. */
export function runScan(config: DesignConfig, root: string, json = false): RunResult {
	const report: { path: string; violations: Violation[] }[] = [];

	for (const dir of config.scan.dirs) {
		for (const full of walk(resolve(root, dir))) {
			const path = relative(root, full);
			if (!isInScope(path, config)) continue;
			const violations = checkSource(path, readFileSync(full, 'utf8'), config);
			if (violations.length) report.push({ path, violations });
		}
	}

	const all = report.flatMap((r) => r.violations);
	const errors = all.filter((v) => v.severity === 'error').length;
	const details = json
		? JSON.stringify(report, null, 2) + '\n'
		: report.map(({ path, violations }) => formatViolations(path, violations) + '\n\n').join('');
	const total = `${errors} erro(s), ${all.length - errors} aviso(s) em ${report.length} arquivo(s).\n`;
	return result(errors > 0 ? 1 : 0, details + total);
}

/** Escolhe o modo pelos argumentos. `stdin` só é lido no modo hook. */
export async function run(
	argv: string[],
	readStdin: () => Promise<string>,
	root: string
): Promise<RunResult> {
	const config = loadConfig(argv);
	if (argv.includes('--summary')) return result(0, summarize(config) + '\n');
	if (argv.includes('--hook')) {
		const payload = JSON.parse((await readStdin()) || '{}') as HookPayload;
		return runHook(payload, config, process.env.CLAUDE_PROJECT_DIR ?? payload.cwd ?? root);
	}
	return runScan(config, process.env.CLAUDE_PROJECT_DIR ?? root, argv.includes('--json'));
}

function readProcessStdin(): Promise<string> {
	return new Promise((done) => {
		let data = '';
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', (chunk) => (data += chunk));
		process.stdin.on('end', () => done(data));
	});
}

/* Executado direto (`node check-design.mts`), não importado por um teste. */
const isEntryPoint =
	process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntryPoint) {
	const { code, stdout, stderr } = await run(process.argv, readProcessStdin, process.cwd());
	process.stdout.write(stdout);
	process.stderr.write(stderr);
	process.exitCode = code;
}
