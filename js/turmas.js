// ======================================================
// 🔥 GERAR FICHA DA TURMA
// ======================================================
function gerarFichaTurma(nomeTurma) {

  const sem =
    getSemanaAtualSelecionada?.() ||
    document.getElementById('selectSemanaTurma')?.value ||
    document.getElementById('selectSemana')?.value;

  const dias =
    semanasAgrupadas?.[sem]?.dias || {};

  let resultado = [];

  Object.keys(dias).forEach(dia => {

    dias[dia].forEach(r => {

      const horario = r[1];

      const idx =
        dadosGlobais[0].indexOf(nomeTurma);

      if (idx === -1) return;

      const val =
        (r[idx] || "").trim();

      if (
        val &&
        val !== "-" &&
        !normalizarTexto(horario)
          .includes("INTERVALO")
      ) {

        resultado.push({
          dia,
          horario,
          aula: val
        });
      }
    });
  });

  return resultado;
}


// ======================================================
// 🔥 PREENCHER SELECT TURMAS
// ======================================================
function preencherSelectTurmas() {

  const selectTurma =
    document.getElementById("selectTurma");

  const selectSemana =
    document.getElementById("selectSemanaTurma");

  if (!selectTurma || !selectSemana) return;

  selectTurma.innerHTML = "";

  turmasDaPlanilha.forEach(turma => {

    selectTurma.innerHTML += `
      <option value="${turma}">
        ${turma}
      </option>
    `;
  });

  selectSemana.innerHTML = "";

  const semanas =
    ordenarDatasBR(
      Object.keys(semanasAgrupadas)
    );

  semanas.forEach(semana => {

    selectSemana.innerHTML += `
      <option value="${semana}">
        Semana de ${semana}
      </option>
    `;
  });

  const semanaAtual =
    document.getElementById("selectSemana")?.value;

  if (semanaAtual) {
    selectSemana.value = semanaAtual;
  }
}


// ======================================================
// 🔥 RENDER TURMA
// ======================================================
function renderTurma() {

  const selectTurma =
    document.getElementById("selectTurma");

  const selectSemana =
    document.getElementById("selectSemanaTurma");

  const container =
    document.getElementById("fichaTurma");

  if (
    !selectTurma ||
    !selectSemana ||
    !container
  ) return;

  const turma =
    selectTurma.value;

  const semana =
    selectSemana.value;

  if (!turma || !semana) {
    container.innerHTML = "";
    return;
  }

  window.appState = window.appState || {};

  window.appState.semana = semana;

  const registros =
    gerarFichaTurma(turma);

  if (!registros.length) {

    container.innerHTML = `
      <div style="
        padding:20px;
        background:white;
        border-radius:10px;
        box-shadow:0 2px 10px rgba(0,0,0,0.1);
      ">
        Nenhum horário encontrado.
      </div>
    `;

    return;
  }

  let html = `
    <div style="
      background:white;
      padding:20px;
      border-radius:10px;
      box-shadow:0 2px 10px rgba(0,0,0,0.1);
      overflow:auto;
    ">

    <h2 style="margin-bottom:15px;">
      🏫 TURMA: ${turma}
    </h2>

    <table style="
      width:100%;
      border-collapse:collapse;
      font-size:13px;
    ">
      <thead>
        <tr style="background:#2e7d32;color:white;">
          <th style="padding:10px;border:1px solid #ddd;">Dia</th>
          <th style="padding:10px;border:1px solid #ddd;">Horário</th>
          <th style="padding:10px;border:1px solid #ddd;">Aula</th>
        </tr>
      </thead>

      <tbody>
  `;

  registros.forEach(item => {

    html += `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">
          ${item.dia}
        </td>

        <td style="padding:8px;border:1px solid #ddd;">
          ${item.horario}
        </td>

        <td style="padding:8px;border:1px solid #ddd;">
          ${item.aula}
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    </div>
  `;

  container.innerHTML = html;
}


// ======================================================
// 🔥 EXPORTAR PDF TURMA
// ======================================================
function exportarPDFTurma() {

  const turma =
    document.getElementById("selectTurma")?.value;

  if (!turma) return;

  const registros =
    gerarFichaTurma(turma);

  if (!registros.length) {
    alert("Nenhum dado encontrado.");
    return;
  }

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF();

  pdf.setFontSize(16);

  pdf.text(
    `Ficha da Turma - ${turma}`,
    14,
    20
  );

  const body = registros.map(r => [
    r.dia,
    r.horario,
    r.aula
  ]);

  pdf.autoTable({
    startY: 30,

    head: [[
      "Dia",
      "Horário",
      "Aula"
    ]],

    body
  });

  pdf.save(`turma_${turma}.pdf`);
}
