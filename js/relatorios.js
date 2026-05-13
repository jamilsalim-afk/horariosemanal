// ===============================
// 📅 ABRIR RELATÓRIO DO DIA
// ===============================
function abrirRelatorioDia(dia) {

  const texto = gerarRelatorioDia(dia);

  // 🔥 agora respeita nova estrutura de painel
  const container = document.getElementById("painelVagas");

  if (!container) return;

  document.getElementById("conteudoVagas").innerText = texto;

  document.querySelector("#painelVagas strong").innerText =
    "📅 Relatório do Dia";

  container.style.display = "block";
}


// ===============================
// 📊 ABRIR RELATÓRIO SEMANA
// ===============================
function abrirRelatorioSemana() {

  const texto = gerarRelatorioSemanaTexto();

  const container = document.getElementById("painelVagas");

  if (!container) return;

  document.getElementById("conteudoVagas").innerText = texto;

  document.querySelector("#painelVagas strong").innerText =
    "📊 Relatório da Semana";

  container.style.display = "block";
}


// ===============================
// 🔘 CRIAR BOTÕES DE DIAS
// ===============================
function criarBotoesDias() {

  const sem = window.appState?.semana ||
    document.getElementById('selectSemana')?.value;

  const dias = semanasAgrupadas?.[sem]?.dias;

  if (!dias) return;

  let html = `
    <div style="padding:10px;display:flex;gap:10px;flex-wrap:wrap;">
  `;

  Object.keys(dias).forEach(dia => {

  const [d, m, a] = dia.split('/');
  const dataObj = new Date(a, m - 1, d);
  const diaSemana = dataObj.getDay();

  if (diaSemana === 0 || diaSemana === 6) return; // remove dom e sáb

    html += `
      <button onclick="abrirRelatorioDia('${dia}')"
        style="
          padding:10px;
          background:#2e7d32;
          color:white;
          border:none;
          border-radius:8px;
          cursor:pointer;
          font-weight:600;
        ">
        📅 ${dia}
      </button>
    `;
  });

  html += `
    <button onclick="abrirRelatorioSemana()"
      style="
        padding:10px;
        background:#d32f2f;
        color:white;
        border:none;
        border-radius:8px;
        cursor:pointer;
        font-weight:600;
      ">
      📊 Semana inteira
    </button>
  </div>
  `;

  document.getElementById("botoesRelatorio").innerHTML = html;
}

function gerarRelatorioDia(dia) {

  const vagas = coletarVagasDoDia(dia);

  let texto = `📅 RELATÓRIO DE AULAS VAGAS DO DIA (${dia})\n\n`;

  if (!vagas.length) {
    return texto + "Não há aulas vagas neste dia.";
  }

  const agrupado = {};

  vagas.forEach(v => {
    if (!agrupado[v.turma]) {
      agrupado[v.turma] = [];
    }
    agrupado[v.turma].push(v.horario);
  });

  Object.keys(agrupado).forEach(turma => {

    const horarios = [...new Set(agrupado[turma])];

    texto += `🏫 TURMA: ${turma}\n`;
    texto += `⏰ HORÁRIOS: ${horarios.join(", ")}\n\n`;
  });

  return texto;
}

function gerarRelatorioSemanaTexto() {

  const sem = getSemanaAtualSelecionada?.() || document.getElementById('selectSemana').value;
  const dias = semanasAgrupadas[sem]?.dias || {};

  let texto = `📊 RELATÓRIO SEMANAL DE AULAS VAGAS (SEGUNDA À SEXTA)\n\n`;

  const agrupado = {};

  Object.keys(dias).forEach(dia => {

    const vagas = coletarVagasDoDia(dia);

    vagas.forEach(v => {

      const chave = `${dia}__${v.turma}`;

      if (!agrupado[chave]) {
        agrupado[chave] = {
          dia,
          turma: v.turma,
          horarios: []
        };
      }

      agrupado[chave].horarios.push(v.horario);
    });

  });

  const listaFinal = Object.values(agrupado);

  if (listaFinal.length === 0) {
    return "Não há aulas vagas na semana.";
  }

  listaFinal.sort((a, b) => {
    const [da, ma, aa] = a.dia.split('/');
    const [db, mb, ab] = b.dia.split('/');
    return new Date(aa, ma - 1, da) - new Date(ab, mb - 1, db);
  });

  let diaAtual = "";

  listaFinal.forEach(item => {

    if (item.dia !== diaAtual) {
      texto += `📅 ${item.dia}\n\n`;
      diaAtual = item.dia;
    }

    const horarios = [...new Set(item.horarios)];

    texto += `🏫 ${item.turma}\n`;
    texto += `⏰ ${horarios.join(", ")}\n\n`;
  });

  return texto;
}
