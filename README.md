# falsp Financial Control

Sistema de controle financeiro pessoal e empresarial (PF + PJ).

## Acesso

🔗 **[App PC](https://falssp.github.io/falsp-financial-control/)** — versão completa para desktop

📱 **[App Celular](https://falssp.github.io/falsp-financial-control/falsp_mobile.html)** — versão mobile (adicione à tela inicial)

## Arquivos do projeto

| Arquivo | Descrição |
|---|---|
| `index.html` | App PC — hospedado no GitHub Pages |
| `falsp_mobile.html` | App Celular — mesmo repositório |
| `falsp_financial_control.xlsx` | Planilha Excel com dashboard e fórmulas |
| `Code.gs` / `falsp_sheets_sync.gs` | Script do Google Apps Script |

## Como instalar / atualizar

### App PC e Celular (GitHub Pages)
1. Faça upload dos arquivos `index.html` e `falsp_mobile.html` neste repositório
2. Aguarde ~1 minuto — o GitHub Pages publica automaticamente
3. **App PC:** acesse pelo link acima em qualquer navegador
4. **App Celular:** acesse o link mobile pelo celular → menu do navegador → **"Adicionar à tela inicial"**

### Google Sheets — configuração única
1. Abra sua planilha Google Sheets
2. **Extensões → Apps Script** → cole o conteúdo de `Code.gs` → salva (`Ctrl+S`)
3. **Implantar → Gerenciar implantações → lápis → Nova versão → Salvar**
4. Na lista de funções, selecione `setupPlanilha` → ▶ Executar (só na primeira vez)
5. A URL do deploy já está configurada no app — clique **📤 Enviar para Sheets agora**

### Excel
- Baixe `falsp_financial_control.xlsx` e salve localmente ou no OneDrive
- Os dados chegam via **Configurações → Exportar para Excel (.xlsx)** no app

## Fluxo de dados

```
App Celular  ←──localStorage──→  App PC
                                     │
                                     ↓ botão "📤 Enviar para Sheets"
                              Google Sheets (online)
                                     │
                                     ↓ exportar quando quiser
                              Excel (.xlsx) — uso local
```

> PC e celular compartilham dados automaticamente se você usar o mesmo perfil Chrome com sincronização ativada.

## Funcionalidades

- Lançamentos PF e PJ com categorias e grupos
- Cartões de crédito — limite, fatura, rotativo, anuidade
- Cartões de débito vinculados a contas
- Parcelamentos com detecção automática na importação de faturas
- Contas bancárias com conciliação de saldo
- Investimentos com carteira consolidada
- Imposto de Renda — documentos, deduções e simulação IRPF
- Contas a Pagar — painel consolidado mensal
- Contas de consumo (Vivo Celular, Fixo, TV, Internet)
- Sync direto com Google Sheets via Apps Script
- Exportação CSV, Excel (.xlsx) e backup JSON completo
- Dashboard com resumo mensal, KPIs e gráficos

## Dados e Privacidade

Todos os dados ficam no seu dispositivo (localStorage) ou na sua própria nuvem (OneDrive / Google Drive / Google Sheets). Nenhum dado é enviado para servidores externos.

## Tecnologia

HTML + CSS + JavaScript — arquivo único, sem dependências externas, sem backend.
