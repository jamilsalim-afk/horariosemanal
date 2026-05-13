// ======================================================
// 🔥 CORE GLOBAL (ABAS + ESTADO)
// ======================================================

function getAbaAtiva() {
  const el = document.querySelector(".tab.active");
  return el ? el.dataset.tab : "horarios";
}

function getModalidadeAtual() {
  const aba = getAbaAtiva();
  const el = document.querySelector(`#aba-${aba} .selectModalidade`);
  return el ? el.value : document.getElementById('selectModalidade').value;
}

function getSemanaAtualSelecionada() {
  const aba = getAbaAtiva();
  const el = document.querySelector(`#aba-${aba} .selectSemana`);
  return el ? el.value : document.getElementById('selectSemana').value;
}
