// ======================================================
// 🌍 RENDER HORÁRIOS
// ======================================================

function renderHorario() {

  const container =
    document.getElementById(
      "tabelaHorario"
    );

  if (!container) return;

  const semana =
    document.getElementById(
      "selectSemana"
    )?.value
    || detectarSemanaAtual();

  const modalidade =
    document.getElementById(
      "selectModalidade"
    )?.value
    || "INTEGRADO";

  const busca =
    normalizarTexto(
      document.getElementById(
        "searchGlobal"
      )?.value || ""
    );

  AppState.semanaAtual = semana;
  AppState.modalidade = modalidade;

  const dadosSemana =
    semanasAgrupadas[semana];

  if (!dadosSemana) {

    container.innerHTML =
      gerarEstadoVazio(
        "Semana não encontrada"
      );

    return;
  }

  // ======================================================
  // 🔥 FILTRA DIAS
  // ======================================================

  const dias =
    dadosSemana.dias || {};

  // ======================================================
  // 🔥 TURMAS
  // ======================================================

  let turmas =
    obterTurmasAtivasSemana(
      semana
    );

  // 🔥 modalidade
  turmas = turmas.filter(t => {

    const up =
      normalizarTexto(t);

    if (
      modalidade === "INTEGRADO"
    ) {
      return up.includes("INTEGRADO")
        || up.includes("AGRO")
        || up.includes("INFO");
    }

    return (
      up.includes("SEMESTRE")
    );
  });

  // ======================================================
  // 🔥 BUSCA
  // ======================================================

  if (busca) {

    turmas = turmas.filter(turma => {

      return Object.values(dias)
        .some(linhas => {

          return linhas.some(linha => {

            const idx =
              obterColunaTurma(turma);

            const valor =
              normalizarTexto(
                linha[idx] || ""
              );

            return valor.includes(busca);

          });

        });

    });

  }

  // ======================================================
  // 🔥 HTML
  // ======================================================

  let html = "";

  Object.keys(dias)
    .forEach(dia => {

      const linhas =
        dias[dia];

      const dataObj =
        converterDataBR(dia);

      const nomeDia =
        getNomeDiaSemana(
          dataObj.getDay()
        );

      // ======================================================
      // 🔥 FERIADO
      // ======================================================

      const feriado =
        FERIADOS.includes(dia);

      html += `
      <div class="day-card">

        <div class="
          day-header
          ${feriado ? 'feriado' : ''}
        ">

          <div>
            ${nomeDia}
          </div>

          <div>
            ${dia}
          </div>

        </div>
      `;

      // ======================================================
      // 🔥 TABELA
      // ======================================================

      html += `
      <div class="table-wrapper">

      <table class="schedule-table sticky-table">

        <thead>

          <tr>

            <th class="sticky-col">
              Horário
            </th>
      `;

      turmas.forEach(turma => {

        html += `
        <th
          class="
            ${getCursoInfo(turma).cl}
          "
          title="${turma}"
        >
          ${abreviarTurma(turma)}
        </th>
        `;
      });

      html += `
          </tr>
        </thead>

        <tbody>
      `;

      // ======================================================
      // 🔥 LINHAS
      // ======================================================

      linhas.forEach(linha => {

        const horario =
          linha[1] || "";

        const isIntervalo =
          normalizarTexto(horario)
            .includes("INTERVALO");

        // 🔥 filtro busca
        let linhaPossuiBusca =
          !busca;

        if (busca) {

          linhaPossuiBusca =
            turmas.some(turma => {

              const idx =
                obterColunaTurma(turma);

              const valor =
                normalizarTexto(
                  linha[idx] || ""
                );

              return valor.includes(busca);

            });

        }

        // 🔥 oculta linha sem busca
        if (
          busca &&
          !linhaPossuiBusca
        ) {
          return;
        }

        html += `
        <tr class="
          ${isIntervalo ? 'interval-row' : ''}
        ">
        `;

        // ======================================================
        // 🔥 HORÁRIO
        // ======================================================

        html += `
        <td class="
          sticky-col
          time-cell
        ">
          ${horario}
        </td>
        `;

        // ======================================================
        // 🔥 CÉLULAS
        // ======================================================

        turmas.forEach(turma => {

          const idx =
            obterColunaTurma(turma);

          let valor =
            (linha[idx] || "")
            .toString()
            .trim();

          const valNorm =
            normalizarTexto(valor);

          // ======================================================
          // 🔥 EVENTOS
          // ======================================================

          valor =
            aplicarEventosNaCelula(
              dia,
              horario,
              turma,
              valor
            );

          // ======================================================
          // 🔥 CLASSES
          // ======================================================

          let classes = [
            "schedule-cell",
            getCursoInfo(turma).cl
          ];

          regrasDestaque
            .forEach(regra => {

              if (
                regra.match(valNorm)
              ) {
                classes.push(
                  regra.classe
                );
              }

            });

          // ======================================================
          // 🔥 AULA VAGA
          // ======================================================

          if (
            valNorm.includes(
              "RESERVA ENSINO"
            ) ||
            valNorm.includes(
              "ESTUDOS INDIVIDUAIS"
            )
          ) {

            classes.push(
              "aula-vaga"
            );

          }

          // ======================================================
          // 🔥 HIGHLIGHT BUSCA
          // ======================================================

          if (
            busca &&
            valNorm.includes(busca)
          ) {

            classes.push(
              "highlight"
            );

          }

          html += `
          <td class="
            ${classes.join(" ")}
          ">
            ${valor}
          </td>
          `;

        });

        html += `
        </tr>
        `;

      });

      html += `
        </tbody>
      </table>

      </div>
      </div>
      `;

    });

  // ======================================================
  // 🔥 SEM RESULTADO
  // ======================================================

  if (!html) {

    html =
      gerarEstadoVazio(
        "Nenhum resultado encontrado"
      );

  }

  container.innerHTML = html;

  aplicarStickyTabela();

}

// ======================================================
// 🔥 OBTÉM COLUNA DA TURMA
// ======================================================

function obterColunaTurma(turma) {

  const idx =
    turmasDetectadas.indexOf(
      turma
    );

  return idx + 2;
}

// ======================================================
// 🔥 NOME DIA SEMANA
// ======================================================

function getNomeDiaSemana(dia) {

  const nomes = [

    "DOMINGO",
    "SEGUNDA-FEIRA",
    "TERÇA-FEIRA",
    "QUARTA-FEIRA",
    "QUINTA-FEIRA",
    "SEXTA-FEIRA",
    "SÁBADO"

  ];

  return nomes[dia] || "";
}

// ======================================================
// 🔥 ESTADO VAZIO
// ======================================================

function gerarEstadoVazio(texto) {

  return `
  <div class="empty-state">

    <div class="empty-icon">
      📅
    </div>

    <div class="empty-title">
      ${texto}
    </div>

  </div>
  `;
}