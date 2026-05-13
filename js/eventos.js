function abrirAba(nome) {

  const abas = ["horarios", "sabados", "professor", "turma"];

  abas.forEach(a => {
    const el = document.getElementById(`aba-${a}`);
    if (el) el.style.display = (a === nome) ? "block" : "none";
  });

  // ativa botão visual
  document.querySelectorAll(".tab").forEach(btn => {
    btn.classList.remove("active");
  });

  const ativo = document.querySelector(`[data-tab="${nome}"]`);
  if (ativo) ativo.classList.add("active");
}

window.addEventListener("beforeunload", () => {
  salvarSnapshotAtual();
});
  
window.onload=init;
