
// ===============================
// 🔀 CONTROLE DE ABAS (REFEITO)
// ===============================
function abrirAba(nome) {

  const abas = ["horarios", "sabados", "professor", "turma"];

  // 🔥 atualiza estado global
  window.appState = window.appState || {};
  window.appState.aba = nome;

  abas.forEach(a => {
    const el = document.getElementById(`aba-${a}`);
    if (el) el.style.display = (a === nome) ? "block" : "none";
  });

  // 🔥 ativa botão visual
  document.querySelectorAll(".tab").forEach(btn => {
    btn.classList.remove("active");
  });

  const ativo = document.querySelector(`[data-tab="${nome}"]`);
  if (ativo) ativo.classList.add("active");

  // 🔥 força render inteligente por aba
  requestAnimationFrame(() => {

    if (nome === "horarios" && typeof renderizarTabela === "function") {
      renderizarTabela();
    }

    if (nome === "sabados" && typeof renderSabados === "function") {
      renderSabados();
    }

    if (nome === "professor" && typeof renderProfessor === "function") {
      renderProfessor();
    }

    if (nome === "turma" && typeof renderTurma === "function") {
      renderTurma();
    }
  });
}


// ===============================
// 💾 SALVAMENTO SEGURO AO SAIR
// ===============================
window.addEventListener("beforeunload", () => {

  // 🔥 garante estado válido antes de salvar snapshot
  if (window.appState?.aba === "horarios") {
    salvarSnapshotAtual();
  }
});


// ===============================
// 🚀 INIT GLOBAL
// ===============================
window.onload = () => {

  init();

  // estado inicial seguro
  window.appState = {
    aba: "horarios",
    modalidade: null,
    semana: null
  };
};
