# Desenvolvimento

Tudo roda dentro de `brand-maker/` (o app). Requer **Node 22.18+**.

```bash
cd brand-maker
npm install
npx playwright install chromium   # só na primeira vez, para os e2e

npm run dev            # http://localhost:5173
npm run check          # svelte-check (TypeScript)
npm run lint           # Prettier + ESLint
npm test               # Vitest + testes do verificador do kit
npm run test:coverage  # o mesmo, com cobertura mínima de 80%
npm run test:e2e       # Playwright contra o build de produção (desktop e celular)
npm run build          # site estático em build/
```

## Stack

SvelteKit 3 + Svelte 5 (runes) + TypeScript + Tailwind v4, `adapter-static`. Componentes com
bits-ui (select, tooltip, abas), ícones Lucide, `cn()` (clsx + tailwind-merge), fflate (zip) e
Mustache (templates das skills). Sem React, Vue ou Radix.

## Estrutura

```
brand-maker/src/
├── routes/
│   ├── +page.svelte              a página (editor, prévia, seções, bottom sheet)
│   ├── +layout.svelte            metatags de SEO e compartilhamento
│   ├── sitemap.xml/+server.ts    sitemap gerado no build
│   └── robots.txt/+server.ts     robots com o endereço do sitemap
└── lib/
    ├── types/                    tipos do domínio (*.type.ts)
    ├── theme/                    paletas, neutros, fontes, padrões, acabamentos, leis de UX
    │   └── preview/              CSS da prévia: base, @pattern por padrão, @style por acabamento
    ├── utils/                    cor, tokens, harmonia, slug, arquivo, cn, movimento
    ├── seo/                      endereço público, sitemap, robots, JSON-LD
    ├── hooks/use-*/              estado: use-design, use-kit, use-toast
    ├── components/brand-*/       componentes (props em data / ui / state / actions)
    └── kit/
        ├── agent/                verificador em TS que vai no zip como .mjs (+ testes)
        ├── generators/           geram cada arquivo do kit
        ├── templates/            Markdown (Mustache) das skills, atalhos e README
        └── kit.util.ts           monta a lista de arquivos e o zip
```

## Testes

| Camada     | Onde                                     | O que cobre                                                                           |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| Unitário   | `src/**/*.test.ts`                       | cor, contraste, tokens, harmonias, kit, SEO; todas as paletas × neutros × modos       |
| Estado     | `src/lib/hooks/**/*.svelte.test.ts`      | `DesignState`: escolhas, teclado, salvar e restaurar                                  |
| Componente | `src/lib/components/**/*.svelte.test.ts` | cada componente com Testing Library                                                   |
| Página     | `src/routes/page.svelte.test.ts`         | integração da página inteira                                                          |
| Kit        | `src/lib/kit/agent/*.test.mts`           | cada regra (caso feliz e triste) e o verificador em projetos temporários              |
| E2E        | `e2e/*.e2e.ts`                           | fluxo completo, tela cheia, bottom sheet, kit baixado rodando, SEO, layout no celular |

Cobertura mínima de **80%** (linhas, funções, ramificações), no Vitest e no Node. Abaixo disso o
comando falha, e o workflow não publica.

## Como estender

- **Paleta**: um item em `theme/palettes.ts` (três cores no tom do tema escuro; o claro é derivado).
- **Padrão**: um item em `theme/patterns.ts`, o ícone em `theme/icons.ts` e, se precisar, um trecho
  `/* @pattern <id> */` em `theme/preview/patterns.css`.
- **Acabamento**: um item em `theme/foundation.ts` e um trecho `/* @style <id> */` em
  `theme/preview/styles.css`.
- **Regra do verificador**: em `kit/agent/design-rules.mts`, com teste feliz e triste em
  `design-rules.test.mts`.
