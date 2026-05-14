// ===============================
// 👨‍🏫 PROFESSORES
// ===============================

(function () {

  // ===============================
  // 🔤 NORMALIZAÇÃO SEGURA
  // ===============================
  function normalizarSeguro(texto) {

    try {

      if (typeof normalizarTexto === "function") {
        return normalizarTexto(texto || "");
      }

      return String(texto || "")
        .trim()
        .toUpperCase();

    } catch (e) {

      return String(texto || "")
        .trim()
        .toUpperCase();

    }

  }

// ===============================
// 🔍 FILTRO DE PROFESSOR (INTELIGENTE)
// ===============================
function filtrarProfessor() {

  const input = document.getElementById('searchProf');

  if (!input) return;

  const termo = normalizarTexto(input.value);

  const container = document.getElementById('tabelaHorario');

  if (!container) return;

  const tabelas = container.querySelectorAll('table');

  tabelas.forEach(tb => {

    let tabelaTemResultado = false;

    const linhas = tb.querySelectorAll('tr');

    linhas.forEach(tr => {

      // 🔥 mantém cabeçalhos
      if (
        tr.classList.contains('day-divider') ||
        tr.querySelector('th')
      ) {
        tr.style.display = '';
        return;
      }

      const celulas = tr.querySelectorAll('td');

      let linhaTemResultado = false;

      celulas.forEach(td => {

        // 🔥 ignora coluna horário
        if (td.classList.contains('time-col')) {
          td.classList.remove('highlight', 'opaco');
          return;
        }

        const txt = normalizarTexto(td.innerText);

        if (termo) {

          if (txt.includes(termo)) {

            td.classList.add('highlight');
            td.classList.remove('opaco');

            linhaTemResultado = true;
            tabelaTemResultado = true;

          } else {

            td.classList.remove('highlight');
            td.classList.add('opaco');

          }

        } else {

          td.classList.remove('highlight', 'opaco');

        }

      });

      // 🔥 esconde linhas sem resultado
      if (termo) {

        tr.style.display =
          linhaTemResultado ? '' : 'none';

      } else {

        tr.style.display = '';

      }

    });

    // 🔥 esconde tabela inteira sem ocorrência
    if (termo) {

      tb.style.display =
        tabelaTemResultado ? '' : 'none';

    } else {

      tb.style.display = '';

    }

  });

}


  // ===============================
  // 🧠 NORMALIZAR PROFESSOR
  // ===============================
  function normalizarProfessor(nome) {

    try {

      if (!nome) return "";

      return normalizarSeguro(nome)

        .replace(/\s+/g, " ")

        .trim()

        .split(" ")

        .slice(0, 2)

        .join(" ");

    } catch (e) {

      console.warn(
        "⚠️ Erro em normalizarProfessor:",
        e
      );

      return String(nome || "");

    }

  }


  // ===============================
  // 📊 GERAR GRADE PROFESSOR
  // ===============================
  function gerarGradeProfessor(
    nomeProf
  ) {

    const mapa = {};

    try {

      const sem =

        window.appState?.semana ||

        window.semanaAtual ||

        document.getElementById(
          "selectSemanaProfessor"
        )?.value ||

        document.getElementById(
          "selectSemana"
        )?.value;

      const dias =
        window.semanasAgrupadas?.[sem]
          ?.dias || {};

      const diasSemana = [

        "SEGUNDA-FEIRA",

        "TERÇA-FEIRA",

        "QUARTA-FEIRA",

        "QUINTA-FEIRA",

        "SEXTA-FEIRA",

        "SÁBADO"

      ];

      const nomeBusca =
        normalizarSeguro(nomeProf);

      Object.keys(dias)
        .forEach(dia => {

          try {

            const [d, m, a] =
              dia.split("/");

            const dataObj =
              new Date(
                a,
                m - 1,
                d
              );

            const nomesDias = [

              "DOMINGO",

              "SEGUNDA-FEIRA",

              "TERÇA-FEIRA",

              "QUARTA-FEIRA",

              "QUINTA-FEIRA",

              "SEXTA-FEIRA",

              "SÁBADO"

            ];

            const nomeDia =
              nomesDias[
                dataObj.getDay()
              ];

            if (
              !diasSemana.includes(
                nomeDia
              )
            ) {
              return;
            }

            dias[dia]
              .forEach(r => {

                try {

                  const horario =
                    r[1];

                  if (
                    !mapa[horario]
                  ) {

                    mapa[horario] =
                      {};

                  }

                  (
                    window
                      .turmasDaPlanilha ||
                    []
                  ).forEach(
                    turma => {

                      try {

                        const idx =
                          window
                            .dadosGlobais?.[0]
                            ?.indexOf(
                              turma
                            );

                        if (
                          idx === -1 ||
                          idx ==
                            null
                        ) {
                          return;
                        }

                        const val =
                          (
                            r[idx] ||
                            ""
                          ).trim();

                        const valNorm =
                          normalizarSeguro(
                            val
                          );

                        if (
                          valNorm.includes(
                            nomeBusca
                          )
                        ) {

                          if (
                            !mapa[
                              horario
                            ][
                              nomeDia
                            ]
                          ) {

                            mapa[
                              horario
                            ][
                              nomeDia
                            ] = [];

                          }

                          mapa[
                            horario
                          ][
                            nomeDia
                          ].push({

                            turma,

                            aula: val

                          });

                        }

                      } catch (e) {

                        console.warn(
                          "⚠️ Erro turma professor:",
                          e
                        );

                      }

                    }
                  );

                } catch (e) {

                  console.warn(
                    "⚠️ Erro linha professor:",
                    e
                  );

                }

              });

          } catch (e) {

            console.warn(
              "⚠️ Erro dia professor:",
              e
            );

          }

        });

    } catch (e) {

      console.error(
        "❌ Erro em gerarGradeProfessor:",
        e
      );

    }

    return mapa;

  }


  // ===============================
  // 👨‍🏫 MOSTRAR FICHA
  // ===============================
  function mostrarFichaProfessorTabela(
    nome
  ) {

    try {

      const grade =
        gerarGradeProfessor(nome);

      const diasSemana = [

        "SEGUNDA-FEIRA",

        "TERÇA-FEIRA",

        "QUARTA-FEIRA",

        "QUINTA-FEIRA",

        "SEXTA-FEIRA",

        "SÁBADO"

      ];

      let html = `

        <div class="table-responsive">

        <h3 style="
          margin:10px 0;
          color:#2e7d32;
        ">
          👨‍🏫 FICHA SEMANAL - ${nome}
        </h3>

        <table style="
          border-collapse:collapse;
          width:100%;
          font-size:12px;
        ">

          <thead>

            <tr>

              <th>Horário</th>

              ${diasSemana
                .map(
                  d => `<th>${d}</th>`
                )
                .join("")}

            </tr>

          </thead>

          <tbody>

      `;

      Object.keys(grade)
        .forEach(horario => {

          html += `<tr>`;

          html += `
            <td>
              <b>${horario}</b>
            </td>
          `;

          diasSemana.forEach(dia => {

            let conteudo =
              grade[horario]?.[dia];

            if (
              Array.isArray(
                conteudo
              )
            ) {

              conteudo =
                conteudo
                  .map(
                    item => `

                      <div style="
                        margin-bottom:6px;
                      ">

                        <b>
                          ${item.turma}
                        </b>

                        <br>

                        ${item.aula}

                      </div>

                    `
                  )
                  .join(
                    "<hr style='margin:3px 0;'>"
                  );

            }

            html += `
              <td>
                ${conteudo || "-"}
              </td>
            `;

          });

          html += `</tr>`;

        });

      html += `
          </tbody>
        </table>
        </div>
      `;

      const container =
        document.getElementById(
          "fichaProfessor"
        );

      if (container) {

        container.innerHTML = html;

      }

    } catch (e) {

      console.error(
        "❌ Erro em mostrarFichaProfessorTabela:",
        e
      );

    }

  }


  // ===============================
  // 🔄 RENDER PROFESSOR
  // ===============================
  function renderProfessor() {

    try {

      const select =
        document.getElementById(
          "selectProfessor"
        );

      if (!select) return;

      const nome =
        select.value;

      if (!nome) {

        const container =
          document.getElementById(
            "fichaProfessor"
          );

        if (container) {
          container.innerHTML = "";
        }

        return;
      }

      mostrarFichaProfessorTabela(
        nome
      );

    } catch (e) {

      console.error(
        "❌ Erro em renderProfessor:",
        e
      );

    }

  }


  // ===============================
  // 🔎 PREVIEW PROFESSOR
  // ===============================
  function gerarPreviewProfessor() {

    try {

      const nome =
        document.getElementById(
          "searchProf"
        )?.value
          .trim();

      if (
        nome &&
        nome.length > 3
      ) {

        mostrarFichaProfessorTabela(
          nome
        );

      } else {

        const container =
          document.getElementById(
            "fichaProfessor"
          );

        if (container) {
          container.innerHTML = "";
        }

      }

    } catch (e) {

      console.error(
        "❌ Erro preview professor:",
        e
      );

    }

  }


  // ===============================
  // 🌎 EXPORTAÇÃO GLOBAL
  // ===============================
  window.filtrarProfessor =
    filtrarProfessor;

  window.normalizarProfessor =
    normalizarProfessor;

  window.gerarGradeProfessor =
    gerarGradeProfessor;

  window.mostrarFichaProfessorTabela =
    mostrarFichaProfessorTabela;

  window.gerarPreviewProfessor =
    gerarPreviewProfessor;

  window.renderProfessor =
    renderProfessor;

})();

// ======================================================
// 👨‍🏫 PROFESSORES.JS
// ======================================================


// ======================================================
// 🔥 NORMALIZADOR DE PROFESSOR
// ======================================================
function normalizarProfessor(nome){

  return normalizarTexto(nome)
    .replace(/\s+/g, " ")
    .trim();
}


// ======================================================
// 🔥 LIMPA FICHA
// ======================================================
function limparFichaProfessor(){

  document.getElementById("nomeProfessorFicha").innerText = "—";
  document.getElementById("semanaProfessorFicha").innerText = "—";

  document.getElementById("tabelaProfessor").innerHTML = `
    <table>

      <tr class="day-divider">
        <td colspan="7">
          FICHA SEMANAL DO PROFESSOR
        </td>
      </tr>

      <tr>
        <th class="time-col">Horário</th>
        <th>SEGUNDA</th>
        <th>TERÇA</th>
        <th>QUARTA</th>
        <th>QUINTA</th>
        <th>SEXTA</th>
        <th>SÁBADO</th>
      </tr>

      <tr>
        <td class="time-col">—</td>
        <td class="aula-cell"></td>
        <td class="aula-cell"></td>
        <td class="aula-cell"></td>
        <td class="aula-cell"></td>
        <td class="aula-cell"></td>
        <td class="aula-cell"></td>
      </tr>

    </table>
  `;
}


// ======================================================
// 🔥 DETECTA SE É AULA VÁLIDA
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
// 🔥 GERA MAPA DO PROFESSOR
// ======================================================
function gerarMapaProfessor(nomeProfessor, semana){

  const dias = semanasAgrupadas?.[semana]?.dias || {};

  const nomeBusca = normalizarProfessor(nomeProfessor);

  const mapa = {};
  const totais = {};

  Object.keys(dias).forEach(dia => {

    const [d,m,a] = dia.split('/');

    const dataObj = new Date(a, m - 1, d);

    const nomesDias = [
      "DOMINGO",
      "SEGUNDA",
      "TERÇA",
      "QUARTA",
      "QUINTA",
      "SEXTA",
      "SÁBADO"
    ];

    const nomeDia = nomesDias[dataObj.getDay()];

    if(nomeDia === "DOMINGO") return;

    totais[nomeDia] = 0;

    dias[dia].forEach(r => {

      const horario = r[1];

      if(!horario) return;

      turmasDaPlanilha.forEach(turma => {

        const idx = dadosGlobais[0].indexOf(turma);

        if(idx === -1) return;

        const valor = (r[idx] || "").trim();

        const valorNorm = normalizarTexto(valor);

        if(!valorNorm.includes(nomeBusca)) return;

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
    document.getElementById("searchProf")?.value?.trim();

  const semana =
    document.getElementById("selectSemanaProfessor")?.value;

  if(!professor || !semana){

    limparFichaProfessor();
    return;
  }

  const {
    mapa,
    totais
  } = gerarMapaProfessor(professor, semana);

  document.getElementById("nomeProfessorFicha").innerText =
    professor;

  document.getElementById("semanaProfessorFicha").innerText =
    semana;

  const dias = semanasAgrupadas?.[semana]?.dias || {};

  const cabecalhos = [];

  Object.keys(dias).forEach(dia => {

    const [d,m,a] = dia.split('/');

    const dataObj = new Date(a, m - 1, d);

    const nomesDias = [
      "DOMINGO",
      "SEGUNDA",
      "TERÇA",
      "QUARTA",
      "QUINTA",
      "SEXTA",
      "SÁBADO"
    ];

    const nomeDia = nomesDias[dataObj.getDay()];

    if(nomeDia === "DOMINGO") return;

    cabecalhos.push({
      chave: nomeDia,
      label: `${nomeDia}<br>${dia}`
    });

  });

  const horarios = Object.keys(mapa).sort((a,b)=>{

    const ha = horaParaMinutos(a.split(" - ")[0]);
    const hb = horaParaMinutos(b.split(" - ")[0]);

    return ha - hb;
  });

  let html = `
    <table>

      <tr class="day-divider">
        <td colspan="${cabecalhos.length + 1}">
          FICHA SEMANAL DO PROFESSOR
        </td>
      </tr>

      <tr>
        <th class="time-col">Horário</th>
  `;

  cabecalhos.forEach(c => {
    html += `<th>${c.label}</th>`;
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

      const aula = mapa?.[horario]?.[c.chave];

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

    html += `</tr>`;
  });

  // 🔥 TOTAL
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

  html += `</table>`;

  document.getElementById("tabelaProfessor").innerHTML =
    html;
}


// ======================================================
// 🔥 POPULAR SEMANAS PROFESSOR
// ======================================================
function popularSemanasProfessor(){

  const select =
    document.getElementById("selectSemanaProfessor");

  if(!select) return;

  select.innerHTML =
    `<option value="">Selecione a semana</option>`;

  ordenarDatasBR(
    Object.keys(semanasAgrupadas)
  ).forEach(semana => {

    select.innerHTML += `
      <option value="${semana}">
        Semana de ${semana}
      </option>
    `;
  });
}
