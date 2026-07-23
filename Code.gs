// ╔══════════════════════════════════════════════════════════════════╗
// ║  falsp Financial Control — Google Sheets Sync Script v6         ║
// ║  Cole em: Extensões → Apps Script → Code.gs → Salvar            ║
// ║  Depois: Implantar → App da Web → Nova versão → Salvar          ║
// ║  Executar setupPlanilha() uma vez para configurar               ║
// ╚══════════════════════════════════════════════════════════════════╝

const RENOMEAR = {
  'Lancamentos': 'Lançamentos',
  'Cartoes':     'Cartões',
  'Contas':      'Contas Bancárias',
  'Sheet1':      null,
  'Página1':     null,
};

const ABAS = {
  'Dashboard':        { cabecalho: null },
  'Lançamentos':      { cabecalho: ['Data','Perfil','Descrição','Tipo','Mês','Valor (R$)','Grupo','Sub-categoria','Forma Pagamento','Conta / Cartão','Recorrente','Observação'] },
  'Cartões':          { cabecalho: ['Nome','Perfil','Banco','Bandeira','Número','Limite (R$)','Vencimento (dia)','Fechamento (dia)','Anuidade (R$)'] },
  'Parcelamentos':    { cabecalho: ['Descrição','Perfil','Data Compra','Valor Total','Valor Parcela','Nº Parcelas','Pagas','Restantes','Saldo Dev.','Status','Cartão','Juros %a.m.'] },
  'IR':               { cabecalho: ['Ano','Data','Perfil','Categoria IR','Tipo','Descrição / Beneficiário','CPF / CNPJ','Valor (R$)'] },
  'Contas Bancárias': { cabecalho: ['Nome','Banco','Tipo','Perfil','Agência','Conta','Saldo Ref. (R$)','Data Ref.','Chave PIX','Observação'] },
  'Investimentos':    { cabecalho: ['Nome','Tipo','Perfil','Instituição','Aplicado (R$)','Rendimento (R$)','Vencimento','Categoria IR'] }
};

const COR_HEADER = '#1a1a2e';
const COR_FONTE  = '#ffffff';
const COR_ALT    = '#f0f2ff';

function doGet(e) {
  return resp({ ok: true, msg: 'falsp sync ativo', ts: new Date().toISOString() });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (payload.action === 'setup') return resp(setupPlanilha());
    if (payload.action === 'sync')  return resp(syncAll(payload.data));
    return resp({ ok: false, error: 'Ação desconhecida: ' + payload.action });
  } catch (err) {
    return resp({ ok: false, error: err.toString() });
  }
}

// ─── SETUP ───────────────────────────────────────────────────────
function setupPlanilha() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetLocale('pt_BR');
  ss.setSpreadsheetTimeZone('America/Sao_Paulo');

  Object.entries(RENOMEAR).forEach(function(entry) {
    var antigo = entry[0], novo = entry[1];
    var ws = ss.getSheetByName(antigo);
    if (!ws) return;
    if (novo === null) {
      if (ss.getSheets().length > 1) ss.deleteSheet(ws);
    } else if (!ss.getSheetByName(novo)) {
      ws.setName(novo);
    }
  });

  var ordem = Object.keys(ABAS);
  ordem.forEach(function(nome, idx) {
    var ws = ss.getSheetByName(nome);
    if (!ws) ws = ss.insertSheet(nome);
    if (nome === 'Dashboard') {
      _renderDashboard(ss, ws);
    } else {
      _aplicarTabela(ws, ABAS[nome].cabecalho);
    }
    ss.setActiveSheet(ws);
    ss.moveActiveSheet(idx + 1);
  });

  var dash = ss.getSheetByName('Dashboard');
  if (dash) ss.setActiveSheet(dash);

  return { ok: true, msg: 'Planilha configurada!' };
}

// ─── SYNC ────────────────────────────────────────────────────────
function syncAll(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.entries(ABAS).forEach(function(entry) {
    var nome = entry[0], cfg = entry[1];
    if (nome === 'Dashboard') return;
    var ws = ss.getSheetByName(nome);
    if (!ws) {
      ws = ss.insertSheet(nome);
      _aplicarTabela(ws, cfg.cabecalho);
    }
  });

  var synced = {};
  if (data.lancamentos)      synced.lancamentos    = _gravarLancamentos(ss, data.lancamentos);
  if (data.cartoes)          synced.cartoes         = _gravarCartoes(ss, data.cartoes);
  if (data.parcelamentos)    synced.parcelamentos   = _gravarParcelamentos(ss, data.parcelamentos);
  if (data.irRecsV2)         synced.ir              = _gravarIR(ss, data.irRecsV2);
  if (data.contas_bancarias) synced.contas          = _gravarContas(ss, data.contas_bancarias);
  if (data.invs)             synced.investimentos   = _gravarInvestimentos(ss, data.invs);

  var dash = ss.getSheetByName('Dashboard');
  if (dash) {
    _renderDashboard(ss, dash);
    ss.setActiveSheet(dash);
  }

  return { ok: true, synced: synced, ts: new Date().toISOString() };
}

// ─── GRAVADORES ──────────────────────────────────────────────────
function _gravarLancamentos(ss, lancs) {
  if (!lancs || !lancs.length) return 0;
  var ws = ss.getSheetByName('Lançamentos');
  _limparDados(ws);
  lancs.sort(function(a,b){ return (b.data||'').localeCompare(a.data||''); });
  var rows = lancs.map(function(l) { return [
    l.data ? _data(l.data) : '',
    l.perfil || '', l.descricao || '', l.tipo || '',
    l.data ? _mes(l.data) : '',
    _num(l.valor),
    l.grupo || '', l.subcat || '', l.forma || '', l.conta || '',
    l.recorrente ? 'Sim' : 'Não', l.obs || ''
  ]; });
  ws.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  ws.getRange(2, 1, rows.length, 1).setNumberFormat('DD/MM/YYYY');
  ws.getRange(2, 6, rows.length, 1).setNumberFormat("R$ #,##0.00");
  _zebraStripes(ws, rows.length, rows[0].length);
  _deletarExtras(ws, rows.length, rows[0].length);
  _autoAjuste(ws);
  _autoFilter(ws, rows[0].length);
  return rows.length;
}

function _gravarCartoes(ss, cartoes) {
  if (!cartoes || !cartoes.length) return 0;
  var ws = ss.getSheetByName('Cartões');
  _limparDados(ws);
  var rows = cartoes.map(function(c) { return [
    c.nome || '', c.perfil || '', c.banco || '', c.bandeira || '',
    c.digitos ? '•••• ' + c.digitos : '',
    _num(c.limite), c.venc || '', c.fech || '', _num(c.anuidade)
  ]; });
  ws.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  ws.getRange(2, 6, rows.length, 1).setNumberFormat("R$ #,##0.00");
  ws.getRange(2, 9, rows.length, 1).setNumberFormat("R$ #,##0.00");
  _zebraStripes(ws, rows.length, rows[0].length);
  _deletarExtras(ws, rows.length, rows[0].length);
  _autoAjuste(ws);
  _autoFilter(ws, rows[0].length);
  return rows.length;
}

function _gravarParcelamentos(ss, compras) {
  if (!compras || !compras.length) return 0;
  var ws = ss.getSheetByName('Parcelamentos');
  _limparDados(ws);
  var rows = compras.map(function(c) {
    var parc  = c.valorTotal && c.nParcelas ? c.valorTotal / c.nParcelas : 0;
    var pagas = Array.isArray(c.pagas) ? c.pagas.length : (c.pagas || 0);
    var rest  = Math.max(0, (c.nParcelas || 0) - pagas);
    return [
      c.descricao || '', c.perfil || '',
      c.dataCompra ? _data(c.dataCompra) : '',
      _num(c.valorTotal), _num(parc), c.nParcelas || 0,
      pagas, rest, rest * parc,
      pagas >= (c.nParcelas || 0) ? 'Quitado' : 'Aberto',
      c.cartao || '', _num(c.juros)
    ];
  });
  ws.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  ws.getRange(2, 3, rows.length, 1).setNumberFormat('DD/MM/YYYY');
  [4,5,9].forEach(function(col){ ws.getRange(2, col, rows.length, 1).setNumberFormat("R$ #,##0.00"); });
  _zebraStripes(ws, rows.length, rows[0].length);
  _deletarExtras(ws, rows.length, rows[0].length);
  _autoAjuste(ws);
  _autoFilter(ws, rows[0].length);
  return rows.length;
}

function _gravarIR(ss, recs) {
  if (!recs || !recs.length) return 0;
  var ws = ss.getSheetByName('IR');
  _limparDados(ws);
  recs.sort(function(a,b){ return (b.ano-a.ano) || (b.data||'').localeCompare(a.data||''); });
  var rows = recs.map(function(r) { return [
    r.ano || '', r.data ? _data(r.data) : '',
    r.perfil || '', r.categoria || '', r.tipo || '',
    r.descricao || '', r.cnpj || r.emissor || '', _num(r.valor)
  ]; });
  ws.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  ws.getRange(2, 2, rows.length, 1).setNumberFormat('DD/MM/YYYY');
  ws.getRange(2, 8, rows.length, 1).setNumberFormat("R$ #,##0.00");
  _zebraStripes(ws, rows.length, rows[0].length);
  _deletarExtras(ws, rows.length, rows[0].length);
  _autoAjuste(ws);
  _autoFilter(ws, rows[0].length);
  return rows.length;
}

function _gravarContas(ss, contas) {
  if (!contas || !contas.length) return 0;
  var ws = ss.getSheetByName('Contas Bancárias');
  _limparDados(ws);
  var rows = contas.map(function(c) { return [
    c.nome || '', c.banco || '', c.tipo || '', c.perfil || '',
    c.agencia || '', c.numero || '', _num(c.saldoRef),
    c.saldoData ? _data(c.saldoData) : '',
    c.pix || '', c.obs || ''
  ]; });
  ws.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  ws.getRange(2, 7, rows.length, 1).setNumberFormat("R$ #,##0.00");
  ws.getRange(2, 8, rows.length, 1).setNumberFormat('DD/MM/YYYY');
  _zebraStripes(ws, rows.length, rows[0].length);
  _deletarExtras(ws, rows.length, rows[0].length);
  _autoAjuste(ws);
  _autoFilter(ws, rows[0].length);
  return rows.length;
}

function _gravarInvestimentos(ss, invs) {
  if (!invs || !invs.length) return 0;
  var ws = ss.getSheetByName('Investimentos');
  _limparDados(ws);
  var rows = invs.map(function(i) { return [
    i.nome || '', i.tipo || '', i.perfil || '', i.inst || '',
    _num(i.aplicado), _num(i.rend),
    i.venc ? _data(i.venc) : '', i.catIR || ''
  ]; });
  ws.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  ws.getRange(2, 5, rows.length, 2).setNumberFormat("R$ #,##0.00");
  ws.getRange(2, 7, rows.length, 1).setNumberFormat('DD/MM/YYYY');
  _zebraStripes(ws, rows.length, rows[0].length);
  _deletarExtras(ws, rows.length, rows[0].length);
  _autoAjuste(ws);
  _autoFilter(ws, rows[0].length);
  return rows.length;
}

// ─── DASHBOARD ───────────────────────────────────────────────────
function _renderDashboard(ss, ws) {
  ws.clearContents();
  ws.clearFormats();
  try { ws.getFilter().remove(); } catch(e) {}
  ws.setTabColor('#4a4a8a');

  var ts    = Utilities.formatDate(new Date(), 'America/Sao_Paulo', "dd/MM/yyyy 'às' HH:mm");
  var nCols = 6;
  var nRows = 25;

  // Deletar extras
  var maxC = ws.getMaxColumns();
  if (maxC > nCols) ws.deleteColumns(nCols + 1, maxC - nCols);
  var maxR = ws.getMaxRows();
  if (maxR > nRows + 1) ws.deleteRows(nRows + 2, maxR - nRows - 1);

  // Centralizar TUDO
  ws.getRange(1, 1, nRows, nCols)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // Linha 1 — título
  ws.getRange(1, 1, 1, nCols).merge()
    .setValue('💰  falsp Financial Control  —  Dashboard')
    .setBackground('#0d0d24').setFontColor('#ffffff')
    .setFontSize(16).setFontWeight('bold');
  ws.setRowHeight(1, 48);

  // Linha 2 — sync
  ws.getRange(2, 1, 1, nCols).merge()
    .setValue('⏱  Último sync: ' + ts)
    .setBackground('#0d0d24').setFontColor('#6666aa').setFontSize(10);
  ws.setRowHeight(2, 22);

  // Linha 3 — espaço
  ws.getRange(3, 1, 1, nCols).merge().setValue('').setBackground('#0d0d24');
  ws.setRowHeight(3, 8);

  // Linhas 4-5 — Contadores
  var contLabels = ['📋 Lançamentos','💳 Cartões','🔄 Parcelamentos','🏛 Docs IR','🏦 Contas','📈 Investimentos'];
  var contAbaNames = ['Lançamentos','Cartões','Parcelamentos','IR','Contas Bancárias','Investimentos'];
  var contValues = contAbaNames.map(function(nome) {
    var ws2 = ss.getSheetByName(nome);
    return ws2 ? Math.max(0, ws2.getLastRow() - 1) : 0;
  });
  for (var i = 0; i < 6; i++) {
    ws.getRange(4, i+1).setValue(contLabels[i])
      .setBackground('#1a1a3e').setFontColor('#9999dd')
      .setFontSize(9).setFontWeight('bold');
    ws.getRange(5, i+1).setValue(contValues[i])
      .setBackground('#1a1a3e').setFontColor('#ffffff')
      .setFontSize(22).setFontWeight('bold');
  }
  ws.setRowHeight(4, 26);
  ws.setRowHeight(5, 44);

  // Linha 6 — espaço
  ws.getRange(6, 1, 1, nCols).merge().setValue('').setBackground('#0d0d24');
  ws.setRowHeight(6, 8);

  // Linhas 7-8 — Totais
  var totLabels   = ['💰 Total Receitas','💸 Total Despesas','📊 Saldo','📈 Total Investido','⏳ Parcel. Abertos','🏦 Saldo Contas'];
  // Calcular totais direto via Apps Script (evita problema de fórmulas com acentos)
  var wsLanc = ss.getSheetByName('Lançamentos');
  var wsInv  = ss.getSheetByName('Investimentos');
  var wsPar  = ss.getSheetByName('Parcelamentos');
  var wsCon  = ss.getSheetByName('Contas Bancárias');

  var totalReceitas = 0, totalDespesas = 0, totalInvestido = 0, parcelAbertos = 0, saldoContas = 0;

  if (wsLanc && wsLanc.getLastRow() > 1) {
    var lancData = wsLanc.getRange(2, 1, wsLanc.getLastRow()-1, 6).getValues();
    lancData.forEach(function(row) {
      var tipo = row[3], val = parseFloat(row[5]) || 0;
      if (tipo === 'Receita') totalReceitas += val;
      if (tipo === 'Despesa') totalDespesas += val;
    });
  }
  if (wsInv && wsInv.getLastRow() > 1) {
    var invData = wsInv.getRange(2, 5, wsInv.getLastRow()-1, 1).getValues();
    invData.forEach(function(row) { totalInvestido += parseFloat(row[0]) || 0; });
  }
  if (wsPar && wsPar.getLastRow() > 1) {
    var parData = wsPar.getRange(2, 1, wsPar.getLastRow()-1, 10).getValues();
    parData.forEach(function(row) { if (row[9] === 'Aberto') parcelAbertos += parseFloat(row[8]) || 0; });
  }
  if (wsCon && wsCon.getLastRow() > 1) {
    var conData = wsCon.getRange(2, 7, wsCon.getLastRow()-1, 1).getValues();
    conData.forEach(function(row) { saldoContas += parseFloat(row[0]) || 0; });
  }

  var totValues = [totalReceitas, totalDespesas, totalReceitas - totalDespesas, totalInvestido, parcelAbertos, saldoContas];
  for (var j = 0; j < 6; j++) {
    ws.getRange(7, j+1).setValue(totLabels[j])
      .setBackground('#12122e').setFontColor('#8888bb')
      .setFontSize(9).setFontWeight('bold');
    ws.getRange(8, j+1).setValue(totValues[j])
      .setBackground('#12122e').setFontColor('#00ee88')
      .setFontSize(14).setFontWeight('bold')
      .setNumberFormat("R$ #,##0.00");
  }
  ws.setRowHeight(7, 26);
  ws.setRowHeight(8, 40);

  // Linha 9 — espaço
  ws.getRange(9, 1, 1, nCols).merge().setValue('').setBackground('#0d0d24');
  ws.setRowHeight(9, 8);

  // Linha 10 — título tabela mensal
  ws.getRange(10, 1, 1, nCols).merge()
    .setValue('📅  Resumo por Mês')
    .setBackground('#16163a').setFontColor('#7777bb')
    .setFontSize(10).setFontWeight('bold');
  ws.setRowHeight(10, 28);

  // Linha 11 — espaço
  ws.getRange(11, 1, 1, nCols).merge().setValue('').setBackground('#0d0d24');
  ws.setRowHeight(11, 6);

  // Linha 12 — cabeçalho tabela
  var tabCabs = ['Mês','Receitas (R$)','Despesas (R$)','Saldo (R$)'];
  for (var k = 0; k < 4; k++) {
    ws.getRange(12, k+1).setValue(tabCabs[k])
      .setBackground(COR_HEADER).setFontColor(COR_FONTE)
      .setFontSize(10).setFontWeight('bold');
  }
  ws.getRange(12, 5, 1, 2).setValue('').setBackground('#0d0d24');
  ws.setRowHeight(12, 28);

  // Linhas 13-24 — meses
  var meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  var ano   = new Date().getFullYear();
  for (var m = 0; m < 12; m++) {
    var row   = 13 + m;
    var label = meses[m] + '/' + ano;
    var bg    = m % 2 === 0 ? '#ffffff' : '#f0f2ff';

    ws.getRange(row, 1).setValue(label).setBackground(bg).setFontColor('#1a1a2e').setFontSize(10);

    var recMes = 0, desMes = 0;
    if (wsLanc && wsLanc.getLastRow() > 1) {
      var dadosMes = wsLanc.getRange(2, 1, wsLanc.getLastRow()-1, 6).getValues();
      dadosMes.forEach(function(r) {
        if (r[4] === label) {
          if (r[3] === 'Receita') recMes += parseFloat(r[5]) || 0;
          if (r[3] === 'Despesa') desMes += parseFloat(r[5]) || 0;
        }
      });
    }
    ws.getRange(row, 2).setValue(recMes)
      .setBackground(bg).setFontColor('#1a6644').setFontSize(10).setNumberFormat("R$ #,##0.00");
    ws.getRange(row, 3).setValue(desMes)
      .setBackground(bg).setFontColor('#991111').setFontSize(10).setNumberFormat("R$ #,##0.00");
    ws.getRange(row, 4).setValue(recMes - desMes)
      .setBackground(bg).setFontColor('#1a1a8a').setFontSize(10).setNumberFormat("R$ #,##0.00");

    ws.getRange(row, 5, 1, 2).setValue('').setBackground(bg);
    ws.setRowHeight(row, 22);
  }

  // Linha 25 — espaço final
  ws.getRange(25, 1, 1, nCols).merge().setValue('').setBackground('#0d0d24');
  ws.setRowHeight(25, 8);

  // Autoajuste colunas
  ws.autoResizeColumns(1, nCols);
  for (var c = 1; c <= nCols; c++) {
    var w = ws.getColumnWidth(c);
    ws.setColumnWidth(c, Math.max(w + 30, 180));
  }
  ws.setFrozenRows(0);
}

// ─── HELPERS ─────────────────────────────────────────────────────
function _aplicarTabela(ws, cabecalho) {
  ws.clearContents();
  ws.clearFormats();
  var nCols = cabecalho.length;

  // Centralizar planilha inteira
  ws.getRange(1, 1, ws.getMaxRows(), nCols)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  var header = ws.getRange(1, 1, 1, nCols);
  header.setValues([cabecalho]);
  header.setBackground(COR_HEADER).setFontColor(COR_FONTE)
    .setFontWeight('bold').setFontSize(10)
    .setBorder(null, null, true, null, null, null, '#4a4a8a', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  ws.setRowHeight(1, 32);
  ws.setFrozenRows(1);
  ws.setTabColor('#1a1a2e');

  // Deletar extras (manter 1 linha em branco)
  var totalCols = ws.getMaxColumns();
  if (totalCols > nCols) ws.deleteColumns(nCols + 1, totalCols - nCols);
  var totalRows = ws.getMaxRows();
  if (totalRows > 2) ws.deleteRows(3, totalRows - 2);

  ws.autoResizeColumns(1, nCols);
  for (var i = 1; i <= nCols; i++) {
    var w = ws.getColumnWidth(i);
    ws.setColumnWidth(i, Math.max(w + 30, 180));
  }
  _autoFilter(ws, nCols);
}

function _autoFilter(ws, nCols) {
  try {
    var lastRow = Math.max(ws.getLastRow(), 1);
    ws.getRange(1, 1, lastRow, nCols).createFilter();
  } catch(e) {}
}

function _limparDados(ws) {
  try { ws.getFilter().remove(); } catch(e) {}
  var last = ws.getLastRow();
  if (last > 1) ws.getRange(2, 1, last-1, ws.getLastColumn() || 1).clearContent().clearFormat();
}

function _deletarExtras(ws, nRows, nCols) {
  var totalCols = ws.getMaxColumns();
  if (totalCols > nCols) ws.deleteColumns(nCols + 1, totalCols - nCols);
  var totalRows = ws.getMaxRows();
  var manter = Math.max(nRows + 2, 3);
  if (totalRows > manter) ws.deleteRows(manter + 1, totalRows - manter);
}

function _autoAjuste(ws) {
  var nCols = ws.getLastColumn();
  if (nCols < 1) return;
  ws.autoResizeColumns(1, nCols);
  for (var i = 1; i <= nCols; i++) {
    var w = ws.getColumnWidth(i);
    ws.setColumnWidth(i, Math.max(w + 30, 180));
  }
}

function _zebraStripes(ws, nRows, nCols) {
  for (var i = 0; i < nRows; i++) {
    ws.getRange(i+2, 1, 1, nCols)
      .setBackground(i%2===0 ? '#ffffff' : COR_ALT)
      .setFontColor('#1a1a2e').setFontSize(10)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
    ws.setRowHeight(i+2, 28);
  }
}

function _data(str) {
  if (!str) return '';
  try { return new Date(str.substring(0,10) + 'T12:00:00'); } catch(e) { return str; }
}

function _mes(str) {
  if (!str) return '';
  var m = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  try {
    var d = new Date(str.substring(0,10) + 'T12:00:00');
    return m[d.getMonth()] + '/' + d.getFullYear();
  } catch(e) { return ''; }
}

function _num(v) {
  if (v === null || v === undefined || v === '') return 0;
  var s = String(v).replace(/[^\d,.\-]/g, '').replace(',', '.');
  return parseFloat(s) || 0;
}

function resp(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
