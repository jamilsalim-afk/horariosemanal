// ===============================
// 🔥 SNAPSHOT + COMPARAÇÃO
// ===============================

(function () {

  // ===============================
  // 📅 SEMANA ATUAL
  // ===============================
  function obterSemanaAtual() {

    const hoje = new Date();

    const inicioAno = new Date(hoje.getFullYear(), 0, 1);

    const diff = hoje - inicioAno;

    return String(
      Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
    );
  }


  // ===============================
  // 🔍 VALOR MUDOU
  // ===============================
  function valorMudou(v1, v2) {

    const t1 = String(v1 || "").trim();
    const t2 = String(v2 || "").trim();

    if (t1 !== t2) return true;

    if (typeof normalizarTexto !== "function") {
      return t1 !== t2;
    }

    return normalizarTexto(t1) !== normalizarTexto(t2);
  }

// ===============================
// 💾 SALVAR SNAPSHOT
// ===============================
function salvarSnapshotAtual() {

  try {

    limparSnapshotsAntigos();

    const base =
      window.BASE_UNIFICADA || [];

    if (!base.length) {
      return;
    }

    const sem =
      document.getElementById(
        "selectSemana"
      )?.value;

    if (!sem) {
      return;
    }

    const chave =
      `snapshot_global_${sem}`;

    if (
      typeof gerarMapaDados !== "function"
    ) {
      return;
    }

    const mapa =
      gerarMapaDados(base);

    const snapshot = {

      t: Date.now(),

      m: mapa

    };

    localStorage.setItem(

      chave,

      JSON.stringify(snapshot)

    );

    console.log(
      "💾 Snapshot salvo:",
      chave
    );

  } catch (e) {

    console.warn(
      "⚠️ Erro salvarSnapshotAtual:",
      e
    );

  }

}

// ===============================
// 📥 OBTER SNAPSHOT
// ===============================
function obterSnapshotAntigo() {

  try {

    const sem =
      document.getElementById(
        "selectSemana"
      )?.value;

    if (!sem) {
      return null;
    }

    const chave =
      `snapshot_global_${sem}`;

    const raw =
      localStorage.getItem(chave);

    return raw
      ? JSON.parse(raw)
      : null;

  } catch (e) {

    console.warn(
      "⚠️ Erro obterSnapshotAntigo:",
      e
    );

    return null;
  }

}

// ===============================
// 🔥 FILTRAR ALTERAÇÕES
// ===============================
function filtrarAlteracoesSemanaAtual(
  lista = []
) {

  return lista.filter(item => {

    if (!item?.data) {
      return false;
    }

    if (
      typeof dataDentroDaSemanaAtual !== "function"
    ) {
      return true;
    }

    return dataDentroDaSemanaAtual(
      item.data
    );

  });

}
  
// ===============================
// 🔥 VERIFICAR ALTERAÇÕES
// ===============================
function verificarMudancaAoAbrir() {

  try {

    if (
      window.abaAtiva &&
      window.abaAtiva !== "horarios"
    ) {
      return;
    }

    const base =
      window.BASE_UNIFICADA || [];

    if (!base.length) {
      return;
    }

    if (
      typeof gerarMapaDados !== "function"
    ) {
      return;
    }

    if (
      typeof compararMapas !== "function"
    ) {
      return;
    }

    const snapshotAntigo =
      obterSnapshotAntigo();

    const mapaNovo =
      gerarMapaDados(base);

    // 🔥 PRIMEIRA ABERTURA
    if (!snapshotAntigo) {

      salvarSnapshotAtual();

      console.log(
        "📌 Primeiro snapshot criado."
      );

      return;
    }

    let alteracoes =
      compararMapas(

        snapshotAntigo?.m || {},

        mapaNovo

      );

    alteracoes =
      filtrarAlteracoesSemanaAtual(
        alteracoes
      );

    console.log(
      "🔍 Alterações:",
      alteracoes
    );

    if (alteracoes.length > 0) {

      mostrarAvisoAlteracoesRobusto(
        alteracoes
      );

    }

    // 🔥 atualiza snapshot
    salvarSnapshotAtual();

  } catch (e) {

    console.warn(
      "⚠️ Erro verificarMudancaAoAbrir:",
      e
    );

  }

}

  // ===============================
// ⚠️ MOSTRAR AVISO
// ===============================
function mostrarAvisoAlteracoesRobusto(
  lista
) {

  try {

    const painel =
      document.getElementById(
        "painelAlteracoes"
      );

    const conteudo =
      document.getElementById(
        "conteudoAlteracoes"
      );

    if (!painel || !conteudo) {
      return;
    }

    let texto =
      "⚠️ ALTERAÇÕES DETECTADAS:\n\n";

    lista.forEach(item => {

      texto +=
        `📅 Data: ${item?.data || "-"}\n`;

      texto +=
        `🏫 Turma: ${item?.turma || "-"}\n`;

      texto +=
        `🎓 Modalidade: ${item?.modalidade || "-"}\n`;

      texto +=
        `⏰ Horário: ${item?.horario || "-"}\n`;

      texto +=
        `🔎 Tipo: ${item?.tipo || "-"}\n`;

      texto +=
        `➡️ ${item?.antes || "-"} → ${item?.depois || "-"}\n\n`;

    });

    conteudo.innerText = texto;

    painel.style.display = "block";

  } catch (e) {

    console.warn(
      "⚠️ Erro mostrar alterações:",
      e
    );

  }

}

// ===============================
// 🧹 LIMPAR SNAPSHOTS ANTIGOS
// ===============================
function limparSnapshotsAntigos() {

  try {

    const sem =
      document.getElementById(
        "selectSemana"
      )?.value;

    if (!sem) {
      return;
    }

    const chaveAtual =
      `snapshot_global_${sem}`;

    Object.keys(localStorage)
      .forEach(chave => {

        if (
          !chave.startsWith(
            "snapshot_global_"
          )
        ) {
          return;
        }

        if (chave !== chaveAtual) {

          localStorage.removeItem(
            chave
          );

          console.log(
            "🗑️ Snapshot removido:",
            chave
          );

        }

      });

  } catch (e) {

    console.warn(
      "⚠️ Erro limpar snapshots:",
      e
    );

  }

}

  // ===============================
  // ❌ FECHAR
  // ===============================
  function fecharPainel() {

    const painel =
      document.getElementById("painelAlteracoes");

    if (painel) {
      painel.style.display = "none";
    }

  }


  // ===============================
  // 📋 COPIAR
  // ===============================
  function copiarAlteracoes() {

    try {

      const texto =
        document.getElementById("conteudoAlteracoes")
          ?.innerText || "";

      navigator.clipboard
        .writeText(texto)
        .then(() => alert("Copiado!"));

    } catch (e) {

      console.warn(
        "⚠️ Erro ao copiar alterações:",
        e
      );

    }

  }


  // ===============================
  // 🌎 EXPORTAÇÃO GLOBAL
  // ===============================
  window.obterSemanaAtual = obterSemanaAtual;
  window.valorMudou = valorMudou;
  window.salvarSnapshotAtual = salvarSnapshotAtual;
  window.obterSnapshotAntigo = obterSnapshotAntigo;
  window.verificarMudancaAoAbrir = verificarMudancaAoAbrir;
  window.mostrarAvisoAlteracoesRobusto = mostrarAvisoAlteracoesRobusto;
  window.fecharPainel = fecharPainel;
  window.copiarAlteracoes = copiarAlteracoes;
  window.limparSnapshots = limparSnapshots;

})();