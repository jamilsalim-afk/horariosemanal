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

// 🔥 recria índice
window.INDICE_BASE = null;

// 🔥 recria base unificada
if (
  !window.BASE_UNIFICADA ||
  !window.BASE_UNIFICADA.length
) {

  await carregarBaseUnificada();
  await montarBaseRelatorioDPT();

}

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
// 📦 HEADERS DAS PLANILHAS
// ===============================
window.headerIntegrado = [];
window.headerSuperior = [];

// ===============================
// 🌍 BASE UNIFICADA GLOBAL
// ===============================
window.BASE_UNIFICADA = [];

// ===============================
// 📥 CARREGAR CSV INTEGRADO
// ===============================
async function carregarCSVIntegrado() {

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEETS.INTEGRADO.id}/export?format=csv&gid=${SHEETS.INTEGRADO.gid}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro integrado");

  const texto = await res.text();
  const dados = parseCSV(texto);

  window.headerIntegrado = dados[0] || [];

  return dados;
}

// ===============================
// 📥 CARREGAR CSV SUPERIOR
// ===============================
async function carregarCSVSuperior() {

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEETS.SUPERIOR.id}/export?format=csv&gid=${SHEETS.SUPERIOR.gid}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro superior");

  const texto = await res.text();
  const dados = parseCSV(texto);

  window.headerSuperior = dados[0] || [];

  return dados;
}

// ===============================
// 🔥 NORMALIZAR BASE (FIX REAL)
// ===============================
function normalizarBase(dados, origem) {

  const saida = [];

  const header =
    dados?.[0] || [];

  const turmas =
    header.slice(2).filter(t => t?.trim());

  const nomesDias = [
    "DOMINGO",
    "SEGUNDA",
    "TERÇA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SÁBADO"
  ];

  let ultimaData = "";

  for (let i = 1; i < dados.length; i++) {

    const linha = dados[i];

    if (!Array.isArray(linha)) {
      continue;
    }

    // 🔥 mantém última data válida
    if (linha[0]?.trim()) {
      ultimaData = linha[0].trim();
    }

    const data = ultimaData;

    const horario =
      (linha[1] || "").trim();

    if (!data || !horario) {
      continue;
    }

    // 🔥 ignora intervalos
    if (
      normalizarTexto(horario)
        .includes("INTERVALO")
    ) {
      continue;
    }

    // 🔥 apenas semana atual
    if (
      typeof dataDentroDaSemanaAtual === "function" &&
      !dataDentroDaSemanaAtual(data)
    ) {
      continue;
    }

    const [d, m, a] =
      data.split("/");

    const dt =
      new Date(a, m - 1, d);

    const dia =
      nomesDias[dt.getDay()];

    if (dia === "DOMINGO") {
      continue;
    }

    // 🔥 percorre turmas CORRETAS
    turmas.forEach((turma, idxTurma) => {

      const idx = idxTurma + 2;

      const valor =
        (linha[idx] || "").trim();

      if (!valor) {
        return;
      }

      const aulaValida =
        valor.includes(" - ");

      let professorCurto = "";

      let disciplina = valor;

      if (aulaValida) {

        const partes =
          valor.split(/\s*[-–]\s*/);

        professorCurto =
          normalizarTexto(
            partes.pop()
          );

        disciplina =
          partes.join(" - ").trim();
      }

      saida.push({

        data,

        dia,

        horario,

        turma,

        valor,

        disciplina,

        professorCurto,

        aulaValida,

        modalidade:
          origem.toUpperCase(),

        origem
      });

    });

  }

  return saida;
}

// ===============================
// 🔥 CARREGAR BASE UNIFICADA
// ===============================
async function carregarBaseUnificada() {

  try {

    const integrado =
      await carregarCSVIntegrado();

    const superior =
      await carregarCSVSuperior();

    const base = [

      ...normalizarBase(
        integrado,
        "integrado"
      ),

      ...normalizarBase(
        superior,
        "superior"
      )

    ];

    window.BASE_UNIFICADA = base;

    console.log(
      "✅ BASE UNIFICADA:",
      base.length
    );

    return base;

  } catch (e) {

    console.error(
      "❌ Erro carregarBaseUnificada:",
      e
    );

    window.BASE_UNIFICADA = [];

    return [];
  }
}

// ===============================
// 🧹 LIMPAR SNAPSHOTS
// ===============================
function limparSnapshots() {

  Object.keys(localStorage)
    .filter(k => k.startsWith("snapshot_"))
    .forEach(k => localStorage.removeItem(k));

  console.log("🧹 Snapshots removidos.");

}

async function montarBaseRelatorioDPT() {

  const arquivos = [

    {
      modalidade: "INTEGRADO",

      id:
        "1j33kiPqwtzZNuvkBgYDaIiXZvVMY_J0qWAtRfYGdnD8",

      gid:
        "657984342"
    },

    {
      modalidade: "SUPERIOR",

      id:
        "14ALXZgFIT68ee9ajuIdG63SpGVm0HyTjwp63-J6vRyg",

      gid:
        "1064095810"
    }

  ];

  const base = [];
  const mapa = new Map();

  for (const arquivo of arquivos) {

    console.log(
      "LENDO:",
      arquivo.modalidade
    );

    const url = `
      https://docs.google.com/spreadsheets/d/
      ${arquivo.id}
      /gviz/tq?gid=${arquivo.gid}
      &tqx=out:json
    `
    .replace(/\s+/g, "");

    const response =
      await fetch(url);

    const texto =
      await response.text();

    const jsonTexto =
      texto.substring(
        47,
        texto.length - 2
      );

    const json =
      JSON.parse(jsonTexto);

    const rows =
      json.table.rows || [];

    // =====================================
    // MATRIZ
    // =====================================
    const matriz = rows.map(r =>

      (r.c || []).map(c =>

        String(
          c?.f ??
          c?.v ??
          ""
        ).trim()

      )

    );

    // =====================================
    // PRIMEIRA LINHA = TURMAS
    // =====================================
    const linhaTurmas =
      matriz[0] || [];

    console.log(
      "TURMAS:",
      linhaTurmas
    );

    // =====================================
    // LINHAS DAS AULAS
    // =====================================
    for (
      let linha = 1;
      linha < matriz.length;
      linha++
    ) {

      const row =
        matriz[linha] || [];

      // percorre colunas
      for (
        let col = 0;
        col < row.length;
        col++
      ) {

        const turma =
          String(
            linhaTurmas[col] || ""
          ).trim();

        if (!turma) {
          continue;
        }

        const valor =
          String(
            row[col] || ""
          ).trim();

        if (!valor) {
          continue;
        }

        // ignora intervalo
        if (
          valor
            .toUpperCase()
            .includes("INTERVALO")
        ) {
          continue;
        }

        // precisa ter professor
        if (
          !valor.includes("-")
        ) {
          continue;
        }

        const partes =
          valor.split("-");

        if (
          partes.length < 2
        ) {
          continue;
        }

        const disciplina =
          partes[0]
            .replace(/\*/g, "")
            .trim();

        const professorCurto =
          partes
            .slice(1)
            .join("-")
            .replace(/\*/g, "")
            .trim();

        if (
          !disciplina ||
          !professorCurto
        ) {
          continue;
        }

        const chave =
          `${disciplina}|${professorCurto}|${turma}`;

        // evita duplicados
        if (
          mapa.has(chave)
        ) {
          continue;
        }

        mapa.set(chave, true);

        base.push({

          modalidade:
            arquivo.modalidade,

          turma,

          disciplina,

          professorCurto,

          valor

        });

      }

    }

  }

  console.log(
    "BASE_RELATORIO_DPT:",
    base.length
  );

  console.table(base);

  window.BASE_RELATORIO_DPT =
    base;

  return base;

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