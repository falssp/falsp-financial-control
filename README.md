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
1. Faça upload dos arquivos neste repositório via **Add file → Upload files**
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

### Lançamentos
- PF e PJ com categorias, grupos e sub-categorias
- Filtros por tipo, perfil, grupo e busca livre
- Importação de faturas e extratos (OFX, CSV, XLS, PDF colado)
- Detecção automática de parcelamentos na importação

### Cartões de Crédito
- Limite, fatura atual, rotativo, anuidade e juros
- Alerta automático de anuidade vencendo em ≤ 30 dias
- Portabilidade — campo "substitui" para rastrear troca de cartão
- Tags livres e notas internas
- Encerramento com data e motivo — some dos selects mas mantém histórico
- Filtro "Mostrar encerrados"

### Contas Bancárias
- Conciliação de saldo calculado vs saldo de referência
- Conta principal destacada no dashboard
- Tags, notas internas e data de encerramento
- Filtro "Mostrar encerradas"

### Investimentos
- Carteira consolidada com rentabilidade calculada automaticamente
- Status: Ativo / Resgatado / Vencido
- Alerta automático de vencimento em ≤ 30 dias
- Resgate planejado, tags e notas internas
- Filtro "Mostrar encerrados/resgatados"

### Parcelamentos
- Controle de parcelas pagas e saldo devedor
- Detecção automática ao importar faturas

### Imposto de Renda
- Documentos, deduções e simulação IRPF
- Exportação CSV para contador

### Contas a Pagar
- Painel consolidado mensal
- Registro de pagamento com data, valor e forma
- Desfazer pagamento

### Contas de Consumo
- Vivo Celular, Fixo, TV, Internet

### Sincronização e Backup
- Sync direto com Google Sheets via Apps Script
- Exportação CSV, Excel (.xlsx) e backup JSON completo
- Alertas automáticos ao abrir o app (anuidades, vencimentos)

## Dados e Privacidade

Todos os dados ficam no seu dispositivo (localStorage) ou na sua própria nuvem (Google Sheets / Excel). Nenhum dado é enviado para servidores externos.

## Tecnologia

HTML + CSS + JavaScript puro — arquivo único, sem dependências externas, sem backend.
