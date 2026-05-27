// ======================================================
// 🔥 CORE GLOBAL (ESTADO + ABAS)
// ======================================================

(function () {

  "use strict";

  // ======================================================
  // 🌎 ESTADO GLOBAL ÚNICO
  // ======================================================

  window.appState = {

    aba: "horarios",

    modalidade: "INTEGRADO",

    semana: ""

  };

  // ======================================================
  // 📦 CACHE DOM
  // ======================================================

  const DOM = {

    tabs:
      () => document.querySelectorAll(".tab"),

    activeTab:
      () => document.querySelector(".tab.active"),

    selectModalidade:
      () => document.getElementById("selectModalidade"),

    selectModalidadeSabados:
      () => document.getElementById("selectModalidadeSabados"),

    selectModalidadeTurma:
      () => document.getElementById("selectModalidadeTurma"),

    selectSemana:
      () => document.getElementById("selectSemana"),

    selectSemanaProfessor:
      () => document.getElementById("selectSemanaProfessor"),

    selectSemanaTurma:
      () => document.getElementById("selectSemanaTurma")

  };

  // ======================================================
  // 📂 RETORNA ABA ATIVA
  // ======================================================

  function getAbaAtiva() {

    try {

      const aba =
        DOM.activeTab();

      return (
        aba?.dataset?.tab ||
        "horarios"
      );

    } catch (e) {

      console.warn(
        "⚠️ getAbaAtiva:",
        e
      );

      return "horarios";

    }

  }

  // ======================================================
  // 🎓 RETORNA MODALIDADE ATUAL
  // ======================================================

  function getModalidadeAtual() {

    try {

      const aba =
        getAbaAtiva();

      const mapa = {

        horarios:
          DOM.selectModalidade(),

        sabados:
          DOM.selectModalidadeSabados(),

        turma:
          DOM.selectModalidadeTurma()

      };

      return (
        mapa[aba]?.value ||
        "INTEGRADO"
      );

    } catch (e) {

      console.warn(
        "⚠️ getModalidadeAtual:",
        e
      );

      return "INTEGRADO";

    }

  }

  // ======================================================
  // 📅 RETORNA SEMANA ATUAL
  // ======================================================

  function getSemanaAtualSelecionada() {

    try {

      const aba =
        getAbaAtiva();

      const mapa = {

        horarios:
          DOM.selectSemana(),

        professor:
          DOM.selectSemanaProfessor(),

        turma:
          DOM.selectSemanaTurma()

      };

      return (
        mapa[aba]?.value ||
        ""
      );

    } catch (e) {

      console.warn(
        "⚠️ getSemanaAtualSelecionada:",
        e
      );

      return "";

    }

  }

  // ======================================================
  // 🌎 ATUALIZA ESTADO GLOBAL
  // ======================================================

  function atualizarEstadoGlobal() {

    try {

      appState.aba =
        getAbaAtiva();

      appState.modalidade =
        getModalidadeAtual();

      appState.semana =
        getSemanaAtualSelecionada();

      // 🔥 evento global
      document.dispatchEvent(

        new CustomEvent(
          "appStateChanged",
          {
            detail: {
              ...appState
            }
          }
        )

      );

    } catch (e) {

      console.warn(
        "⚠️ atualizarEstadoGlobal:",
        e
      );

    }

  }

  // ======================================================
  // 🔄 REGISTRA EVENTOS
  // ======================================================

  function registrarEventos() {

    try {

      // ==================================================
      // 🎓 MODALIDADE
      // ==================================================

      [
        DOM.selectModalidade(),
        DOM.selectModalidadeSabados(),
        DOM.selectModalidadeTurma()
      ]

      .filter(Boolean)

      .forEach(el => {

        el.addEventListener(
          "change",
          atualizarEstadoGlobal
        );

      });

      // ==================================================
      // 📅 SEMANAS
      // ==================================================

      [
        DOM.selectSemana(),
        DOM.selectSemanaProfessor(),
        DOM.selectSemanaTurma()
      ]

      .filter(Boolean)

      .forEach(el => {

        el.addEventListener(
          "change",
          atualizarEstadoGlobal
        );

      });

      // ==================================================
      // 📂 ABAS
      // ==================================================

      DOM.tabs()

      .forEach(tab => {

        tab.addEventListener(
          "click",
          () => {

            requestAnimationFrame(
              atualizarEstadoGlobal
            );

          }
        );

      });

    } catch (e) {

      console.warn(
        "⚠️ registrarEventos:",
        e
      );

    }

  }

  // ======================================================
  // 🚀 INIT CORE
  // ======================================================

  function initCore() {

    try {

      registrarEventos();

      atualizarEstadoGlobal();

      console.log(
        "✅ CORE inicializado"
      );

    } catch (e) {

      console.warn(
        "⚠️ initCore:",
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