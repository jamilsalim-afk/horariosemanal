// ======================================================
// 🔥 MÓDULO PROFESSORES
// ======================================================

window.professoresModule = {

  // ======================================================
  // 🔥 CARREGA SELECT
  // ======================================================

  carregarSelect() {

    const select =
      document.getElementById(
        "selectProfessor"
      );

    if (!select) return;

    select.innerHTML = `
      <option value="">
        Selecione o professor
      </option>
    `;

    const professores =
      Object.keys(appState.professoresMap)
        .sort((a, b) =>
          a.localeCompare(b, 'pt-BR')
        );

    professores.forEach(nome => {

      select.innerHTML += `
        <option value="${nome}">
          ${nome}
        </option>
      `;

    });

  },

  // ======================================================
  // 🔥 OBTÉM MATRIZ
  // ======================================================

  gerarMatrizProfessor(
    professorCompleto,
    semana
  ) {

    const professorBusca =
      utils.normalizarTexto(
        professorCompleto
      );

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
    // 🔥 VARREDURA GLOBAL
    // ==================================================

    diasSemana.forEach(dia => {

      const linhas =
        appState.semanas[semana]
          ?.dias?.[dia] || [];

      linhas.forEach(linha => {

        const horario =
          linha[1];

        if (!horario) return;

        for (
          let col = 2;
          col < linha.length;
          col++
        ) {

          const valor =
            (linha[col] || "").trim();

          if (!utils.isAula(valor))
            continue;

          const professorCelula =
            utils.extrairProfessor(valor);

          const professorNorm =
            utils.normalizarTexto(
              professorCelula
            );

          // ==========================================
          // 🔥 MATCH PROFESSOR
          // ==========================================

          if (
            !professorNorm.includes(
              professorBusca
            )
          ) {
            continue;
          }

          const turma =
            appState.colunas[col];

          const disciplina =
            utils.extrairDisciplina(valor);

          const modalidade =
            scheduler.detectarModalidade(
              turma
            );

          matriz[horario][dia] = `
            ${utils.abreviarTurma(turma)}
            <br>
            <strong>${disciplina}</strong>
            <br>
            <span class="badge-modalidade">
              ${modalidade}
            </span>
          `;

        }

      });

    });

    return matriz;

  },

  // ======================================================
  // 🔥 RENDER
  // ======================================================

  render() {

    const professor =
      document.getElementById(
        "selectProfessor"
      )?.value;

    const semana =
      document.getElementById(
        "selectSemanaProfessor"
      )?.value;

    const container =
      document.getElementById(
        "tabelaProfessor"
      );

    if (!container) return;

    // ==================================================
    // 🔥 ESTADO VAZIO
    // ==================================================

    if (!professor || !semana) {

      container.innerHTML = `
        <div class="empty-state">
          Selecione professor e semana.
        </div>
      `;

      return;

    }

    // ==================================================
    // 🔥 CABEÇALHO
    // ==================================================

    document.getElementById(
      "nomeProfessorFicha"
    ).innerHTML = professor;

    document.getElementById(
      "semanaProfessorFicha"
    ).innerHTML = semana;

    // ==================================================
    // 🔥 MATRIZ
    // ==================================================

    const matriz =
      this.gerarMatrizProfessor(
        professor,
        semana
      );

    const diasSemana =
      scheduler.obterDiasSemana(semana);

    // ==================================================
    // 🔥 TABELA
    // ==================================================

    let html = `
      <div class="table-wrapper">
        <table class="schedule-table professor-table">
    `;

    // ==================================================
    // 🔥 HEAD
    // ==================================================

    html += `
      <thead>
        <tr>
          <th class="sticky-col sticky-time">
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

      html += `
        <tr>
      `;

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
            professor-cell
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
// 🔥 TROCA PROFESSOR
// ======================================================

window.renderProfessor = function() {

  professoresModule.render();

};

// ======================================================
// 🔥 AUTO INIT
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

  setTimeout(() => {

    professoresModule.carregarSelect();

  }, 500);

});