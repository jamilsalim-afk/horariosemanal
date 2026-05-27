function toggleTheme() {

  const body = document.body;

  const isDark =
    body.classList.contains("theme-dark");

  if (isDark) {

    body.classList.remove("theme-dark");
    body.classList.add("theme-light");

    localStorage.setItem("theme", "light");

  } else {

    body.classList.remove("theme-light");
    body.classList.add("theme-dark");

    localStorage.setItem("theme", "dark");

  }

}

function carregarTema() {

  const temaSalvo =
    localStorage.getItem("theme") || "dark";

  document.body.classList.remove(
    "theme-dark",
    "theme-light"
  );

  document.body.classList.add(
    temaSalvo === "light"
      ? "theme-light"
      : "theme-dark"
  );

}

document.addEventListener(
  "DOMContentLoaded",
  carregarTema
);
