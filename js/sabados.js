// ======================================================
// 🔥 SÁBADOS LETIVOS
// ======================================================


// ======================================================
// 🔥 OBTÉM APENAS SÁBADOS
// ======================================================
function obterSabadosSemana() {

  const modalidade =
    document.getElementById("selectModalidadeSabados")?.value ||
    "INTEGRADO";

  const resultado = {};

  Object.keys(semanasAgrupadas).forEach(semana => {

    const dias = semanasAgrupadas[semana]?.dias || {};

    Object.keys(dias).forEach(dia => {

      const [d, m, a] = dia.split('/');
      const dataObj = new Date(a, m - 1, d);

      // sábado = 6
      if (dataObj.getDay() === 6) {
        resultado[dia] = dias[dia];
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

  const modalidade =
    document.getElementById("selectModalidadeSabados")?.value ||
    "INTEGRADO";

  const sabados = obterSabadosSemana();

  const turmasAtivas =
    modalidade === "SUPERIOR"
      ? getTurmasAtivasNaSemana(sabados)
      : turmasDaPlanilha;

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

    // 🔥 FILTRO
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
// 🔥 EXPORTAR PDF SÁBADOS
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

  let pagina = 0;

  Object.keys(sabados).forEach(dia => {

    if (pagina > 0) {
      pdf.addPage();
    }

    pagina++;

    const linhas = sabados[dia];

    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(10);

    pdf.text(
      "INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DE RONDÔNIA - IFRO",
      pageWidth / 2,
      10,
      { align: 'center' }
    );

    pdf.text(
      `SÁBADO LETIVO - ${dia}`,
      pageWidth / 2,
      18,
      { align: 'center' }
    );

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

      startY: 25,

      theme: 'grid',

      styles: {
        fontSize: 5,
        halign: 'center',
        valign: 'middle'
      },

      headStyles: {
        fillColor: [46, 125, 50]
      }

    });

  });

  pdf.save(`SABADOS_${modalidade}.pdf`);
}
