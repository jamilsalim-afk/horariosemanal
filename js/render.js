// ======================================================
// 🌍 UI GLOBAL
// ======================================================

window.UI = {};

// ======================================================
// 🔥 ABRIR ABA
// ======================================================

function abrirAba(nome) {

  AppState.abaAtual = nome;

  // remove ativos
  document
    .querySelectorAll(".tab-btn")
    .forEach(btn => {

      btn.classList.remove("active");

    });

  document
    .querySelectorAll(".tab-page")
    .forEach(pagina => {

      pagina.classList.remove("active");

    });

  // ativa botão
  const botao =
    document.querySelector(
      `[data-tab="${nome}"]`
    );

  if (botao) {
    botao.classList.add("active");
  }

  // ativa página
  const pagina =
    document.getElementById(
      `aba-${nome}`
    );

  if (pagina) {
    pagina.classList.add("active");
  }

  // ======================================================
  // 🔥 RENDERS
  // ======================================================

  switch (nome) {

    case "horarios":
      renderHorario();
      break;

    case "sabados":
      renderSabados();
      break;

    case "professor":
      renderProfessor();
      break;

    case "turma":
      renderTurma();
      break;

    case "relatorios":
      renderRelatorios();
      break;

  }

  // salva aba
  localStorage.setItem(
    "ifro_aba",
    nome
  );
}

// ======================================================
// 🔥 LOADER
// ======================================================

UI.mostrarLoader = function(
  texto = "Carregando..."
) {

  const loader =
    document.getElementById(
      "globalLoader"
    );

  if (!loader) return;

  loader.classList.add("show");

  const label =
    loader.querySelector(".loader-text");

  if (label) {
    label.innerText = texto;
  }
};

UI.fecharLoader = function() {

  const loader =
    document.getElementById(
      "globalLoader"
    );

  if (!loader) return;

  loader.classList.remove("show");
};

// ======================================================
// 🔥 TOAST
// ======================================================

UI.toast = function(
  mensagem,
  tipo = "success"
) {

  const toast =
    document.createElement("div");

  toast.className =
    `toast toast-${tipo}`;

  toast.innerHTML = mensagem;

  document.body.appendChild(toast);

  setTimeout(() => {

    toast.classList.add("show");

  }, 50);

  setTimeout(() => {

    toast.classList.remove("show");

    setTimeout(() => {

      toast.remove();

    }, 300);

  }, 3500);

};

// ======================================================
// 🔥 PREENCHE SELECT SEMANAS
// ======================================================

function preencherSelectSemanas() {

  const semanas =
    obterSemanasDisponiveis();

  const selects = [

    "selectSemana",
    "selectSemanaProfessor",
    "selectSemanaTurma"

  ];

  selects.forEach(id => {

    const select =
      document.getElementById(id);

    if (!select) return;

    select.innerHTML = "";

    semanas.forEach(semana => {

      const option =
        document.createElement("option");

      option.value = semana;

      option.innerText =
        `Semana ${semana}`;

      select.appendChild(option);

    });

  });

  // semana atual
  const semanaAtual =
    detectarSemanaAtual();

  selects.forEach(id => {

    const select =
      document.getElementById(id);

    if (!select) return;

    if (
      [...select.options]
      .some(o => o.value === semanaAtual)
    ) {

      select.value = semanaAtual;
    }

  });

}

// ======================================================
// 🔥 PREENCHE PROFESSORES
// ======================================================

function preencherSelectProfessores() {

  const select =
    document.getElementById(
      "selectProfessor"
    );

  if (!select) return;

  select.innerHTML =
    `<option value="">Selecione</option>`;

  const professores =
    Object.keys(
      indicesGlobais.professores || {}
    )
    .sort();

  professores.forEach(nome => {

    const option =
      document.createElement("option");

    option.value = nome;

    option.innerText =
      obterNomeProfessorCompleto(nome);

    select.appendChild(option);

  });

}

// ======================================================
// 🔥 PREENCHE TURMAS
// ======================================================

function preencherSelectTurmas() {

  const select =
    document.getElementById(
      "selectTurma"
    );

  if (!select) return;

  select.innerHTML =
    `<option value="">Selecione</option>`;

  turmasDetectadas
    .sort()
    .forEach(turma => {

      const option =
        document.createElement("option");

      option.value = turma;

      option.innerText = turma;

      select.appendChild(option);

    });

}

// ======================================================
// 🔥 DETECTA SEMANA ATUAL
// ======================================================

function detectarSemanaAtual() {

  const hoje = new Date();

  const dia =
    hoje.getDay();

  const ajuste =
    dia === 0 ? -6 : 1 - dia;

  hoje.setDate(
    hoje.getDate() + ajuste
  );

  return formatarData(hoje);
}

// ======================================================
// 🔥 ALTERAR MODALIDADE
// ======================================================

function alterarModalidade() {

  AppState.modalidade =
    document.getElementById(
      "selectModalidade"
    )?.value || "INTEGRADO";

  renderHorario();
}

// ======================================================
// 🔥 ALTERAR SEMANA
// ======================================================

function alterarSemana() {

  AppState.semanaAtual =
    document.getElementById(
      "selectSemana"
    )?.value;

  renderHorario();
}

// ======================================================
// 🔥 PAINEL ALTERAÇÕES
// ======================================================

function abrirPainelAlteracoes() {

  document
    .getElementById(
      "painelAlteracoes"
    )
    ?.classList.add("show");

}

function fecharPainelAlteracoes() {

  document
    .getElementById(
      "painelAlteracoes"
    )
    ?.classList.remove("show");

}

// ======================================================
// 🔥 PAINEL VAGAS
// ======================================================

function abrirPainelVagas() {

  document
    .getElementById(
      "painelVagas"
    )
    ?.classList.add("show");

}

function fecharPainelVagas() {

  document
    .getElementById(
      "painelVagas"
    )
    ?.classList.remove("show");

}

// ======================================================
// 🔥 COPIAR TEXTO
// ======================================================

async function copiarTexto(texto) {

  try {

    await navigator.clipboard.writeText(
      texto
    );

    UI.toast(
      "Copiado com sucesso"
    );

  } catch {

    UI.toast(
      "Erro ao copiar",
      "error"
    );

  }

}

// ======================================================
// 🔥 COPIAR ALTERAÇÕES
// ======================================================

function copiarAlteracoes() {

  const texto =
    document.getElementById(
      "conteudoAlteracoes"
    )?.innerText || "";

  copiarTexto(texto);
}

// ======================================================
// 🔥 COPIAR VAGAS
// ======================================================

function copiarVagas() {

  const texto =
    document.getElementById(
      "conteudoVagas"
    )?.innerText || "";

  copiarTexto(texto);
}

// ======================================================
// 🔥 FIXA COLUNAS
// ======================================================

function aplicarStickyTabela() {

  document
    .querySelectorAll(".sticky-table")
    .forEach(tabela => {

      const th =
        tabela.querySelectorAll(
          "th:first-child, td:first-child"
        );

      th.forEach(celula => {

        celula.style.position =
          "sticky";

        celula.style.left = "0";

        celula.style.zIndex = "5";

      });

    });

}

// ======================================================
// 🔥 INICIALIZA UI
// ======================================================

function inicializarUI() {

  preencherSelectSemanas();

  preencherSelectProfessores();

  preencherSelectTurmas();

  aplicarStickyTabela();

  // 🔥 abre última aba
  const ultimaAba =
    localStorage.getItem(
      "ifro_aba"
    ) || "horarios";

  abrirAba(ultimaAba);

}