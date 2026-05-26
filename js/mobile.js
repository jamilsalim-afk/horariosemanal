// ======================================================
// 🔥 MOBILE UI MANAGER
// ======================================================

window.mobileUI = {

  // ======================================================
  // 🔥 INIT
  // ======================================================

  init() {

    this.detectarTela();

    this.bindResize();

    this.bindMenuMobile();

    this.bindSwipeTabs();

    this.ativarScrollTabelas();

  },

  // ======================================================
  // 🔥 DETECTAR TAMANHO
  // ======================================================

  detectarTela() {

    const w = window.innerWidth;

    document.body.classList.remove(
      "mobile",
      "tablet",
      "desktop"
    );

    // mobile
    if (w <= 768) {

      document.body.classList.add("mobile");

      return;

    }

    // tablet
    if (w <= 1200) {

      document.body.classList.add("tablet");

      return;

    }

    // desktop
    document.body.classList.add("desktop");

  },

  // ======================================================
  // 🔥 RESIZE
  // ======================================================

  bindResize() {

    window.addEventListener(
      "resize",
      () => {

        this.detectarTela();

      }
    );

  },

  // ======================================================
  // 🔥 MENU MOBILE
  // ======================================================

  bindMenuMobile() {

    const btn =
      document.getElementById(
        "btnMenuMobile"
      );

    const nav =
      document.getElementById(
        "tabsNav"
      );

    if (!btn || !nav) return;

    btn.addEventListener(
      "click",
      () => {

        nav.classList.toggle(
          "tabs-open"
        );

      }
    );

  },

  // ======================================================
  // 🔥 FECHAR MENU AO CLICAR
  // ======================================================

  fecharMenuMobile() {

    const nav =
      document.getElementById(
        "tabsNav"
      );

    if (!nav) return;

    nav.classList.remove(
      "tabs-open"
    );

  },

  // ======================================================
  // 🔥 SWIPE DAS ABAS
  // ======================================================

  bindSwipeTabs() {

    const nav =
      document.getElementById(
        "tabsNav"
      );

    if (!nav) return;

    let startX = 0;

    nav.addEventListener(
      "touchstart",
      e => {

        startX =
          e.touches[0].clientX;

      },
      { passive: true }
    );

    nav.addEventListener(
      "touchmove",
      e => {

        const x =
          e.touches[0].clientX;

        const diff =
          startX - x;

        nav.scrollLeft += diff;

        startX = x;

      },
      { passive: true }
    );

  },

  // ======================================================
  // 🔥 SCROLL TABELAS
  // ======================================================

  ativarScrollTabelas() {

    document
      .querySelectorAll(
        ".table-wrapper"
      )
      .forEach(el => {

        el.addEventListener(
          "wheel",
          e => {

            // shift + scroll
            if (e.shiftKey) {

              e.preventDefault();

              el.scrollLeft += e.deltaY;

            }

          },
          { passive: false }
        );

      });

  },

  // ======================================================
  // 🔥 TOOLBAR COMPACTA
  // ======================================================

  compactarToolbar() {

    const mobile =
      document.body.classList.contains(
        "mobile"
      );

    document
      .querySelectorAll(".btn-text")
      .forEach(btn => {

        if (mobile) {

          btn.dataset.original =
            btn.innerHTML;

          // mantém apenas emoji
          const emoji =
            btn.innerHTML.match(
              /[\p{Emoji}]/u
            );

          if (emoji) {

            btn.innerHTML =
              emoji[0];

          }

        } else {

          if (btn.dataset.original) {

            btn.innerHTML =
              btn.dataset.original;

          }

        }

      });

  }

};

// ======================================================
// 🔥 AUTO INIT
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    mobileUI.init();

  }
);