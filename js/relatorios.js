// ===============================
// 📊 RELATÓRIOS
// ===============================

(function () {

  // ===============================
  // 📂 ABRIR PAINEL
  // ===============================
  function abrirPainelRelatorio(
    titulo,
    texto
  ) {

    try {

      const painel =
        document.getElementById(
          "painelVagas"
        );

      const conteudo =
        document.getElementById(
          "conteudoVagas"
        );

      const tituloEl =
        document.querySelector(
          "#painelVagas strong"
        );

      if (!painel || !conteudo) {
        return;
      }

      conteudo.innerText =
        texto || "";

      if (tituloEl) {
        tituloEl.innerText = titulo;
      }

      painel.style.display = "block";

    } catch (e) {

      console.error(
        "❌ Erro abrirPainelRelatorio:",
        e
      );

    }

  }


  // ===============================
  // 📅 ABRIR RELATÓRIO DIA
  // ===============================
  function abrirRelatorioDia(dia) {

    try {

      const texto =
        gerarRelatorioDia(dia);

      abrirPainelRelatorio(
        "📅 Relatório do Dia",
        texto
      );

    } catch (e) {

      console.error(
        "❌ Erro abrirRelatorioDia:",
        e
      );

    }

  }


  // ===============================
  // 📊 ABRIR RELATÓRIO SEMANA
  // ===============================
  function abrirRelatorioSemana() {

    try {

      const texto =
        gerarRelatorioSemanaTexto();

      abrirPainelRelatorio(
        "📊 Relatório da Semana",
        texto
      );

    } catch (e) {

      console.error(
        "❌ Erro abrirRelatorioSemana:",
        e
      );

    }

  }


  // ===============================
  // 🔘 CRIAR BOTÕES
  // ===============================
  function criarBotoesDias() {

    try {

      const sem =

        window.appState?.semana ||

        window.semanaAtual ||

        document.getElementById(
          "selectSemana"
        )?.value;

      const dias =
        window.semanasAgrupadas?.[sem]
          ?.dias;

      const container =
        document.getElementById(
          "botoesRelatorio"
        );

      if (!container) return;

      if (!dias) {

        container.innerHTML = "";

        return;
      }

      let html = `

        <div style="
          padding:10px;
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          align-items:center;
        ">

      `;

      Object.keys(dias)
        .forEach(dia => {

          try {

            const [d, m, a] =
              dia.split("/");

            const dataObj =
              new Date(
                a,
                m - 1,
                d
              );

            const diaSemana =
              dataObj.getDay();

            // 🔥 remove domingo e sábado
            if (
              diaSemana === 0 ||
              diaSemana === 6
            ) {
              return;
            }

            html += `

              <button
                onclick="abrirRelatorioDia('${dia}')"

                style="
                  padding:10px;
                  background:#2e7d32;
                  color:white;
                  border:none;
                  border-radius:8px;
                  cursor:pointer;
                  font-weight:600;
                "
              >

                📅 ${dia}

              </button>

            `;

          } catch (e) {

            console.warn(
              "⚠️ Erro botão relatório:",
              e
            );

          }

        });

      // 🔥 botão semanal
      html += `

        <button
          onclick="abrirRelatorioSemana()"

          style="
            padding:10px;
            background:#d32f2f;
            color:white;
            border:none;
            border-radius:8px;
            cursor:pointer;
            font-weight:600;
          "
        >

          📊 Semana inteira

        </button>

      `;

      html += `</div>`;

      container.innerHTML = html;

    } catch (e) {

      console.error(
        "❌ Erro criarBotoesDias:",
        e
      );

    }

  }


  // ===============================
  // 📅 RELATÓRIO DIA
  // ===============================
  function gerarRelatorioDia(dia) {

    try {

      if (
        typeof coletarVagasDoDia !==
        "function"
      ) {

        return "Função coletarVagasDoDia não encontrada.";

      }

      const vagas =
        coletarVagasDoDia(dia) || [];

      let texto = `

📅 RELATÓRIO DE AULAS VAGAS DO DIA (${dia})

`;

      if (!vagas.length) {

        return (
          texto +
          "\nNão há aulas vagas neste dia."
        );

      }

      const agrupado = {};

      vagas.forEach(v => {

        if (!agrupado[v.turma]) {

          agrupado[v.turma] = [];

        }

        agrupado[v.turma]
          .push(v.horario);

      });

      Object.keys(agrupado)
        .forEach(turma => {

          const horarios = [

            ...new Set(
              agrupado[turma]
            )

          ];

          texto += `

🏫 TURMA: ${turma}

⏰ HORÁRIOS: ${horarios.join(", ")}

`;

        });

      return texto.trim();

    } catch (e) {

      console.error(
        "❌ Erro gerarRelatorioDia:",
        e
      );

      return "Erro ao gerar relatório.";

    }

  }


  // ===============================
  // 📋 COPIAR RELATÓRIO
  // ===============================
  function copiarRelatorioDia(dia) {

    try {

      const texto =
        gerarRelatorioDia(dia);

      navigator.clipboard
        .writeText(texto)
        .then(() => {

          alert(
            "Relatório copiado!"
          );

        });

    } catch (e) {

      console.error(
        "❌ Erro copiarRelatorioDia:",
        e
      );

    }

  }


  // ===============================
  // 📊 RELATÓRIO SEMANA
  // ===============================
  function gerarRelatorioSemanaTexto() {

    try {

      const sem =

        (
          typeof getSemanaAtualSelecionada ===
          "function"
        )

          ? getSemanaAtualSelecionada()

          : document.getElementById(
              "selectSemana"
            )?.value;

      const dias =

        window.semanasAgrupadas?.[sem]
          ?.dias || {};

      let texto = `

📊 RELATÓRIO SEMANAL DE AULAS VAGAS
(SEGUNDA À SEXTA)

`;

      const agrupado = {};

      Object.keys(dias)
        .forEach(dia => {

          try {

            const vagas =
              typeof coletarVagasDoDia ===
              "function"

                ? coletarVagasDoDia(dia)

                : [];

            vagas.forEach(v => {

              const chave =
                `${dia}__${v.turma}`;

              if (!agrupado[chave]) {

                agrupado[chave] = {

                  dia,

                  turma: v.turma,

                  horarios: []

                };

              }

              agrupado[chave]
                .horarios
                .push(v.horario);

            });

          } catch (e) {

            console.warn(
              "⚠️ Erro vagas semana:",
              e
            );

          }

        });

      const listaFinal =
        Object.values(agrupado);

      if (
        listaFinal.length === 0
      ) {

        return (
          texto +
          "\nNão há aulas vagas na semana."
        );

      }

      // 🔥 ordena por data
      listaFinal.sort((a, b) => {

        const [da, ma, aa] =
          a.dia.split("/");

        const [db, mb, ab] =
          b.dia.split("/");

        return (

          new Date(
            aa,
            ma - 1,
            da
          )

          -

          new Date(
            ab,
            mb - 1,
            db
          )

        );

      });

      let diaAtual = "";

      listaFinal
        .forEach(item => {

          if (
            item.dia !== diaAtual
          ) {

            texto += `

📅 ${item.dia}

`;

            diaAtual = item.dia;

          }

          const horarios = [

            ...new Set(
              item.horarios
            )

          ];

          texto += `

🏫 ${item.turma}

⏰ ${horarios.join(", ")}

`;

        });

      return texto.trim();

    } catch (e) {

      console.error(
        "❌ Erro gerarRelatorioSemanaTexto:",
        e
      );

      return "Erro ao gerar relatório semanal.";

    }

  }


  // ===============================
  // 🌎 EXPORTAÇÃO GLOBAL
  // ===============================
  window.abrirRelatorioDia =
    abrirRelatorioDia;

  window.abrirRelatorioSemana =
    abrirRelatorioSemana;

  window.criarBotoesDias =
    criarBotoesDias;

  window.gerarRelatorioDia =
    gerarRelatorioDia;

  window.copiarRelatorioDia =
    copiarRelatorioDia;

  window.gerarRelatorioSemanaTexto =
    gerarRelatorioSemanaTexto;

})();
