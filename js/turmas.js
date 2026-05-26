// ======================================================
// 🔥 MÓDULO TURMAS
// ======================================================

window.turmasModule = {

  // ======================================================
  // 🔥 CARREGAR SELECT TURMAS
  // ======================================================

  carregarSelectTurmas(modalidade) {

    const select =
      document.getElementById(
        "selectTurmaFicha"
      );

    if (!select) return;

    select.innerHTML = `
      <option value="">
        Selecione a turma
      </option>
    `;

    const turmas =
      scheduler.getTurmasPorModalidade(
        modalidade
      );

    turmas.forEach(turma => {

      select.innerHTML += `
        <option value="${turma}">
          ${turma}
        </option>
      `;

    });

  },

  // ======================================================
  // 🔥 MATRIZ DA TURMA
  // ======================================================

  gerarMatrizTurma(
    turmaSelecionada,
    semana
  ) {

    const diasSemana =
      scheduler.obterDiasSemana(semana);

    // ==================================================
    // 🔥 MATRIZ BASE
    // ==================================================

    const matriz = {};

    scheduler.HORARIOS.forEach(h => {

      matriz[h] = {};

      diasSemana.forEach(dia => {

        matriz[h][dia] = "";

      });

    });

    // ==================================================
    // 🔥 COLUNA DA TURMA
    // ==================================================

    const idxTurma =
      appState.colunas.indexOf(
        turmaSelecionada
      );

    if (idxTurma === -1)
      return matriz;

    // ==================================================
    // 🔥 VARREDURA
    // ==================================================

    diasSemana.forEach(dia => {

      const linhas =
        appState.semanas[semana]
          ?.dias?.[dia] || [];

      linhas.forEach(linha => {

        const horario =
          linha[1];

        if (!horario) return;

        const valor =
          (linha[idxTurma] || "").trim();

        if (!utils.isAula(valor))
          return;

        const disciplina =
          utils.extrairDisciplina(valor);

        const professor =
          utils.extrairProfessor(valor);

        matriz[horario][dia] = `
          <strong>${disciplina}</strong>
          <br>
          ${professor}
        `;

      });

    });

    return matriz;

  },

  // ======================================================
  // 🔥 RENDER
  // ======================================================

  render() {

    const turma =
      document.getElementById(
        "selectTurmaFicha"
      )?.value;

    const semana =
      document.getElementById(
        "selectSemanaTurma"
      )?.value;

    const container =
      document.getElementById(
        "tabelaTurma"
      );

    if (!container) return;

    // ==================================================
    // 🔥 ESTADO VAZIO
    // ==================================================

    if (!turma || !semana) {

      container.innerHTML = `
        <div class="empty-state">
          Selecione turma e semana.
        </div>
      `;

      return;

    }

    // ==================================================
    // 🔥 CABEÇALHO
    // ==================================================

    document.getElementById(
      "nomeTurmaFicha"
    ).innerHTML =
      utils.abreviarTurma(turma);

    document.getElementById(
      "semanaTurmaFicha"
    ).innerHTML =
      semana;

    // ==================================================
    // 🔥 MATRIZ
    // ==================================================

    const matriz =
      this.gerarMatrizTurma(
        turma,
        semana
      );

    const diasSemana =
      scheduler.obterDiasSemana(semana);

    // ==================================================
    // 🔥 TABELA
    // ==================================================

    let html = `
      <div class="table-wrapper">
        <table class="schedule-table turma-table">
    `;

    // ==================================================
    // 🔥 HEAD
    // ==================================================

    html += `
      <thead>
        <tr>
          <th class="
            sticky-col
            sticky-time
          ">
            Horário
          </th>
    `;

    diasSemana.forEach(dia => {

      const dataObj =
        utils.parseDataBR(dia);

      const nome =
        utils.nomeDiaSemana(
          dataObj.getDay()
        );

      html += `
        <th>
          ${nome}
          <br>
          <span class="table-date">
            ${dia}
          </span>
        </th>
      `;

    });

    html += `
        </tr>
      </thead>
    `;

    // ==================================================
    // 🔥 BODY
    // ==================================================

    html += `<tbody>`;

    scheduler.HORARIOS.forEach(horario => {

      html += `<tr>`;

      html += `
        <td class="
          sticky-col
          sticky-time
          time-cell
        ">
          ${horario}
        </td>
      `;

      diasSemana.forEach(dia => {

        const valor =
          matriz[horario][dia] || "";

        html += `
          <td class="
            aula-cell
            turma-cell
          ">
            ${valor}
          </td>
        `;

      });

      html += `</tr>`;

    });

    html += `
      </tbody>
    `;

    html += `
        </table>
      </div>
    `;

    container.innerHTML = html;

  }

};

// ======================================================
// 🔥 TROCAR MODALIDADE TURMA
// ======================================================

window.trocarModalidadeTurma =
function() {

  const modalidade =
    document.getElementById(
      "selectModalidadeTurma"
    )?.value;

  turmasModule.carregarSelectTurmas(
    modalidade
  );

};

// ======================================================
// 🔥 RENDER TURMA
// ======================================================

window.renderTurma = function() {

  turmasModule.render();

};

// ======================================================
// 🔥 AUTO INIT
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

  setTimeout(() => {

    trocarModalidadeTurma();

  }, 500);

});