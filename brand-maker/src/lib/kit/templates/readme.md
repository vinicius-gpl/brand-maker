# Kit de design · {{brand}}

Padrão **{{patternName}}**, paleta **{{paletteName}}**, acabamento **{{styleName}}**, tipografia **{{fontName}}**, neutros
**{{neutralName}}**. Gerado em {{generatedAt}} pelo brand design kit.

## O que tem aqui

| Caminho | Para que serve |
| ------- | -------------- |
{{#files}}
| `{{path}}` | {{description}} |
{{/files}}

## Como instalar num projeto

1. **Copie a pasta `.claude/` para a raiz do projeto.** Se o projeto já tiver um
   `.claude/settings.json`, junte o bloco `hooks` deste com o de lá em vez de sobrescrever.
2. **Copie os tokens**:
   - Tailwind v4: `design/tailwind.css` para `src/`, importado logo depois de `@import 'tailwindcss';`.
   - CSS puro: `design/tokens.css`.
3. **Confira o Node**: os hooks são JavaScript puro (`.mjs`), sem dependência; basta o Node
   **22 ou mais novo** (`node --version`). Não há nada para instalar.
4. **Ajuste o escopo** em `.claude/hooks/design/design.config.json`: `scan.dirs` (padrão `src`)
   e `scan.tokenFiles` (onde cor crua é permitida).

## Como funciona

- **Skills** (`.claude/skills/`, nomes em inglês): `{{skill}}` ensina a marca ao agente;
  `{{uxSkill}}` ensina as leis de UX como regras concretas.
- **Atalhos em português** (`.claude/commands/`): chame pelo nome em inglês (`/{{skill}}`,
  `/{{uxSkill}}`) ou em português (`/{{shortcut}}`, `/{{uxShortcut}}`); os dois fazem o mesmo.
- **Hook `SessionStart`**: no início de toda sessão, o resumo das regras entra no contexto.
- **Hook `PostToolUse`**: depois de cada `Edit`/`Write`, o arquivo é conferido. Violação de nível
  erro volta para o agente com linha e dica, e ele corrige antes de seguir.

Rodar à mão ou no CI:

```bash
node .claude/hooks/design/check-design.mjs         # sai com código 1 se houver erro
node --test ".claude/hooks/design/*.test.mjs"     # testes das regras e do verificador
```

Sugestão de script no `package.json`:

```json
"check:design": "node .claude/hooks/design/check-design.mjs"
```

## Regras ativas

{{#rules}}
- `{{id}}` ({{severity}}) — {{description}}
{{/rules}}
