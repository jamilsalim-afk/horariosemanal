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

        return normalizarTexto(
          texto || ""
        );

      }

      return String(texto || "")
        .trim()
        .toUpperCase();

    } catch (e) {

      console.warn(
        "⚠️ Erro normalizarSeguro:",
        e
      );

      return String(texto || "")
        .trim()
        .toUpperCase();
    }
  }


  // ===============================
  // 🧠 GERA MAPA NORMALIZADO
  // ===============================
  function gerarMapaDados(base = []) {

    const mapa = {};

    try {

      if (!Array.isArray(base)) {
        return mapa;
      }

      base.forEach(item => {

        if (!item) return;

        // 🔥 apenas HOJE → DOMINGO
        if (
          typeof dataDentroDaSemanaAtual === "function" &&
          !dataDentroDaSemanaAtual(item.data)
        ) {
          return;
        }

        const chave = [

          normalizarSeguro(item.data),

          normalizarSeguro(item.horario),

          normalizarSeguro(item.turma),

          normalizarSeguro(item.modalidade)

        ].join("|");

        mapa[chave] = {

  data: item.data || "",

  dia: item.data || "",

  horario: item.horario || "",

  turma: item.turma || "",

  modalidade: item.modalidade || "",

  valor: item.valor || "",

  valorOriginal: item.valor || "",

  valorNormalizado:
    normalizarSeguro(item.valor || "")
};

      });

    } catch (e) {

      console.error(
        "❌ Erro gerarMapaDados:",
        e
      );

    }

    return mapa;
  }


  function compararMapas(
  mapaAntigo = {},
  mapaNovo = {}
) {

  const alteracoes = [];

  try {

    const todasChaves = new Set([

      ...Object.keys(mapaAntigo),

      ...Object.keys(mapaNovo)

    ]);

    todasChaves.forEach(chave => {

      const antigo =
        mapaAntigo[chave];

      const novo =
        mapaNovo[chave];

      // ===============================
      // 🔴 REMOVIDO
      // ===============================
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

      // ===============================
      // 🟢 ADICIONADO
      // ===============================
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

      // ===============================
      // 🟡 ALTERADO
      // ===============================
      const valorAntigo =
        antigo?.valorNormalizado || "";

      const valorNovo =
        novo?.valorNormalizado || "";

      if (valorAntigo !== valorNovo) {

        alteracoes.push({

          tipo: "ALTERADO",

          dia:
            novo?.dia ||
            antigo?.dia ||
            "",

          horario:
            novo?.horario ||
            antigo?.horario ||
            "",

          turma:
            novo?.turma ||
            antigo?.turma ||
            "",

          antes:
            antigo?.valorOriginal || "",

          depois:
            novo?.valorOriginal || ""

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
  window.gerarMapaDados =
    gerarMapaDados;

  window.compararMapas =
    compararMapas;

})();