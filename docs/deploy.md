# Publicação

O build é um site estático (`brand-maker/build/`). Duas variáveis controlam o endereço:

| Variável    | Para quê                                                         | Exemplo                                 |
| ----------- | ---------------------------------------------------------------- | --------------------------------------- |
| `BASE_PATH` | Caminho quando o site não está na raiz do domínio                | `/brand-maker`                          |
| `SITE_URL`  | Endereço público completo: canonical, metatags, sitemap e robots | `https://usuario.github.io/brand-maker` |

## GitHub Pages (principal)

O workflow `.github/workflows/deploy-pages.yml` roda lint, typecheck, testes com cobertura e e2e,
e só então publica, a cada push na `main`. Publicado em
**https://brand-maker.vinicius-gpl.com**.

### Domínio próprio

O endereço vem da variável de repositório `CUSTOM_DOMAIN`. Com ela, o build usa `BASE_PATH` vazio
e `SITE_URL=https://<CUSTOM_DOMAIN>`; sem ela, cai em `https://<usuario>.github.io/<repo>/`.

```bash
gh variable set CUSTOM_DOMAIN --body brand-maker.vinicius-gpl.com
gh api -X PUT repos/vinicius-gpl/brand-maker/pages -f cname=brand-maker.vinicius-gpl.com
```

No DNS (Cloudflare), um registro **CNAME** `brand-maker` → `vinicius-gpl.github.io`, em
**DNS only** (nuvem cinza) até o GitHub emitir o certificado; depois ligue **Enforce HTTPS**:

```bash
gh api -X PUT repos/vinicius-gpl/brand-maker/pages -F https_enforced=true
```

### Repositório novo

1. Suba o repositório (a raiz, com `brand-maker/`, `docker/` e `docs/`).
2. Ative o Pages pelo Actions: `gh api -X POST repos/<usuario>/<repo>/pages -f build_type=workflow`.
3. Push na `main`.

## Docker

A imagem compila o app com Node e entrega com Caddy (a imagem final não leva Node). Arquivos em
`docker/`: `dockerfile`, `caddyfile`, `compose.yaml` e `dockerfile.dockerignore`.

```bash
# da raiz do repositório
docker compose -f docker/compose.yaml up --build -d          # http://localhost:8080
SITE_URL=https://brand.exemplo.com docker compose -f docker/compose.yaml up --build -d

# sem compose
docker build -f docker/dockerfile --build-arg SITE_URL=https://brand.exemplo.com -t brand-maker .
docker run -d -p 8080:80 brand-maker
```

O Caddy comprime (zstd/gzip), dá cache de um ano aos arquivos com hash (`/_app/immutable/`),
revalida HTML, sitemap e robots a cada visita e manda cabeçalhos de segurança. Para o Caddy cuidar
do HTTPS sozinho, troque `:80` pelo domínio no `caddyfile`.

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

No GitHub Pages de repositório, buscadores só leem o `robots.txt` da raiz do domínio
(`usuario.github.io/robots.txt`). Então envie o sitemap direto no
[Google Search Console](https://search.google.com/search-console): `https://<usuario>.github.io/<repo>/sitemap.xml`.

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
