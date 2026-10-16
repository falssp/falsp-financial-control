# Manutenção — Calculadora CLT vs PJ

> Guia de atualização anual e referência técnica. Atualizar em janeiro de cada ano.

---

## Checklist anual (janeiro)

### 1. Tabela INSS
**Fonte oficial:** https://www.gov.br/inss/pt-br/central-de-conteudos/publicacoes/tabelas/tabela-de-contribuicao-mensal  
**Quando muda:** portaria publicada em dezembro/janeiro, valendo a partir de janeiro  
**O que muda:** faixas salariais e teto (seguem o reajuste do salário mínimo)  
**O que verificar:** salário mínimo do ano, teto do INSS, 4 faixas com alíquotas 7,5% / 9% / 12% / 14%

**Onde editar em `index.html`:**
```js
const INSS_TABELAS = {
  2026: [[0,1621,.075],[1621,2902.84,.09],[2902.84,4354.27,.12],[4354.27,8475.55,.14]],
  2027: [[0, MINIMO, .075], ...], // ← adicionar linha com os novos valores
};
```
Formato de cada faixa: `[início, fim, alíquota]` — início inclusive, fim exclusive.

---

### 2. Tabela IRRF
**Fonte oficial:** https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas  
**Quando muda:** normalmente uma vez por ano (lei ordinária ou MP)  
**O que muda:** faixas de base de cálculo, deduções, valores de isenção e redução progressiva

**O que verificar:**
- Faixa isenta (ex: até R$ 2.428,80 em 2026)
- 4 faixas: 7,5% / 15% / 22,5% / 27,5% com parcelas a deduzir
- Redução progressiva: teto de isenção efetiva (ex: R$ 5.000), teto da redução decrescente (ex: R$ 7.350), coeficientes da fórmula

**Onde editar em `index.html`:**
```js
const IRRF_TABELAS = {
  2026: { tb:[...], isento:2428.80, redMax:5000, redLim:7350, redK:978.62, redR:0.133145 },
  2027: { tb:[...], isento:X, redMax:X, redLim:X, redK:X, redR:X }, // ← adicionar
};
```

---

### 3. DAS MEI
**Fonte oficial:** https://www.gov.br/pt-br/servicos/emitir-das-para-pagamento-de-tributos-do-mei  
**Quando muda:** janeiro, junto com o salário mínimo (base INSS = 5% do mínimo)  
**Componentes:**
- INSS: 5% × salário mínimo (ex: 5% × R$ 1.621 = R$ 81,05 em 2026)
- ICMS: R$ 1,00 fixo (comércio/indústria)
- ISS: R$ 5,00 fixo (serviços)

**Totais por atividade:**
| Atividade | Fórmula | 2026 |
|---|---|---|
| Comércio / Indústria | INSS + ICMS | R$ 82,05 |
| Serviços | INSS + ISS | R$ 86,05 |
| Comércio + Serviços | INSS + ICMS + ISS | R$ 87,05 |

**Onde editar em `index.html`:** valores nos `<option>` do select `#mei-ativ` e no hint `#mei-ref-hint` (atualizado dinamicamente por `initAnoNovo()`).

---

### 4. Limite de faturamento MEI
**Fonte oficial:** https://www.planalto.gov.br (Lei Geral das MPE) / Senado  
**Histórico:**
| Período | Limite anual |
|---|---|
| Até 2026 | R$ 81.000 |
| 2027 | R$ 110.000 (PLP 186/2026, aprovado Senado 15/10/2026) |
| 2028+ | R$ 140.000 |

**Onde editar em `index.html`:**
```js
function meiLimite() {
  if (ANO >= 2028) return 140000;
  if (ANO >= 2027) return 110000;
  return 81000;
}
```
Se aprovado novo limite, adicionar `if (ANO >= ANONOVEX) return VALOR;` antes dos anteriores.

---

### 5. Outras verificações
- **Salário mínimo** (referência para sugestão de INSS mínimo PJ, hint autônomo): verificar e atualizar comentários e sugestão na função `updRegime()` (linha com `inssPJ.value = 324`)
- **Teto INSS autônomo** (~20% sobre teto): recalcular e atualizar hint na linha do campo INSS próprio
- **Simples Nacional** (Anexo III e V): faixas e alíquotas mudam raramente, mas verificar no site do Simples (http://www8.receita.fazenda.gov.br/SimplesNacional/)
- **Ano no banner** (`#review-year`): atualizado automaticamente via `ANO = new Date().getFullYear()`

---

## O que a calculadora faz

| Pergunta | Resposta |
|---|---|
| Compara CLT e PJ? | Sim — líquido mensal real dos dois regimes |
| Considera 13º, férias, FGTS? | Sim — todos provisionados no equivalente mensal CLT |
| Calcula break-even? | Sim — NF mínima para igualar o pacote CLT |
| Suporta MEI, Simples, LP, Autônomo? | Sim — 6 regimes + alíquota personalizada |
| Considera plano de saúde, VA, home office? | Sim — campo a campo |
| Calcula IRPJ / CSLL no PJ? | Não — usa alíquota efetiva informada pelo usuário (ou tabela de referência) |
| Considera pró-labore e distribuição de lucros? | Não — usa nota fiscal como base |
| Funciona offline? | Sim — HTML standalone, sem backend |

## O que a calculadora NÃO faz

- Declaração de IR anual
- Cálculo do Simples com fator R (indica a lógica, mas não calcula)
- Projeção de aposentadoria / benefícios INSS
- Múltiplos cenários simultâneos

---

## Estrutura do arquivo `index.html`

```
<style>         — tokens de cor (light/dark), layout, componentes
<body>          — sidebar (inputs) + main (comparativo, CLT, PJ)
INSS_TABELAS    — tabelas INSS indexadas por ano
IRRF_TABELAS    — tabelas IRRF indexadas por ano
meiLimite()     — retorna limite MEI por ano
initAnoNovo()   — roda no carregamento: atualiza labels, mostra banner jan/fev
inss(b)         — cálculo progressivo INSS
irrf(base)      — cálculo progressivo IRRF com redução
calc()          — cálculo principal, atualiza DOM
updRegime()     — mostra/oculta campos por regime tributário
```

---

## Histórico de atualizações

| Data | O que mudou |
|---|---|
| Out 2026 | Tabelas INSS/IRRF 2026 (confirmadas Receita Federal); limite MEI 2027/2028 (PLP 186/2026); banner início de ano; labels dinâmicos por ano |
| Ano anterior | Tabelas 2025 → 2026 |
