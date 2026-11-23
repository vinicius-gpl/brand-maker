# Publicação

O build é um site estático (`brand-maker/build/`). Duas variáveis controlam o endereço:

| Variável    | Para quê                                                         | Exemplo                                 |
| ----------- | ---------------------------------------------------------------- | --------------------------------------- |
| `BASE_PATH` | Caminho quando o site não está na raiz do domínio                | `/brand-maker`                          |
| `SITE_URL`  | Endereço público completo: canonical, metatags, sitemap e robots | `https://usuario.github.io/brand-maker` |

## Komodo, no hetzner (principal)

Publicado em **https://brand-maker.vinicius-gpl.com**, no servidor hetzner do
[config](https://github.com/vinicius-gpl/config), atrás do Caddy de lá. Tudo do deploy está em
[`.komodo/`](../.komodo/). A cada push na `main`, o webhook do GitHub dispara a Procedure
`hetzner_brand-maker` do Komodo:

1. **Pull**: o Repo `hetzner_brand-maker` atualiza o clone da `main` no hetzner.
2. **Build**: o Build `hetzner_brand-maker` constrói o `brand-maker/.config/docker/dockerfile` no
   próprio hetzner, com `BASE_PATH` vazio e `SITE_URL=https://brand-maker.vinicius-gpl.com`. Sem
   registry: a imagem fica só no hetzner, como `brand-maker:<commit curto>-hetzner`.
3. **Deploy**: a Stack `hetzner_brand-maker` sobe o `.komodo/brand-maker.compose.yml` no Swarm, e o
   `route.sh` grava o `brand-maker.caddy` no Caddy do servidor.

Para voltar à versão anterior: Action `hetzner_brand-maker_rollback`. Os testes (lint, tipos,
cobertura e e2e) rodam no `.github/workflows/brand-maker-tests.yml`, em todo PR e push.

### Antes do primeiro deploy

- DNS (Cloudflare): `brand-maker` vira registro **A** para o IP do hetzner, em modo "DNS only", no
  lugar do CNAME do GitHub Pages. Depois, desligue o Pages do repositório.
- No Komodo: crie a Sync `brand-maker` (repo `vinicius-gpl/brand-maker`, branch `main`, arquivo
  `.komodo/komodo.toml`), execute e cadastre os dois webhooks (*Settings → Webhooks*, JSON, evento
  *push*, com o segredo dos webhooks do Komodo):

| Webhook | URL |
|---|---|
| Sync (aplica o `.komodo/komodo.toml`) | `https://komodo.vinicius-gpl.com/listener/github/sync/<id da sync brand-maker>/sync` |
| Procedure (publica o app) | `https://komodo.vinicius-gpl.com/listener/github/procedure/hetzner_brand-maker/main` |

## Docker

A imagem compila o app com Node e entrega com Caddy (a imagem final não leva Node), na porta 3000
como em todos os projetos. Arquivos em `brand-maker/.config/docker/`: `dockerfile`, `caddyfile` e
`compose.yml`; o contexto do build é a pasta `brand-maker/` (com o `.dockerignore` dela).

```bash
# da raiz do repositório
docker compose -f brand-maker/.config/docker/compose.yml up --build -d          # http://localhost:8080
SITE_URL=https://brand.exemplo.com docker compose -f brand-maker/.config/docker/compose.yml up --build -d

# sem compose
docker build -f brand-maker/.config/docker/dockerfile --build-arg SITE_URL=https://brand.exemplo.com -t brand-maker brand-maker
docker run -d -p 8080:3000 brand-maker
```

O Caddy comprime (zstd/gzip), dá cache de um ano aos arquivos com hash (`/_app/immutable/`),
revalida HTML, sitemap e robots a cada visita e manda cabeçalhos de segurança. Para o Caddy cuidar
do HTTPS sozinho, troque `:3000` pelo domínio no `caddyfile`.

## Cloudflare Workers (alternativa)

A config fica em `brand-maker/wrangler.jsonc` (só assets estáticos):

```bash
cd brand-maker
SITE_URL=https://brand-maker.<conta>.workers.dev npm run build && npx wrangler deploy
```

## SEO e compartilhamento

- **Metatags**: título, descrição, canonical, Open Graph e Twitter Card em `src/routes/+layout.svelte`,
  com textos em `src/lib/seo/seo.ts`.
- **Imagem de compartilhamento**: `static/og.jpg`, 1200×630 e ~70 KB. LinkedIn, WhatsApp, X e
  Facebook mostram a prévia; o WhatsApp ignora imagens acima de ~300 KB (um e2e garante o limite).
- **Dados estruturados**: JSON-LD `WebApplication` (gratuito, pt-BR).
- **sitemap.xml**: gerado no build. O site tem uma URL (as seções são âncoras), então o sitemap
  lista só a canônica, com `lastmod` do build e a imagem. Sem `changefreq` nem `priority`,
  que o Google ignora.
- **robots.txt**: libera tudo e aponta o sitemap com URL absoluta.

Envie o sitemap no [Google Search Console](https://search.google.com/search-console):
`https://brand-maker.vinicius-gpl.com/sitemap.xml`.

### Gerar a imagem de novo

Com um print da tela (PNG) e ffmpeg:

```bash
# imagem de compartilhamento: 1200x630, corte central
ffmpeg -i print.png -vf "scale=-2:630:flags=lanczos,crop=1200:630:(iw-1200)/2:0" -q:v 5 brand-maker/static/og.jpg

# imagens das docs: 1600px de largura
ffmpeg -i print.png -vf "scale=1600:-2:flags=lanczos" -q:v 4 docs/images/editor.jpg
```

O banner do README (1920x1080) é montado em HTML: o print vai numa moldura com o logo e o título.
Corte as margens vazias do print, renderize com o Chrome e comprima:

```bash
cd docs/banner
magick print.png -crop 1320x943+250+0 +repage shot.png   # print de 1832x943
google-chrome --headless=new --hide-scrollbars --window-size=1920,1080 \
  --virtual-time-budget=5000 --screenshot=banner.png "file://$PWD/banner.html"
ffmpeg -i banner.png -q:v 3 banner.jpg && rm shot.png banner.png
```
