
// ===============================
// 🧠 GERAR MAPA DE DADOS (ROBUSTO)
// ===============================
function gerarMapaDados(dados) {

  const mapa = {};
  let ultimoDia = "";

  for (let i = 1; i < dados.length; i++) {

    const linha = dados[i];

    if (linha[0]) ultimoDia = linha[0];

    const dia = ultimoDia;

    if (!dia) continue;

    const horario = (linha[1] || "").trim();
    const horarioNorm = normalizarTexto(horario);

    // 🔥 ignora linhas irrelevantes
    if (
      !horario ||
      horarioNorm.includes("INTERVALO") ||
      horarioNorm.includes("[+]") ||
      horarioNorm.includes("*") ||
      horarioNorm.includes("[R]")
    ) continue;

    for (let j = 2; j < linha.length; j++) {

      const turma = (dados[0][j] || "").trim();
      if (!turma) continue;

      const valor = (linha[j] || "").trim();

      const chave = `${normalizarTexto(dia)}|${horarioNorm}|${normalizarTexto(turma)}`;

      mapa[chave] = {
        dia,
        horario,
        turma,
        valorOriginal: valor || "",
        valorNormalizado: normalizarTexto(valor || "")
      };
    }
  }

  return mapa;
}


// ===============================
// ⚖️ COMPARAÇÃO DE MAPAS (VERSÃO SEGURA)
// ===============================
function compararMapas(mapaAntigo = {}, mapaNovo = {}) {

  const alteracoes = [];

  const todasChaves = new Set([
    ...Object.keys(mapaAntigo),
    ...Object.keys(mapaNovo)
  ]);

  todasChaves.forEach(chave => {

    const antigo = mapaAntigo[chave];
    const novo = mapaNovo[chave];

    // 🔴 REMOVIDO
    if (antigo && !novo) {
      alteracoes.push({
        tipo: "REMOVIDO",
        dia: antigo.dia,
        horario: antigo.horario,
        turma: antigo.turma,
        antes: antigo.valorOriginal,
        depois: "(vazio)"
      });
      return;
    }

    // 🟢 ADICIONADO
    if (!antigo && novo) {
      alteracoes.push({
        tipo: "ADICIONADO",
        dia: novo.dia,
        horario: novo.horario,
        turma: novo.turma,
        antes: "(vazio)",
        depois: novo.valorOriginal
      });
      return;
    }

    // 🟡 ALTERADO (SEGURANÇA TOTAL)
    const antigoValor = antigo?.valorNormalizado || "";
    const novoValor = novo?.valorNormalizado || "";

    if (antigoValor !== novoValor) {

      alteracoes.push({
        tipo: "ALTERADO",
        dia: novo?.dia || antigo?.dia,
        horario: novo?.horario || antigo?.horario,
        turma: novo?.turma || antigo?.turma,
        antes: antigo?.valorOriginal || "(vazio)",
        depois: novo?.valorOriginal || "(vazio)"
      });
    }
  });

  return alteracoes;
}
