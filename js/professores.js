// ======================================================
// 👨‍🏫 PROFESSORES.JS
// ======================================================


// ======================================================
// 🔥 BASE PROFESSORES
// ======================================================
window.listaProfessores = [];
window.mapaProfessores = {};


// ======================================================
// 🔥 NORMALIZADOR BASE
// ======================================================
function normalizarProfessor(nome){

  return normalizarTexto(nome)
    .replace(/\s+/g, " ")
    .trim();
}


// ======================================================
// 🔥 NOME COMPLETO
// ======================================================
function getNomeProfessorExibicao(nome){

  const n = normalizarProfessor(nome);

  return window.mapaProfessores[n] || nome;
}


// ======================================================
// 🔥 CARREGA PROFESSORES
// ======================================================
async function carregarProfessores(){

  try{

    // 🔥 GID DA ABA PROFESSORES
    const gid = "1694280391";

    const planilhaId =
      "1IDjs0oS6lQBGDrL7ja1Ge0vaBdNCNIULDH7J5p89c5s";

    const url =
      `https://docs.google.com/spreadsheets/d/${planilhaId}/export?format=csv&gid=${gid}`;

    const resp = await fetch(url);

    const texto = await resp.text();

    const linhas = parseCSV(texto);

    const mapa = {};
    const lista = [];

    for(let i = 1; i < linhas.length; i++){

      const linha = linhas[i];

      const nomeExibicao =
        (linha[0] || "").trim();

      const variacoes =
        (linha[1] || "").trim();

      if(!nomeExibicao) continue;

      lista.push(nomeExibicao);

      // 🔥 adiciona nome principal
      mapa[
        normalizarProfessor(nomeExibicao)
      ] = nomeExibicao;

      // 🔥 aliases
      variacoes
        .split(";")
        .map(v => v.trim())
        .filter(v => v)
        .forEach(v => {

          mapa[
            normalizarProfessor(v)
          ] = nomeExibicao;

        });
    }

    window.listaProfessores = lista.sort();

    window.mapaProfessores = mapa;

    popularSelectProfessores();

  }catch(e){

    console.error(
      "❌ Erro carregarProfessores:",
      e
    );
  }
}


// ======================================================
// 🔥 POPULAR SELECT PROFESSORES
// ======================================================
function popularSelectProfessores(){

  const select =
    document.getElementById(
      "selectProfessor"
    );

  if(!select) return;

  select.innerHTML = `
    <option value="">
      Selecione o professor
    </option>
  `;

  window.listaProfessores
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

  select.innerHTML = `
    <option value="">
      Selecione a semana
    </option>
  `;

  if(
    !window.semanasAgrupadas
  ){
    return;
  }

  ordenarDatasBR(
    Object.keys(
      window.semanasAgrupadas
    )
  ).forEach(semana => {

    select.innerHTML += `
      <option value="${semana}">
        Semana de ${semana}
      </option>
    `;

  });
}


// ======================================================
// 🔥 TODOS HORÁRIOS
// ======================================================
function getTodosHorariosProfessor(){

  const horarios = new Set();

  Object.values(
    semanasAgrupadas || {}
  ).forEach(semana => {

    Object.values(
      semana.dias || {}
    ).forEach(dia => {

      dia.forEach(r => {

        const horario =
          (r[1] || "").trim();

        if(
          horario &&
          !normalizarTexto(horario)
            .includes("INTERVALO")
        ){
          horarios.add(horario);
        }

      });

    });

  });

  return [...horarios].sort((a,b)=>{

    const ha =
      horaParaMinutos(
        a.split(" - ")[0]
      );

    const hb =
      horaParaMinutos(
        b.split(" - ")[0]
      );

    return ha - hb;
  });
}


// ======================================================
// 🔥 AULA VÁLIDA
// ======================================================
function aulaValida(valor){

  const v = normalizarTexto(valor);

  if(!v) return false;

  if(
    v.includes("INTERVALO") ||
    v.includes("RESERVA ENSINO") ||
    v.includes("PPS/ATENDIMENTO") ||
    v.includes("ESTUDOS INDIVIDUAIS") ||
    v.includes("REUNIAO") ||
    v.includes("CAED") ||
    v.includes("PRE-CONSELHO") ||
    v.includes("[+]") ||
    v.includes("[R]") ||
    v.includes("*")
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

  document.getElementById(
    "tabelaProfessor"
  ).innerHTML = "";
}


// ======================================================
// 🔥 GERA MAPA PROFESSOR
// ======================================================
function gerarMapaProfessor(
  nomeProfessor,
  semana
){

  const dias =
    semanasAgrupadas?.[semana]
      ?.dias || {};

  const nomeBusca =
    normalizarProfessor(nomeProfessor);

  const mapa = {};
  const totais = {};

  Object.keys(dias)
    .forEach(dia => {

      const [d,m,a] =
        dia.split('/');

      const dataObj =
        new Date(a, m - 1, d);

      const nomesDias = [
        "DOMINGO",
        "SEGUNDA",
        "TERÇA",
        "QUARTA",
        "QUINTA",
        "SEXTA",
        "SÁBADO"
      ];

      const nomeDia =
        nomesDias[
          dataObj.getDay()
        ];

      if(nomeDia === "DOMINGO"){
        return;
      }

      if(!totais[nomeDia]){
        totais[nomeDia] = 0;
      }

      dias[dia]
        .forEach(r => {

          const horario =
            (r[1] || "").trim();

          if(!horario) return;

          turmasDaPlanilha
            .forEach(turma => {

              const idx =
                dadosGlobais[0]
                  .indexOf(turma);

              if(idx === -1){
                return;
              }

              const valor =
                (r[idx] || "").trim();

              const valorNorm =
                normalizarTexto(valor);

              // 🔥 procura qualquer alias
              let encontrou = false;

              Object.keys(
                window.mapaProfessores
              ).forEach(alias => {

                const nomeReal =
                  window
                    .mapaProfessores[
                      alias
                    ];

                if(
                  nomeReal !== nomeProfessor
                ){
                  return;
                }

                if(
                  valorNorm.includes(alias)
                ){
                  encontrou = true;
                }

              });

              if(!encontrou){
                return;
              }

              if(!mapa[horario]){
                mapa[horario] = {};
              }

              mapa[horario][nomeDia] = {
                turma,
                texto: valor
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
    )?.value?.trim();

  const semana =
    document.getElementById(
      "selectSemanaProfessor"
    )?.value;

  if(!professor || !semana){

    limparFichaProfessor();
    return;
  }

  const {
    mapa,
    totais
  } = gerarMapaProfessor(
    professor,
    semana
  );

  document.getElementById(
    "nomeProfessorFicha"
  ).innerText = professor;

  document.getElementById(
    "semanaProfessorFicha"
  ).innerText = semana;

  const dias =
    semanasAgrupadas?.[semana]
      ?.dias || {};

  const cabecalhos = [];

  Object.keys(dias)
    .forEach(dia => {

      const [d,m,a] =
        dia.split('/');

      const dataObj =
        new Date(a, m - 1, d);

      const nomesDias = [
        "DOMINGO",
        "SEGUNDA",
        "TERÇA",
        "QUARTA",
        "QUINTA",
        "SEXTA",
        "SÁBADO"
      ];

      const nomeDia =
        nomesDias[
          dataObj.getDay()
        ];

      if(nomeDia === "DOMINGO"){
        return;
      }

      cabecalhos.push({
        chave: nomeDia,
        label: `${nomeDia}<br>${dia}`
      });

    });

  const horarios =
    getTodosHorariosProfessor();

  let html = `
    <table>

      <tr class="day-divider">
        <td colspan="${cabecalhos.length + 1}">
          FICHA SEMANAL DO PROFESSOR
        </td>
      </tr>

      <tr>
        <th class="time-col">
          Horário
        </th>
  `;

  cabecalhos.forEach(c => {

    html += `
      <th>${c.label}</th>
    `;

  });

  html += `</tr>`;

  horarios.forEach(horario => {

    html += `
      <tr>

        <td class="time-col">
          ${horario}
        </td>
    `;

    cabecalhos.forEach(c => {

      const aula =
        mapa?.[horario]?.[c.chave];

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
            margin-bottom:4px;
            font-size:11px;
          ">
            ${aula.turma}
          </div>

          <div style="
            line-height:1.4;
            font-size:10px;
          ">
            ${aula.texto}
          </div>

        </td>
      `;

    });

    html += `
      </tr>
    `;
  });

  html += `
    <tr style="
      background:
        linear-gradient(
          135deg,
          rgba(34,197,94,0.15),
          rgba(15,23,42,0.9)
        );
      font-weight:800;
    ">

      <td class="time-col">
        TOTAL
      </td>
  `;

  cabecalhos.forEach(c => {

    html += `
      <td class="aula-cell">
        ${totais[c.chave] || 0}
      </td>
    `;

  });

  html += `
    </tr>
  `;

  html += `
    </table>
  `;

  document.getElementById(
    "tabelaProfessor"
  ).innerHTML = html;
}


// ======================================================
// 🔥 INIT PROFESSORES
// ======================================================
async function initProfessores(){

  await carregarProfessores();

  popularSemanasProfessor();

  limparFichaProfessor();
}


// ======================================================
// 🔥 EXPORT GLOBAL
// ======================================================
window.renderProfessor =
  renderProfessor;

window.initProfessores =
  initProfessores;

window.popularSemanasProfessor =
  popularSemanasProfessor;

window.carregarProfessores =
  carregarProfessores;

window.getNomeProfessorExibicao =
  getNomeProfessorExibicao;
