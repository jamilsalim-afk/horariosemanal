
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
  document.getElementById("conteudoAlteracoes").innerText = "";
  document.getElementById("painelAlteracoes").style.display = "none";
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
function trocarModalidade() {

  const mod = document.getElementById('selectModalidade').value;

  window.appState.modalidade = mod;

  limparPainelAlteracoes();

  init();
}


// ===============================
// 🔁 TROCA DE SEMANA (AJUSTADO)
// ===============================
function trocarSemana() {

  const sem = document.getElementById('selectSemana').value;

  window.appState.semana = sem;

  limparPainelAlteracoes();

  renderizarTabela();
}


// ===============================
// 🚀 INIT PRINCIPAL (AJUSTADO)
// ===============================
async function init() {

  document.getElementById('searchProf').value = "";

  const mod = document.getElementById('selectModalidade').value;

  window.appState.modalidade = mod;

  document.getElementById("painelAlteracoes").style.display = "none";

  const url = `https://docs.google.com/spreadsheets/d/${SHEETS[mod].id}/export?format=csv&gid=${SHEETS[mod].gid}`;

  const res = await fetch(url);

  dadosGlobais = parseCSV(await res.text());

  processarDados();

  // ===============================
  // 🔥 VERIFICAÇÃO DE ALTERAÇÕES (SEM TIMEOUT)
  // ===============================
  requestAnimationFrame(() => {

    verificarMudancaAoAbrir({
      dados: dadosGlobais,

      getSemana: () =>
        document.getElementById('selectSemana')?.value,

      getModalidade: () =>
        document.getElementById('selectModalidade')?.value
    });

  });
}
