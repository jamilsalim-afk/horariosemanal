// ===============================
// 🔥 SNAPSHOT + COMPARAÇÃO (ATUAL)
// ===============================


function obterSemanaAtual() {
  const hoje = new Date();

  const inicioAno = new Date(hoje.getFullYear(), 0, 1);
  const diff = hoje - inicioAno;

  const semana = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));

  return String(semana);
}


function valorMudou(v1, v2) {

  const t1 = (v1 || "").trim();
  const t2 = (v2 || "").trim();

  if (t1 !== t2) return true;

  const n1 = normalizarTexto(t1);
  const n2 = normalizarTexto(t2);

  return n1 !== n2;
}


// ===============================
// 💾 SALVAR SNAPSHOT ATUAL
// ===============================
function salvarSnapshotAtual() {

  const sem = document.getElementById('selectSemana').value;
  const mod = document.getElementById('selectModalidade').value;

  const chave = `snapshot_${mod}_${sem}`;

  const mapaOriginal = gerarMapaDados(dadosGlobais);

  const mapaCompacto = {};

  Object.keys(mapaOriginal).forEach(k => {

    const item = mapaOriginal[k];

    mapaCompacto[k] = {
      dia: item.dia,
      horario: item.horario,
      turma: item.turma,
      valorOriginal: normalizarTexto(item.valorOriginal || ""),
      valorNormalizado: normalizarTexto(item.valorNormalizado || "")
    };

  });

  const snapshot = {
    tempo: Date.now(),
    mapa: mapaCompacto
  };

  try {
    localStorage.setItem(chave, JSON.stringify(snapshot));

  } catch (e) {

    console.warn("⚠️ LocalStorage cheio. Limpando snapshots do sistema...");

    Object.keys(localStorage)
      .filter(k => k.startsWith("snapshot_"))
      .forEach(k => localStorage.removeItem(k));

    localStorage.setItem(chave, JSON.stringify(snapshot));
  }
}


// ===============================
// 📥 OBTER SNAPSHOT ANTIGO
// ===============================
function obterSnapshotAntigo() {

  const sem = document.getElementById('selectSemana').value;
  const mod = document.getElementById('selectModalidade').value;

  const chave = `snapshot_${mod}_${sem}`;

  const data = localStorage.getItem(chave);

  return data ? JSON.parse(data) : null;
}


// ===============================
// 🔥 VERIFICAÇÃO AO ABRIR
// ===============================
function verificarMudancaAoAbrir({ dados, getSemana, getModalidade }) {

  const sem = getSemana();
  const mod = getModalidade();

  // 🔥 bloqueia qualquer coisa fora da semana atual
  const semanaAtual = obterSemanaAtual();
  if (sem !== semanaAtual) return;

  const chave = `snapshot_${mod}_${sem}`;

  const antigoRaw = localStorage.getItem(chave);

  const mapaNovo = gerarMapaDados(dados);

  const mapaAtual = {};

  Object.keys(mapaNovo).forEach(k => {

    const item = mapaNovo[k];

    mapaAtual[k] = {
      dia: item.dia,
      horario: item.horario,
      turma: item.turma,
      valor: normalizarTexto(item.valorNormalizado || "")
    };
  });

  // 🔥 PRIMEIRA ABERTURA (NÃO MOSTRA ALERTA)
  if (!antigoRaw) {

    salvarSnapshotAtual();

    console.log("📌 Primeira abertura da semana: snapshot criado.");

    return;
  }

  let antigo;

  try {
    antigo = JSON.parse(antigoRaw);
  } catch (e) {

    salvarSnapshotAtual();
    return;
  }

  const alteracoes = compararMapas(antigo.mapa, mapaAtual);

  if (alteracoes.length > 0) {
    mostrarAvisoAlteracoesRobusto(alteracoes);
  }

  // 🔥 atualiza snapshot sempre após abrir
  salvarSnapshotAtual();
}


// ===============================
// ⚠️ EXIBIÇÃO DE ALTERAÇÕES
// ===============================
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


// ===============================
// ❌ FECHAR PAINEL
// ===============================
function fecharPainel() {

  document.getElementById("painelAlteracoes").style.display = "none";
}


// ===============================
// 📋 COPIAR ALTERAÇÕES
// ===============================
function copiarAlteracoes() {

  const texto = document.getElementById("conteudoAlteracoes").innerText;

  navigator.clipboard.writeText(texto)
    .then(() => {
      alert("Copiado!");
    });
}
