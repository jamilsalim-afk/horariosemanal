// ======================================================
// 🧠 PARSER.JS
// MOTOR PRINCIPAL DA MATRIZ GOOGLE SHEETS
// ======================================================

// ======================================================
// 📦 ESTRUTURAS GLOBAIS
// ======================================================

window.matrizCompleta = [];

window.matrizNormalizada = [];

window.semanasAgrupadas = {};

window.turmasDaPlanilha = [];

window.colunasTurmas = [];

window.diasEncontrados = [];

window.horariosEncontrados = [];

// ======================================================
// 🚀 PROCESSAMENTO PRINCIPAL
// ======================================================

function processarMatriz() {

  console.log("🧠 Processando matriz...");

  matrizCompleta = [...dadosGlobais];

  matrizNormalizada = [];

  semanasAgrupadas = {};

  turmasDaPlanilha = [];

  colunasTurmas = [];

  diasEncontrados = [];

  horariosEncontrados = [];

  if (!matrizCompleta.length) {

    console.warn("⚠️ Matriz vazia");

    return;

  }

  detectarEstruturaColunas();

  normalizarMatriz();

  agruparSemanas();

  detectarTurmasAtivas();

  detectarHorarios();

  detectarDias();

  console.log("✅ Parser finalizado");

}

// ======================================================
// 🔥 DETECTAR ESTRUTURA DA MATRIZ
// ======================================================

function detectarEstruturaColunas() {

  const header =
    matrizCompleta[0] || [];

  colunasTurmas = [];

  for (let i = 0; i < header.length; i++) {

    const valor =
      (header[i] || "").toString().trim();

    if (!valor) continue;

    const normalizado =
      normalizarTexto(valor);

    // ignora data e horário duplicados
    if (
      normalizado === "DATA" ||
      normalizado === "HORARIO"
    ) {
      continue;
    }

    // detecta turma válida
    if (ehTurma(valormaiusculo(valor))) {

      colunasTurmas.push({

        colunaOriginal: i,

        turma: valor.trim()

      });

      if (
        !turmasDaPlanilha.includes(valor.trim())
      ) {

        turmasDaPlanilha.push(
          valor.trim()
        );

      }

    }

  }

  console.log(
    "🎓 Turmas detectadas:",
    turmasDaPlanilha.length
  );

}

// ======================================================
// 🔥 NORMALIZAR MATRIZ
// REMOVE COLUNAS DUPLICADAS
// ======================================================

function normalizarMatriz() {

  let dataAtual = "";

  matrizCompleta.forEach((linhaOriginal, index) => {

    // ignora linha totalmente vazia
    if (
      linhaOriginal.every(c => !c)
    ) {
      return;
    }

    // ==================================================
    // 🔥 DATA
    // ==================================================

    let dataLinha = "";

    for (let i = 0; i < linhaOriginal.length; i++) {

      const valor =
        (linhaOriginal[i] || "")
          .toString()
          .trim();

      if (validarData(valor)) {

        dataLinha = valor;

        dataAtual = valor;

        break;

      }

    }

    // ==================================================
    // 🔥 HORÁRIO
    // ==================================================

    let horarioLinha = "";

    for (let i = 0; i < linhaOriginal.length; i++) {

      const valor =
        (linhaOriginal[i] || "")
          .toString()
          .trim();

      if (ehHorario(valor)) {

        horarioLinha = valor;

        break;

      }

    }

    // ignora linhas sem horário
    if (!horarioLinha) {
      return;
    }

    // ==================================================
    // 🔥 MONTA NOVA LINHA
    // ==================================================

    const novaLinha = {

      data: dataLinha || dataAtual,

      horario: horarioLinha,

      aulas: {}

    };

    // ==================================================
    // 🔥 TURMAS
    // ==================================================

    colunasTurmas.forEach(info => {

      const valor =
        (
          linhaOriginal[
            info.colunaOriginal
          ] || ""
        )
          .toString()
          .trim();

      novaLinha.aulas[
        info.turma
      ] = valor;

    });

    matrizNormalizada.push(novaLinha);

  });

  console.log(
    "🧱 Linhas normalizadas:",
    matrizNormalizada.length
  );

}

// ======================================================
// 📅 AGRUPAR SEMANAS
// ======================================================

function agruparSemanas() {

  semanasAgrupadas = {};

  matrizNormalizada.forEach(linha => {

    const data = linha.data;

    if (!data) return;

    const semana =
      obterSemanaDaData(data);

    if (!semanasAgrupadas[semana]) {

      semanasAgrupadas[semana] = {

        dias: {}

      };

    }

    if (
      !semanasAgrupadas[semana]
        .dias[data]
    ) {

      semanasAgrupadas[semana]
        .dias[data] = [];

    }

    semanasAgrupadas[semana]
      .dias[data]
      .push(linha);

  });

  console.log(
    "📅 Semanas agrupadas:",
    Object.keys(semanasAgrupadas).length
  );

}

// ======================================================
// 🎓 TURMAS ATIVAS
// ======================================================

function detectarTurmasAtivas() {

  turmasDaPlanilha =
    turmasDaPlanilha.filter(turma => {

      return matrizNormalizada.some(linha => {

        const valor =
          linha.aulas[turma] || "";

        return possuiAulaReal(valor);

      });

    });

  console.log(
    "🎓 Turmas ativas:",
    turmasDaPlanilha.length
  );

}

// ======================================================
// 🕐 HORÁRIOS
// ======================================================

function detectarHorarios() {

  horariosEncontrados = [];

  matrizNormalizada.forEach(linha => {

    const h = linha.horario;

    if (
      h &&
      !horariosEncontrados.includes(h)
    ) {

      horariosEncontrados.push(h);

    }

  });

}

// ======================================================
// 📅 DIAS
// ======================================================

function detectarDias() {

  diasEncontrados = [];

  matrizNormalizada.forEach(linha => {

    const d = linha.data;

    if (
      d &&
      !diasEncontrados.includes(d)
    ) {

      diasEncontrados.push(d);

    }

  });

}

// ======================================================
// 🔥 VERIFICA AULA REAL
// ======================================================

function possuiAulaReal(valor) {

  if (!valor) return false;

  const v =
    normalizarTexto(valor);

  // ignora marcações
  if (
    v.includes("INTERVALO") ||
    v.includes("[+]") ||
    v.includes("[R]") ||
    v === "*" ||
    v === "-"
  ) {
    return false;
  }

  // precisa conter hífen
  return v.includes(" - ");

}

// ======================================================
// 🔥 DETECTAR TURMA
// ======================================================

function ehTurma(valor) {

  const v =
    normalizarTexto(valor);

  const referencias = [

    "AGROECOLOGIA",
    "AGROPEC",
    "INFORMATICA",
    "INFO",
    "GEOGRAFIA",
    "MATEMATICA",
    "AGRONEG",
    "ZOOTECNIA",
    "AGRONOMIA",
    "SEMESTRE"

  ];

  return referencias.some(r =>
    v.includes(r)
  );

}

// ======================================================
// 🔥 HORÁRIO
// ======================================================

function ehHorario(valor) {

  if (!valor) return false;

  return /\d{2}:\d{2}/.test(valor);

}

// ======================================================
// 🔥 AULA VAGA
// ======================================================

function ehAulaVaga(valor) {

  if (!valor) return false;

  const v =
    normalizarTexto(valor);

  return (

    v.includes("RESERVA ENSINO") ||

    v.includes("ESTUDOS INDIVIDUAIS")

  );

}

// ======================================================
// 🔥 DETECTAR CLASSE
// ======================================================

function detectarClasse(valor) {

  if (!valor) return "";

  const v =
    normalizarTexto(valor);

  for (const regra of regrasDestaque) {

    if (regra.match(v)) {

      return regra.classe;

    }

  }

  return "";

}

// ======================================================
// 🔥 OBTER TURMAS ATIVAS
// ======================================================

function getTurmasAtivasSemana(semana) {

  const estrutura =
    semanasAgrupadas[semana];

  if (!estrutura) return [];

  return turmasDaPlanilha.filter(turma => {

    return Object.values(
      estrutura.dias
    ).some(linhas => {

      return linhas.some(linha => {

        return possuiAulaReal(
          linha.aulas[turma]
        );

      });

    });

  });

}

// ======================================================
// 🔥 FILTRAR POR PROFESSOR
// ======================================================

function filtrarMatrizProfessor(busca) {

  busca =
    normalizarTexto(busca);

  if (!busca) {

    return matrizNormalizada;

  }

  return matrizNormalizada.filter(linha => {

    return Object.values(
      linha.aulas
    ).some(valor => {

      return normalizarTexto(valor)
        .includes(busca);

    });

  });

}

// ======================================================
// 🔥 FILTRAR POR DIA
// ======================================================

function filtrarPorDiaSemana(diaSemana) {

  return matrizNormalizada.filter(linha => {

    const data =
      converterData(linha.data);

    if (!data) return false;

    return (
      data.getDay() === diaSemana
    );

  });

}

// ======================================================
// 🔥 BUSCAR AULAS VAGAS
// ======================================================

function buscarAulasVagas(diaSemana = null) {

  const resultado = [];

  matrizNormalizada.forEach(linha => {

    if (diaSemana !== null) {

      const data =
        converterData(linha.data);

      if (!data) return;

      if (
        data.getDay() !== diaSemana
      ) {
        return;
      }

    }

    Object.entries(linha.aulas)
      .forEach(([turma, valor]) => {

        if (
          ehAulaVaga(valor)
        ) {

          resultado.push({

            data: linha.data,

            horario: linha.horario,

            turma,

            valor

          });

        }

      });

  });

  return resultado;

}

// ======================================================
// 🔥 OBTER LINHAS DIA
// ======================================================

function obterLinhasDia(data) {

  return matrizNormalizada.filter(linha => {

    return linha.data === data;

  });

}

// ======================================================
// 🔥 OBTÉM SEMANA
// ======================================================

function obterDadosSemana(semana) {

  return semanasAgrupadas[
    semana
  ] || null;

}