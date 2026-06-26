async function carregarIntegrado() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEETS.INTEGRADO.id}/export?format=csv&gid=${SHEETS.INTEGRADO.gid}`;
  const res = await fetch(url);
  dadosIntegrado = aplicarPreenchimentoParaBaixo(parseCSV(await res.text()));
  const processado = processarBaseModalidade(dadosIntegrado);
  semanasIntegrado = processado.semanas;
  turmasIntegrado  = processado.turmas;
}

async function carregarSuperior() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEETS.SUPERIOR.id}/export?format=csv&gid=${SHEETS.SUPERIOR.gid}`;
  const res = await fetch(url);
  dadosSuperior = aplicarPreenchimentoParaBaixo(parseCSV(await res.text()));
  const processado = processarBaseModalidade(dadosSuperior);
  semanasSuperior = processado.semanas;
  turmasSuperior  = processado.turmas;
}

async function carregarSuperior2() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEETS.SUPERIOR2.id}/export?format=csv&gid=${SHEETS.SUPERIOR2.gid}`;
  const res = await fetch(url);
  dadosSuperior2 = aplicarPreenchimentoParaBaixo(parseCSV(await res.text()));
  const processado = processarBaseModalidade(dadosSuperior2);
  semanasSuperior2 = processado.semanas;
  turmasSuperior2  = processado.turmas;
}

async function carregarProfessores() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEETS.PROFESSORES.id}/export?format=csv&gid=${SHEETS.PROFESSORES.gid}`;
  const res = await fetch(url);
  const text = await res.text();
  const raw = parseCSV(text);
  dadosProfessores = raw;
  listaProfessores = raw.slice(1).map(l => l[0]).filter(n => n && n.trim() !== "");
}

// Retorna a grade base correta para o Superior conforme a data
function getDadosSuperiorParaData(dataStr) {
  const dt = projecao_parseData(dataStr);
  const ini2 = projecao_parseData(CALENDARIO.SUPERIOR2_INI);
  if (dt && dt >= ini2) return dadosSuperior2;
  return dadosSuperior;
}

async function init() {
  document.getElementById('searchProf').value = "";
  limparSnapshotsInvalidos();

  const mod = document.getElementById('selectModalidade').value;
  document.getElementById("painelAlteracoes").style.display = "none";
  window.horariosProntos = false;

  const url = `https://docs.google.com/spreadsheets/d/${SHEETS[mod].id}/export?format=csv&gid=${SHEETS[mod].gid}`;
  const res = await fetch(url);
  dadosGlobais = parseCSV(await res.text());

  processarDados();

  await carregarIntegrado();
  await carregarSuperior();
  await carregarSuperior2();
  await carregarProfessores();

  montarBaseGeral(dadosIntegrado, dadosSuperior, dadosSuperior2);

  montarRelatorioBase();
  montarCacheRelatorioDisciplinas();

  carregarListaProfessores();
  carregarSemanasProfessor();
  carregarListaTurmas();
  carregarSemanasTurma();

  gerarDashboard();
  esconderLoaderAbas();

  window.horariosProntos = true;
  setTimeout(() => { verificarMudancaAoAbrir(); }, 0);
}

function processarDados() {
  semanasAgrupadas = {};
  turmasDaPlanilha = dadosGlobais[0].slice(2).filter(t => t);
  let ultima = "";

  for (let i = 1; i < dadosGlobais.length; i++) {
    let r = [...dadosGlobais[i]];
    if (r[0]) ultima = r[0];
    r[0] = ultima;
    if (!r[0]) continue;

    const [d, m, a] = r[0].split('/');
    const dt = new Date(a, m - 1, d);
    const seg = new Date(dt.setDate(dt.getDate() - dt.getDay() + 1)).toLocaleDateString('pt-BR');

    if (!semanasAgrupadas[seg]) semanasAgrupadas[seg] = { dias: {} };
    if (!semanasAgrupadas[seg].dias[r[0]]) semanasAgrupadas[seg].dias[r[0]] = [];
    semanasAgrupadas[seg].dias[r[0]].push(r);
  }

  const sel = document.getElementById('selectSemana');
  sel.innerHTML = "";
  const semanaAtual = getSemanaAtual();

  ordenarDatasBR(Object.keys(semanasAgrupadas)).forEach(s => {
    sel.innerHTML += `<option value="${s}">Semana de ${s}</option>`;
  });

  if (semanasAgrupadas[semanaAtual]) {
    sel.value = semanaAtual;
  }

  renderizarTabela();
}

// ============================================================
// SELETOR SUPERIOR 1º / 2º SEMESTRE
// ============================================================
function trocarSemestreSuperior(sem) {
  window.semesterSuperior = sem;

  // Atualiza visual dos botões
  document.getElementById('btnSup1').classList.toggle('active', sem === 1);
  document.getElementById('btnSup2').classList.toggle('active', sem === 2);

  // Recarrega listas de professor e turma com o semestre correto
  carregarListaProfessores();
  carregarListaTurmas();
}

// Retorna os dados do Superior conforme semestre selecionado
function getDadosSuperiorAtivo() {
  return window.semesterSuperior === 2 ? dadosSuperior2 : dadosSuperior;
}
