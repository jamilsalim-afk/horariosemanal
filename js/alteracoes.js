// ======================================================
// 📁 js/alteracoes.js
// ======================================================

// ======================================================
// 🔥 CHAVE SNAPSHOT
// ======================================================

function getSnapshotKey() {

  const semana = appState.semana || "SEMANA";

  return `snapshot_${semana}`;
}

// ======================================================
// 🔥 GERA SNAPSHOT DA SEMANA
// ======================================================

function gerarSnapshotSemana() {

  const estrutura = {};

  const dias = getDiasSemanaAtual();

  dias.forEach(dia => {

    estrutura[dia] = {};

    const linhas = obterLinhasDia(dia);

    linhas.forEach(linha => {

      const horario = linha.horario;

      estrutura[dia][horario] = {};

      Object.entries(linha.aulas || {}).forEach(([turma, valor]) => {

        estrutura[dia][horario][turma] = valor || "";

      });

    });

  });

  return estrutura;
}

// ======================================================
// 🔥 PRIMEIRO USO
// ======================================================

function snapshotExiste() {

  return !!localStorage.getItem(getSnapshotKey());
}

// ======================================================
// 🔥 SALVAR SNAPSHOT
// ======================================================

function salvarSnapshotAtual() {

  const snapshot = gerarSnapshotSemana();

  localStorage.setItem(
    getSnapshotKey(),
    JSON.stringify(snapshot)
  );
}

// ======================================================
// 🔥 OBTER SNAPSHOT
// ======================================================

function obterSnapshotAnterior() {

  const raw =
    localStorage.getItem(getSnapshotKey());

  if (!raw) return null;

  try {

    return JSON.parse(raw);

  } catch {

    return null;
  }
}

// ======================================================
// 🔥 COMPARAR SNAPSHOTS
// ======================================================

function compararSnapshots() {

  const anterior = obterSnapshotAnterior();

  if (!anterior) {

    salvarSnapshotAtual();

    return [];
  }

  const atual = gerarSnapshotSemana();

  const alteracoes = [];

  Object.keys(atual).forEach(dia => {

    const horarios = atual[dia] || {};

    Object.keys(horarios).forEach(horario => {

      const turmas = horarios[horario] || {};

      Object.keys(turmas).forEach(turma => {

        const antigo =
          anterior?.[dia]?.[horario]?.[turma] || "";

        const novo =
          atual?.[dia]?.[horario]?.[turma] || "";

        if (antigo !== novo) {

          alteracoes.push({

            dia,
            horario,
            turma,
            antigo,
            novo

          });

        }

      });

    });

  });

  salvarSnapshotAtual();

  return alteracoes;
}

// ======================================================
// 🔥 RENDER PAINEL ALTERAÇÕES
// ======================================================

function renderPainelAlteracoes() {

  const alteracoes = compararSnapshots();

  const painel =
    document.getElementById("painelAlteracoes");

  const conteudo =
    document.getElementById("conteudoAlteracoes");

  if (!painel || !conteudo) return;

  if (!alteracoes.length) {

    painel.style.display = "none";

    return;
  }

  let texto = "";

  alteracoes.forEach(a => {

    texto +=
`📅 ${a.dia}
⏰ ${a.horario}
🏫 ${abreviarTurma(a.turma)}

❌ ANTIGO:
${a.antigo || "(vazio)"}

✅ NOVO:
${a.novo || "(vazio)"}

──────────────────────────────

`;

  });

  conteudo.textContent = texto;

  painel.style.display = "block";
}

// ======================================================
// 🔥 FECHAR PAINEL
// ======================================================

function fecharPainelAlteracoes() {

  const painel =
    document.getElementById("painelAlteracoes");

  if (painel) {

    painel.style.display = "none";
  }
}

// ======================================================
// 🔥 COPIAR ALTERAÇÕES
// ======================================================

async function copiarAlteracoes() {

  const texto =
    document.getElementById("conteudoAlteracoes")
      ?.textContent || "";

  if (!texto) return;

  try {

    await navigator.clipboard.writeText(texto);

    toast("Alterações copiadas.");

  } catch {

    toast("Erro ao copiar.");
  }
}

// ======================================================
// 🔥 LIMPAR SNAPSHOTS ANTIGOS
// ======================================================

function limparSnapshotsAntigos() {

  const semanaAtual = appState.semana;

  Object.keys(localStorage).forEach(key => {

    if (!key.startsWith("snapshot_")) return;

    if (!key.includes(semanaAtual)) {

      localStorage.removeItem(key);

    }

  });

}