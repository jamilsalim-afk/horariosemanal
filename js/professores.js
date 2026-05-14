// ======================================================
// 👨‍🏫 PROFESSORES.JS
// ======================================================


// ======================================================
// 🔥 CONFIG
// ======================================================
const URL_CSV_PROFESSORES =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQx3mL0G0v4wX2j5mW2e6sY5vN3/pub?gid=1694280391&single=true&output=csv";

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
// 🔥 CARREGAR PROFESSORES
// ======================================================
async function carregarProfessores(){

  try{

    const resp = await fetch(URL_CSV_PROFESSORES);

    const txt = await resp.text();

    const linhas = parseCSV(txt);

    PROFESSORES_MAPA = {};
    PROFESSORES_LISTA = [];

    linhas.slice(1).forEach(l => {

      const nomeExibicao =
        (l[0] || "").trim();

      const variacoes =
        (l[1] || "").trim();

      if(!nomeExibicao) return;

      const nomeNorm =
        normalizarSeguro(nomeExibicao);

      PROFESSORES_LISTA.push(nomeExibicao);

      PROFESSORES_MAPA[nomeNorm] = {
        exibicao: nomeExibicao,
        variacoes: []
      };

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

      PROFESSORES_MAPA[nomeNorm]
        .variacoes
        .push(nomeNorm);

    });

    preencherSelectProfessores();

  }catch(e){

    console.error(
      "❌ Erro ao carregar professores:",
      e
    );
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
function gerarMapaProfessor(
  nomeProfessor,
  semana
){

  const mapa = {};
  const totais = {};

  const dias =
    semanasAgrupadas?.[semana]
      ?.dias || {};

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

    const [d,m,a] =
      data.split('/');

    const dt =
      new Date(a, m - 1, d);

    const nomeDia =
      nomesDias[dt.getDay()];

    if(nomeDia === "DOMINGO"){
      return;
    }

    totais[nomeDia] ||= 0;

    dias[data].forEach(r => {

      const horario =
        (r[1] || "").trim();

      if(!horario) return;

      turmasDaPlanilha.forEach(turma => {

        const idx =
          dadosGlobais[0]
            .indexOf(turma);

        if(idx === -1) return;

        const valor =
          (r[idx] || "").trim();

        if(!valor) return;

        const encontrado =
          localizarProfessor(valor);

        if(
          encontrado !== nomeProfessor
        ){
          return;
        }

        mapa[horario] ||= {};

        mapa[horario][nomeDia] = {
          turma,
          valor
        };

        if(aulaValida(valor)){
          totais[nomeDia]++;
        }

      });

    });

  });

  return {
    mapa,
    totais
  };
}


// ======================================================
// 🔥 RENDER PROFESSOR
// ======================================================
function renderProfessor(){

  const professor =
    document.getElementById(
      "selectProfessor"
    )?.value || "";

  const semana =
    document.getElementById(
      "selectSemanaProfessor"
    )?.value || "";

  if(!professor || !semana){

    limparFichaProfessor();
    return;
  }

  document.getElementById(
    "nomeProfessorFicha"
  ).innerText = professor;

  document.getElementById(
    "semanaProfessorFicha"
  ).innerText = semana;

  const {
    mapa,
    totais
  } = gerarMapaProfessor(
    professor,
    semana
  );

  const diasSemana = [];
  const dias =
    semanasAgrupadas?.[semana]
      ?.dias || {};

  Object.keys(dias).forEach(data => {

    const [d,m,a] =
      data.split('/');

    const dt =
      new Date(a, m - 1, d);

    const nomes = [
      "DOMINGO",
      "SEGUNDA",
      "TERÇA",
      "QUARTA",
      "QUINTA",
      "SEXTA",
      "SÁBADO"
    ];

    const nomeDia =
      nomes[dt.getDay()];

    if(nomeDia === "DOMINGO"){
      return;
    }

    diasSemana.push({
      chave: nomeDia,
      label: `${nomeDia}<br>${data}`
    });
  });

  let html = `
    <table>

      <tr class="day-divider">
        <td colspan="${
          diasSemana.length + 1
        }">
          FICHA SEMANAL DO PROFESSOR
        </td>
      </tr>

      <tr>

        <th class="time-col">
          Horário
        </th>
  `;

  diasSemana.forEach(d => {

    html += `
      <th>${d.label}</th>
    `;
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

      if(!aula){

        html += `
          <td class="aula-cell"></td>
        `;

        return;
      }

      html += `
        <td class="aula-cell">

          <div style="
            font-weight:800;
            color:#22c55e;
            margin-bottom:5px;
            font-size:11px;
          ">
            ${aula.turma}
          </div>

          <div style="
            line-height:1.4;
            font-size:10px;
          ">
            ${aula.valor}
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

  html += `
    </tr>
  `;

  html += `</table>`;

  document.getElementById(
    "tabelaProfessor"
  ).innerHTML = html;
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
