// ======================================================
// 🔥 CURSO INFO
// ======================================================
function getCursoInfo(t) {

  t = (t || "").toUpperCase();

  if (t.includes("AGROEC")) return { cl: "c-agroec", rgb: [232, 245, 233] };
  if (t.includes("AGROPEC")) return { cl: "c-agropec", rgb: [227, 242, 253] };
  if (t.includes("INFO")) return { cl: "c-info", rgb: [255, 248, 225] };
  if (t.includes("GEO")) return { cl: "c-geo", rgb: [243, 229, 245] };
  if (t.includes("MAT")) return { cl: "c-mat", rgb: [224, 247, 250] };
  if (t.includes("AGRONEG")) return { cl: "c-agroneg", rgb: [239, 235, 233] };
  if (t.includes("ZOO")) return { cl: "c-zoo", rgb: [252, 228, 236] };
  if (t.includes("AGRON")) return { cl: "c-agron", rgb: [241, 248, 233] };

  return { cl: "", rgb: [255, 255, 255] };
}


// ======================================================
// 🔥 PROCESSAR DADOS
// ======================================================
function processarDados() {

  semanasAgrupadas = {};

  if (!dadosGlobais || !dadosGlobais.length) return;

  turmasDaPlanilha = dadosGlobais[0]
    .slice(2)
    .filter(t => t && t.trim());

  let ultimaData = "";

  for (let i = 1; i < dadosGlobais.length; i++) {

    let r = [...dadosGlobais[i]];

    if (r[0]) ultimaData = r[0];

    r[0] = ultimaData;

    if (!r[0]) continue;

    const [d, m, a] = r[0].split('/');

    const dt = new Date(a, m - 1, d);

    const diaSemana = dt.getDay();

    const diff = diaSemana === 0 ? -6 : 1 - diaSemana;

    const segunda = new Date(dt);

    segunda.setDate(dt.getDate() + diff);

    const semana = segunda.toLocaleDateString('pt-BR');

    if (!semanasAgrupadas[semana]) {
      semanasAgrupadas[semana] = {
        dias: {}
      };
    }

    if (!semanasAgrupadas[semana].dias[r[0]]) {
      semanasAgrupadas[semana].dias[r[0]] = [];
    }

    semanasAgrupadas[semana].dias[r[0]].push(r);
  }

  const selectSemana = document.getElementById("selectSemana");

  if (!selectSemana) return;

  selectSemana.innerHTML = "";

  const semanasOrdenadas = ordenarDatasBR(
    Object.keys(semanasAgrupadas)
  );

  semanasOrdenadas.forEach(s => {

    selectSemana.innerHTML += `
      <option value="${s}">
        Semana de ${s}
      </option>
    `;
  });

  const semanaAtual = getSemanaAtual();

  if (semanasAgrupadas[semanaAtual]) {
    selectSemana.value = semanaAtual;
  } else if (semanasOrdenadas.length) {
    selectSemana.value = semanasOrdenadas[0];
  }

  window.appState = window.appState || {};

  window.appState.semana = selectSemana.value;

  const selectModalidade =
    document.getElementById("selectModalidade");

  if (selectModalidade) {

    window.appState.modalidade =
      selectModalidade.value;
  }

  // 🔥 RENDER PRINCIPAL
  renderizarTabela();

  // 🔥 BOTÕES RELATÓRIOS
  if (typeof criarBotoesDias === "function") {
    criarBotoesDias();
  }

  // 🔥 ABA PROFESSOR
  if (typeof popularProfessores === "function") {
    popularProfessores();
  }

  if (typeof popularSemanasProfessor === "function") {
    popularSemanasProfessor();
  }

  // 🔥 ABA TURMAS
  if (typeof preencherSelectTurmas === "function") {
    preencherSelectTurmas();
  }

  // 🔥 FILTRO
  if (typeof filtrarProfessor === "function") {
    filtrarProfessor();
  }
}

// ======================================================
// 🔥 TURMAS ATIVAS
// ======================================================
function getTurmasAtivasNaSemana(dias) {

  return turmasDaPlanilha.filter(t => {

    const idx = dadosGlobais[0].indexOf(t);

    return Object.values(dias).some(d =>
      d.some(r => {

        const v = (r[idx] || "").trim();

        return (
          v &&
          v !== "-" &&
          !normalizarTexto(r[1] || "")
            .includes("INTERVALO")
        );
      })
    );
  });
}


// ======================================================
// 🔥 ABREVIAR TURMA
// ======================================================
function abreviarTurma(nome) {

  return nome

    .replaceAll("1 SEMESTRE", "1º")
    .replaceAll("2 SEMESTRE", "2º")
    .replaceAll("3 SEMESTRE", "3º")
    .replaceAll("4 SEMESTRE", "4º")
    .replaceAll("5 SEMESTRE", "5º")
    .replaceAll("6 SEMESTRE", "6º")
    .replaceAll("7 SEMESTRE", "7º")
    .replaceAll("8 SEMESTRE", "8º")
    .replaceAll("9 SEMESTRE", "9º")
    .replaceAll("10 SEMESTRE", "10º")

    .replaceAll("AGROECOLOGIA", "AGROEC.")
    .replaceAll("AGROPECUÁRIA", "AGROP.")
    .replaceAll("AGROPECUARIA", "AGROP.")
    .replaceAll("INFORMÁTICA", "INFO")
    .replaceAll("INFORMATICA", "INFO")

    .replaceAll("GEOGRAFIA", "GEO.")
    .replaceAll("MATEMÁTICA", "MAT.")
    .replaceAll("MATEMATICA", "MAT.")
    .replaceAll("AGRONEGÓCIO", "AGRONEG.")
    .replaceAll("AGRONEGOCIO", "AGRONEG.")
    .replaceAll("ZOOTECNIA", "ZOO.")
    .replaceAll("AGRONOMIA", "AGRON.")

    .replaceAll("MATUTINO", "MAT.")
    .replaceAll("VESPERTINO", "VESP.")
    .replaceAll("NOTURNO", "NOT.")

    .replaceAll("INTEGRADO", "INT.")
    .replaceAll("SUPERIOR", "SUP.")

    .replace(/\s+/g, " ")
    .trim();
}


// ======================================================
// 🔥 RENDER PRINCIPAL
// ======================================================
// ======================================================
// 🔥 RENDER PRINCIPAL
// ======================================================
function renderizarTabela() {

  const selectSemana =
    document.getElementById('selectSemana');

  const selectModalidade =
    document.getElementById('selectModalidade');

  if (!selectSemana || !selectModalidade) return;

  const sem = selectSemana.value;

  if (!sem || !semanasAgrupadas[sem]) return;

  const dias = semanasAgrupadas[sem].dias;

  const container =
    document.getElementById('tabelaHorario');

  if (!container) return;

  // ======================================================
  // 🔍 BUSCA PROFESSOR
  // ======================================================
  const busca =
    normalizarTexto(
      document.getElementById("searchProf")?.value || ""
    );

  window.appState = window.appState || {};

  window.appState.semana = sem;

  window.appState.modalidade =
    selectModalidade.value;

  let turmasAtivas =
  selectModalidade.value === "SUPERIOR"
    ? getTurmasAtivasNaSemana(dias)
    : turmasDaPlanilha;


// ======================================================
// 🔥 FILTRO PROFESSOR (OCULTAR COLUNAS)
// ======================================================

const busca =
  normalizarTexto(
    document.getElementById("searchProf")?.value || ""
  );

if (busca) {

  turmasAtivas = turmasAtivas.filter(turma => {

    const idx =
      dadosGlobais[0].indexOf(turma);

    return Object.values(dias).some(linhas => {

      return linhas.some(r => {

        const val =
          normalizarTexto(r[idx] || "");

        return val.includes(busca);

      });

    });

  });

}

  const nomes = [
    "DOMINGO",
    "SEGUNDA-FEIRA",
    "TERÇA-FEIRA",
    "QUARTA-FEIRA",
    "QUINTA-FEIRA",
    "SEXTA-FEIRA",
    "SÁBADO"
  ];

  let html = "";

  const regrasDestaque = [
    {
      match: v => v.includes("RESERVA ENSINO"),
      classe: "reserva-ensino"
    },
    {
      match: v => v.includes("PPS/ATENDIMENTO"),
      classe: "pps"
    },
    {
      match: v => v.includes("ESTUDOS INDIVIDUAIS"),
      classe: "estudos"
    },
    {
      match: v => v.includes("REUNIAO DE SERVIDORES"),
      classe: "reuniao"
    },
    {
      match: v =>
        v.includes("CAED") ||
        v.includes("PRE-CONSELHO"),
      classe: "caed"
    },
    {
      match: v => v.includes("_REP -"),
      classe: "reposicao"
    }
  ];

  Object.keys(dias).forEach(dia => {

    const p = dia.split('/');

    const dObj = new Date(
      p[2],
      p[1] - 1,
      p[0]
    );

    // ======================================================
    // 🔥 FERIADO
    // ======================================================
    if (
      typeof isFeriado === "function" &&
      isFeriado(dia)
    ) {

      html += `
        <table>

          <tr class="day-divider">
            <td colspan="${turmasAtivas.length + 1}">
              ${nomes[dObj.getDay()]} - ${dia}
            </td>
          </tr>

          <tr>
            <td
              colspan="${turmasAtivas.length + 1}"
              class="feriado"
            >
              FERIADO
            </td>
          </tr>

        </table>

        <br>
      `;

      return;
    }

    // ======================================================
    // 🔍 FILTRO PROFESSOR
    // ======================================================
    const linhasOriginais = dias[dia];

    let linhas = linhasOriginais.filter(r => {

      if (!busca) return true;

      return r.some(c =>
        normalizarTexto(c || "")
          .includes(busca)
      );

    });

    // 🔥 não renderiza dia vazio
    if (!linhas.length) {
      return;
    }

    html += `<table>`;

    // ======================================================
    // 🔥 CABEÇALHO DIA
    // ======================================================
    html += `
      <tr class="day-divider">
        <td colspan="${turmasAtivas.length + 1}">
          ${nomes[dObj.getDay()]} - ${dia}
        </td>
      </tr>
    `;

    html += `
      <tr>

        <th class="time-col">
          Horário
        </th>
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

    let i = 0;

    while (i < linhas.length) {

      const r = linhas[i];

      const horario = r[1] || "";

      // ======================================================
      // 🔥 EVENTO GERAL
      // ======================================================
      const eventoGeral =
        typeof getEventoGeral === "function"
          ? getEventoGeral(dia, horario)
          : null;

      if (eventoGeral) {

        let inicio = i;
        let fim = i;

        while (fim + 1 < linhas.length) {

          const prox = linhas[fim + 1];

          const proxHorario = prox[1] || "";

          const proxEvento =
            getEventoGeral(dia, proxHorario);

          if (
            proxEvento === eventoGeral ||
            proxHorario
              .toUpperCase()
              .includes("INTERVALO")
          ) {
            fim++;
          } else {
            break;
          }
        }

        const totalLinhas =
          (fim - inicio) + 1;

        html += `
          <tr class="evento-geral">

            <td class="time-col">
              ${linhas[inicio][1]}
            </td>

            <td
              rowspan="${totalLinhas}"
              colspan="${turmasAtivas.length}"
              class="evento-bloco"
            >
              ${eventoGeral}
            </td>

          </tr>
        `;

        i = fim + 1;

        continue;
      }

      // ======================================================
      // 🔥 LINHA
      // ======================================================
      const isInt =
        horario.toUpperCase()
          .includes("INTERVALO");

      const linhaVazia =
        r.slice(2)
          .every(v => !v || !v.trim());

      html += `
        <tr
          class="
            ${isInt ? 'intervalo' : ''}
            ${linhaVazia ? 'linha-vazia' : ''}
          "
        >

          <td class="time-col">
            ${horario}
          </td>
      `;

      turmasAtivas.forEach(t => {

        const idx =
          dadosGlobais[0].indexOf(t);

        let val =
          (r[idx] || "").trim();

        let classesExtras = [];

        const valNorm =
          normalizarTexto(val);

        // ======================================================
        // 🔥 REGRAS VISUAIS
        // ======================================================
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

        // ======================================================
        // 🔍 HIGHLIGHT BUSCA
        // ======================================================
        const contemBusca =
          busca &&
          valNorm.includes(busca);

        if (busca) {

          if (contemBusca) {

            classesExtras.push("highlight");

          } else {

            classesExtras.push("opaco");
          }
        }

        html += `
          <td
            class="
              aula-cell
              ${getCursoInfo(t).cl}
              ${classesExtras.join(" ")}
            "
          >
            ${val}
          </td>
        `;
      });

      html += `</tr>`;

      i++;
    }

    html += `</table><br>`;
  });

  // ======================================================
  // 🔥 SEM RESULTADOS
  // ======================================================
  if (!html) {

    html = `
      <div style="
        padding:20px;
        border-radius:18px;
        background:rgba(15,23,42,0.92);
        text-align:center;
        font-weight:700;
        color:white;
      ">
        Nenhum professor encontrado.
      </div>
    `;
  }

  container.innerHTML = html;

  // ======================================================
  // 🔥 RELATÓRIOS
  // ======================================================
  if (typeof criarBotoesDias === "function") {
    criarBotoesDias();
  }
}

// ======================================================
// 🔥 COLETAR VAGAS
// ======================================================
function coletarVagasDoDia(dia) {

  const sem =
    getSemanaAtualSelecionada?.() ||
    document.getElementById('selectSemana')?.value;

  const dias =
    semanasAgrupadas?.[sem]?.dias;

  const vagas = [];

  if (!dias || !dias[dia]) {
    return vagas;
  }

  const [d, m, a] = dia.split('/');

  const dataObj =
    new Date(a, m - 1, d);

  const diaSemana =
    dataObj.getDay();

  if (diaSemana === 0 || diaSemana === 6) {
    return [];
  }

  dias[dia].forEach(r => {

    const horario = r[1];

    turmasDaPlanilha.forEach(turma => {

      const idx =
        dadosGlobais[0].indexOf(turma);

      const val =
        (r[idx] || "").toUpperCase();

      if (
        val.includes("RESERVA ENSINO") ||
        val.includes("ESTUDOS INDIVIDUAIS")
      ) {
        vagas.push({
          turma,
          horario
        });
      }
    });
  });

  return vagas;
}

function filtrarProfessor() {
  renderizarTabela();
}

window.filtrarProfessor = filtrarProfessor;
