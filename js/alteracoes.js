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

    const sem =
      window.semanaAtual ||
      document.getElementById("selectSemana")?.value;

    const mod =
      window.modalidadeAtual ||
      document.getElementById("selectModalidade")?.value;

    if (!sem || !mod) return;

    if (!window.dadosGlobais) {
      console.warn("⚠️ dadosGlobais não carregado.");
      return;
    }

    if (typeof gerarMapaDados !== "function") {
      console.warn("⚠️ gerarMapaDados não encontrado.");
      return;
    }

    const chave = `snapshot_${mod}_${sem}`;

    const mapaOriginal =
      gerarMapaDados(window.dadosGlobais);

    const mapaCompacto = {};

    Object.keys(mapaOriginal).forEach(k => {

      const item = mapaOriginal[k];

      mapaCompacto[k] = {

        dia: item?.dia || "",

        horario: item?.horario || "",

        turma: item?.turma || "",

        valorOriginal:
          typeof normalizarTexto === "function"
            ? normalizarTexto(item?.valorOriginal || "")
            : String(item?.valorOriginal || "").trim(),

        valorNormalizado:
          typeof normalizarTexto === "function"
            ? normalizarTexto(item?.valorNormalizado || "")
            : String(item?.valorNormalizado || "").trim()

      };

    });

    const snapshot = {

      tempo: Date.now(),

      mapa: mapaCompacto

    };

    localStorage.setItem(
      chave,
      JSON.stringify(snapshot)
    );

    console.log("💾 Snapshot salvo:", chave);

  } catch (e) {

    console.warn(
      "⚠️ Erro ao salvar snapshot:",
      e
    );

    try {

      Object.keys(localStorage)
        .filter(k => k.startsWith("snapshot_"))
        .forEach(k => localStorage.removeItem(k));

    } catch (_) {}

  }

}


  // ===============================
  // 📥 OBTER SNAPSHOT
  // ===============================
  function obterSnapshotAntigo() {

    try {

      const sem =
        window.semanaAtual ||
        document.getElementById("selectSemana")?.value;

      const mod =
        window.modalidadeAtual ||
        document.getElementById("selectModalidade")?.value;

      if (!sem || !mod) return null;

      const chave = `snapshot_${mod}_${sem}`;

      const data = localStorage.getItem(chave);

      return data ? JSON.parse(data) : null;

    } catch (e) {

      console.warn("⚠️ Erro ao obter snapshot:", e);

      return null;
    }

  }

// ===============================
// 🔥 VERIFICAR ALTERAÇÕES
// ===============================
function verificarMudancaAoAbrir({
  dados,
  getSemana,
  getModalidade
}) {

  try {

    // 🔥 trava fora da aba horários
    if (
      window.abaAtiva &&
      window.abaAtiva !== "horarios"
    ) {
      return;
    }

    if (!dados) return;

    if (typeof gerarMapaDados !== "function") {
      console.warn("⚠️ gerarMapaDados não encontrado.");
      return;
    }

    if (typeof compararMapas !== "function") {
      console.warn("⚠️ compararMapas não encontrado.");
      return;
    }

    const sem = getSemana?.();

    const mod = getModalidade?.();

    if (!sem || !mod) return;

    const chave = `snapshot_${mod}_${sem}`;

    const antigoRaw =
      localStorage.getItem(chave);

    const mapaNovo =
      gerarMapaDados(dados);

    const mapaAtual = {};

    Object.keys(mapaNovo).forEach(k => {

      const item = mapaNovo[k];

      mapaAtual[k] = {

        dia: item?.dia || "",

        horario: item?.horario || "",

        turma: item?.turma || "",

        valorOriginal:
          typeof normalizarTexto === "function"
            ? normalizarTexto(item?.valorOriginal || "")
            : String(item?.valorOriginal || "").trim(),

        valorNormalizado:
          typeof normalizarTexto === "function"
            ? normalizarTexto(item?.valorNormalizado || "")
            : String(item?.valorNormalizado || "").trim()

      };

    });

    // 🔥 primeira abertura
    if (!antigoRaw) {

      salvarSnapshotAtual();

      console.log(
        "📌 Primeira abertura: snapshot criado."
      );

      return;
    }

    let antigo;

    try {

      antigo = JSON.parse(antigoRaw);

    } catch (_) {

      salvarSnapshotAtual();

      return;
    }

    const alteracoes =
      compararMapas(
        antigo?.mapa || {},
        mapaAtual
      );

    console.log(
      "🔍 Alterações encontradas:",
      alteracoes
    );

    if (
      Array.isArray(alteracoes) &&
      alteracoes.length > 0
    ) {

      mostrarAvisoAlteracoesRobusto(
        alteracoes
      );

    }

    // 🔥 atualiza snapshot
    salvarSnapshotAtual();

  } catch (e) {

    console.warn(
      "⚠️ Erro em verificarMudancaAoAbrir:",
      e
    );

  }

}

  // ===============================
  // ⚠️ MOSTRAR AVISO
  // ===============================
  function mostrarAvisoAlteracoesRobusto(lista) {

    try {

      const painel =
        document.getElementById("painelAlteracoes");

      const conteudo =
        document.getElementById("conteudoAlteracoes");

      if (!painel || !conteudo) return;

      let texto = "⚠️ ALTERAÇÕES DETECTADAS:\n\n";

      lista.forEach(item => {

        texto += `📅 Dia: ${item?.dia || "-"}\n`;
        texto += `🏫 Turma: ${item?.turma || "-"}\n`;
        texto += `⏰ Horário: ${item?.horario || "-"}\n`;
        texto += `🔎 Tipo: ${item?.tipo || "-"}\n`;
        texto += `➡️ ${item?.antes || "-"} → ${item?.depois || "-"}\n\n`;

      });

      conteudo.innerText = texto;

      painel.style.display = "block";

    } catch (e) {

      console.warn(
        "⚠️ Erro ao mostrar alterações:",
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

})();
