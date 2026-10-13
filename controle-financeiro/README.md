# falsp Financial Control — App

App de controle financeiro pessoal e empresarial (PF + PJ).

## Acesso

🔗 **[App PC](https://falssp.github.io/falsp-financial-control/controle-financeiro/)** — versão completa para desktop

📱 **[App Celular](https://falssp.github.io/falsp-financial-control/controle-financeiro/falsp_mobile.html)** — versão mobile (adicione à tela inicial)

## Arquivos

| Arquivo | Descrição |
|---|---|
| `index.html` | App PC — hospedado no GitHub Pages |
| `falsp_mobile.html` | App Celular |
| `falsp_financial_control.xlsx` | Planilha Excel com dashboard e fórmulas |
| `Code.gs` | Script do Google Apps Script |

## Como instalar / atualizar

### App PC e Celular (GitHub Pages)
1. Faça upload dos arquivos nesta pasta via **Add file → Upload files**
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

## Dados e Privacidade

Todos os dados ficam no seu dispositivo (localStorage) ou na sua própria nuvem (Google Sheets / Excel). Nenhum dado é enviado para servidores externos.
