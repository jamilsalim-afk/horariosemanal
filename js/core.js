// ======================================================
// 🔥 CORE GLOBAL (ABAS + ESTADO)
// ======================================================

(function () {

  // ======================================================
  // 📂 ABA ATIVA
  // ======================================================
  function getAbaAtiva() {

    try {

      const el =
        document.querySelector(".tab.active");

      if (!el) {
        return "horarios";
      }

      return el.dataset.tab || "horarios";

    } catch (e) {

      console.warn(
        "⚠️ Erro em getAbaAtiva:",
        e
      );

      return "horarios";
    }

  }


  // ======================================================
  // 🎓 MODALIDADE ATUAL
  // ======================================================
  function getModalidadeAtual() {

    try {

      const aba = getAbaAtiva();

      // 🔥 tenta primeiro seletor específico da aba
      let el = document.querySelector(
        `#aba-${aba} .selectModalidade`
      );

      // 🔥 fallback principal
      if (!el) {
        el = document.getElementById(
          "selectModalidade"
        );
      }

      if (!el) {
        return "INTEGRADO";
      }

      return el.value || "INTEGRADO";

    } catch (e) {

      console.warn(
        "⚠️ Erro em getModalidadeAtual:",
        e
      );

      return "INTEGRADO";
    }

  }


  // ======================================================
  // 📅 SEMANA ATUAL SELECIONADA
  // ======================================================
  function getSemanaAtualSelecionada() {

    try {

      const aba = getAbaAtiva();

      // 🔥 tenta seletor específico da aba
      let el = document.querySelector(
        `#aba-${aba} .selectSemana`
      );

      // 🔥 fallback principal
      if (!el) {
        el = document.getElementById(
          "selectSemana"
        );
      }

      if (!el) {
        return "";
      }

      return el.value || "";

    } catch (e) {

      console.warn(
        "⚠️ Erro em getSemanaAtualSelecionada:",
        e
      );

      return "";
    }

  }


  // ======================================================
  // 🌎 SINCRONIZA ESTADO GLOBAL
  // ======================================================
  function atualizarEstadoGlobal() {

    try {

      const aba = getAbaAtiva();

      const modalidade =
        getModalidadeAtual();

      const semana =
        getSemanaAtualSelecionada();

      // 🔥 appState
      if (!window.appState) {
        window.appState = {};
      }

      window.appState.aba = aba;
      window.appState.modalidade = modalidade;
      window.appState.semana = semana;

      // 🔥 compatibilidade legado
      window.abaAtiva = aba;
      window.modalidadeAtual = modalidade;
      window.semanaAtual = semana;

    } catch (e) {

      console.warn(
        "⚠️ Erro em atualizarEstadoGlobal:",
        e
      );

    }

  }


  // ======================================================
  // 🚀 INIT CORE
  // ======================================================
  function initCore() {

    try {

      atualizarEstadoGlobal();

      // 🔥 atualiza ao trocar modalidade
      const selectModalidade =
        document.getElementById(
          "selectModalidade"
        );

      if (selectModalidade) {

        selectModalidade.addEventListener(
          "change",
          atualizarEstadoGlobal
        );

      }

      // 🔥 atualiza ao trocar semana
      const selectSemana =
        document.getElementById(
          "selectSemana"
        );

      if (selectSemana) {

        selectSemana.addEventListener(
          "change",
          atualizarEstadoGlobal
        );

      }

      // 🔥 atualiza abas
      document
        .querySelectorAll(".tab")
        .forEach(btn => {

          btn.addEventListener(
            "click",
            () => {

              setTimeout(() => {
                atualizarEstadoGlobal();
              }, 0);

            }
          );

        });

    } catch (e) {

      console.warn(
        "⚠️ Erro em initCore:",
        e
      );

    }

  }


  // ======================================================
  // 🌎 EXPORTAÇÃO GLOBAL
  // ======================================================
  window.getAbaAtiva =
    getAbaAtiva;

  window.getModalidadeAtual =
    getModalidadeAtual;

  window.getSemanaAtualSelecionada =
    getSemanaAtualSelecionada;

  window.atualizarEstadoGlobal =
    atualizarEstadoGlobal;

  window.initCore =
    initCore;


  // ======================================================
  // 🚀 AUTO INIT
  // ======================================================
  document.addEventListener(
    "DOMContentLoaded",
    initCore
  );

})();
