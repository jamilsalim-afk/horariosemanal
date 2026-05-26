// ======================================================
// 🛠️ UTILITÁRIOS GLOBAIS
// Arquivo: js/utils.js
// ======================================================

// ======================================================
// 🔥 NORMALIZAR TEXTO
// ======================================================

function normalizarTexto(txt = "") {

  return txt
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

}

// ======================================================
// 🔥 REMOVER ESPAÇOS DUPLOS
// ======================================================

function limparEspacos(txt = "") {

  return txt
    .replace(/\s+/g, " ")
    .trim();

}

// ======================================================
// 🔥 VERIFICAR SE É DATA
// ======================================================

function ehData(valor = "") {

  return /^\d{2}\/\d{2}\/\d{4}$/.test(
    valor.toString().trim()
  );

}

// ======================================================
// 🔥 CONVERTER DATA BR
// ======================================================

function parseDataBR(dataStr) {

  if (!ehData(dataStr)) return null;

  const [d, m, a] = dataStr.split("/");

  return new Date(a, m - 1, d);

}

// ======================================================
// 🔥 FORMATAR DATA
// ======================================================

function formatarData(data) {

  if (!(data instanceof Date)) return "";

  const d = String(data.getDate()).padStart(2, "0");

  const m = String(data.getMonth() + 1).padStart(2, "0");

  const a = data.getFullYear();

  return `${d}/${m}/${a}`;

}

// ======================================================
// 🔥 OBTER NOME DIA
// ======================================================

function getNomeDia(dataStr) {

  const data = parseDataBR(dataStr);

  if (!data) return "";

  return DIAS_SEMANA[data.getDay()];

}

// ======================================================
// 🔥 É FERIADO
// ======================================================

function ehFeriado(dataStr) {

  return FERIADOS.includes(dataStr);

}

// ======================================================
// 🔥 DETECTAR AULA REAL
// ======================================================

function ehAula(valor = "") {

  valor = normalizarTexto(valor);

  if (!valor) return false;

  if (
    valor.includes("INTERVALO") ||
    valor.includes("[+]") ||
    valor.includes("[R]") ||
    valor === "*" ||
    valor === "-"
  ) {
    return false;
  }

  return valor.includes(" - ");

}

// ======================================================
// 🔥 DETECTAR AULA VAGA
// ======================================================

function ehAulaVaga(valor = "") {

  valor = normalizarTexto(valor);

  return TERMOS_AULA_VAGA.some(t =>
    valor.includes(normalizarTexto(t))
  );

}

// ======================================================
// 🔥 DETECTAR CLASSE ESPECIAL
// ======================================================

function detectarClasse(valor = "") {

  valor = normalizarTexto(valor);

  for (const regra of REGRAS_DESTAQUE) {

    if (regra.match(valor)) {
      return regra.classe;
    }

  }

  return "";

}

// ======================================================
// 🔥 ABREVIAR TURMA
// ======================================================

function abreviarTurma(turma = "") {

  return turma

    .replaceAll("SUPERIOR", "SUP.")

    .replaceAll("1 SEMESTRE", "1º")
    .replaceAll("2 SEMESTRE", "2º")
    .replaceAll("3 SEMESTRE", "3º")
    .replaceAll("4 SEMESTRE", "4º")
    .replaceAll("5 SEMESTRE", "5º")
    .replaceAll("6 SEMESTRE", "6º")
    .replaceAll("7 SEMESTRE", "7º")
    .replaceAll("8 SEMESTRE", "8º")
    .replaceAll("9 SEMESTRE", "9º")
    .replaceAll("10 SEMESTRE", "10º")

    .replaceAll("GEOGRAFIA", "GEO.")
    .replaceAll("MATEMÁTICA", "MAT.")
    .replaceAll("MATEMATICA", "MAT.")
    .replaceAll("AGRONEGÓCIO", "AGRONEG.")
    .replaceAll("AGRONEGOCIO", "AGRONEG.")
    .replaceAll("ZOOTECNIA", "ZOO.")
    .replaceAll("AGRONOMIA", "AGRON.")

    .replaceAll("MATUTINO", "MAT.")
    .replaceAll("VESPERTINO", "VESP.")
    .replaceAll("NOTURNO", "NOT.")

    .replaceAll("INTEGRADO", "INT.")
    .replaceAll("AGROECOLOGIA", "AGROEC.")
    .replaceAll("AGROPECUÁRIA", "AGROP.")
    .replaceAll("AGROPECUARIA", "AGROP.")
    .replaceAll("INFORMÁTICA", "INFO")
    .replaceAll("INFORMATICA", "INFO");

}

// ======================================================
// 🔥 CORES DAS TURMAS
// ======================================================

function getCursoInfo(t) {

  t = normalizarTexto(t);

  if (t.includes("AGROEC")) {
    return {
      cl: "c-agroec",
      rgb: [232, 245, 233]
    };
  }

  if (t.includes("AGROPEC")) {
    return {
      cl: "c-agropec",
      rgb: [227, 242, 253]
    };
  }

  if (t.includes("INFO")) {
    return {
      cl: "c-info",
      rgb: [255, 248, 225]
    };
  }

  if (t.includes("GEO")) {
    return {
      cl: "c-geo",
      rgb: [243, 229, 245]
    };
  }

  if (t.includes("MAT")) {
    return {
      cl: "c-mat",
      rgb: [224, 247, 250]
    };
  }

  if (t.includes("AGRONEG")) {
    return {
      cl: "c-agroneg",
      rgb: [239, 235, 233]
    };
  }

  if (t.includes("ZOO")) {
    return {
      cl: "c-zoo",
      rgb: [252, 228, 236]
    };
  }

  if (t.includes("AGRON")) {
    return {
      cl: "c-agron",
      rgb: [241, 248, 233]
    };
  }

  return {
    cl: "",
    rgb: [255, 255, 255]
  };

}

// ======================================================
// 🔥 BUSCA FLEXÍVEL
// ======================================================

function contemBusca(valor = "", busca = "") {

  valor = normalizarTexto(valor);

  busca = normalizarTexto(busca);

  if (!busca) return true;

  return valor.includes(busca);

}

// ======================================================
// 🔥 GERAR ID ÚNICO
// ======================================================

function uid() {

  return Math.random()
    .toString(36)
    .substring(2, 12);

}

// ======================================================
// 🔥 STORAGE
// ======================================================

function salvarStorage(chave, valor) {

  localStorage.setItem(
    chave,
    JSON.stringify(valor)
  );

}

function lerStorage(chave, padrao = null) {

  try {

    const valor = localStorage.getItem(chave);

    return valor
      ? JSON.parse(valor)
      : padrao;

  } catch {

    return padrao;

  }

}

function removerStorage(chave) {

  localStorage.removeItem(chave);

}

// ======================================================
// 🔥 SNAPSHOT
// ======================================================

function salvarSnapshot(snapshot) {

  salvarStorage(
    CONFIG.STORAGE_SNAPSHOT,
    snapshot
  );

}

function obterSnapshot() {

  return lerStorage(
    CONFIG.STORAGE_SNAPSHOT,
    null
  );

}

// ======================================================
// 🔥 TEMA
// ======================================================

function alternarTema() {

  appState.tema =
    appState.tema === "dark"
      ? "light"
      : "dark";

  document.documentElement.setAttribute(
    "data-theme",
    appState.tema
  );

  salvarStorage(
    CONFIG.STORAGE_THEME,
    appState.tema
  );

}

// ======================================================
// 🔥 SCROLL HORIZONTAL SUAVE
// ======================================================

function scrollTabela(containerId, direcao = 1) {

  const el = document.getElementById(containerId);

  if (!el) return;

  el.scrollBy({
    left: direcao * 400,
    behavior: "smooth"
  });

}

// ======================================================
// 🔥 COPIAR TEXTO
// ======================================================

async function copiarTexto(texto) {

  try {

    await navigator.clipboard.writeText(texto);

    return true;

  } catch {

    return false;

  }

}

// ======================================================
// 🔥 LOADING
// ======================================================

function showLoading() {

  document.body.classList.add("loading");

}

function hideLoading() {

  document.body.classList.remove("loading");

}

// ======================================================
// 🔥 DEBOUNCE
// ======================================================

function debounce(fn, delay = 300) {

  let timer;

  return (...args) => {

    clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
    }, delay);

  };

}

// ======================================================
// 🔥 OBTER SEMANA ATUAL
// ======================================================

function getSemanaAtual() {

  const hoje = new Date();

  const inicio = new Date(hoje);

  inicio.setDate(
    hoje.getDate() - hoje.getDay() + 1
  );

  const fim = new Date(inicio);

  fim.setDate(inicio.getDate() + 5);

  return {

    inicio: formatarData(inicio),

    fim: formatarData(fim)

  };

}

// ======================================================
// 🔥 VERIFICAR MOBILE
// ======================================================

function isMobile() {

  return window.innerWidth <= 768;

}

// ======================================================
// 🔥 VERIFICAR TABLET
// ======================================================

function isTablet() {

  return (
    window.innerWidth > 768 &&
    window.innerWidth <= 1024
  );

}

// ======================================================
// 🔥 OCULTAR ELEMENTO
// ======================================================

function hide(id) {

  const el = document.getElementById(id);

  if (el) {
    el.style.display = "none";
  }

}

// ======================================================
// 🔥 MOSTRAR ELEMENTO
// ======================================================

function show(id, display = "block") {

  const el = document.getElementById(id);

  if (el) {
    el.style.display = display;
  }

}

// ======================================================
// 🔥 DEBUG
// ======================================================

function debugLog(...args) {

  if (!CONFIG.DEBUG) return;

  console.log(
    "[IFRO]",
    ...args
  );

}