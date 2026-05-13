
// ===============================
// 🔥 SNAPSHOT + COMPARAÇÃO (AJUSTADO PARA ABAS)
// ===============================


function obterSemanaAtual() {
  const hoje = new Date();
  const inicioAno = new Date(hoje.getFullYear(), 0, 1);
  const diff = hoje - inicioAno;
  return String(Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)));
}


function valorMudou(v1, v2) {
  const t1 = (v1 || "").trim();
  const t2 = (v2 || "").trim();

  if (t1 !== t2) return true;

  return normalizarTexto(t1) !== normalizarTexto(t2);
}


// ===============================
// 💾 SALVAR SNAPSHOT ATUAL (HORÁRIOS APENAS)
// ===============================
function salvarSnapshotAtual() {

  // 🔥 GARANTE CONTEXTO CORRETO
  const sem = window.semanaAtual || document.getElementById('selectSemana')?.value;
  const mod = window.modalidadeAtual || document.getElementById('selectModalidade')?.value;

  if (!sem || !mod) return;

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

    console.warn("⚠️ LocalStorage cheio. Limpando snapshots...");

    Object.keys(localStorage)
      .filter(k => k.startsWith("snapshot_"))
      .forEach(k => localStorage.removeItem(k));

    localStorage.setItem(chave, JSON.stringify(snapshot));
  }
}


// ===============================
// 📥 OBTER SNAPSHOT
// ===============================
function obterSnapshotAntigo() {

  const sem = window.semanaAtual || document.getElementById('selectSemana')?.value;
  const mod = window.modalidadeAtual || document.getElementById('selectModalidade')?.value;

  if (!sem || !mod) return null;

  const chave = `snapshot_${mod}_${sem}`;

  const data = localStorage.getItem(chave);

  return data ? JSON.parse(data) : null;
}


// ===============================
// 🔥 VERIFICAÇÃO AO ABRIR (SÓ ABA HORÁRIOS)
// ===============================
function verificarMudancaAoAbrir({ dados, getSemana, getModalidade }) {

  // 🔥 BLOQUEIO POR ABA
  if (window.abaAtiva && window.abaAtiva !== "horarios") return;

  const sem = getSemana();
  const mod = getModalidade();

  if (!sem || !mod) return;

  const semanaAtual = obterSemanaAtual();

  // 🔥 continua sua regra de bloqueio
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

  // 🔥 primeira abertura
  if (!antigoRaw) {
    salvarSnapshotAtual();
    console.log("📌 Primeira abertura: snapshot criado.");
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

  salvarSnapshotAtual();
}


// ===============================
// ⚠️ ALERTA
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
// ❌ FECHAR
// ===============================
function fecharPainel() {
  document.getElementById("painelAlteracoes").style.display = "none";
}


// ===============================
// 📋 COPIAR
// ===============================
function copiarAlteracoes() {

  const texto = document.getElementById("conteudoAlteracoes").innerText;

  navigator.clipboard.writeText(texto)
    .then(() => alert("Copiado!"));
}
