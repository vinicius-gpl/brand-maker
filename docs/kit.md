# O kit de design

O botão **Baixar** gera um zip no navegador. Ele traz só o que o projeto precisa: **CSS**,
**skills** e **scripts `.mjs`** que o agente roda para garantir que o design é seguido.

```
minha-marca-design-kit/
├── README.md
├── .claude/
│   ├── settings.json                    liga os hooks
│   ├── skills/
│   │   ├── brand-design/SKILL.md        identidade, tokens, padrão, proibições
│   │   └── ux-laws/SKILL.md             as 7 leis de UX como regras
│   ├── commands/
│   │   ├── design-da-marca.md           atalho em português → brand-design
│   │   └── leis-de-ux.md                atalho em português → ux-laws
│   └── hooks/design/
│       ├── design-rules.mjs             as regras (sem dependência)
│       ├── check-design.mjs             verificador: varredura, hook e resumo
│       ├── *.test.mjs                   testes (node --test)
│       └── design.config.json           limites escolhidos na tela
└── design/
    ├── tokens.css                       tokens em CSS puro, claro e escuro
    ├── tailwind.css                     tokens + tema do Tailwind v4
    ├── reference.css                    CSS de referência do padrão e do acabamento
    └── logo.*                           a logo, se você enviou uma
```

## Skills e atalhos

As skills têm nome em inglês. Cada uma ganha um atalho em português em `.claude/commands/`, que
só delega (skill não aceita apelido). Chame por qualquer um dos dois nomes:

| Skill           | Atalho             |
| --------------- | ------------------ |
| `/brand-design` | `/design-da-marca` |
| `/ux-laws`      | `/leis-de-ux`      |

## Hooks

- **SessionStart**: `check-design.mjs --summary` põe as regras no contexto do agente.
- **PostToolUse** (`Edit|MultiEdit|Write`): `check-design.mjs --hook` confere o arquivo editado.
  Erro bloqueia (código 2) e volta para o agente corrigir na mesma tarefa; aviso entra como contexto.

O verificador pega cor crua fora dos tokens, preto/branco puro, valores arbitrários do Tailwind,
alvo de clique menor que o limite (Fitts), excesso de opções (Hick), mais de um destaque
(Von Restorff) e outras regras das leis ligadas.

## Instalar num projeto

1. Copie `.claude/` para a raiz do projeto. Se já existir um `.claude/settings.json`, junte o
   bloco `hooks` em vez de sobrescrever.
2. Tailwind v4: copie `design/tailwind.css` para `src/` e importe depois de `@import 'tailwindcss';`.
   CSS puro: use `design/tokens.css`.
3. Node 22 ou mais novo. Não há nada para instalar.
4. Ajuste `scan.dirs` e `scan.tokenFiles` em `design.config.json` se o código não estiver em `src/`.

```bash
node .claude/hooks/design/check-design.mjs              # varre o projeto (CI, pre-push)
node --test ".claude/hooks/design/*.test.mjs"           # testa as regras
```

## De onde vêm os `.mjs`

No repositório os scripts são TypeScript (`brand-maker/src/lib/kit/agent/*.mts`), testados com
`node --test`. No build, o plugin `agent-mjs` do `vite.config.ts` tira os tipos e troca os imports
para `.mjs`. O e2e do kit baixa o zip e roda o hook e os testes que vão dentro dele.
