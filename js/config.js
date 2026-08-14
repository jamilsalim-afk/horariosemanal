// Link da aba de configuração na planilha mestra (planilha real do sistema)
const CONFIG_URL = "https://docs.google.com/spreadsheets/d/122GdHocj0Ia-o_LOeHm9fTF3TkPkWrYZ9MHYYpyHt4g/export?format=csv&gid=0";

let dadosGlobais = [];

let dadosIntegrado = [];
let dadosSuperior = [];

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

let turmasIntegrado = [];
let turmasSuperior = [];

let timerBuscaEstatistica = null;

const FERIADOS=[
"01/01/2026","16/02/2026","17/02/2026","18/02/2026","03/04/2026","20/04/2026","21/04/2026","01/05/2026",
"04/06/2026","05/06/2026","07/09/2026","12/10/2026","02/11/2026",
"15/11/2026","25/12/2026"
];
