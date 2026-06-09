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

function verificarMudancaAoAbrir() {

  if(!semanaSelecionadaEhAtual()){
    return;
  }
  const sem = document.getElementById('selectSemana').value;
  const mod = document.getElementById('selectModalidade').value;

  const chave = `snapshot_${mod}_${sem}`;

  const antigoRaw = localStorage.getItem(chave);

  // 🔥 Se não existe snapshot → salva e sai
  if (!antigoRaw) {
    salvarSnapshotAtual();
    return;
  }

  const antigo = JSON.parse(antigoRaw);
  const novo = dadosGlobais;

  const agrupado = {};
  let ultimoDia = "";

  for (let i = 1; i < novo.length; i++) {

    if (novo[i][0]) ultimoDia = novo[i][0];
    const diaAtual = ultimoDia;

    if (!diaAtual) continue;
    if (!deveCompararDia(diaAtual)) continue;

    const horario = (novo[i][1] || "").trim();
    const horarioNorm = normalizarTexto(horario);

    // 🔥 IGNORA INTERVALO
    if (
      !horario ||
      horarioNorm.includes("INTERVALO") ||
      horarioNorm.includes("[+]") ||
      horarioNorm.includes("*") ||
      horarioNorm.includes("[R]")
    ) continue;

    for (let j = 2; j < novo[i].length; j++) {

      const vNovo = (novo[i][j] || "").trim();
      const vAntigo = (antigo.dados?.[i]?.[j] || "").trim();

      if (!valorMudou(vNovo, vAntigo)) continue;

      const turma = (dadosGlobais[0][j] || "").trim();
      if (!turma) continue;

      const chaveItem = `${diaAtual}__${turma}__${horario}`;

      if (!agrupado[chaveItem]) {
        agrupado[chaveItem] = {
          dia: diaAtual,
          turma,
          horario,
          alteracoes: []
        };
      }

      agrupado[chaveItem].alteracoes.push({
        antes: vAntigo || "(vazio)",
        depois: vNovo || "(vazio)"
      });
    }
  }

  const listaFinal = Object.values(agrupado);

  if (listaFinal.length > 0) {
    mostrarAvisoAlteracoes(listaFinal);
  } else {
    document.getElementById("painelAlteracoes").style.display = "none";
  }

  salvarSnapshotAtual();
}
