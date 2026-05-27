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

function construirIndiceBase(base, debug = null) {

  const indice = {
    porProfessor: {}
  };

  base.forEach((item, idx) => {

    const valor = (item.valor || "").trim();

    if (!valor || !valor.includes(" - ")) {
      return;
    }

    const partes =
      valor.split(/\s*[-–]\s*/);

    if (partes.length < 2) {
      return;
    }

    const disciplina =
      (partes[0] || "").trim();

    const professorRaw =
      (partes[1] || "").trim();

    const prof =
      normalizarSeguro(professorRaw);

    const dia =
      normalizarSeguro(item.dia);

    const horario =
      (item.horario || "").trim();

    if (debug) {

      debug.totalLinhas++;

      debug.professoresEncontrados[prof] =
        (debug.professoresEncontrados[prof] || 0) + 1;
    }

    if (!prof || !dia || !horario) {
      return;
    }

    if (!indice.porProfessor[prof]) {

      indice.porProfessor[prof] = {
        aulas: []
      };
    }

    indice.porProfessor[prof].aulas.push({

      data: item.data,

      dia,

      horario,

      turma: item.turma,

      disciplina,

      origem: item.origem,

      raw: item.valor
    });

  });

  return indice;
}

// ======================================================
// 🔥 GERAR MAPA PROFESSOR (NOVO)
// ======================================================
function gerarMapaProfessor(nomeProfessor, semanaSelecionada) {

  const mapa = {};
  const totais = {};

  const professorBusca =
    normalizarTexto(nomeProfessor);

  const debug = {
    professorSelecionado: nomeProfessor,
    chave: professorBusca,
    totalBase: window.BASE_UNIFICADA?.length || 0,
    totalLinhas: 0,
    ignoradasSemana: 0,
    ignoradasProfessor: 0,
    matches: 0
  };

  if (!window.BASE_UNIFICADA?.length) {

    console.warn("⚠️ BASE_UNIFICADA vazia");

    return {
      mapa,
      totais,
      debug
    };
  }

  // ======================================================
  // 🔥 FILTRA POR SEMANA
  // ======================================================

  let datasSemana = [];

  if (
    semanaSelecionada &&
    semanasAgrupadas?.[semanaSelecionada]
  ) {

    datasSemana =
      Object.keys(
        semanasAgrupadas[semanaSelecionada].dias || {}
      );

  }

  // ======================================================
  // 🔥 PROCESSA BASE
  // ======================================================

  window.BASE_UNIFICADA.forEach(reg => {

    debug.totalLinhas++;

    // --------------------------------------------------
    // 🔥 FILTRO SEMANA
    // --------------------------------------------------

    if (
      datasSemana.length &&
      !datasSemana.includes(reg.data)
    ) {

      debug.ignoradasSemana++;

      return;
    }

    // --------------------------------------------------
    // 🔥 SOMENTE AULAS
    // --------------------------------------------------

    if (!reg.aulaValida) {
      return;
    }

    const valorOriginal =
      (reg.valor || "").trim();

    if (!valorOriginal.includes(" - ")) {
      return;
    }

    // ======================================================
    // 🔥 PROFESSOR = ÚLTIMA PARTE
    // ======================================================

    const partes =
      valorOriginal.split(" - ");

    const professorCelula =
  normalizarTexto(
    partes[partes.length - 1]
  );

console.log({
  professorBusca,
  professorCelula,
  valorOriginal
});

    // ======================================================
// 🔥 MATCH FLEXÍVEL REAL
// ======================================================

const partesBusca =
  professorBusca.split(" ");

const primeiroNomeBusca =
  partesBusca[0] || "";

const matchProfessor = (

  // igual completo
  professorCelula === professorBusca ||

  // começa com nome completo
  professorCelula.startsWith(professorBusca) ||

  // busca começa com célula
  professorBusca.startsWith(professorCelula) ||

  // 🔥 PRIMEIRO NOME
  professorCelula === primeiroNomeBusca ||

  professorCelula.startsWith(primeiroNomeBusca) ||

  primeiroNomeBusca.startsWith(professorCelula)

);

    if (!matchProfessor) {

      debug.ignoradasProfessor++;

      return;
    }

    debug.matches++;

    // ======================================================
    // 🔥 MAPA
    // ======================================================

    if (!mapa[reg.dia]) {
      mapa[reg.dia] = {};
    }

    mapa[reg.dia][reg.horario] = {

      disciplina: reg.disciplina,
      turma: reg.turma,
      modalidade: reg.modalidade,
      valor: reg.valor

    };

    // ======================================================
    // 🔥 TOTAIS
    // ======================================================

    if (!totais[reg.dia]) {
      totais[reg.dia] = 0;
    }

    totais[reg.dia]++;
  });

  console.log("🔥 DEBUG PROFESSOR:", debug);

  // ======================================================
  // 🔥 DEBUG VISUAL
  // ======================================================

  const debugDiv =
    document.getElementById("debugProfessor");

  if (debugDiv) {

    debugDiv.innerHTML = `

      <b>Professor selecionado:</b>
      ${debug.professorSelecionado}<br>

      <b>Chave normalizada:</b>
      ${debug.chave}<br>

      <b>Total base:</b>
      ${debug.totalBase}<br>

      <b>Total linhas processadas:</b>
      ${debug.totalLinhas}<br>

      <b>Ignoradas por semana:</b>
      ${debug.ignoradasSemana}<br>

      <b>Ignoradas por professor:</b>
      ${debug.ignoradasProfessor}<br>

      <b>Matches finais:</b>
      ${debug.matches}

    `;
  }

  return {
    mapa,
    totais,
    debug
  };
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

  const nomesDias = [
    "DOMINGO",
    "SEGUNDA",
    "TERÇA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SÁBADO"
  ];

  // =========================================
  // 🔥 FIX PRINCIPAL: DIAS DA SEMANA (ROBUSTO)
  // =========================================

  const diasSemana = [];

  const diasRef = semanasAgrupadas?.[semana]?.dias;

  // 1) CASO NORMAL (com estrutura de semanas)
  if (diasRef && Object.keys(diasRef).length > 0) {

    Object.keys(diasRef).forEach(data => {

      const [d, m, a] = data.split("/");
      const dt = new Date(a, m - 1, d);

      const nomeDia = nomesDias[dt.getDay()];

      if (!nomeDia || nomeDia === "DOMINGO") return;

      diasSemana.push({
        chave: nomeDia,
        data,
        label: `${nomeDia}<br>${data}`
      });
    });

  }

  // 2) FALLBACK (CASO QUEBROU semanasAgrupadas)
  if (diasSemana.length === 0) {

    const hoje = new Date();

    // gera semana padrão SEG-SÁB
    for (let i = 1; i <= 6; i++) {

      const dt = new Date(hoje);
      dt.setDate(hoje.getDate() + i);

      const nomeDia = nomesDias[dt.getDay()];

      diasSemana.push({
        chave: nomeDia,
        data: `${String(dt.getDate()).padStart(2,"0")}/${
          String(dt.getMonth()+1).padStart(2,"0")
        }/${dt.getFullYear()}`,
        label: nomeDia
      });
    }
  }

  // =========================================
  // 🔥 HTML TABELA
  // =========================================

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

  // =========================================
  // 🔥 LINHAS DE HORÁRIO (FIX PRINCIPAL)
  // =========================================

  HORARIOS_FICHA.forEach(horario => {

    html += `<tr>
      <td class="time-col">${horario}</td>
    `;

    diasSemana.forEach(d => {

      const aula =
  mapa?.[d.chave]?.[horario];

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
            ${aula.disciplina || ""}
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

  // =========================================
  // 🔥 TOTAL
  // =========================================

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

    if (aulaValida(aula.disciplina)) {
      totaisDia[dia.chave] =
        (totaisDia[dia.chave] || 0) + 1;
    }

    linha.push(
  `${aula.turma}\n${aula.disciplina || ""}`
);
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