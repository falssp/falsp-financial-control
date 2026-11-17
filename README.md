# falsp Financial Control

Ferramentas de controle e análise financeira pessoal e empresarial — HTML puro, sem backend, hospedado no GitHub Pages.

---

## Ferramentas

| Pasta | Ferramenta | Link |
|---|---|---|
| `controle-financeiro/` | App de controle financeiro PF + PJ | [Abrir →](https://falssp.github.io/falsp-financial-control/controle-financeiro/) |
| `calc-clt-pj/` | Calculadora CLT vs PJ | [Abrir →](https://falssp.github.io/falsp-financial-control/calc-clt-pj/) |

---

## Calculadora CLT vs PJ

**URL:** https://falssp.github.io/falsp-financial-control/calc-clt-pj/

Calcula e compara remuneração líquida entre CLT e PJ, com tabelas atualizadas para 2026 (Lei 15.270/2025 — IRRF, INSS progressivo, DAS MEI).

### Funcionalidades

- **Comparativo CLT × PJ** — total mensal médio com todos os direitos (13º, férias + ⅓, FGTS, PLR, benefícios)
- **Ponto de equilíbrio** — NF mínima para o PJ empatar o pacote CLT (cálculo iterativo)
- **Regimes tributários** — MEI, Simples III/V, Lucro Presumido, Autônomo/RPA (INSS 11% + IRRF automáticos no RPA)
- **Simulador de reajuste** — slider de % de aumento recalcula CLT, break-even e flag "PJ ainda vale?" em tempo real
- **Alertas automáticos** — limite MEI ultrapassado · faixa Simples Nacional superada
- **Cenários** — salva até 5 cenários no navegador com nome + nota livre · exporta/importa como `.json` · comparação lado a lado · gráfico de break-even por cenário
- **PDF dinâmico** — exporta com nome do cenário, bruto, NF e regime no título do arquivo
- **Compartilhar link** — URL codifica todos os campos para enviar ou guardar como favorito
- **Análise IA** — Gemini (gratuito), Claude ou OpenAI analisam o cenário e recomendam CLT ou PJ
- **Dark / light mode** — segue preferência do sistema ou toggle manual
- **FAQ** — dúvidas frequentes com busca e filtro por categoria

### Tabelas vigentes (2026)

| Tributo | Referência |
|---|---|
| INSS | Portaria MPS — 4 faixas: 7,5% · 9% · 12% · 14% (teto R$ 8.475,55) |
| IRRF | Lei 15.270/2025 — isento efetivo até R$ 5.000; 7,5% · 15% · 22,5% · 27,5% |
| DAS MEI | R$ 86,05 serviços · R$ 82,05 comércio · R$ 87,05 ambos · limite R$ 81k/ano |

---

## Deploy

O site é servido diretamente pelo **GitHub Pages** a partir da branch `main`, sem build step.

```
Repositório : https://github.com/falssp/falsp-financial-control
Branch      : main
Pasta raiz  : / (root)
URL base    : https://falssp.github.io/falsp-financial-control/
```

Para publicar uma alteração:

```bash
git add .
git commit -m "descrição da mudança"
git push origin main
```

O GitHub Pages propaga em ~1–2 minutos. Nenhuma configuração de CI/CD necessária.

---

## Tecnologia

HTML + CSS + JavaScript puro — arquivos standalone, sem dependências externas, sem backend, sem build.
