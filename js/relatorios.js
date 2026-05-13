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

  let texto = `📅 RELATÓRIO DO DIA (${dia})\n\n`;

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
