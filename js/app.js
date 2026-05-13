
// ===============================
// 🔗 PLANILHAS
// ===============================
const SHEETS = {
  INTEGRADO: {
    id: '1j33kiPqwtzZNuvkBgYDaIiXZvVMY_J0qWAtRfYGdnD8',
    gid: '1357770092'
  },
  SUPERIOR: {
    id: '14ALXZgFIT68ee9ajuIdG63SpGVm0HyTjwp63-J6vRyg',
    gid: '669887707'
  }
};

// 🔥 NOVO
EVENTOS:{
  id:'1IDjs0oS6lQBGDrL7ja1Ge0vaBdNCNIULDH7J5p89c5s',
  gid:'0'}
};

async function carregarEventos(){
  const url = `https://docs.google.com/spreadsheets/d/${SHEETS.EVENTOS.id}/export?format=csv&gid=${SHEETS.EVENTOS.gid}`;
  const res = await fetch(url);
  eventosGlobais = parseCSV(await res.text());
}

function horaParaMinutos(h){
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + mm;
}

// ===============================
// 🌍 ESTADO GLOBAL DO APP (NOVO PADRÃO)
// ===============================
window.appState = {
  modalidade: null,
  semana: null,
  aba: "horarios"
};

// ===============================
// 📦 DADOS GLOBAIS
// ===============================
let dadosGlobais = [];
let turmasDaPlanilha = [];
let semanasAgrupadas = {};

// ===============================
// 📅 SEMANA PASSADA
// ===============================
function isSemanaPassada(dataStr) {

  const [d, m, a] = dataStr.split('/');
  const data = new Date(a, m - 1, d);

  const hoje = new Date();

  const dia = hoje.getDay();
  const diff = hoje.getDate() - dia + (dia === 0 ? -6 : 1);

  const segundaAtual = new Date(hoje.setDate(diff));

  return data < segundaAtual;
}

// ===============================
// 🧹 PAINEL ALTERAÇÕES
// ===============================
function limparPainelAlteracoes() {
  const conteudo = document.getElementById("conteudoAlteracoes");
  const painel = document.getElementById("painelAlteracoes");

  if (conteudo) conteudo.innerText = "";
  if (painel) painel.style.display = "none";
}

// ===============================
// 📅 PAINEL VAGAS
// ===============================
function mostrarPainelVagas(texto) {

  document.getElementById("conteudoVagas").innerText = texto;
  document.querySelector("#painelVagas strong").innerText = "📅 Aulas Vagas";
  document.getElementById("painelVagas").style.display = "block";
}

function fecharPainelVagas() {
  document.getElementById("painelVagas").style.display = "none";
}

function copiarVagas() {

  const texto = document.getElementById("conteudoVagas").innerText;

  navigator.clipboard.writeText(texto).then(() => {
    alert("Copiado!");
  });
}

// ===============================
// 🔁 TROCA DE MODALIDADE (AJUSTADO)
// ===============================
function trocarModalidade(){
  window.trocouModalidade = true;

  limparPainelAlteracoes(); // 🔥 ESSENCIAL

  init();
}

// ===============================
// 🔁 TROCA DE SEMANA (AJUSTADO)
// ===============================
function trocarSemana(){

  limparPainelAlteracoes();

  renderizarTabela();

  setTimeout(() => {

  verificarMudancaAoAbrir({
      dados: dadosGlobais,
      getSemana: () => document.getElementById('selectSemana').value,
      getModalidade: () => document.getElementById('selectModalidade').value
    });

  }, 50);
}


// ===============================
// 🚀 INIT PRINCIPAL (AJUSTADO)
// ===============================
async function init(){

  const mod = document.getElementById('selectModalidade').value;

  // 🔥 LIMPA PAINEL ao trocar
  document.getElementById("painelAlteracoes").style.display = "none";

  // 🔥 FLAG DE TROCA
  window.trocouModalidade = true;

  const url = `https://docs.google.com/spreadsheets/d/${SHEETS[mod].id}/export?format=csv&gid=${SHEETS[mod].gid}`;
  const res = await fetch(url);

  dadosGlobais = parseCSV(await res.text());
  await carregarEventos(); // 🔥 NOVO

  processarDados();

  // 🔥 GARANTE verificação após tudo carregado
  setTimeout(() => {
  verificarMudancaAoAbrir({
    dados: dadosGlobais,
    getSemana: () => document.getElementById('selectSemana').value,
    getModalidade: () => document.getElementById('selectModalidade').value
  });
}, 100);
}
