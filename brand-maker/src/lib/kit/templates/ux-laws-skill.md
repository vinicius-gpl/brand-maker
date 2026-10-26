---
name: ux-laws
description: As leis de UX que {{brand}} exige em toda tela — Hick (poucas opções), Fitts (alvos grandes e perto), Jakob (padrões conhecidos), Miller (agrupar em blocos), Von Restorff (um destaque por vez), Conectividade Uniforme (agrupar visualmente o que é relacionado) e Tesler (o sistema absorve a complexidade). Use ao desenhar, criar ou revisar qualquer tela, formulário, menu, lista ou fluxo.
---

# Leis de UX de {{brand}}

Cada lei abaixo vira **prática obrigatória**. As que têm checagem automática são conferidas
pelo hook de design a cada arquivo editado (`{{hooksDir}}/check-design.mjs`); as outras
dependem de você. Os limites numéricos vêm de `{{hooksDir}}/design.config.json`.

A checagem é estática: ela pega o erro comum (botão de 24px, `<div>` clicável, formulário
de 12 campos soltos), mas **não prova que a tela está boa**. Revise o fluxo com estas leis em
mente mesmo quando o verificador passar.

{{#laws}}
---

## {{name}}

> {{principle}}

**O que exigir**

{{#practices}}
- {{{.}}}
{{/practices}}
{{#hasParams}}

**Limites deste projeto**: {{#params}}{{label}} = {{value}} {{unit}}; {{/params}}
{{/hasParams}}
{{#hasChecks}}

**Checagem automática**

| Regra | Nível | O que pega |
| ----- | ----- | ---------- |
{{#checks}}
| `{{id}}` | {{severity}} | {{description}} |
{{/checks}}
{{/hasChecks}}
{{^hasChecks}}

**Checagem automática**: nenhuma; é revisão humana.
{{/hasChecks}}

{{/laws}}
{{#disabled.length}}
---

## Desligadas neste projeto

{{#disabled}}
- {{name}}
{{/disabled}}

Para religar, mude `enabled` em `{{hooksDir}}/design.config.json` (ou gere o kit de novo).
{{/disabled.length}}
