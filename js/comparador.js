// ===============================
// 🧠 COMPARADOR DE DADOS
// ===============================

(function () {

  // ===============================
  // 🔤 NORMALIZAÇÃO SEGURA
  // ===============================
  function normalizarSeguro(texto) {

    try {

      if (typeof normalizarTexto === "function") {
        return normalizarTexto(texto || "");
      }

      return String(texto || "")
        .trim()
        .toUpperCase();

    } catch (e) {

      console.warn("⚠️ Erro ao normalizar texto:", e);

      return String(texto || "")
        .trim()
        .toUpperCase();
    }

  }


  // ===============================
  // 🧠 GERAR MAPA DE DADOS
  // ===============================
  function gerarMapaDados(dados) {

    const mapa = {};

    try {

      if (!Array.isArray(dados)) {
        console.warn("⚠️ gerarMapaDados: dados inválidos.");
        return mapa;
      }

      if (dados.length === 0) {
        return mapa;
      }

      let ultimoDia = "";

      for (let i = 1; i < dados.length; i++) {

        const linha = dados[i];

        if (!Array.isArray(linha)) continue;

        // 🔥 mantém último dia válido
        if (linha[0]) {
          ultimoDia = String(linha[0]).trim();
        }

        const dia = ultimoDia;

        if (!dia) continue;

        const horario =
          String(linha[1] || "").trim();

        const horarioNorm =
          normalizarSeguro(horario);

        // 🔥 ignora linhas irrelevantes
        if (
          !horario ||
          horarioNorm.includes("INTERVALO") ||
          horarioNorm.includes("[+]") ||
          horarioNorm.includes("*") ||
          horarioNorm.includes("[R]")
        ) {
          continue;
        }

        // 🔥 percorre turmas
        for (let j = 2; j < linha.length; j++) {

          const turma =
            String(dados[0]?.[j] || "").trim();

          if (!turma) continue;

          const valor =
            String(linha[j] || "").trim();

          const chave = [
            normalizarSeguro(dia),
            horarioNorm,
            normalizarSeguro(turma)
          ].join("|");

          mapa[chave] = {

            dia,

            horario,

            turma,

            valorOriginal: valor || "",

            valorNormalizado:
              normalizarSeguro(valor || "")

          };

        }

      }

    } catch (e) {

      console.error(
        "❌ Erro em gerarMapaDados:",
        e
      );

    }

    return mapa;
  }


  // ===============================
  // ⚖️ COMPARAÇÃO DE MAPAS
  // ===============================
// ===============================
// ⚖️ COMPARAÇÃO DE MAPAS
// ===============================
function compararMapas(
  mapaAntigo = {},
  mapaNovo = {}
) {

  const alteracoes = [];

  try {

    const todasChaves = new Set([

      ...Object.keys(mapaAntigo || {}),

      ...Object.keys(mapaNovo || {})

    ]);

    todasChaves.forEach(chave => {

      const antigo =
        mapaAntigo?.[chave];

      const novo =
        mapaNovo?.[chave];

      // ===============================
      // 🔴 REMOVIDO
      // ===============================
      if (antigo && !novo) {

        alteracoes.push({

          tipo: "REMOVIDO",

          dia: antigo?.d || "",

          horario: antigo?.h || "",

          turma: antigo?.t || "",

          antes:
            antigo?.v || "(vazio)",

          depois: "(vazio)"

        });

        return;
      }

      // ===============================
      // 🟢 ADICIONADO
      // ===============================
      if (!antigo && novo) {

        alteracoes.push({

          tipo: "ADICIONADO",

          dia: novo?.d || "",

          horario: novo?.h || "",

          turma: novo?.t || "",

          antes: "(vazio)",

          depois:
            novo?.v || "(vazio)"

        });

        return;
      }

      // ===============================
      // 🟡 ALTERADO
      // ===============================
      const antigoValor =
        normalizarTexto(
          antigo?.v || ""
        );

      const novoValor =
        normalizarTexto(
          novo?.v || ""
        );

      if (antigoValor !== novoValor) {

        alteracoes.push({

          tipo: "ALTERADO",

          dia:
            novo?.d ||
            antigo?.d ||
            "",

          horario:
            novo?.h ||
            antigo?.h ||
            "",

          turma:
            novo?.t ||
            antigo?.t ||
            "",

          antes:
            antigo?.v ||
            "(vazio)",

          depois:
            novo?.v ||
            "(vazio)"

        });

      }

    });

  } catch (e) {

    console.error(
      "❌ Erro em compararMapas:",
      e
    );

  }

  return alteracoes;
}


  // ===============================
  // 🌎 EXPORTAÇÃO GLOBAL
  // ===============================
  window.gerarMapaDados = gerarMapaDados;

  window.compararMapas = compararMapas;

})();
