// ======================================================
// 🌍 CORE GLOBAL - IFRO HORÁRIOS 2026
// Arquivo: js/core.js
// ======================================================

// ======================================================
// 🔥 ESTADO GLOBAL DA APLICAÇÃO
// ======================================================

window.appState = {

  abaAtual: "horarios",

  modalidade: "INTEGRADO",

  semanaAtual: null,

  professorAtual: null,

  turmaAtual: null,

  tema: localStorage.getItem("ifro-theme") || "light",

  buscaHorario: "",

  buscaSabados: "",

  buscaRelatorio: "",

  filtroVagas: "TODOS"

};

// ======================================================
// 🔥 BANCO GLOBAL EM MEMÓRIA
// ======================================================

window.dadosSistema = {

  // =========================================
  // MATRIZES BRUTAS
  // =========================================
  integrado: [],

  superior1: [],

  superior2: [],

  eventos: [],

  professores: [],

  relatorios: [],

  // =========================================
  // DADOS PROCESSADOS
  // =========================================
  semanas: {},

  sabados: {},

  professoresNormalizados: {},

  relatorioDPT: [],

  turmasAtivas: [],

  // =========================================
  // CACHE
  // =========================================
  snapshots: {},

  alteracoes: [],

  aulasVagas: []

};

// ======================================================
// 🔥 CONFIGURAÇÕES GLOBAIS
// ======================================================

window.CONFIG = {

  ANO: 2026,

  STORAGE_THEME: "ifro-theme",

  STORAGE_SNAPSHOT: "ifro-snapshot",

  STORAGE_CACHE: "ifro-cache",

  MAX_SNAPSHOT_DIAS: 7,

  DEBUG: false

};

// ======================================================
// 🔥 LINKS GOOGLE SHEETS
// ======================================================

window.PLANILHAS = {

  INTEGRADO:
    "https://docs.google.com/spreadsheets/d/1j33kiPqwtzZNuvkBgYDaIiXZvVMY_J0qWAtRfYGdnD8/gviz/tq?tqx=out:json&gid=1357770092",

  SUPERIOR1:
    "https://docs.google.com/spreadsheets/d/14ALXZgFIT68ee9ajuIdG63SpGVm0HyTjwp63-J6vRyg/gviz/tq?tqx=out:json&gid=669887707",

  EVENTOS:
    "https://docs.google.com/spreadsheets/d/1IDjs0oS6lQBGDrL7ja1Ge0vaBdNCNIULDH7J5p89c5s/gviz/tq?tqx=out:json&gid=0",

  PROFESSORES:
    "https://docs.google.com/spreadsheets/d/1IDjs0oS6lQBGDrL7ja1Ge0vaBdNCNIULDH7J5p89c5s/gviz/tq?tqx=out:json&gid=1694280391",

  RELATORIO_INTEGRADO:
    "https://docs.google.com/spreadsheets/d/1j33kiPqwtzZNuvkBgYDaIiXZvVMY_J0qWAtRfYGdnD8/gviz/tq?tqx=out:json&gid=657984342",

  RELATORIO_SUPERIOR1:
    "https://docs.google.com/spreadsheets/d/14ALXZgFIT68ee9ajuIdG63SpGVm0HyTjwp63-J6vRyg/gviz/tq?tqx=out:json&gid=1064095810"

};

// ======================================================
// 🔥 HORÁRIOS OFICIAIS
// ======================================================

window.HORARIOS = [

  "07:30 - 08:20",
  "08:20 - 09:10",
  "09:30 - 10:20",
  "10:20 - 11:10",
  "11:10 - 12:00",

  "13:50 - 14:40",
  "14:40 - 15:30",
  "15:50 - 16:40",
  "16:40 - 17:30",
  "17:30 - 18:20",

  "19:00 - 19:50",
  "19:50 - 20:40",
  "20:50 - 21:40",
  "21:40 - 22:30"

];

// ======================================================
// 🔥 FERIADOS
// ======================================================

window.FERIADOS = [

  "01/01/2026",
  "16/02/2026",
  "17/02/2026",
  "18/02/2026",
  "03/04/2026",
  "20/04/2026",
  "21/04/2026",
  "01/05/2026",
  "04/06/2026",
  "05/06/2026",
  "07/09/2026",
  "12/10/2026",
  "02/11/2026",
  "15/11/2026",
  "25/12/2026"

];

// ======================================================
// 🔥 TURMAS INTEGRADO
// ======================================================

window.TURMAS_INTEGRADO = [

  "1-AGROECOLOGIA",
  "2-AGROECOLOGIA",
  "3-AGROECOLOGIA",

  "1-A-AGROPECUÁRIA",
  "1-B-AGROPECUARIA",

  "2-A-AGROPECUÁRIA",
  "2-B-AGROPECUARIA",

  "3-A-AGROPECUÁRIA",
  "3-B-AGROPECUARIA",

  "1-A-INFORMÁTICA",
  "1-B-INFORMÁTICA",

  "2-A-INFORMÁTICA",
  "2-B-INFORMÁTICA",

  "3-A-INFORMÁTICA",
  "3-B-INFORMÁTICA"

];

// ======================================================
// 🔥 TURMAS SUPERIOR
// ======================================================

window.TURMAS_SUPERIOR = [

  "1 SEMESTRE GEOGRAFIA",
  "2 SEMESTRE GEOGRAFIA",
  "3 SEMESTRE GEOGRAFIA",
  "4 SEMESTRE GEOGRAFIA",
  "5 SEMESTRE GEOGRAFIA",
  "6 SEMESTRE GEOGRAFIA",
  "7 SEMESTRE GEOGRAFIA",
  "8 SEMESTRE GEOGRAFIA",

  "1 SEMESTRE MATEMÁTICA",
  "2 SEMESTRE MATEMÁTICA",
  "3 SEMESTRE MATEMÁTICA",
  "4 SEMESTRE MATEMÁTICA",
  "5 SEMESTRE MATEMÁTICA",
  "6 SEMESTRE MATEMÁTICA",
  "7 SEMESTRE MATEMÁTICA",
  "8 SEMESTRE MATEMÁTICA",

  "1 SEMESTRE AGRONEGÓCIO",
  "2 SEMESTRE AGRONEGÓCIO",
  "3 SEMESTRE AGRONEGÓCIO",
  "4 SEMESTRE AGRONEGÓCIO",
  "5 SEMESTRE AGRONEGÓCIO",
  "6 SEMESTRE AGRONEGÓCIO",

  "1 SEMESTRE ZOOTECNIA",
  "2 SEMESTRE ZOOTECNIA",
  "3 SEMESTRE ZOOTECNIA",
  "4 SEMESTRE ZOOTECNIA",
  "5 SEMESTRE ZOOTECNIA",
  "6 SEMESTRE ZOOTECNIA",
  "7 SEMESTRE ZOOTECNIA",
  "8 SEMESTRE ZOOTECNIA",
  "9 SEMESTRE ZOOTECNIA",
  "10 SEMESTRE ZOOTECNIA",

  "1 SEMESTRE AGRONOMIA",
  "2 SEMESTRE AGRONOMIA",
  "3 SEMESTRE AGRONOMIA",
  "4 SEMESTRE AGRONOMIA",
  "5 SEMESTRE AGRONOMIA",
  "6 SEMESTRE AGRONOMIA",
  "7 SEMESTRE AGRONOMIA",
  "8 SEMESTRE AGRONOMIA",
  "9 SEMESTRE AGRONOMIA",
  "10 SEMESTRE AGRONOMIA"

];

// ======================================================
// 🔥 REGRAS DE DESTAQUE
// ======================================================

window.REGRAS_DESTAQUE = [

  {
    match: v => v.includes("RESERVA ENSINO"),
    classe: "reserva-ensino"
  },

  {
    match: v => v.includes("PPS/ATENDIMENTO"),
    classe: "pps"
  },

  {
    match: v => v.includes("ESTUDOS INDIVIDUAIS"),
    classe: "estudos"
  },

  {
    match: v => v.includes("REUNIAO DE SERVIDORES"),
    classe: "reuniao"
  },

  {
    match: v =>
      v.includes("CAED") ||
      v.includes("PRE-CONSELHO"),

    classe: "caed"
  },

  {
    match: v => v.includes("_REP -"),
    classe: "reposicao"
  }

];

// ======================================================
// 🔥 TERMOS DE AULAS VAGAS
// ======================================================

window.TERMOS_AULA_VAGA = [

  "RESERVA ENSINO",
  "ESTUDOS INDIVIDUAIS"

];

// ======================================================
// 🔥 CORES PDF
// ======================================================

window.coresPDF = {

  "reserva-ensino": [255, 243, 205],

  "pps": [13, 110, 253],

  "estudos": [255, 224, 178],

  "reuniao": [224, 224, 224],

  "caed": [206, 147, 216],

  "reposicao": [211, 47, 47]

};

// ======================================================
// 🔥 DIAS DA SEMANA
// ======================================================

window.DIAS_SEMANA = [

  "DOMINGO",
  "SEGUNDA-FEIRA",
  "TERÇA-FEIRA",
  "QUARTA-FEIRA",
  "QUINTA-FEIRA",
  "SEXTA-FEIRA",
  "SÁBADO"

];

// ======================================================
// 🔥 INIT TEMA
// ======================================================

document.documentElement.setAttribute(
  "data-theme",
  appState.tema
);

// ======================================================
// 🔥 LOG DEBUG
// ======================================================

function debug(...args) {

  if (!CONFIG.DEBUG) return;

  console.log(
    "[IFRO DEBUG]",
    ...args
  );

}

// ======================================================
// 🔥 APP READY
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

  debug("Sistema iniciado.");

});

window.AppState = window.appState;
