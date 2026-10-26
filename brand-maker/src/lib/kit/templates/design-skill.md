---
name: {{skill}}
description: Identidade visual de {{brand}} — padrão {{pattern.name}}, paleta {{paletteName}}, tipografia {{fontName}}, tokens de cor e o que é proibido (cor crua, preto e branco puros). Use ANTES de criar ou mudar qualquer tela, componente, cor, espaçamento ou estilo, e ao revisar se uma tela segue a marca.
---

# Design de {{brand}}

Esta skill é a **fonte da verdade visual**. A skill `ux-laws` diz como a tela se comporta
(tamanho de alvo, quantidade de opções, agrupamento); aqui está **como ela parece**. Um hook
confere cada arquivo editado (§7): violação de nível erro volta para você corrigir na hora.

Antes de escrever qualquer tela, responda:

1. **A cor vem de um token?** (§2) Nunca hex, rgb ou paleta padrão do Tailwind.
2. **A forma segue o padrão {{pattern.name}}?** (§3: raio por papel, borda, sombra, altura)
3. **A tela respeita as leis de UX?** (skill `ux-laws`)

---

## 1. Identidade

| Papel | Escuro | Claro | Como texto (escuro / claro) |
| ----- | ------ | ----- | --------------------------- |
{{#keyColors}}
| **{{label}}** | `{{dark}}` | `{{light}}` | `{{darkText}}` / `{{lightText}}` |
{{/keyColors}}

Paleta **{{paletteName}}** (grupo {{paletteGroup}}), neutros **{{neutralName}}**.

> {{tagline}}

{{description}}
{{#logoFile}}

Logo: `{{logoFile}}`. Use o arquivo como está: nunca recolorir, esticar ou recriar a logo.
{{/logoFile}}
{{^logoFile}}

Sem logo definida: a marca aparece como nome escrito, com as iniciais num selo na cor primária.
{{/logoFile}}

## 2. Tokens

Todas as cores da interface saem destes tokens. No Tailwind viram classes (`bg-primary`,
`text-muted-foreground`, `border-border`); no CSS, `var(--primary)`. O tema escuro é marcado por
`data-theme="dark"` no `<html>`.

| Token | Papel | Claro | Escuro |
| ----- | ----- | ----- | ------ |
{{#tokens}}
| `{{name}}` | {{role}} | `{{light}}` | `{{dark}}` |
{{/tokens}}

Regras de uso:

- **`primary` cheio é raro**: uma ação primária por tela. Link e texto na cor da marca usam
  `primary-strong`, que passa no contraste.
- **`*-soft` é fundo, `*` é texto**: selo de sucesso = `bg-success-soft text-success`.
- **Texto sobre cor cheia usa o `*-foreground` dela**, nunca uma cor escolhida a olho.
- **Cor nova entra primeiro no tokens.css**, com nome de papel (`--warning`), não de cor (`--amarelo`).

## 3. Padrão: {{pattern.name}}

{{pattern.summary}}
{{#pattern.inspiredBy}}

Inspirado em **{{name}}** ({{url}}). É uma leitura livre do guia público, não a implementação
oficial: sem logo, sem fonte proprietária e com as regras desta marca por cima (alvo mínimo de
40px e sombra sem preto puro).
{{/pattern.inspiredBy}}

{{#pattern.rules}}
- {{{.}}}
{{/pattern.rules}}

Forma por papel (tokens `--shape-*`, no Tailwind `rounded-<papel>`):

| Papel | Raio | Classe |
|---|---|---|
{{#pattern.shapes}}
| {{label}} | `{{value}}` | `rounded-{{role}}` |
{{/pattern.shapes}}

- Controles com `{{pattern.controlHeight}}` de altura (`h-control`, token `--control-height`).
- Campos de texto: {{pattern.inputStyle}}.
- Sombra de cartão: `shadow-card` (`{{pattern.cardShadow}}`).
- Movimento: `{{pattern.motion}}` (`ease-brand`, `--motion-duration`).
- Nunca raio, sombra ou altura arbitrários (`rounded-[13px]`): use o papel certo.
- Referência de implementação: `design/reference.css` (classes `.pv-*` da prévia).
{{#hasFinish}}

**Acabamento {{styleName}}**: {{styleSummary}} É efeito por cima do padrão; não muda forma
nem borda. Use com moderação e no produto inteiro, nunca numa tela só.
{{/hasFinish}}

## 4. Tipografia

- Texto: `{{{fontSans}}}`
- Títulos: `{{{fontHeading}}}`
- Escala do Tailwind (`text-sm`, `text-base`, `text-xl`…); nunca tamanho arbitrário em px.
- Corpo de texto com no mínimo 16px em formulário no celular (evita zoom automático).

## 5. Proibido

| Proibido                                                       | Por quê                                     | No lugar                                   |
| -------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------ |
| `#000`, `#fff`, `black`, `white`, `bg-black`, `text-white`     | Regra da marca: nunca preto ou branco puros | `foreground`, `background`, `*-foreground` |
| Hex, `rgb()`, `hsl()`, `oklch()` fora do tokens.css            | A cor sai da marca e não acompanha o tema   | Token                                      |
| Paleta padrão do Tailwind (`bg-blue-500`, `text-gray-600`)     | Mesma coisa                                 | Token                                      |
| Valor arbitrário de cor, raio, sombra ou fonte (`text-[13px]`) | Foge da escala                              | Classe da escala ou token novo             |
| Mais de uma ação primária na mesma tela                        | Efeito Von Restorff                         | Uma primária, o resto secundário           |

## 6. Leis de UX

{{#laws}}
- **{{name}}**: {{principle}}
{{/laws}}

O detalhe, com o que exigir e o que o verificador pega, está na skill `ux-laws`.

## 7. Checagem automática

O verificador mora em `{{hooksDir}}/` (JavaScript puro, sem dependência, Node 22+):

```bash
node {{hooksDir}}/check-design.mjs            # varre o projeto (CI, pre-push)
node {{hooksDir}}/check-design.mjs --json     # o mesmo, em JSON
node --test "{{hooksDir}}/*.test.mjs"            # testes das regras e do verificador
```

- **Hook `PostToolUse`** (`.claude/settings.json`): depois de todo `Edit`/`Write`, confere o
  arquivo. Erro → você recebe a regra, a linha e a dica, e **corrige antes de seguir**. Aviso →
  chega como contexto.
- **Hook `SessionStart`**: o resumo das regras entra no contexto de toda sessão.
- Limites e leis ligadas ficam em `{{hooksDir}}/design.config.json`.

Caso justificado (raro) se silencia na linha de cima, **com o motivo**:

```html
<!-- design-ignore-next-line fitts/target-size: ícone dentro de um alvo de 40px -->
```

Nunca silencie para "fazer passar": corrija.

## 8. Antes de entregar

- [ ] `node {{hooksDir}}/check-design.mjs` sem erro.
- [ ] Tela conferida no tema claro **e** no escuro.
- [ ] Uma ação primária por tela; destaque usado uma vez.
- [ ] Todo alvo de toque com {{minTargetPx}}px ou mais; todo campo com rótulo.
