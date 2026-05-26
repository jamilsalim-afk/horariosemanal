// ======================================================
// 🔥 RELATÓRIOS DPT
// ======================================================

window.relatoriosModule = {

  // ======================================================
  // 🔥 GERAR BASE CONSOLIDADA
  // ======================================================

  gerarBase() {

    const resultado = [];

    Object.keys(appState.semanas).forEach(semana => {

      const dias =
        appState.semanas[semana]?.dias || {};

      Object.keys(dias).forEach(dia => {

        const linhas =
          dias[dia];

        linhas.forEach(linha => {

          for (
            let col = 2;
            col < linha.length;
            col++
          ) {

            const valor =
              (linha[col] || "").trim();

            // 🔥 apenas aulas reais
            if (!utils.isAula(valor))
              continue;

            const turma =
              appState.colunas[col];

            const disciplina =
              utils.extrairDisciplina(valor);

            const professorCurto =
              utils.extrairProfessor(valor);

            const professorCompleto =
              appState.professoresMap[
                professorCurto
              ] || professorCurto;

            const modalidade =
              scheduler.detectarModalidade(
                turma
              );

            resultado.push({

              disciplina,

              professor:
                professorCompleto,

              professorCurto,

              turma,

              modalidade

            });

          }

        });

      });

    });

    // ==================================================
    // 🔥 REMOVE DUPLICADOS
    // ==================================================

    const unicos = [];

    const mapa = new Set();

    resultado.forEach(item => {

      const chave = `
        ${item.disciplina}
        ${item.professor}
        ${item.turma}
      `;

      if (mapa.has(chave))
        return;

      mapa.add(chave);

      unicos.push(item);

    });

    return unicos;

  },

  // ======================================================
  // 🔥 FILTRAR
  // ======================================================

  filtrar(base) {

    const busca =
      utils.normalizarTexto(
        document.getElementById(
          "buscaRelatorioDPT"
        )?.value || ""
      );

    const modalidade =
      document.getElementById(
        "selectModalidadeRelatorio"
      )?.value || "TODOS";

    return base.filter(item => {

      // ==================================================
      // 🔥 MODALIDADE
      // ==================================================

      if (
        modalidade !== "TODOS"
      ) {

        if (
          item.modalidade !== modalidade
        ) {
          return false;
        }

      }

      // ==================================================
      // 🔥 BUSCA
      // ==================================================

      if (!busca) return true;

      const texto =
        utils.normalizarTexto(`
          ${item.disciplina}
          ${item.professor}
          ${item.turma}
        `);

      return texto.includes(busca);

    });

  },

  // ======================================================
  // 🔥 RENDER
  // ======================================================

  render() {

    const container =
      document.getElementById(
        "resultadoRelatorioDPT"
      );

    if (!container) return;

    // ==================================================
    // 🔥 BASE
    // ==================================================

    const base =
      this.gerarBase();

    const dados =
      this.filtrar(base);

    // ==================================================
    // 🔥 SEM RESULTADO
    // ==================================================

    if (!dados.length) {

      container.innerHTML = `
        <div class="empty-state">
          Nenhum resultado encontrado.
        </div>
      `;

      return;

    }

    // ==================================================
    // 🔥 TABELA
    // ==================================================

    let html = `
      <div class="table-wrapper">
        <table class="schedule-table relatorio-table">
    `;

    // ==================================================
    // 🔥 HEAD
    // ==================================================

    html += `
      <thead>
        <tr>
          <th>Disciplina</th>
          <th>Professor</th>
          <th>Turma</th>
          <th>Modalidade</th>
        </tr>
      </thead>
    `;

    // ==================================================
    // 🔥 BODY
    // ==================================================

    html += `<tbody>`;

    dados
      .sort((a, b) =>
        a.disciplina.localeCompare(
          b.disciplina,
          'pt-BR'
        )
      )
      .forEach(item => {

        const curso =
          utils.getCursoInfo(
            item.turma
          );

        html += `
          <tr>
        `;

        html += `
          <td>
            <strong>
              ${item.disciplina}
            </strong>
          </td>
        `;

        html += `
          <td>
            ${item.professor}
          </td>
        `;

        html += `
          <td class="${curso.cl}">
            ${utils.abreviarTurma(
              item.turma
            )}
          </td>
        `;

        html += `
          <td>
            <span class="
              badge-modalidade
            ">
              ${item.modalidade}
            </span>
          </td>
        `;

        html += `
          </tr>
        `;

      });

    html += `
      </tbody>
    `;

    html += `
        </table>
      </div>
    `;

    // ==================================================
    // 🔥 RESUMO
    // ==================================================

    html += `
      <div class="report-summary">
        <div class="summary-card">
          <span class="summary-number">
            ${dados.length}
          </span>

          <span class="summary-label">
            Registros
          </span>
        </div>

        <div class="summary-card">
          <span class="summary-number">
            ${
              [...new Set(
                dados.map(
                  d => d.professor
                )
              )].length
            }
          </span>

          <span class="summary-label">
            Professores
          </span>
        </div>

        <div class="summary-card">
          <span class="summary-number">
            ${
              [...new Set(
                dados.map(
                  d => d.disciplina
                )
              )].length
            }
          </span>

          <span class="summary-label">
            Disciplinas
          </span>
        </div>
      </div>
    `;

    container.innerHTML = html;

  }

};

// ======================================================
// 🔥 FUNÇÃO GLOBAL
// ======================================================

window.gerarRelatorioDisciplinaProfessorTurma =
function() {

  relatoriosModule.render();

};

// ======================================================
// 🔥 AUTO INIT
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

  setTimeout(() => {

    relatoriosModule.render();

  }, 1000);

});