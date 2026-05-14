// ======================================================
// 👨‍🏫 PROFESSORES.JS
// ======================================================


// ======================================================
// 🔥 PLANILHA PROFESSORES
// ======================================================
const SHEETS_PROFESSORES = {

  id: "1IDjs0oS6lQBGDrL7ja1Ge0vaBdNCNIULDH7J5p89c5s",

  gid: "1694280391"
};

let PROFESSORES_MAPA = {};
let PROFESSORES_LISTA = [];


// ======================================================
// 🔥 HORÁRIOS FIXOS
// ======================================================
const HORARIOS_FICHA = [

  "07:30 - 08:20",
  "08:20 - 09:10",
  "09:30 - 10:20",
  "10:20 - 11:10",
  "11:10 - 12:00",

  "13:50 - 14:40",
  "14:40 - 15:30",
  "15:50 - 16:40",
  "16:40 - 17:30",
  "17:30 - 18:20",

  "19:00 - 19:50",
  "19:50 - 20:40",
  "20:50 - 21:40",
  "21:40 - 22:30"
];

function ehIntervalo(horario) {

  const INTERVALOS = {
    "09:10 - 09:30": "INTERVALO",
    "15:30 - 15:50": "INTERVALO",
    "20:40 - 20:50": "INTERVALO",
    "12:00 - 13:50": "ALMOÇO",
    "18:20 - 19:00": "JANTAR"
  };

  return INTERVALOS[horario] || null;
}

// ======================================================
// 🔥 CARREGAR PROFESSORES
// ======================================================
async function carregarProfessores(){

  try{

    const url =
      `https://docs.google.com/spreadsheets/d/${SHEETS_PROFESSORES.id}/export?format=csv&gid=${SHEETS_PROFESSORES.gid}`;

    const res = await fetch(url);

    if(!res.ok){
      throw new Error(
        "Falha ao carregar professores."
      );
    }

    const texto = await res.text();

    const linhas = parseCSV(texto);

    PROFESSORES_MAPA = {};
    PROFESSORES_LISTA = [];

    linhas.slice(1).forEach(l => {

      const nomeExibicao =
        (l[0] || "").trim();

      const variacoes =
        (l[1] || "").trim();

      if(!nomeExibicao){
        return;
      }

      const nomeNorm =
        normalizarSeguro(nomeExibicao);

      PROFESSORES_LISTA.push(
        nomeExibicao
      );

      PROFESSORES_MAPA[nomeNorm] = {

        exibicao: nomeExibicao,

        variacoes: []
      };

      // 🔥 variações separadas por vírgula
      if(variacoes){

        variacoes
          .split(",")
          .map(v => v.trim())
          .filter(v => v)
          .forEach(v => {

            PROFESSORES_MAPA[nomeNorm]
              .variacoes
              .push(
                normalizarSeguro(v)
              );
          });
      }

      // 🔥 adiciona o próprio nome
      PROFESSORES_MAPA[nomeNorm]
        .variacoes
        .push(nomeNorm);

    });

    preencherSelectProfessores();

    console.log(
      "✅ Professores carregados:",
      PROFESSORES_LISTA
    );

  }catch(e){

    console.warn(
      "⚠️ Erro ao carregar professores:",
      e
    );

    PROFESSORES_MAPA = {};
    PROFESSORES_LISTA = [];
  }
}

// ======================================================
// 🔥 NORMALIZAÇÃO SEGURA
// ======================================================
function normalizarSeguro(txt){

  try{

    if(typeof normalizarTexto === "function"){
      return normalizarTexto(txt || "");
    }

    return String(txt || "")
      .trim()
      .toUpperCase();

  }catch(e){

    return String(txt || "")
      .trim()
      .toUpperCase();
  }
}

// ======================================================
// 🔥 PREENCHE SELECT PROFESSORES
// ======================================================
function preencherSelectProfessores(){

  const select =
    document.getElementById(
      "selectProfessor"
    );

  if(!select) return;

  select.innerHTML =
    `<option value="">Selecione o professor</option>`;

  PROFESSORES_LISTA
    .sort((a,b)=>a.localeCompare(b))
    .forEach(nome => {

      select.innerHTML += `
        <option value="${nome}">
          ${nome}
        </option>
      `;
    });
}


// ======================================================
// 🔥 POPULAR SEMANAS
// ======================================================
function popularSemanasProfessor(){

  const select =
    document.getElementById(
      "selectSemanaProfessor"
    );

  if(!select) return;

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
// 🔥 LOCALIZA PROFESSOR
// ======================================================
function localizarProfessor(texto){

  const txt =
    normalizarSeguro(texto);

  for(const chave in PROFESSORES_MAPA){

    const prof =
      PROFESSORES_MAPA[chave];

    const encontrou =
      prof.variacoes.some(v =>
        txt.includes(v)
      );

    if(encontrou){
      return prof.exibicao;
    }
  }

  return null;
}


// ======================================================
// 🔥 AULA VÁLIDA
// ======================================================
function aulaValida(valor){

  const v =
    normalizarSeguro(valor);

  if(!v) return false;

  if(
    v.includes("INTERVALO") ||
    v.includes("RESERVA ENSINO") ||
    v.includes("ESTUDOS INDIVIDUAIS") ||
    v.includes("PPS/ATENDIMENTO") ||
    v.includes("REUNIAO") ||
    v.includes("CAED") ||
    v.includes("PRE-CONSELHO")
  ){
    return false;
  }

  return true;
}


// ======================================================
// 🔥 LIMPA FICHA
// ======================================================
function limparFichaProfessor(){

  document.getElementById(
    "nomeProfessorFicha"
  ).innerText = "—";

  document.getElementById(
    "semanaProfessorFicha"
  ).innerText = "—";

  renderTabelaProfessorVazia();
}


// ======================================================
// 🔥 TABELA VAZIA
// ======================================================
function renderTabelaProfessorVazia(){

  const dias = [
    "SEGUNDA",
    "TERÇA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SÁBADO"
  ];

  let html = `
    <table>

      <tr class="day-divider">
        <td colspan="7">
          FICHA SEMANAL DO PROFESSOR
        </td>
      </tr>

      <tr>
        <th class="time-col">
          Horário
        </th>
  `;

  dias.forEach(d => {
    html += `<th>${d}</th>`;
  });

  html += `</tr>`;

  HORARIOS_FICHA.forEach(h => {

    html += `
      <tr>

        <td class="time-col">
          ${h}
        </td>
    `;

    dias.forEach(() => {

      html += `
        <td class="aula-cell"></td>
      `;
    });

    html += `</tr>`;
  });

  html += `</table>`;

  document.getElementById(
    "tabelaProfessor"
  ).innerHTML = html;
}


// ======================================================
// 🔥 GERAR MAPA PROFESSOR
// ======================================================
function gerarMapaProfessor(nomeProfessor, semana) {

  const mapa = {};
  const totais = {};

  const nomesDias = [
    "DOMINGO",
    "SEGUNDA",
    "TERÇA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SÁBADO"
  ];

  const base = window.BASE_UNIFICADA || [];

  const profNormalizado = normalizarSeguro(nomeProfessor);

  base.forEach(item => {

    // 🔥 FIX CRÍTICO: normalização real
    const itemProf = normalizarSeguro(item.professor);

    if (itemProf !== profNormalizado) return;

    const nomeDia = item.dia;

    if (!nomeDia || nomeDia === "DOMINGO") return;

    mapa[item.horario] ||= {};

    mapa[item.horario][nomeDia] = {
      turma: item.turma,
      valor: item.valor,
      origem: item.origem
    };

    if (aulaValida(item.valor)) {
      totais[nomeDia] ||= 0;
      totais[nomeDia]++;
    }

  });

  return { mapa, totais };
}

// ======================================================
// 🔥 RENDER PROFESSOR
// ======================================================
function renderProfessor(){

  const professor =
    document.getElementById("selectProfessor")?.value || "";

  const semana =
    document.getElementById("selectSemanaProfessor")?.value || "";

  if(!professor || !semana){

    limparFichaProfessor();
    return;
  }

  document.getElementById("nomeProfessorFicha").innerText = professor;
  document.getElementById("semanaProfessorFicha").innerText = semana;

  const { mapa, totais } = gerarMapaProfessor(professor, semana);

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

  // 🔥 monta colunas reais da semana
  const diasSemana = [];

  Object.keys(diasRef).forEach(data => {

    const [d, m, a] = data.split("/");
    const dt = new Date(a, m - 1, d);

    const nomeDia = nomesDias[dt.getDay()];

    if (!nomeDia || nomeDia === "DOMINGO") return;

    diasSemana.push({
      chave: nomeDia,
      label: `${nomeDia}<br>${data}`
    });

  });

  // 🔥 fallback se semana não tiver estrutura
  if (diasSemana.length === 0) {

    document.getElementById("tabelaProfessor").innerHTML =
      `<div style="padding:10px">⚠️ Semana sem dados estruturados</div>`;

    return;
  }

  let html = `
    <table>

      <tr class="day-divider">
        <td colspan="${diasSemana.length + 1}">
          FICHA SEMANAL DO PROFESSOR
        </td>
      </tr>

      <tr>
        <th class="time-col">Horário</th>
  `;

  diasSemana.forEach(d => {
    html += `<th>${d.label}</th>`;
  });

  html += `</tr>`;

  HORARIOS_FICHA.forEach(horario => {

    html += `
      <tr>
        <td class="time-col">${horario}</td>
    `;

    diasSemana.forEach(d => {

      const aula = mapa?.[horario]?.[d.chave];

      if (!aula) {
        html += `<td class="aula-cell"></td>`;
        return;
      }

      html += `
        <td class="aula-cell">

          <div style="
            font-weight:800;
            color:#22c55e;
            margin-bottom:4px;
            font-size:11px;
          ">
            ${aula.turma || ""}
          </div>

          <div style="
            font-size:10px;
            line-height:1.4;
          ">
            ${aula.valor || ""}
          </div>

          ${aula.origem ? `
            <div style="
              font-size:9px;
              opacity:0.6;
              margin-top:2px;
            ">
              ${aula.origem}
            </div>
          ` : ""}

        </td>
      `;
    });

    html += `</tr>`;
  });

  // 🔥 TOTAL
  html += `
    <tr style="
      background: linear-gradient(135deg, rgba(34,197,94,0.18), rgba(15,23,42,0.95));
      font-weight:800;
    ">
      <td class="time-col">TOTAL</td>
  `;

  diasSemana.forEach(d => {
    html += `<td class="aula-cell">${totais[d.chave] || 0}</td>`;
  });

  html += `</tr></table>`;

  document.getElementById("tabelaProfessor").innerHTML = html;
}


// ======================================================
// 🔥 INIT
// ======================================================
window.addEventListener(
  "DOMContentLoaded",
  async () => {

    renderTabelaProfessorVazia();

    await carregarProfessores();

    popularSemanasProfessor();
  }
);


// ======================================================
// 🔥 EXPORTA GLOBAIS
// ======================================================
window.renderProfessor =
  renderProfessor;

window.popularSemanasProfessor =
  popularSemanasProfessor;

window.preencherSelectProfessores =
  preencherSelectProfessores;

function ehIntervalo(horario) {

  const INTERVALOS = {
    "09:10 - 09:30": "INTERVALO",
    "15:30 - 15:50": "INTERVALO",
    "20:40 - 20:50": "INTERVALO",
    "12:00 - 13:50": "ALMOÇO",
    "18:20 - 19:00": "JANTAR"
  };

  return INTERVALOS[horario] || null;
}

// ======================================================
// 📄 EXPORTAR PDF PROFESSOR (PADRÃO SISTEMA)
// ======================================================
async function exportarPDFProfessor() {

  try {

    if (!window.jspdf?.jsPDF) {
      console.error("❌ jsPDF não carregado.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const nome =
      document.getElementById("nomeProfessorFicha")?.innerText || "Professor";

    const semana =
      document.getElementById("semanaProfessorFicha")?.innerText || "";

    if (!nome || !semana) {
      alert("Selecione professor e semana.");
      return;
    }

    const { mapa } = gerarMapaProfessor(nome, semana);

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

    const diasSemana = [];

    Object.keys(dias).forEach(data => {

      const [d, m, a] = data.split("/");

      const dt = new Date(a, m - 1, d);

      const nomeDia = nomesDias[dt.getDay()];

      if (!nomeDia || nomeDia === "DOMINGO") return;

      diasSemana.push({
        chave: nomeDia,
        data
      });

    });

    // ===============================
    // ⏱️ INTERVALOS / REFEIÇÕES
    // ===============================
    const INTERVALOS = {
      "09:10 - 09:30": "INTERVALO",
      "15:30 - 15:50": "INTERVALO",
      "20:40 - 20:50": "INTERVALO",
      "12:00 - 13:50": "ALMOÇO",
      "18:20 - 19:00": "JANTAR"
    };

    const totaisDia = {};

    const pageWidth = pdf.internal.pageSize.getWidth();
    const marginLeft = 4;
    const marginRight = 4;

    const usableWidth = pageWidth - marginLeft - marginRight;

    const firstColWidth = 18;
    const otherColsWidth =
      (usableWidth - firstColWidth) / diasSemana.length;

    // ===============================
    // HEADER
    // ===============================
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
      "FICHA SEMANAL DO PROFESSOR",
      pageWidth / 2,
      20,
      { align: "center" }
    );

    pdf.text(
      `Professor: ${nome} | Semana: ${semana}`,
      pageWidth / 2,
      25,
      { align: "center" }
    );

    // ===============================
    // HEAD
    // ===============================
    const head = [[
      "Horário",
      ...diasSemana.map(d => `${d.chave}\n${d.data}`)
    ]];

    // ===============================
    // BODY
    // ===============================
    const body = [];

HORARIOS_FICHA.forEach(horario => {

  const intervalo = ehIntervalo(horario);

  if (intervalo) {

    body.push([
      `${horario} - ${intervalo}`,
      ...diasSemana.map(() => "")
    ]);

    return;
  }

  const linha = [horario];

  diasSemana.forEach(dia => {

    const aula = mapa?.[horario]?.[dia.chave];

    if (!aula) {
      linha.push("");
      return;
    }

    if (aulaValida(aula.valor)) {
      totaisDia[dia.chave] =
        (totaisDia[dia.chave] || 0) + 1;
    }

    linha.push(`${aula.turma}\n${aula.valor}`);
  });

  body.push(linha);
});

    // TOTAL
    body.push([
      "TOTAL DE AULAS",
      ...diasSemana.map(d => totaisDia[d.chave] || 0)
    ]);

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
        0: { cellWidth: firstColWidth },
        1: { cellWidth: otherColsWidth },
        2: { cellWidth: otherColsWidth },
        3: { cellWidth: otherColsWidth },
        4: { cellWidth: otherColsWidth },
        5: { cellWidth: otherColsWidth },
        6: { cellWidth: otherColsWidth }
      },

      didParseCell: (data) => {

        const txt = (data.cell.raw || "").toString();

        if (txt.includes("INTERVALO") ||
            txt.includes("ALMOÇO") ||
            txt.includes("JANTAR")) {

          data.cell.styles.fillColor = [235, 235, 235];
          data.cell.styles.fontStyle = "bold";
        }

        if (txt.includes("TOTAL")) {
          data.cell.styles.fillColor = [200, 200, 200];
          data.cell.styles.fontStyle = "bold";
        }

      }

    });

    // FOOTER
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setFontSize(8);

    pdf.text(
      "IFRO - Campus Cacoal | BR 364, Km 228 | dape.cacoal@ifro.edu.br",
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );

    pdf.save(`Ficha Professor ${nome} - ${semana}.pdf`);

  } catch (e) {

    console.error("❌ Erro PDF professor:", e);
    alert("Erro ao gerar PDF do professor.");
  }
}
