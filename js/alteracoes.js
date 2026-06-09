function semanaSelecionadaEhAtual(){

  const semanaSelecionada =
    document.getElementById('selectSemana').value;

  return semanaSelecionada === getSemanaAtual();
}

function limparPainelAlteracoes(){
  document.getElementById("conteudoAlteracoes").innerText = "";
  document.getElementById("painelAlteracoes").style.display = "none";
}

function salvarSnapshotAtual() {

  if(!semanaSelecionadaEhAtual()){
    return;
  }

  const sem = document.getElementById('selectSemana').value;
  const mod = document.getElementById('selectModalidade').value;

  const snapshot = {
    tempo:new Date().toISOString(),
    dados:dadosGlobais
  };

  localStorage.setItem(
    `snapshot_${mod}_${sem}`,
    JSON.stringify(snapshot)
  );
}

function obterSnapshotAntigo() {
  const sem = document.getElementById('selectSemana').value;
  const mod = document.getElementById('selectModalidade').value;

  const data = localStorage.getItem(`snapshot_${mod}_${sem}`);
  return data ? JSON.parse(data) : null;
}
