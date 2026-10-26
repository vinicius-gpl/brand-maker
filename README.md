# Brand Maker

Monte a identidade visual de uma marca na tela e baixe um **kit de design** que prende o agente
(Claude Code) ao padrão: skills, hooks e scripts `.mjs` que conferem cada arquivo editado, mais
os tokens em CSS e Tailwind.

![Editor do Brand Maker: identidade e cores à esquerda, prévia ao vivo à direita e o bottom sheet de padrão, acabamento e cor embaixo](docs/images/editor.jpg)

- **30 paletas** em 7 grupos (pastel, neon, terroso, joia, corporativo, metálico, iridescente),
  cores editáveis, harmonias e paleta aleatória que já sai dentro das regras.
- **10 padrões de interface** (Simples, Material 3 Expressive, Fluent 2, Carbon, Primer, shadcn,
  Cupertino, GOV.UK, Brutalista, Blueprint) e **7 acabamentos** (suave, neon, texturizado, vidro,
  metálico, holográfico, papel).
- **Regras**: nunca preto nem branco puros, contraste AA calculado ao vivo e as 7 leis de UX com
  limites ajustáveis.
- 100% estático: o zip é gerado no navegador, nada sai da máquina de quem usa.

## Estrutura do repositório

```
brand-maker/
├── brand-maker/   o app (SvelteKit 3 + Svelte 5 + TypeScript + Tailwind v4)
├── docker/        imagem com Caddy (dockerfile, caddyfile, compose.yaml)
├── docs/          documentação e imagens
└── .github/       workflow que testa e publica no GitHub Pages
```

## Começar

```bash
cd brand-maker
npm install
npm run dev        # http://localhost:5173
```

Ou com Docker, da raiz do repositório:

```bash
docker compose -f docker/compose.yaml up --build -d   # http://localhost:8080
```

## Documentação

| Guia                                      | Para quê                                                    |
| ----------------------------------------- | ----------------------------------------------------------- |
| [Como usar](docs/usage.md)                | Montar a marca: identidade, cores, padrão, acabamento, regras |
| [O kit de design](docs/kit.md)            | O que vem no zip e como instalar num projeto                |
| [Desenvolvimento](docs/development.md)    | Comandos, estrutura do código, testes e como estender       |
| [Publicação](docs/deploy.md)              | GitHub Pages, Docker, Cloudflare e SEO (sitemap, metatags)  |
