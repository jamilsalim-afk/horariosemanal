function salvarSnapshotAtual() {

  const sem = document.getElementById('selectSemana').value;
  const mod = document.getElementById('selectModalidade').value;

  const mapa = gerarMapaDados(dadosGlobais);

  const snapshot = {
    tempo: new Date().toISOString(),
    mapa
  };

  // 🔥 remove snapshots antigos da mesma modalidade
  Object.keys(localStorage).forEach(chave => {

    if (
      chave.startsWith(`snapshot_${mod}_`) &&
      chave !== `snapshot_${mod}_${sem}`
    ) {
      localStorage.removeItem(chave);
    }
  });

  try {

    localStorage.setItem(
      `snapshot_${mod}_${sem}`,
      JSON.stringify(snapshot)
    );

  } catch (e) {

    console.error("⚠️ LocalStorage cheio.");

    // limpa tudo relacionado a snapshots
    Object.keys(localStorage).forEach(chave => {

      if (chave.startsWith("snapshot_")) {
        localStorage.removeItem(chave);
      }
    });

    // tenta salvar novamente
    localStorage.setItem(
      `snapshot_${mod}_${sem}`,
      JSON.stringify(snapshot)
    );
  }
}

function obterSnapshotAntigo() {
  const sem = document.getElementById('selectSemana').value;
  const mod = document.getElementById('selectModalidade').value;

  const data = localStorage.getItem(`snapshot_${mod}_${sem}`);
  return data ? JSON.parse(data) : null;
}

function valorMudou(v1, v2){
  const t1 = (v1 || "").trim();
  const t2 = (v2 || "").trim();

  if (t1 !== t2) return true;

  const n1 = normalizarTexto(t1);
  const n2 = normalizarTexto(t2);

  return n1 !== n2;
}
  
function verificarMudancaAoAbrir({
  dados,
  getSemana,
  getModalidade
}) {

  const sem = getSemana();
  const mod = getModalidade();

  const chave = `snapshot_${mod}_${sem}`;
  const antigoRaw = localStorage.getItem(chave);

  const mapaNovo = gerarMapaDados(dados);

  // primeira execução
  if (!antigoRaw) {

  // 🔥 PRIMEIRO ACESSO: NÃO MOSTRA ALTERAÇÕES
  salvarSnapshotAtual();

  console.log("📌 Snapshot inicial criado — nenhuma comparação feita.");

  return;
}

  const snapshotAntigo = JSON.parse(antigoRaw);
  const mapaAntigo = snapshotAntigo.mapa || {};

  const alteracoes = compararMapas(mapaAntigo, mapaNovo);

  // filtro: ignora semanas passadas
  const filtradas = alteracoes.filter(a => !isSemanaPassada(a.dia));

  if (filtradas.length > 0) {
    mostrarAvisoAlteracoesRobusto(filtradas);
  } else {
    document.getElementById("painelAlteracoes").style.display = "none";
  }

  salvarSnapshotAtual();
}

function mostrarAvisoAlteracoesRobusto(lista) {

  let texto = "⚠️ ALTERAÇÕES DETECTADAS:\n\n";

  lista.forEach(item => {

    texto += `📅 Dia: ${item.dia}\n`;
    texto += `🏫 Turma: ${item.turma}\n`;
    texto += `⏰ Horário: ${item.horario}\n`;
    texto += `🔎 Tipo: ${item.tipo}\n`;
    texto += `➡️ ${item.antes} → ${item.depois}\n\n`;
  });

  document.getElementById("conteudoAlteracoes").innerText = texto;
  document.getElementById("painelAlteracoes").style.display = "block";
}

  function fecharPainel(){
  document.getElementById("painelAlteracoes").style.display = "none";
}

function copiarAlteracoes(){
  const texto = document.getElementById("conteudoAlteracoes").innerText;

  navigator.clipboard.writeText(texto).then(()=>{
    alert("Copiado!");
  });
}
