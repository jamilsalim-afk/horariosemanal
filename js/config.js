const SHEETS = {
  INTEGRADO:   { id:'1j33kiPqwtzZNuvkBgYDaIiXZvVMY_J0qWAtRfYGdnD8', gid:'1357770092' },
  SUPERIOR:    { id:'14ALXZgFIT68ee9ajuIdG63SpGVm0HyTjwp63-J6vRyg',  gid:'669887707'  },
  SUPERIOR2:   { id:'14ALXZgFIT68ee9ajuIdG63SpGVm0HyTjwp63-J6vRyg',  gid:'1214898689' },
  PROFESSORES: { id:'1IDjs0oS6lQBGDrL7ja1Ge0vaBdNCNIULDH7J5p89c5s',  gid:'1694280391' }
};

// Calendário letivo 2026
const CALENDARIO = {
  INTEGRADO_S1_FIM: "19/06/2026",
  INTEGRADO_S2_INI: "22/07/2026",
  INTEGRADO_FIM:    "27/11/2026",
  SUPERIOR1_FIM:    "26/06/2026",
  SUPERIOR2_INI:    "22/07/2026",
  SUPERIOR2_FIM:    "04/12/2026"
};

let dadosGlobais = [];
let dadosIntegrado = [];
let dadosSuperior = [];
let dadosSuperior2 = [];
let dadosProfessores = [];
let listaProfessores = [];

let turmasDaPlanilha = [];
let semanasAgrupadas = [];

let BASE_GERAL = [];
let INDEX_PROFESSOR = {};
let INDEX_TURMA = {};
let RELATORIO_DISCIPLINAS = [];

let semanasIntegrado = {};
let semanasSuperior = {};
let semanasSuperior2 = {};

let turmasIntegrado = [];
let turmasSuperior = [];
let turmasSuperior2 = [];

let timerBuscaEstatistica = null;

window.horariosProntos = false;

// Semestre ativo do Superior (1 ou 2)
window.semesterSuperior = 1;

const FERIADOS = [
  "01/01/2026","16/02/2026","17/02/2026","18/02/2026","03/04/2026","20/04/2026","21/04/2026","01/05/2026",
  "04/06/2026","05/06/2026","07/09/2026","12/10/2026","02/11/2026",
  "15/11/2026","25/12/2026"
];

// Colunas PRD/PGD na planilha de professores (índices a partir de 0)
// Col A=0 (NOME_EXIBICAO), Col B=1 (VARIACOES)
// Col C=2..L=11 → PRD | Col M=12..V=21 → PGD
const PRD_PGD_LABELS = [
  "SEG M","SEG T","TER M","TER T","QUA M","QUA T","QUI M","QUI T","SEX M","SEX T"
];
const PRD_INICIO_COL = 2;
const PGD_INICIO_COL = 12;
