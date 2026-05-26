// ======================================================
// 🔥 SNAPSHOT + COMPARAÇÃO
// ======================================================

window.snapshotManager = {

  STORAGE_KEY: "ifro_snapshot_semana",

  // ======================================================
  // 🔥 GERA SNAPSHOT ATUAL
  // ======================================================

  gerarSnapshotAtual() {

    const snapshot = {};

    const hoje = new Date();

    const semanaAtual =
      utils.getSemanaAtual();

    const diasSemana =
      scheduler.obterDiasSemana(semanaAtual);

    diasSemana.forEach(dia => {

      const dataObj =
        utils.parseDataBR(dia);

      // 🔥 ignora domingo
      if (dataObj.getDay() === 0) return;

      // 🔥 ignora dias anteriores
      if (dataObj < utils.zerarHorario(hoje)) return;

      // 🔥 ignora domingo
      if (dataObj.getDay() === 0) return;

      // 🔥 pega linhas do dia
      const linhas =
        appState.semanas[semanaAtual]?.dias?.[dia] || [];

      snapshot[dia] = [];

      linhas.forEach(linha => {

        const registro = [];

        registro.push(linha[0] || "");
        registro.push(linha[1] || "");

        for (let i = 2; i < linha.length; i++) {

          registro.push(linha[i] || "");

        }

        snapshot[dia].push(registro);

      });

    });

    return snapshot;

  },

  // ======================================================
  // 🔥 SALVAR SNAPSHOT
  // ======================================================

  salvarSnapshot(snapshot) {

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(snapshot)
    );

  },

  // ======================================================
  // 🔥 LER SNAPSHOT
  // ======================================================

  obterSnapshotSalvo() {

    const raw =
      localStorage.getItem(this.STORAGE_KEY);

    if (!raw) return null;

    try {

      return JSON.parse(raw);

    } catch {

      return null;

    }

  },

  // ======================================================
  // 🔥 COMPARAR
  // ======================================================

  compararSnapshots(antigo, novo) {

    const alteracoes = [];

    if (!antigo) return alteracoes;

    Object.keys(novo).forEach(dia => {

      const linhasNovas =
        novo[dia] || [];

      const linhasAntigas =
        antigo[dia] || [];

      linhasNovas.forEach((linhaNova, idxLinha) => {

        const linhaAntiga =
          linhasAntigas[idxLinha] || [];

        for (let col = 2; col < linhaNova.length; col++) {

          const valorNovo =
            (linhaNova[col] || "").trim();

          const valorAntigo =
            (linhaAntiga[col] || "").trim();

          if (valorNovo === valorAntigo) continue;

          const turma =
            appState.colunas[col] || `COLUNA ${col}`;

          alteracoes.push({

            dia,

            horario: linhaNova[1],

            turma,

            antigo: valorAntigo,
            novo: valorNovo

          });

        }

      });

    });

    return alteracoes;

  },

  // ======================================================
  // 🔥 PROCESSAR CICLO
  // ======================================================

  processarComparacao() {

    const snapshotNovo =
      this.gerarSnapshotAtual();

    const snapshotAntigo =
      this.obterSnapshotSalvo();

    // 🔥 primeira execução
    if (!snapshotAntigo) {

      this.salvarSnapshot(snapshotNovo);

      console.log("✅ Primeiro snapshot criado.");

      return;

    }

    const alteracoes =
      this.compararSnapshots(
        snapshotAntigo,
        snapshotNovo
      );

    if (alteracoes.length > 0) {

      console.log(
        `⚠️ ${alteracoes.length} alterações detectadas`
      );

      painelAlteracoes.render(alteracoes);

    }

    this.salvarSnapshot(snapshotNovo);

  }

};

// ======================================================
// 🔥 DETECTOR DE AULAS VAGAS
// ======================================================

window.detectorVagas = {

  TERMOS_VAGAS: [
    "RESERVA ENSINO",
    "ESTUDOS INDIVIDUAIS"
  ],

  detectar(diaFiltro = null) {

    const resultado = [];

    Object.keys(appState.semanas).forEach(semana => {

      const dias =
        appState.semanas[semana]?.dias || {};

      Object.keys(dias).forEach(dia => {

        if (diaFiltro && dia !== diaFiltro) return;

        const linhas = dias[dia];

        linhas.forEach(linha => {

          const horario =
            linha[1] || "";

          for (let col = 2; col < linha.length; col++) {

            const valor =
              utils.normalizarTexto(linha[col] || "");

            const turma =
              appState.colunas[col];

            const isVaga =
              this.TERMOS_VAGAS.some(t =>
                valor.includes(t)
              );

            if (!isVaga) continue;

            resultado.push({

              dia,
              horario,
              turma,
              descricao: linha[col]

            });

          }

        });

      });

    });

    return resultado;

  }

};