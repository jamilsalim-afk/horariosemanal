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
