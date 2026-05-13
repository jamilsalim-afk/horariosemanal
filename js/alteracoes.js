function salvarSnapshotAtual() {

  const sem = document.getElementById('selectSemana').value;
  const mod = document.getElementById('selectModalidade').value;

  const mapaOriginal = gerarMapaDados(dadosGlobais);

  // 🔥 compactação para evitar estouro do LocalStorage
  const mapaCompacto = {};

  Object.keys(mapaOriginal).forEach(k => {

    mapaCompacto[k] = (mapaOriginal[k] || "")
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 120);

  });

  const snapshot = {
    tempo: new Date().toISOString(),
    mapa: mapaCompacto
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

    console.warn("⚠️ LocalStorage cheio.");

    // 🔥 remove todos snapshots
    Object.keys(localStorage).forEach(chave => {

      if (chave.startsWith("snapshot_")) {
        localStorage.removeItem(chave);
      }

    });

    // 🔥 tenta novamente
    try {

      localStorage.setItem(
        `snapshot_${mod}_${sem}`,
        JSON.stringify(snapshot)
      );

    } catch(err){

      console.error("❌ Snapshot ainda muito grande.");

    }
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

  // 🔥 primeiro acesso
  if (!antigoRaw) {

    salvarSnapshotAtual();

    console.log(
      "📌 Snapshot inicial criado — nenhuma comparação feita."
    );

    return;
  }

  let snapshotAntigo = {};

  try {

    snapshotAntigo = JSON.parse(antigoRaw);

  } catch(e){

    console.warn("⚠️ Snapshot corrompido.");

    salvarSnapshotAtual();

    return;
  }

  const mapaAntigo = snapshotAntigo.mapa || {};

  const alteracoes = compararMapas(
    mapaAntigo,
    mapaNovo
  );

  // 🔥 ignora semanas passadas
  const filtradas = alteracoes.filter(a => {

    return !isSemanaPassada(a.dia);

  });

  if (filtradas.length > 0) {

    mostrarAvisoAlteracoesRobusto(filtradas);

  } else {

    const painel =
      document.getElementById("painelAlteracoes");

    if (painel) {
      painel.style.display = "none";
    }
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

  document.getElementById(
    "conteudoAlteracoes"
  ).innerText = texto;

  document.getElementById(
    "painelAlteracoes"
  ).style.display = "block";
}

function fecharPainel(){

  document.getElementById(
    "painelAlteracoes"
  ).style.display = "none";
}

function copiarAlteracoes(){

  const texto = document.getElementById(
    "conteudoAlteracoes"
  ).innerText;

  navigator.clipboard.writeText(texto)
    .then(()=>{

      alert("Copiado!");

    });
}
