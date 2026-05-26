// ======================================================
// 🔥 THEME MANAGER
// ======================================================

window.themeManager = {

  STORAGE_KEY: "ifro_theme",

  temaAtual: "light",

  // ======================================================
  // 🔥 INIT
  // ======================================================

  init() {

    const salvo =
      localStorage.getItem(this.STORAGE_KEY);

    // 🔥 tema salvo
    if (salvo) {

      this.aplicarTema(salvo);

      return;

    }

    // 🔥 detectar sistema
    const dark =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

    this.aplicarTema(
      dark ? "dark" : "light"
    );

  },

  // ======================================================
  // 🔥 ALTERAR TEMA
  // ======================================================

  toggleTema() {

    const novo =
      this.temaAtual === "dark"
        ? "light"
        : "dark";

    this.aplicarTema(novo);

  },

  // ======================================================
  // 🔥 APLICAR TEMA
  // ======================================================

  aplicarTema(tema) {

    this.temaAtual = tema;

    document.body.classList.remove(
      "theme-light",
      "theme-dark"
    );

    document.body.classList.add(
      `theme-${tema}`
    );

    localStorage.setItem(
      this.STORAGE_KEY,
      tema
    );

    this.atualizarIcone();

  },

  // ======================================================
  // 🔥 ÍCONE
  // ======================================================

  atualizarIcone() {

    const btn =
      document.getElementById(
        "btnToggleTheme"
      );

    if (!btn) return;

    btn.innerHTML =
      this.temaAtual === "dark"
        ? "☀️"
        : "🌙";

  }

};

// ======================================================
// 🔥 INIT AUTO
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    themeManager.init();

  }
);