// ======================================================
// 🏫 TURMAS.JS
// ======================================================


// ======================================================
// 🔥 POPULAR TURMAS
// ======================================================
function preencherSelectTurmasFicha() {

  const select =
    document.getElementById(
      "selectTurmaFicha"
    );

  if (!select) return;

  const modalidade =
    document.getElementById(
      "selectModalidadeTurma"
    )?.value || "";

  select.innerHTML =
    `<option value="">Selecione a turma</option>`;

  if (!modalidade) return;

  let turmas = [];

  if (modalidade === "INTEGRADO") {

    turmas =
      window.headerIntegrado
        ?.slice(2)
        ?.filter(t => t && t.trim()) || [];

  } else {

    turmas =
      window.headerSuperior
        ?.slice(2)
        ?.filter(t => t && t.trim()) || [];

  }

  turmas
    .sort((a,b)=>a.localeCompare(b))
    .forEach(turma => {

      select.innerHTML += `
        <option value="${turma}">
          ${turma}
        </option>
      `;

    });

}


// ======================================================
// 🔥 POPULAR SEMANAS
// ======================================================
function popularSemanasTurma() {

  const select =
    document.getElementById(
      "selectSemanaTurma"
    );

  if (!select) return;

  select.innerHTML =
    `<option value="">Selecione a semana</option>`;

  const semanas =
    ordenarDatasBR(
      Object.keys(semanasAgrupadas || {})
    );

  semanas.forEach(sem => {

    select.innerHTML += `
      <option value="${sem}">
        Semana de ${sem}
      </option>
    `;

  });

}


// ======================================================
// 🔥 LIMPAR FICHA
// ======================================================
function limparFichaTurma() {

  document.getElementById(
    "nomeTurmaFicha"
  ).innerText = "—";

  document.getElementById(
    "semanaTurmaFicha"
  ).innerText = "—";

  renderTabelaTurmaVazia();

}


// ======================================================
// 🔥 TABELA VAZIA
// ======================================================
function renderTabelaTurmaVazia() {

  document.getElementById(
    "tabelaTurma"
  ).innerHTML = "";

}


// ======================================================
// 🔥 GERAR MAPA TURMA
// ======================================================
function gerarMapaTurma(
  turmaSelecionada,
  semana
) {

  const mapa = {};

  const totais = {};

  const dias =
    semanasAgrupadas?.[semana]?.dias || {};

  const nomesDias = [
    "DOMINGO",
    "SEGUNDA",
    "TERÇA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SÁBADO"
  ];

  Object.keys(dias).forEach(data => {

    const linhas = dias[data];

    const [d, m, a] = data.split("/");

    const dt =
      new Date(a, m - 1, d);

    const nomeDia =
      nomesDias[dt.getDay()];

    linhas.forEach(r => {

      const horario =
        (r[1] || "").trim();

      if (!horario) return;

      const idx =
        dadosGlobais[0]
          .indexOf(turmaSelecionada);

      if (idx === -1) return;

      const valor =
        (r[idx] || "").trim();

      if (!valor) return;

      mapa[horario] ||= {};

      mapa[horario][nomeDia] = {

        valor,
        data

      };

      if (aulaValida(valor)) {

        totais[nomeDia] ||= 0;

        totais[nomeDia]++;

      }

    });

  });

  return { mapa, totais };

}


// ======================================================
// 🔥 RENDER TURMA
// ======================================================
function renderTurma() {

  const modalidade =
    document.getElementById(
      "selectModalidadeTurma"
    )?.value || "";

  const turma =
    document.getElementById(
      "selectTurmaFicha"
    )?.value || "";

  const semana =
    document.getElementById(
      "selectSemanaTurma"
    )?.value || "";

  preencherSelectTurmasFicha();

  if (
    !modalidade ||
    !turma ||
    !semana
  ) {

    limparFichaTurma();

    return;

  }

  // 🔥 sincroniza sistema
  document.getElementById(
    "selectModalidade"
  ).value = modalidade;

  document.getElementById(
    "nomeTurmaFicha"
  ).innerText = turma;

  document.getElementById(
    "semanaTurmaFicha"
  ).innerText = semana;

  const { mapa, totais } =
    gerarMapaTurma(
      turma,
      semana
    );

  const diasRef =
    semanasAgrupadas?.[semana]?.dias || {};

  const nomesDias = [
    "DOMINGO",
    "SEGUNDA",
    "TERÇA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SÁBADO"
  ];

  const diasSemana = [];

  Object.keys(diasRef).forEach(data => {

    const [d, m, a] =
      data.split("/");

    const dt =
      new Date(a, m - 1, d);

    const nomeDia =
      nomesDias[dt.getDay()];

    if (
      !nomeDia ||
      nomeDia === "DOMINGO"
    ) return;

    diasSemana.push({

      chave: nomeDia,

      label:
        `${nomeDia}<br>${data}`

    });

  });

  let html = `
    <table>

      <tr class="day-divider">
        <td colspan="${diasSemana.length + 1}">
          FICHA SEMANAL DA TURMA
        </td>
      </tr>

      <tr>

        <th class="time-col">
          Horário
        </th>
  `;

  diasSemana.forEach(d => {

    html += `<th>${d.label}</th>`;

  });

  html += `</tr>`;

  HORARIOS_FICHA.forEach(horario => {

    html += `
      <tr>

        <td class="time-col">
          ${horario}
        </td>
    `;

    diasSemana.forEach(d => {

      const aula =
        mapa?.[horario]?.[d.chave];

      if (!aula) {

        html += `
          <td class="aula-cell"></td>
        `;

        return;

      }

      html += `
        <td class="aula-cell">

          <div style="
            font-size:11px;
            line-height:1.4;
          ">
            ${aula.valor || ""}
          </div>

        </td>
      `;

    });

    html += `</tr>`;

  });

  // 🔥 TOTAL
  html += `
    <tr style="
      background:
      linear-gradient(
        135deg,
        rgba(34,197,94,0.18),
        rgba(15,23,42,0.95)
      );
      font-weight:800;
    ">

      <td class="time-col">
        TOTAL
      </td>
  `;

  diasSemana.forEach(d => {

    html += `
      <td class="aula-cell">
        ${totais[d.chave] || 0}
      </td>
    `;

  });

  html += `</tr></table>`;

  document.getElementById(
    "tabelaTurma"
  ).innerHTML = html;

}


// ======================================================
// 🔥 INIT
// ======================================================
window.addEventListener(
  "DOMContentLoaded",
  () => {

    popularSemanasTurma();

    renderTabelaTurmaVazia();

  }
);

// ======================================================
// 📄 EXPORTAR PDF TURMA
// ======================================================
async function exportarPDFTurma() {

  try {

    if (!window.jspdf?.jsPDF) {
      console.error("❌ jsPDF não carregado.");
      return;
    }

    const modalidade =
      document.getElementById("selectModalidadeTurma")?.value || "";

    const turma =
      document.getElementById("selectTurmaFicha")?.value || "";

    const semana =
      document.getElementById("selectSemanaTurma")?.value || "";

    if (!modalidade || !turma || !semana) {

      alert(
        "Selecione modalidade, turma e semana."
      );

      return;
    }

    const { jsPDF } = window.jspdf;

    const pdf =
      new jsPDF("p", "mm", "a4");

    const diasRef =
      semanasAgrupadas?.[semana]?.dias || {};

    const nomesDias = [
      "DOMINGO",
      "SEGUNDA",
      "TERÇA",
      "QUARTA",
      "QUINTA",
      "SEXTA",
      "SÁBADO"
    ];

    const diasSemana = [];

    Object.keys(diasRef).forEach(data => {

      const [d, m, a] =
        data.split("/");

      const dt =
        new Date(a, m - 1, d);

      const nomeDia =
        nomesDias[dt.getDay()];

      if (
        !nomeDia ||
        nomeDia === "DOMINGO"
      ) return;

      diasSemana.push({
        chave: nomeDia,
        data
      });

    });

    // ======================================================
    // 🔥 GERA MAPA
    // ======================================================
    const mapa = {};
    const totaisDia = {};

    const idxTurma =
      dadosGlobais[0]
        .indexOf(turma);

    Object.keys(diasRef).forEach(data => {

      const linhas =
        diasRef[data] || [];

      const [d, m, a] =
        data.split("/");

      const dt =
        new Date(a, m - 1, d);

      const nomeDia =
        nomesDias[dt.getDay()];

      linhas.forEach(r => {

        const horario =
          (r[1] || "").trim();

        if (!horario) return;

        const valor =
          (r[idxTurma] || "").trim();

        if (!valor) return;

        mapa[horario] ||= {};

        mapa[horario][nomeDia] = valor;

        if (aulaValida(valor)) {

          totaisDia[nomeDia] =
            (totaisDia[nomeDia] || 0) + 1;

        }

      });

    });

    // ======================================================
    // 🔥 LAYOUT
    // ======================================================
    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const marginLeft = 4;
    const marginRight = 4;

    const usableWidth =
      pageWidth - marginLeft - marginRight;

    const firstColWidth = 18;

    const otherColsWidth =
      (usableWidth - firstColWidth)
      / diasSemana.length;

    // ======================================================
    // 🔥 HEADER
    // ======================================================
    pdf.setFontSize(11);

    pdf.text(
      "INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DE RONDÔNIA - IFRO",
      pageWidth / 2,
      10,
      { align: "center" }
    );

    pdf.setFontSize(10);

    pdf.text(
      "CAMPUS CACOAL - Departamento de Apoio ao Ensino",
      pageWidth / 2,
      15,
      { align: "center" }
    );

    pdf.text(
      "FICHA SEMANAL DA TURMA",
      pageWidth / 2,
      20,
      { align: "center" }
    );

    pdf.text(
      `Turma: ${turma} | Semana: ${semana} | Modalidade: ${modalidade}`,
      pageWidth / 2,
      25,
      { align: "center" }
    );

    // ======================================================
    // 🔥 HEAD
    // ======================================================
    const head = [[
      "Horário",
      ...diasSemana.map(
        d => `${d.chave}\n${d.data}`
      )
    ]];

    // ======================================================
    // 🔥 BODY
    // ======================================================
    const body = [];

    HORARIOS_FICHA.forEach(horario => {

      const intervalo =
        ehIntervalo(horario);

      if (intervalo) {

        body.push([
          `${horario} - ${intervalo}`,
          ...diasSemana.map(() => "")
        ]);

        return;
      }

      const linha = [horario];

      diasSemana.forEach(dia => {

        const valor =
          mapa?.[horario]?.[dia.chave] || "";

        linha.push(valor);

      });

      body.push(linha);

    });

    // ======================================================
    // 🔥 TOTAL
    // ======================================================
    body.push([

      "TOTAL DE AULAS",

      ...diasSemana.map(
        d => totaisDia[d.chave] || 0
      )

    ]);

    // ======================================================
    // 🔥 TABELA
    // ======================================================
    pdf.autoTable({

      head,
      body,

      startY: 32,

      margin: {
        left: marginLeft,
        right: marginRight
      },

      theme: "grid",

      styles: {
        fontSize: 6,
        cellPadding: 2,
        halign: "center",
        valign: "middle"
      },

      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 0,
        fontStyle: "bold"
      },

      columnStyles: {
        0: {
          cellWidth: firstColWidth
        },
        1: {
          cellWidth: otherColsWidth
        },
        2: {
          cellWidth: otherColsWidth
        },
        3: {
          cellWidth: otherColsWidth
        },
        4: {
          cellWidth: otherColsWidth
        },
        5: {
          cellWidth: otherColsWidth
        },
        6: {
          cellWidth: otherColsWidth
        }
      },

      didParseCell: (data) => {

        const txt =
          (data.cell.raw || "")
            .toString();

        if (
          txt.includes("INTERVALO") ||
          txt.includes("ALMOÇO") ||
          txt.includes("JANTAR")
        ) {

          data.cell.styles.fillColor =
            [235, 235, 235];

          data.cell.styles.fontStyle =
            "bold";
        }

        if (
          txt.includes("TOTAL")
        ) {

          data.cell.styles.fillColor =
            [200, 200, 200];

          data.cell.styles.fontStyle =
            "bold";
        }

      }

    });

    // ======================================================
    // 🔥 FOOTER
    // ======================================================
    pdf.setFontSize(8);

    pdf.text(
      "IFRO - Campus Cacoal | BR 364, Km 228 | dape.cacoal@ifro.edu.br",
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );

    pdf.save(
      `Ficha Turma ${turma} - ${semana}.pdf`
    );

  } catch (e) {

    console.error(
      "❌ Erro PDF turma:",
      e
    );

    alert(
      "Erro ao gerar PDF da turma."
    );

  }

}

// ======================================================
// 🌎 EXPORTAÇÃO GLOBAL
// ======================================================
window.exportarPDFTurma =
  exportarPDFTurma;

// ======================================================
// 🌎 EXPORTA
// ======================================================
window.renderTurma =
  renderTurma;

window.popularSemanasTurma =
  popularSemanasTurma;

window.preencherSelectTurmasFicha =
  preencherSelectTurmasFicha;
