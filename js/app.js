// ===============================
// 🌍 ESTADO GLOBAL
// ===============================
window.appState = {
  modalidade: null,
  semana: null,
  aba: "horarios"
};

// ===============================
// 📦 DADOS GLOBAIS
// ===============================
window.dadosGlobais = [];
window.eventosGlobais = [];
window.turmasDaPlanilha = [];
window.semanasAgrupadas = {};

// ===============================
// 🔗 PLANILHAS
// ===============================
const SHEETS = {

  INTEGRADO: {
    id: "1j33kiPqwtzZNuvkBgYDaIiXZvVMY_J0qWAtRfYGdnD8",
    gid: "1357770092"
  },

  SUPERIOR: {
    id: "14ALXZgFIT68ee9ajuIdG63SpGVm0HyTjwp63-J6vRyg",
    gid: "669887707"
  },

  EVENTOS: {
    id: "1IDjs0oS6lQBGDrL7ja1Ge0vaBdNCNIULDH7J5p89c5s",
    gid: "0"
  }

};


// ===============================
// ⏰ HORA → MINUTOS
// ===============================
function horaParaMinutos(h) {

  if (!h || !h.includes(":")) return 0;

  const [hh, mm] = h.split(":").map(Number);

  return (hh * 60) + mm;
}


// ===============================
// 📅 VERIFICA SEMANA PASSADA
// ===============================
function isSemanaPassada(dataStr) {

  try {

    const [d, m, a] = dataStr.split("/");

    const data = new Date(a, m - 1, d);

    const hoje = new Date();

    const dia = hoje.getDay();

    const diff =
      hoje.getDate() - dia + (dia === 0 ? -6 : 1);

    const segundaAtual =
      new Date(hoje.setDate(diff));

    return data < segundaAtual;

  } catch (e) {

    console.warn("⚠️ Erro em isSemanaPassada:", e);

    return false;
  }
}


// ===============================
// 🧹 LIMPAR PAINEL ALTERAÇÕES
// ===============================
function limparPainelAlteracoes() {

  const conteudo =
    document.getElementById("conteudoAlteracoes");

  const painel =
    document.getElementById("painelAlteracoes");

  if (conteudo) {
    conteudo.innerText = "";
  }

  if (painel) {
    painel.style.display = "none";
  }

}


// ===============================
// 📅 PAINEL VAGAS
// ===============================
function mostrarPainelVagas(texto) {

  const conteudo =
    document.getElementById("conteudoVagas");

  const painel =
    document.getElementById("painelVagas");

  const titulo =
    document.querySelector("#painelVagas strong");

  if (conteudo) {
    conteudo.innerText = texto || "";
  }

  if (titulo) {
    titulo.innerText = "📅 Aulas Vagas";
  }

  if (painel) {
    painel.style.display = "block";
  }

}


function fecharPainelVagas() {

  const painel =
    document.getElementById("painelVagas");

  if (painel) {
    painel.style.display = "none";
  }

}


function copiarVagas() {

  try {

    const texto =
      document.getElementById("conteudoVagas")
        ?.innerText || "";

    navigator.clipboard
      .writeText(texto)
      .then(() => alert("Copiado!"));

  } catch (e) {

    console.warn("⚠️ Erro ao copiar vagas:", e);

  }

}


// ===============================
// 📥 CARREGAR EVENTOS
// ===============================
async function carregarEventos() {

  try {

    const url =
      `https://docs.google.com/spreadsheets/d/${SHEETS.EVENTOS.id}/export?format=csv&gid=${SHEETS.EVENTOS.gid}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Falha ao carregar eventos.");
    }

    const texto = await res.text();

    if (typeof parseCSV !== "function") {
      throw new Error("parseCSV não encontrado.");
    }

    window.eventosGlobais = parseCSV(texto);

  } catch (e) {

    console.warn("⚠️ Erro ao carregar eventos:", e);

    window.eventosGlobais = [];
  }

}


// ===============================
// 🔁 TROCA MODALIDADE
// ===============================
function trocarModalidade() {

  try {

    window.trocouModalidade = true;

    limparPainelAlteracoes();

    init();

  } catch (e) {

    console.warn("⚠️ Erro em trocarModalidade:", e);

  }

}


// ===============================
// 🔁 TROCA SEMANA
// ===============================
function trocarSemana() {

  try {

    limparPainelAlteracoes();

    if (typeof renderizarTabela === "function") {
      renderizarTabela();
    }

    setTimeout(() => {

      if (
        typeof verificarMudancaAoAbrir === "function"
      ) {

        verificarMudancaAoAbrir({

          dados: window.dadosGlobais,

          getSemana: () =>
            document.getElementById("selectSemana")?.value,

          getModalidade: () =>
            document.getElementById("selectModalidade")?.value

        });

      }

    }, 50);

  } catch (e) {

    console.warn("⚠️ Erro em trocarSemana:", e);

  }

}


// ===============================
// 🚀 INIT PRINCIPAL
// ===============================
async function init() {

  try {

    const selectModalidade =
      document.getElementById("selectModalidade");

    if (!selectModalidade) {
      console.warn("⚠️ selectModalidade não encontrado.");
      return;
    }

    const mod = selectModalidade.value;

    if (!SHEETS[mod]) {
      console.warn("⚠️ Modalidade inválida:", mod);
      return;
    }

    window.modalidadeAtual = mod;

    const painel =
      document.getElementById("painelAlteracoes");

    if (painel) {
      painel.style.display = "none";
    }

    const url =
      `https://docs.google.com/spreadsheets/d/${SHEETS[mod].id}/export?format=csv&gid=${SHEETS[mod].gid}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(
        `Erro ao carregar modalidade ${mod}`
      );
    }

    const texto = await res.text();

    if (typeof parseCSV !== "function") {
      throw new Error("parseCSV não encontrado.");
    }

    window.dadosGlobais = parseCSV(texto);

    await carregarEventos();

    if (typeof processarDados === "function") {
      processarDados();
    }

    setTimeout(() => {

      if (
        typeof verificarMudancaAoAbrir === "function"
      ) {

        verificarMudancaAoAbrir({

          dados: window.dadosGlobais,

          getSemana: () =>
            document.getElementById("selectSemana")?.value,

          getModalidade: () =>
            document.getElementById("selectModalidade")?.value

        });

      }

    }, 100);

  } catch (e) {

    console.error("❌ Erro no init:", e);

  }

}


// ===============================
// 📅 EVENTO GERAL
// ===============================
function getEventoGeral(dia, horario) {

  try {

    if (
      !horario ||
      !horario.includes(" - ")
    ) {
      return null;
    }

    const [hIniStr, hFimStr] =
      horario.split(" - ");

    const hIniLinha =
      horaParaMinutos(hIniStr);

    const hFimLinha =
      horaParaMinutos(hFimStr);

    for (let i = 1; i < window.eventosGlobais.length; i++) {

      const ev = window.eventosGlobais[i];

      const modalidade = ev[0];
      const tipo = ev[1];
      const data = ev[3];
      const hInicio = horaParaMinutos(ev[4]);
      const hFim = horaParaMinutos(ev[5]);
      const desc = ev[6];

      const modAtual =
        document.getElementById("selectModalidade")
          ?.value;

      if (modalidade !== modAtual) continue;

      if (tipo !== "GERAL") continue;

      if (data !== dia) continue;

      // 🔥 interseção de intervalo
      const dentro =
        hIniLinha < hFim &&
        hFimLinha > hInicio;

      if (dentro) {
        return desc || "EVENTO";
      }

    }

    return null;

  } catch (e) {

    console.warn("⚠️ Erro em getEventoGeral:", e);

    return null;
  }

}


// ===============================
// 🌎 EXPORTAÇÃO GLOBAL
// ===============================
window.SHEETS = SHEETS;

window.horaParaMinutos = horaParaMinutos;
window.isSemanaPassada = isSemanaPassada;

window.limparPainelAlteracoes = limparPainelAlteracoes;

window.mostrarPainelVagas = mostrarPainelVagas;
window.fecharPainelVagas = fecharPainelVagas;
window.copiarVagas = copiarVagas;

window.carregarEventos = carregarEventos;

window.trocarModalidade = trocarModalidade;
window.trocarSemana = trocarSemana;

window.init = init;

window.getEventoGeral = getEventoGeral;
