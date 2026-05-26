// ======================================================
// 🌍 SCHEDULER GLOBAL
// ======================================================

window.semanasAgrupadas = {};
window.indicesGlobais = {};
window.turmasDetectadas = [];

window.scheduler = {

  getTurmasPorModalidade: function(modalidade) {

    return window.dadosGlobais
      .filter(item => item.modalidade === modalidade)
      .map(item => item.turma)
      .filter((v, i, a) => a.indexOf(v) === i);

  }

};

// ======================================================
// 🔥 IDENTIFICA LINHA DE DATA
// ======================================================

function linhaEhData(valor) {

  if (!valor) return false;

  const txt = valor.toString().trim();

  return /^\d{2}\/\d{2}\/\d{4}$/.test(txt);
}

// ======================================================
// 🔥 IDENTIFICA HORÁRIO
// ======================================================

function linhaEhHorario(valor) {

  if (!valor) return false;

  return HORARIOS.includes(
    valor.toString().trim()
  );
}

// ======================================================
// 🔥 IDENTIFICA AULA
// ======================================================

function celulaEhAula(valor) {

  if (!valor) return false;

  const txt =
    normalizarTexto(valor);

  if (!txt) return false;

  // 🔥 precisa ter hífen
  if (!txt.includes(" - ")) {
    return false;
  }

  // 🔥 bloqueios
  if (
    txt.includes("RESERVA ENSINO") ||
    txt.includes("ESTUDOS INDIVIDUAIS") ||
    txt.includes("REUNIAO") ||
    txt.includes("CAED") ||
    txt.includes("PPS")
  ) {
    return false;
  }

  return true;
}

// ======================================================
// 🔥 IDENTIFICA SEMANA
// ======================================================

function obterInicioSemana(dataStr) {

  const [d, m, a] = dataStr.split("/");

  const data =
    new Date(a, m - 1, d);

  const dia =
    data.getDay();

  // domingo
  const ajuste =
    dia === 0 ? -6 : 1 - dia;

  data.setDate(
    data.getDate() + ajuste
  );

  return formatarData(data);
}

// ======================================================
// 🔥 DETECTA TURMAS
// ======================================================

function detectarTurmasCabecalho(cabecalho) {

  const turmas = [];

  cabecalho.forEach((coluna, idx) => {

    const txt =
      (coluna || "").toString().trim();

    if (!txt) return;

    const up = txt.toUpperCase();

    // ignora colunas padrão
    if (
      up === "DATA" ||
      up === "HORARIO" ||
      up === "HORÁRIO"
    ) {
      return;
    }

    turmas.push({
      nome: txt,
      coluna: idx
    });

  });

  return turmas;
}

// ======================================================
// 🔥 MONTA ESTRUTURA DAS SEMANAS
// ======================================================

function processarMatrizHorario(
  matriz,
  modalidade = "INTEGRADO"
) {

  if (!matriz?.length) return;

  const cabecalho =
    matriz[0] || [];

  const turmas =
    detectarTurmasCabecalho(cabecalho);

  turmas.forEach(t => {

    if (
      !turmasDetectadas.includes(t.nome)
    ) {
      turmasDetectadas.push(t.nome);
    }

  });

  let semanaAtual = null;
  let diaAtual = null;

  matriz.forEach((linha, idx) => {

    if (!linha?.length) return;

    // 🔥 primeira coluna data
    const data =
      linha[0]?.toString().trim();

    const horario =
      linha[1]?.toString().trim();

    // 🔥 nova data
    if (linhaEhData(data)) {

      diaAtual = data;

      semanaAtual =
        obterInicioSemana(data);

      if (!semanasAgrupadas[semanaAtual]) {

        semanasAgrupadas[semanaAtual] = {
          dias: {},
          modalidade
        };
      }

      if (
        !semanasAgrupadas[semanaAtual]
          .dias[diaAtual]
      ) {

        semanasAgrupadas[semanaAtual]
          .dias[diaAtual] = [];
      }
    }

    // 🔥 ignora linhas inválidas
    if (!diaAtual) return;

    // 🔥 ignora linha vazia
    const vazia =
      linha.every(c => !c);

    if (vazia) return;

    // 🔥 ignora sem horário
    if (
      horario &&
      !linhaEhHorario(horario) &&
      !horario.toUpperCase().includes("INTERVALO")
    ) {
      return;
    }

    // ======================================================
    // 🔥 MONTA REGISTRO LIMPO
    // ======================================================

    const registro = [];

    registro[0] = diaAtual;
    registro[1] = horario;

    turmas.forEach(turma => {

      const valor =
        linha[turma.coluna] || "";

      registro[turma.coluna] =
        valor.toString().trim();

    });

    semanasAgrupadas[semanaAtual]
      .dias[diaAtual]
      .push(registro);

  });

  console.log(
    `✅ ${modalidade} processado`
  );
}

// ======================================================
// 🔥 MONTA ÍNDICES RÁPIDOS
// ======================================================

function construirIndices() {

  indicesGlobais = {

    professores: {},
    turmas: {},
    disciplinas: {}

  };

  Object.keys(semanasAgrupadas)
    .forEach(semana => {

      const dias =
        semanasAgrupadas[semana].dias;

      Object.keys(dias)
        .forEach(dia => {

          dias[dia]
            .forEach(linha => {

              linha.forEach((celula, col) => {

                if (
                  col < 2 ||
                  !celulaEhAula(celula)
                ) {
                  return;
                }

                const partes =
                  celula.split(" - ");

                const disciplina =
                  partes[0]?.trim() || "";

                const professor =
                  partes[1]?.trim() || "";

                const turma =
                  obterTurmaPorColuna(col);

                // ======================================================
                // 👨‍🏫 PROFESSOR
                // ======================================================

                if (
                  !indicesGlobais.professores[
                    professor
                  ]
                ) {

                  indicesGlobais.professores[
                    professor
                  ] = [];
                }

                indicesGlobais.professores[
                  professor
                ].push({

                  semana,
                  dia,
                  horario: linha[1],
                  turma,
                  disciplina

                });

                // ======================================================
                // 🏫 TURMA
                // ======================================================

                if (
                  !indicesGlobais.turmas[
                    turma
                  ]
                ) {

                  indicesGlobais.turmas[
                    turma
                  ] = [];
                }

                indicesGlobais.turmas[
                  turma
                ].push({

                  semana,
                  dia,
                  horario: linha[1],
                  professor,
                  disciplina

                });

                // ======================================================
                // 📚 DISCIPLINA
                // ======================================================

                if (
                  !indicesGlobais.disciplinas[
                    disciplina
                  ]
                ) {

                  indicesGlobais.disciplinas[
                    disciplina
                  ] = [];
                }

                indicesGlobais.disciplinas[
                  disciplina
                ].push({

                  semana,
                  dia,
                  horario: linha[1],
                  professor,
                  turma

                });

              });

            });

        });

    });

  console.log(
    "✅ Índices globais criados"
  );
}

// ======================================================
// 🔥 OBTÉM TURMA POR COLUNA
// ======================================================

function obterTurmaPorColuna(coluna) {

  return turmasDetectadas.find((t, idx) => {

    return idx + 2 === coluna;

  }) || "";
}

// ======================================================
// 🔥 LISTA SEMANAS
// ======================================================

function obterSemanasDisponiveis() {

  return Object.keys(semanasAgrupadas)
    .sort((a, b) => {

      const da =
        converterDataBR(a);

      const db =
        converterDataBR(b);

      return da - db;

    });

}

// ======================================================
// 🔥 LISTA DIAS DA SEMANA
// ======================================================

function obterDiasSemana(semana) {

  return Object.keys(
    semanasAgrupadas[semana]?.dias || {}
  );
}

// ======================================================
// 🔥 OBTÉM TURMAS ATIVAS
// ======================================================

function obterTurmasAtivasSemana(
  semana
) {

  const dias =
    semanasAgrupadas[semana]?.dias || {};

  const ativas = new Set();

  Object.values(dias)
    .forEach(linhas => {

      linhas.forEach(linha => {

        linha.forEach((celula, col) => {

          if (
            col < 2 ||
            !celula
          ) return;

          ativas.add(
            obterTurmaPorColuna(col)
          );

        });

      });

    });

  return [...ativas];
}

// ======================================================
// 🔥 DETECTA SÁBADOS
// ======================================================

function obterSabadosLetivos() {

  const resultado = {};

  Object.keys(semanasAgrupadas)
    .forEach(semana => {

      const dias =
        semanasAgrupadas[semana].dias;

      Object.keys(dias)
        .forEach(dia => {

          const data =
            converterDataBR(dia);

          if (
            data.getDay() !== 6
          ) {
            return;
          }

          resultado[dia] =
            dias[dia];

        });

    });

  return resultado;
}

// ======================================================
// 🔥 PROCESSA TODAS AS FONTES
// ======================================================

async function montarSchedulerGlobal() {

  semanasAgrupadas = {};
  turmasDetectadas = [];

  // ======================================================
  // 🔥 INTEGRADO
  // ======================================================

  processarMatrizHorario(
    AppState.fontes.integrado,
    "INTEGRADO"
  );

  // ======================================================
  // 🔥 SUPERIOR 1
  // ======================================================

  processarMatrizHorario(
    AppState.fontes.superior1,
    "SUPERIOR1"
  );

  // ======================================================
  // 🔥 SUPERIOR 2
  // ======================================================

  if (
    AppState.fontes.superior2?.length
  ) {

    processarMatrizHorario(
      AppState.fontes.superior2,
      "SUPERIOR2"
    );
  }

  // ======================================================
  // 🔥 ÍNDICES
  // ======================================================

  construirIndices();

  console.log(
    "✅ Scheduler global montado"
  );

}
