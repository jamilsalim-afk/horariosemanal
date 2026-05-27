// ======================================================
// 🔥 FERIADOS
// ======================================================
const FERIADOS = [
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
// 🔥 NORMALIZAR TEXTO
// ======================================================
function normalizarTexto(txt) {

  return (txt || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

// ======================================================
// 🔥 VERIFICA FERIADO
// ======================================================
function isFeriado(data) {

  if (!data) return false;

  return FERIADOS.includes(data);
}

// ======================================================
// 🔥 PARSER CSV ROBUSTO
// ======================================================
function parseCSV(texto) {

  if (!texto) return [];

  const linhas = texto
    .replace(/\r/g, "")
    .split("\n")
    .filter(l => l.trim() !== "");

  return linhas.map(linha => {

    const resultado = [];

    let atual = "";

    let dentroAspas = false;

    for (let i = 0; i < linha.length; i++) {

      const ch = linha[i];

      // 🔥 trata aspas escapadas ""
      if (
        ch === '"' &&
        linha[i + 1] === '"'
      ) {
        atual += '"';
        i++;
        continue;
      }

      if (ch === '"') {
        dentroAspas = !dentroAspas;
        continue;
      }

      if (
        ch === "," &&
        !dentroAspas
      ) {
        resultado.push(atual.trim());
        atual = "";
        continue;
      }

      atual += ch;
    }

    resultado.push(atual.trim());

    return resultado;
  });
}

// ======================================================
// 🔥 ORDENAR DATAS BR
// ======================================================
function ordenarDatasBR(arr = []) {

  return [...arr].sort((a, b) => {

    if (!a || !b) return 0;

    const pa = a.split('/');
    const pb = b.split('/');

    const da = new Date(
      pa[2],
      pa[1] - 1,
      pa[0]
    );

    const db = new Date(
      pb[2],
      pb[1] - 1,
      pb[0]
    );

    return da - db;
  });
}

// ======================================================
// 🔥 SEMANA ATUAL (SEGUNDA-FEIRA)
// ======================================================
function getSemanaAtual() {

  const hoje = new Date();

  const copia = new Date(hoje);

  const diaSemana = copia.getDay();

  const diff =
    diaSemana === 0
      ? -6
      : 1 - diaSemana;

  copia.setDate(
    copia.getDate() + diff
  );

  const d =
    String(copia.getDate())
      .padStart(2, '0');

  const m =
    String(copia.getMonth() + 1)
      .padStart(2, '0');

  const a =
    copia.getFullYear();

  return `${d}/${m}/${a}`;
}

// ======================================================
// 🔥 HORÁRIOS FIXOS
// ======================================================
const HORARIOS_FICHA = [

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
// 🔥 INTERVALOS
// ======================================================
function ehIntervalo(horario) {

  const INTERVALOS = {

    "09:10 - 09:30": "INTERVALO",

    "15:30 - 15:50": "INTERVALO",

    "20:40 - 20:50": "INTERVALO",

    "12:00 - 13:50": "ALMOÇO",

    "18:20 - 19:00": "JANTAR"
  };

  return INTERVALOS[horario] || null;
}

// ======================================================
// 🔥 CONVERTE DATA BR → DATE
// ======================================================
function parseDataBR(dataBR) {

  if (!dataBR) return null;

  const [dia, mes, ano] = dataBR.split('/');

  return new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia),
    0,
    0,
    0,
    0
  );
}

// ======================================================
// 🔥 DATA DE HOJE EM BR
// ======================================================
function getHojeBR() {

  const hoje = new Date();

  const dia = String(
    hoje.getDate()
  ).padStart(2, '0');

  const mes = String(
    hoje.getMonth() + 1
  ).padStart(2, '0');

  const ano = hoje.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

// ======================================================
// 🔥 VERIFICA SE DATA ESTÁ ENTRE HOJE E DOMINGO
// ======================================================
function dataDentroDaSemanaAtual(dataBR) {

  if (!dataBR) return false;

  const hoje = new Date();

  hoje.setHours(0,0,0,0);

  const data = parseDataBR(dataBR);

  if (!data) return false;

  const domingo = new Date(hoje);

  const diasRestantes =
    7 - hoje.getDay();

  domingo.setDate(
    hoje.getDate() + diasRestantes
  );

  domingo.setHours(
    23,59,59,999
  );

  return (
    data >= hoje &&
    data <= domingo
  );
}

// ======================================================
// 🌎 EXPORTAÇÃO GLOBAL
// ======================================================
window.HORARIOS_FICHA = HORARIOS_FICHA;
window.ehIntervalo = ehIntervalo;