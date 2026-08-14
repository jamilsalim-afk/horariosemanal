/* ============================================================
   CONFIGURAÇÃO DINÂMICA DE PLANILHAS (via planilha mestra)
   ============================================================
   A partir de agora, o único link fixo no código é o da
   planilha mestra abaixo. Todos os outros links (Integrado,
   Superior, Professores, por ano) são lidos dinamicamente
   dessa planilha, então para adicionar um novo ano basta
   inserir novas linhas nela — nunca mais mexer no código.

   Estrutura esperada da planilha mestra (aba/gid indicado em
   CONFIG_URL), com cabeçalho na primeira linha:

   | Chave        | Ano  | URL                                   | Ativo |
   |--------------|------|----------------------------------------|-------|
   | INTEGRADO    | 2026 | https://docs.google.com/.../gid=111   | SIM   |
   | SUPERIOR     | 2026 | https://docs.google.com/.../gid=222   | SIM   |
   | PROFESSORES  | 2026 | https://docs.google.com/.../gid=333   | SIM   |
   | INTEGRADO    | 2025 | https://docs.google.com/.../gid=444   | SIM   |
   | SUPERIOR     | 2025 | https://docs.google.com/.../gid=555   | SIM   |
   | PROFESSORES  | 2025 | https://docs.google.com/.../gid=666   | SIM   |

   A coluna "URL" aceita o link normal de compartilhamento do
   Google Sheets (com #gid=... ou ?gid=...) — o código extrai o
   ID e o GID automaticamente, não precisa colar link de export.

   IMPORTANTE: todas as planilhas (mestra e as apontadas por ela)
   precisam estar com compartilhamento "Qualquer pessoa com o
   link pode visualizar", senão o fetch retorna erro de permissão
   em vez do CSV.
   ============================================================ */

// 🔧 AJUSTE AQUI: link da planilha mestra (ID + GID da aba de config)
const CONFIG_URL = "https://docs.google.com/spreadsheets/d/122GdHocj0Ia-o_LOeHm9fTF3TkPkWrYZ9MHYYpyHt4g/edit?gid=0#gid=0";

let CONFIG_COMPLETA = [];  // todas as linhas cruas da planilha mestra (todos os anos)
let SHEETS = {};           // config filtrada do ano atualmente selecionado -> { CHAVE: {id, gid} }
let anoSelecionado = null; // ano atualmente selecionado no seletor da página

// Extrai o ID e o GID de um link comum do Google Sheets
function extrairIdEGid(url){
  const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = url.match(/gid=([0-9]+)/);
  return {
    id: idMatch ? idMatch[1] : null,
    gid: gidMatch ? gidMatch[1] : "0"
  };
}

// Busca a planilha mestra inteira (todos os anos/chaves cadastrados)
async function carregarConfigCompleta(){
  const res = await fetch(CONFIG_URL);
  const text = await res.text();
  const linhas = parseCSV(text);

  // linha 0 = cabeçalho: Chave, Ano, URL, Ativo
  CONFIG_COMPLETA = linhas.slice(1).filter(l => l[0] && l[1] && l[2]);

  if(CONFIG_COMPLETA.length === 0){
    console.warn("⚠️ Planilha mestra retornou vazia ou com formato inesperado.");
  }
}

// Popula o <select id="selectAno"> com os anos encontrados na config
// e define o ano corrente como padrão (com fallback pro mais recente)
function montarSelectDeAnos(){
  const anos = [...new Set(CONFIG_COMPLETA.map(l => l[1].trim()))]
    .sort((a, b) => b - a); // mais recente primeiro

  const sel = document.getElementById('selectAno');
  if(!sel){
    console.warn("⚠️ Elemento #selectAno não encontrado no HTML.");
    return;
  }

  sel.innerHTML = "";
  anos.forEach(ano => {
    sel.innerHTML += `<option value="${ano}">${ano}</option>`;
  });

  const anoAtual = new Date().getFullYear().toString();
  anoSelecionado = anos.includes(anoAtual) ? anoAtual : anos[0];
  sel.value = anoSelecionado;
}

// Filtra a config completa pelo ano informado e monta o objeto SHEETS
// que o resto do sistema já usa (SHEETS.INTEGRADO.id, .gid, etc.)
function montarSheetsDoAno(ano){
  const novo = {};

  CONFIG_COMPLETA
    .filter(l => l[1].trim() === ano)
    .forEach(l => {
      const [chave, , url, ativo] = l;
      if(ativo && ativo.trim().toUpperCase() === "NAO") return;

      const { id, gid } = extrairIdEGid(url);
      if(!id){
        console.warn(`⚠️ URL inválida para a chave "${chave}" no ano ${ano}:`, url);
        return;
      }

      novo[chave.trim().toUpperCase()] = { id, gid };
    });

  SHEETS = novo;
  console.log(`SHEETS carregado para ${ano}:`, SHEETS);
}

// Chamada pelo <select id="selectAno" onchange="trocarAno()">
async function trocarAno(){
  anoSelecionado = document.getElementById('selectAno').value;
  mostrarLoaderAbas("Carregando " + anoSelecionado);
  await init();
  esconderLoaderAbas();
}


/* ============================================================
   CARREGAMENTO DAS BASES (Integrado / Superior / Professores)
   ============================================================
   Sem alterações na lógica interna — continuam usando
   SHEETS.INTEGRADO, SHEETS.SUPERIOR, SHEETS.PROFESSORES,
   só que agora esses valores vêm da planilha mestra.
   ============================================================ */

async function carregarIntegrado(){
  const url = `https://docs.google.com/spreadsheets/d/${SHEETS.INTEGRADO.id}/export?format=csv&gid=${SHEETS.INTEGRADO.gid}`;
  const res = await fetch(url);

  // 🔥 Aplica o preenchimento aqui
  dadosIntegrado = aplicarPreenchimentoParaBaixo(parseCSV(await res.text()));

  const processado = processarBaseModalidade(dadosIntegrado);
  semanasIntegrado = processado.semanas;
  turmasIntegrado = processado.turmas;
}

async function carregarSuperior(){
  const url = `https://docs.google.com/spreadsheets/d/${SHEETS.SUPERIOR.id}/export?format=csv&gid=${SHEETS.SUPERIOR.gid}`;
  const res = await fetch(url);

  // 🔥 Aplica o preenchimento aqui
  dadosSuperior = aplicarPreenchimentoParaBaixo(parseCSV(await res.text()));

  const processado = processarBaseModalidade(dadosSuperior);
  semanasSuperior = processado.semanas;
  turmasSuperior = processado.turmas;
}

async function carregarProfessores(){
  const url =
    `https://docs.google.com/spreadsheets/d/${SHEETS.PROFESSORES.id}/export?format=csv&gid=${SHEETS.PROFESSORES.gid}`;

  const res = await fetch(url);
  const text = await res.text();

  const raw = parseCSV(text);

  console.log("PROF RAW:", raw);

  dadosProfessores = raw;

  listaProfessores = raw
    .slice(1)
    .map(l => l[0])
    .filter(n => n && n.trim() !== "");

  console.log("LISTA PROFESSORES:", listaProfessores);
}


/* ============================================================
   INIT / ATUALIZAR TUDO
   ============================================================ */

async function init(){

  document.getElementById('searchProf').value = "";

  limparSnapshotsInvalidos();

  // 🔥 NOVO: busca a planilha mestra só na primeira vez.
  // (Se preferir sempre refletir mudanças recentes na config
  // sem precisar dar F5, remova o "if" e deixe sempre buscar.)
  if(CONFIG_COMPLETA.length === 0){
    await carregarConfigCompleta();
    montarSelectDeAnos();
  }

  // 🔥 NOVO: monta SHEETS a partir do ano selecionado
  montarSheetsDoAno(anoSelecionado);

  const mod = document.getElementById('selectModalidade').value;

  document.getElementById("painelAlteracoes").style.display = "none";

  window.trocouModalidade = true;

  const url = `https://docs.google.com/spreadsheets/d/${SHEETS[mod].id}/export?format=csv&gid=${SHEETS[mod].gid}`;
  const res = await fetch(url);

  dadosGlobais = parseCSV(await res.text());

  processarDados();

  await carregarIntegrado();
  await carregarSuperior();
  await carregarProfessores();

  montarBaseGeral(
    dadosIntegrado,
    dadosSuperior
  );
  inicializarLaboratorios();
  montarRelatorioBase();
  montarCacheRelatorioDisciplinas();

  // PROFESSORES
  carregarListaProfessores();
  carregarSemanasProfessor();

  // TURMAS
  carregarListaTurmas();
  carregarSemanasTurma();

  gerarDashboard();

  esconderLoaderAbas();

  setTimeout(() => {
    verificarMudancaAoAbrir();
  }, 200);
}

async function atualizarTudo(){
  mostrarLoaderAbas("Atualizando");

  await init();

  // 🔥 re-renderiza a aba que estiver aberta no momento
  const abaAtiva = document.querySelector('.tab-content.active')?.id;

  switch(abaAtiva){
    case 'dashboard':
      gerarDashboard();
      break;
    case 'horarios':
      renderizarTabela();
      break;
    case 'sabados':
      renderSabados();
      break;
    case 'professores':
      renderProfessor();
      break;
    case 'turmas':
      renderTurma();
      break;
    case 'laboratorios':
      renderLaboratorio();
      break;
    case 'estatisticas':
      atualizarRelatorio();
      break;
    case 'relatorios':
      gerarRelatorio();
      break;
  }

  esconderLoaderAbas();
}

function processarDados(){
  semanasAgrupadas = {};
  turmasDaPlanilha = dadosGlobais[0].slice(2).filter(t => t);
  let ultima = "";
  for(let i = 1; i < dadosGlobais.length; i++){
    let r = [...dadosGlobais[i]];
    if(r[0]) ultima = r[0];
    r[0] = ultima;
    if(!r[0]) continue;

    const [d, m, a] = r[0].split('/');
    const dt = new Date(a, m - 1, d);
    const seg = new Date(dt.setDate(dt.getDate() - dt.getDay() + 1)).toLocaleDateString('pt-BR');

    if(!semanasAgrupadas[seg]) semanasAgrupadas[seg] = { dias: {} };
    if(!semanasAgrupadas[seg].dias[r[0]]) semanasAgrupadas[seg].dias[r[0]] = [];
    semanasAgrupadas[seg].dias[r[0]].push(r);
  }

  const sel = document.getElementById('selectSemana');
  sel.innerHTML = "";
  const semanaAtual = getSemanaAtual();

  ordenarDatasBR(Object.keys(semanasAgrupadas)).forEach(s => {
    sel.innerHTML += `<option value="${s}">Semana de ${s}</option>`;
  });

  /* 🔥 SELECIONA SEMANA ATUAL SE EXISTIR */
  if(semanasAgrupadas[semanaAtual]){
    sel.value = semanaAtual;
  }

  renderizarTabela();
}
