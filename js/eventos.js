// ===============================
// 🔀 CONTROLE GLOBAL DE ABAS
// ===============================

(function () {

  // ===============================
  // 📂 ABRIR ABA
  // ===============================
  function abrirAba(nome) {

    try {

      const abas = [
        "horarios",
        "sabados",
        "professor",
        "turma"
      ];

      // 🔥 valida aba
      if (!abas.includes(nome)) {
        nome = "horarios";
      }

      // ===============================
      // 🌍 ESTADO GLOBAL
      // ===============================
      if (!window.appState) {
        window.appState = {};
      }

      window.appState.aba = nome;

      // 🔥 compatibilidade legado
      window.abaAtiva = nome;

      // ===============================
      // 👁️ CONTROLE VISUAL
      // ===============================
      abas.forEach(a => {

        const el =
          document.getElementById(`aba-${a}`);

        if (el) {

          el.style.display =
            (a === nome)
              ? "block"
              : "none";

        }

      });

      // ===============================
      // 🔘 BOTÕES
      // ===============================
      document
        .querySelectorAll(".tab")
        .forEach(btn => {
          btn.classList.remove("active");
        });

      const ativo =
        document.querySelector(
          `[data-tab="${nome}"]`
        );

      if (ativo) {
        ativo.classList.add("active");
      }

      // ===============================
      // 🔄 SINCRONIZA ESTADO
      // ===============================
      if (
        typeof atualizarEstadoGlobal ===
        "function"
      ) {

        atualizarEstadoGlobal();

      }

      // ===============================
      // 🚀 RENDERIZAÇÃO
      // ===============================
      requestAnimationFrame(() => {

        try {

          // 🔥 HORÁRIOS
          if (
            nome === "horarios" &&
            typeof renderizarTabela ===
              "function"
          ) {

            renderizarTabela();

          }

          // 🔥 SÁBADOS
          if (
            nome === "sabados" &&
            typeof renderSabados ===
              "function"
          ) {

            renderSabados();

          }

          // 🔥 PROFESSOR
          if (
            nome === "professor" &&
            typeof renderProfessor ===
              "function"
          ) {

            renderProfessor();

          }

          // 🔥 TURMA
          if (
            nome === "turma" &&
            typeof renderTurma ===
              "function"
          ) {

            renderTurma();

          }

        } catch (e) {

          console.warn(
            "⚠️ Erro ao renderizar aba:",
            e
          );

        }

      });

    } catch (e) {

      console.error(
        "❌ Erro em abrirAba:",
        e
      );

    }

  }


  // ===============================
  // 💾 SALVAR SNAPSHOT AO SAIR
  // ===============================
  function salvarAntesDeSair() {

    try {

      const abaAtual =
        window.appState?.aba ||
        window.abaAtiva ||
        "horarios";

      if (
        abaAtual === "horarios" &&
        typeof salvarSnapshotAtual ===
          "function"
      ) {

        salvarSnapshotAtual();

      }

    } catch (e) {

      console.warn(
        "⚠️ Erro ao salvar snapshot:",
        e
      );

    }

  }


  // ===============================
  // 🚀 INIT GLOBAL
  // ===============================
  async function initEventos() {

    try {

      // 🔥 garante estado inicial
      if (!window.appState) {

        window.appState = {

          aba: "horarios",

          modalidade: null,

          semana: null

        };

      }

      // 🔥 compatibilidade legado
      window.abaAtiva =
        window.appState.aba || "horarios";

      // 🔥 sincroniza core
      if (
        typeof atualizarEstadoGlobal ===
        "function"
      ) {

        atualizarEstadoGlobal();

      }

      // 🔥 init principal
      if (typeof init === "function") {

        await init();

      }

      // 🔥 abre aba inicial
      abrirAba(
        window.appState.aba || "horarios"
      );

    } catch (e) {

      console.error(
        "❌ Erro em initEventos:",
        e
      );

    }

  }


  // ===============================
  // 🌎 EXPORTAÇÃO GLOBAL
  // ===============================
  window.abrirAba = abrirAba;


  // ===============================
  // 💾 EVENTOS GLOBAIS
  // ===============================
  window.addEventListener(
    "beforeunload",
    salvarAntesDeSair
  );


  // ===============================
  // 🚀 AUTO INIT
  // ===============================
  document.addEventListener(
    "DOMContentLoaded",
    initEventos
  );

})();
