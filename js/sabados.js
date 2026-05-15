// ======================================================
// 🔥 SÁBADOS LETIVOS
// ======================================================
// ======================================================
// 🔥 OBTÉM APENAS SÁBADOS
// ======================================================
// ======================================================
// 🔥 OBTÉM APENAS SÁBADOS COM AULAS
// ======================================================
function obterSabadosSemana() {

  const resultado = {};

  Object.keys(semanasAgrupadas).forEach(semana => {

    const dias = semanasAgrupadas[semana]?.dias || {};

    Object.keys(dias).forEach(dia => {

      const [d, m, a] = dia.split('/');
      const dataObj = new Date(a, m - 1, d);

      // 🔥 apenas sábado
      if (dataObj.getDay() !== 6) return;

      const linhas = dias[dia];

      // 🔥 verifica se existe aula real
      const possuiAula = linhas.some(r => {

        return r.slice(2).some(celula => {

          const val = normalizarTexto(celula || "");

          // ignora vazios
          if (!val) return false;

          // ignora intervalos/marcações
          if (
            val.includes("INTERVALO") ||
            val.includes("[+]") ||
            val.includes("[R]") ||
            val === "*"
          ) {
            return false;
          }

          return true;
        });

      });

      // 🔥 só adiciona se realmente houver aula
      if (possuiAula) {
        resultado[dia] = linhas;
      }

    });

  });

  return resultado;
}

// ======================================================
// 🔥 RENDER ABA SÁBADOS
// ======================================================
function renderSabados() {

  const container = document.getElementById("containerSabados");

  if (!container) return;

  const busca =
    normalizarTexto(
      document.getElementById("searchSabados")?.value || ""
    );

  // 🔥 sincroniza modalidade principal
  const modalidade =
    document.getElementById("selectModalidadeSabados")?.value ||
    "INTEGRADO";

  // 🔥 troca modalidade REAL do sistema
  document.getElementById("selectModalidade").value = modalidade;

  const sabados = obterSabadosSemana();

  let turmasAtivas =
  modalidade === "SUPERIOR"
    ? getTurmasAtivasNaSemana(sabados)
    : turmasDaPlanilha;


// ======================================================
// 🔥 FILTRO - OCULTAR COLUNAS SEM O PROFESSOR
// ======================================================

if (busca) {

  turmasAtivas = turmasAtivas.filter(turma => {

    const idx =
      dadosGlobais[0].indexOf(turma);

    return Object.values(sabados).some(linhas => {

      return linhas.some(r => {

        const val =
          normalizarTexto(r[idx] || "");

        return val.includes(busca);

      });

    });

  });

}

  let html = "";

  const regrasDestaque = [
    { match: v => v.includes("RESERVA ENSINO"), classe: "reserva-ensino" },
    { match: v => v.includes("PPS/ATENDIMENTO"), classe: "pps" },
    { match: v => v.includes("ESTUDOS INDIVIDUAIS"), classe: "estudos" },
    { match: v => v.includes("REUNIAO DE SERVIDORES"), classe: "reuniao" },
    { match: v => v.includes("CAED") || v.includes("PRE-CONSELHO"), classe: "caed" },
    { match: v => v.includes("_REP -"), classe: "reposicao" }
  ];

  Object.keys(sabados).forEach(dia => {

    const linhasOriginais = sabados[dia];

    let linhas = linhasOriginais.filter(r => {

      if (!busca) return true;

      return r.some(c =>
        normalizarTexto(c).includes(busca)
      );

    });

    if (!linhas.length) return;

    html += `<table class="sabado-table">`;

    html += `
      <tr class="day-divider">
        <td colspan="${turmasAtivas.length + 1}">
          SÁBADO LETIVO - ${dia}
        </td>
      </tr>
    `;

    html += `
      <tr>
        <th class="time-col">Horário</th>
    `;

    turmasAtivas.forEach(t => {

      html += `
        <th
          class="${getCursoInfo(t).cl}"
          title="${t}"
        >
          ${abreviarTurma(t)}
        </th>
      `;
    });

    html += `</tr>`;

    linhas.forEach(r => {

      const horario = r[1] || "";

      const isInt =
        horario.toUpperCase().includes("INTERVALO");

      html += `
        <tr class="${isInt ? 'intervalo' : ''}">
          <td class="time-col">${horario}</td>
      `;

      turmasAtivas.forEach(turma => {

        const idx = dadosGlobais[0].indexOf(turma);

        let val = (r[idx] || "").trim();

        const valNorm = normalizarTexto(val);

        let classesExtras = [];

        const contemBusca =
          busca &&
          valNorm.includes(busca);

        regrasDestaque.forEach(regra => {

          if (regra.match(valNorm)) {
            classesExtras.push(regra.classe);
          }

        });

        if (
          val.includes("[+]") ||
          val.includes("*") ||
          val.includes("[R]") ||
          valNorm.includes("INTERVALO")
        ) {
          classesExtras.push("marcacao-extra");
        }

        // 🔥 mesmo efeito da aba horários
        if (busca) {

          if (contemBusca) {
            classesExtras.push("highlight");
          } else {
            classesExtras.push("opaco");
          }
        }

        html += `
          <td class="aula-cell ${getCursoInfo(turma).cl} ${classesExtras.join(" ")}">
            ${val}
          </td>
        `;
      });

      html += `</tr>`;

    });

    html += `</table><br>`;

  });

  if (!html) {

    html = `
      <div style="
        padding:20px;
        background:white;
        border-radius:10px;
        text-align:center;
        font-weight:600;
      ">
        Nenhum sábado letivo encontrado.
      </div>
    `;
  }

  container.innerHTML = html;
}

// ======================================================
// 🔥 EXPORTAR PDF SÁBADOS (PADRÃO HORÁRIOS)
// ======================================================
function exportarPDFSabados() {

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF('l', 'mm', 'a4');

  const modalidade =
    document.getElementById("selectModalidadeSabados")?.value ||
    "INTEGRADO";

  const sabados = obterSabadosSemana();

  const turmasAtivas =
    modalidade === "SUPERIOR"
      ? getTurmasAtivasNaSemana(sabados)
      : turmasDaPlanilha;

  const nomes = [
    "DOMINGO","SEGUNDA-FEIRA","TERÇA-FEIRA",
    "QUARTA-FEIRA","QUINTA-FEIRA",
    "SEXTA-FEIRA","SÁBADO"
  ];

  let pagina = 0;

  Object.keys(sabados).forEach(dia => {

    if (pagina > 0) {
      pdf.addPage();
    }

    pagina++;

    const linhas = sabados[dia];

    const pageWidth = pdf.internal.pageSize.getWidth();

    // ======================================================
    // 🔥 CABEÇALHO
    // ======================================================

    pdf.setFontSize(9);

    pdf.text(
      "INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DE RONDÔNIA - IFRO",
      pageWidth / 2,
      8,
      { align: 'center' }
    );

    pdf.text(
      "CAMPUS CACOAL - Departamento de Apoio ao Ensino - DAPE",
      pageWidth / 2,
      12,
      { align: 'center' }
    );

    pdf.text(
      `SÁBADOS LETIVOS - ${modalidade}`,
      pageWidth / 2,
      16,
      { align: 'center' }
    );

    const p = dia.split('/');
    const dObj = new Date(p[2], p[1] - 1, p[0]);

    pdf.setFontSize(14);
    pdf.setTextColor(46, 125, 50);
    pdf.setFont(undefined, 'bold');

    pdf.text(
      `${nomes[dObj.getDay()]} - ${dia}`,
      pageWidth / 2,
      24,
      { align: 'center' }
    );

    pdf.setTextColor(0, 0, 0);
    pdf.setFont(undefined, 'normal');

    // ======================================================
    // 🔥 TABELA
    // ======================================================

    const body = linhas.map(r => {

      const line = [r[1]];

      turmasAtivas.forEach(t => {

        const idx = dadosGlobais[0].indexOf(t);

        line.push((r[idx] || "").trim());

      });

      return line;
    });

    pdf.autoTable({

      head: [['Horário', ...turmasAtivas]],

      body,

      startY: 28,

      theme: 'grid',

      margin: {
        top: 28,
        left: 2,
        right: 2,
        bottom: 2
      },

      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,

      styles: {
        fontSize: 4.5,
        halign: 'center',
        valign: 'middle',
        cellPadding: 1
      },

      headStyles: {
        fillColor: [46, 125, 50],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },

      columnStyles: {
        0: { cellWidth: 16 }
      },

      didParseCell: (data) => {

        const col = data.column.index;

        // 🔥 cor das turmas
        if (col > 0) {

          const curso = getCursoInfo(turmasAtivas[col - 1]);

          data.cell.styles.fillColor = curso.rgb;
        }

        const txt = (data.cell.raw || "").toString();

        const classe = detectarClasse(txt);

        // 🔥 cores especiais
        if (classe && coresPDF[classe]) {

          data.cell.styles.fillColor = coresPDF[classe];

          if (
            classe === "pps" ||
            classe === "reposicao"
          ) {
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontStyle = "bold";
          }
        }

        // 🔥 linhas vazias
        const vazio = data.row.raw
          .slice(1)
          .every(v => !v || v.trim() === "");

        if (vazio) {

          data.cell.styles.minCellHeight = 1.5;
          data.cell.styles.fontSize = 3.5;
        }

        const t = txt.toUpperCase();

        // 🔥 marcações especiais
        if (
          t.includes("INTERVALO") ||
          t.includes("[+]") ||
          t.includes("*") ||
          t.includes("[R]")
        ) {

          data.cell.styles.fillColor = [235, 235, 235];
        }
      }
    });

    // ======================================================
    // 🔥 RODAPÉ
    // ======================================================

    pdf.setFontSize(8);

    pdf.text(
      "IFRO - Campus Cacoal | BR 364, Km 228, Lote 2-A | (69) 3443-2445 | dape.cacoal@ifro.edu.br",
      pageWidth / 2,
      205,
      { align: 'center' }
    );

  });

  pdf.save(`SABADOS_${modalidade}.pdf`);
}

// ======================================================
// 🔥 TROCAR MODALIDADE SÁBADOS
// ======================================================
async function trocarModalidadeSabados() {

  const modalidade =
    document.getElementById("selectModalidadeSabados").value;

  // sincroniza select principal
  document.getElementById("selectModalidade").value = modalidade;

  // recarrega planilha correta
  await init();

  // renderiza sábados
  renderSabados();
}
