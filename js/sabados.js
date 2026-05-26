// ======================================================
// 🔥 MÓDULO SÁBADOS LETIVOS
// ======================================================

window.sabadosModule = {

  // ======================================================
  // 🔥 OBTÉM SÁBADOS COM AULA
  // ======================================================

  obterSabados() {

    const resultado = {};

    Object.keys(appState.semanas).forEach(semana => {

      const dias =
        appState.semanas[semana]?.dias || {};

      Object.keys(dias).forEach(dia => {

        const dataObj =
          utils.parseDataBR(dia);

        // 🔥 apenas sábado
        if (dataObj.getDay() !== 6) return;

        const linhas =
          dias[dia];

        const possuiAula =
          linhas.some(linha => {

            return linha
              .slice(2)
              .some(celula => {

                return utils.isAula(celula);

              });

          });

        if (!possuiAula) return;

        resultado[dia] = linhas;

      });

    });

    return resultado;

  },

  // ======================================================
  // 🔥 TURMAS ATIVAS
  // ======================================================

  obterTurmasAtivas(sabados) {

    const modalidade =
      appState.modalidade;

    const todas =
      scheduler.getTurmasPorModalidade(
        modalidade
      );

    return todas.filter(turma => {

      const idx =
        appState.colunas.indexOf(turma);

      if (idx === -1) return false;

      return Object.values(sabados).some(linhas => {

        return linhas.some(linha => {

          return utils.isAula(
            linha[idx]
          );

        });

      });

    });

  },

  // ======================================================
  // 🔥 RENDER
  // ======================================================

  render() {

    const container =
      document.getElementById(
        "containerSabados"
      );

    if (!container) return;

    const busca =
      utils.normalizarTexto(
        document.getElementById(
          "searchSabados"
        )?.value || ""
      );

    const sabados =
      this.obterSabados();

    const turmasAtivas =
      this.obterTurmasAtivas(sabados);

    let html = "";

    Object.keys(sabados).forEach(dia => {

      const linhas =
        sabados[dia];

      // ==================================================
      // 🔥 CABEÇALHO
      // ==================================================

      html += `
        <div class="week-card">
      `;

      html += `
        <div class="week-title">
          📅 SÁBADO LETIVO — ${dia}
        </div>
      `;

      // ==================================================
      // 🔥 TABELA
      // ==================================================

      html += `
        <div class="table-wrapper">
          <table class="schedule-table">
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

      turmasAtivas.forEach(turma => {

        const curso =
          utils.getCursoInfo(turma);

        html += `
          <th
            class="${curso.cl}"
            title="${turma}"
          >
            ${utils.abreviarTurma(turma)}
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

      linhas.forEach(linha => {

        const horario =
          linha[1] || "";

        const intervalo =
          horario
            .toUpperCase()
            .includes("INTERVALO");

        html += `
          <tr class="
            ${intervalo ? 'interval-row' : ''}
          ">
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

        turmasAtivas.forEach(turma => {

          const idx =
            appState.colunas.indexOf(turma);

          let valor =
            (linha[idx] || "").trim();

          const valorNorm =
            utils.normalizarTexto(valor);

          // ==============================================
          // 🔥 FILTRO BUSCA
          // ==============================================

          let ocultar = false;

          if (busca) {

            ocultar =
              !valorNorm.includes(busca);

          }

          // ==============================================
          // 🔥 CLASSES
          // ==============================================

          const classes =
            utils.detectarClasses(valor);

          if (ocultar) {

            classes.push("opaco");

          }

          html += `
            <td class="
              aula-cell
              ${classes.join(" ")}
            ">
              ${valor}
            </td>
          `;

        });

        html += `</tr>`;

      });

      html += `</tbody>`;

      html += `
          </table>
        </div>
      `;

      html += `</div>`;

    });

    // ======================================================
    // 🔥 SEM RESULTADO
    // ======================================================

    if (!html) {

      html = `
        <div class="empty-state">
          Nenhum sábado letivo encontrado.
        </div>
      `;

    }

    container.innerHTML = html;

  }

};

// ======================================================
// 🔥 TROCAR MODALIDADE
// ======================================================

window.trocarModalidadeSabados =
async function() {

  const modalidade =
    document.getElementById(
      "selectModalidadeSabados"
    )?.value || "INTEGRADO";

  appState.modalidade =
    modalidade;

  await carregarDados();

  sabadosModule.render();

};

// ======================================================
// 🔥 AUTO RENDER
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

  const aba =
    document.getElementById(
      "aba-sabados"
    );

  if (!aba) return;

  // render inicial leve
  setTimeout(() => {

    if (
      appState.abaAtual === "sabados"
    ) {

      sabadosModule.render();

    }

  }, 300);

});