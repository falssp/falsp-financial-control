# falsp Financial Control

Sistema de controle financeiro pessoal e empresarial (PF + PJ).

## Acesso

🔗 **[Abrir o app](https://falsp.github.io/falsp-financial-control/)**

## Funcionalidades

- Lançamentos PF e PJ com categorias
- Cartões de crédito e débito — limite, fatura, rotativo
- Parcelamentos com detecção automática na importação de faturas
- Contas bancárias com conciliação de saldo
- Investimentos
- Imposto de Renda — documentos, deduções e simulação IRPF
- Contas a Pagar — painel consolidado mensal
- Contas de consumo (Vivo Celular, Fixo, TV, Internet)
- Sincronização com OneDrive (automática)
- Sync direto com Google Sheets via Apps Script
- Exportação CSV e backup JSON completo

## Configuração do Google Sheets Sync

1. Abra sua planilha Google Sheets
2. **Extensões → Apps Script** → cole o conteúdo de `falsp_sheets_sync.gs`
3. **Implantar → Nova implantação**
   - Tipo: App da Web
   - Executar como: Sua conta
   - Acesso: Qualquer pessoa
4. Copie a URL gerada
5. No app: **⚙️ Configurações → Google Sheets — Sync direto** → cole a URL → Salvar

## Dados e Privacidade

Todos os dados ficam no seu dispositivo (localStorage) ou na sua própria nuvem (OneDrive / Google Drive / Google Sheets). Nenhum dado é enviado para servidores externos.

## Tecnologia

HTML + CSS + JavaScript — arquivo único, sem dependências externas, sem backend.
