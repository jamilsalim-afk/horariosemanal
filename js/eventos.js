window.addEventListener("beforeunload", () => {
  salvarSnapshotAtual();
});
  
window.onload=init;
