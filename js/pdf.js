// ===============================
// 📄 PDF GLOBAL
// ===============================

(function () {

  // ===============================
  // 🎨 CORES PDF
  // ===============================
  const coresPDF = {

    "reserva-ensino": [212, 237, 218],

    "pps": [11, 61, 145],

    "estudos": [255, 229, 180],

    "reuniao": [208, 235, 255],

    "caed": [255, 243, 205],

    "reposicao": [30, 126, 52],

    "marcacao-extra": [224, 224, 224]

  };


  // ===============================
  // 🧠 DETECTAR CLASSE
  // ===============================
  function detectarClasse(valor) {

    try {

      const valNorm =
        typeof normalizarTexto === "function"
          ? normalizarTexto(valor || "")
          : String(valor || "")
              .trim()
              .toUpperCase();

      if (valNorm.includes("RESERVA ENSINO")) {
        return "reserva-ensino";
      }

      if (valNorm.includes("PPS/ATENDIMENTO")) {
        return "pps";
      }

      if (valNorm.includes("ESTUDOS INDIVIDUAIS")) {
        return "estudos";
      }

      if (valNorm.includes("REUNIAO DE SERVIDORES")) {
        return "reuniao";
      }

      if (
        valNorm.includes("CAED") ||
        valNorm.includes("PRE-CONSELHO")
      ) {
        return "caed";
      }

      if (valNorm.includes("_REP -")) {
        return "reposicao";
      }

      if (
        valNorm.includes("[+]") ||
        valNorm.includes("*") ||
        valNorm.includes("[R]") ||
        valNorm.includes("INTERVALO")
      ) {
        return "marcacao-extra";
      }

      return null;

    } catch (e) {

      console.warn(
        "⚠️ Erro em detectarClasse:",
        e
      );

      return null;
    }

  }


  // ===============================
  // 📄 EXPORTAR PDF
  // ===============================
  function exportarPDF() {

    try {

      if (!window.jspdf?.jsPDF) {
        console.error("❌ jsPDF não carregado.");
        return;
      }

      const { jsPDF } = window.jspdf;

      const pdf =
        new jsPDF("l", "mm", "a4");

      // ===============================
      // 🌍 ESTADO GLOBAL
      // ===============================
      const sem =
        window.appState?.semana ||
        window.semanaAtual ||
        document.getElementById("selectSemana")
          ?.value;

      const mod =
        window.appState?.modalidade ||
        window.modalidadeAtual ||
        document.getElementById(
          "selectModalidade"
        )?.value;

      if (!sem || !mod) {

        alert(
          "Selecione uma semana e modalidade."
        );

        return;
      }

      const diasObj =
        window.semanasAgrupadas?.[sem]?.dias;

      if (!diasObj) {

        console.warn(
          "⚠️ Dias da semana não encontrados."
        );

        return;
      }

      // ===============================
      // 🎓 TURMAS
      // ===============================
      let turmasAtivas = [];

      if (
        mod === "SUPERIOR" &&
        typeof getTurmasAtivasNaSemana ===
          "function"
      ) {

        turmasAtivas =
          getTurmasAtivasNaSemana(diasObj);

      } else {

        turmasAtivas =
          window.turmasDaPlanilha || [];

      }

      // ===============================
      // 📅 NOMES DIAS
      // ===============================
      const nomes = [

        "DOMINGO",

        "SEGUNDA-FEIRA",

        "TERÇA-FEIRA",

        "QUARTA-FEIRA",

        "QUINTA-FEIRA",

        "SEXTA-FEIRA",

        "SÁBADO"

      ];

      // ===============================
      // 🔁 PÁGINAS
      // ===============================
      Object.keys(diasObj)
        .forEach((dia, i) => {

          try {

            if (i > 0) {
              pdf.addPage();
            }

            const pageWidth =
              pdf.internal.pageSize.getWidth();

            // ===============================
            // 🏛️ CABEÇALHO
            // ===============================
            pdf.setFontSize(9);

            pdf.text(
              "INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DE RONDÔNIA - IFRO",
              pageWidth / 2,
              8,
              { align: "center" }
            );

            pdf.text(
              "CAMPUS CACOAL - Departamento de Apoio ao Ensino - DAPE",
              pageWidth / 2,
              12,
              { align: "center" }
            );

            pdf.text(
              `SEMANA: ${sem}`,
              pageWidth / 2,
              16,
              { align: "center" }
            );

            const p = dia.split("/");

            const dObj =
              new Date(
                p[2],
                p[1] - 1,
                p[0]
              );

            pdf.setFontSize(14);

            pdf.setTextColor(46, 125, 50);

            pdf.setFont(undefined, "bold");

            pdf.text(
              `${nomes[dObj.getDay()]} - ${dia}`,
              pageWidth / 2,
              24,
              { align: "center" }
            );

            pdf.setTextColor(0, 0, 0);

            pdf.setFont(undefined, "normal");

            // ===============================
            // 🎉 FERIADO
            // ===============================
            if (
              typeof isFeriado === "function" &&
              isFeriado(dia)
            ) {

              pdf.setFontSize(60);

              pdf.text(
                "FERIADO",
                pageWidth / 2,
                100,
                { align: "center" }
              );

              return;
            }

            // ===============================
            // 📋 BODY
            // ===============================
            const body =
              diasObj[dia].map(r => {

                const line = [r[1]];

                turmasAtivas.forEach(t => {

                  const idx =
                    window.dadosGlobais?.[0]
                      ?.indexOf(t);

                  line.push(
                    (r[idx] || "").trim()
                  );

                });

                return line;

              });

            // ===============================
            // 📊 TABELA
            // ===============================
            pdf.autoTable({

              head: [
                [
                  "Horário",
                  ...turmasAtivas
                ]
              ],

              body,

              startY: 28,

              theme: "grid",

              margin: {
                top: 28,
                left: 2,
                right: 2,
                bottom: 2
              },

              tableLineColor: [
                200,
                200,
                200
              ],

              tableLineWidth: 0.1,

              styles: {

                fontSize: 4.5,

                halign: "center",

                valign: "middle",

                cellPadding: 1

              },

              headStyles: {

                fillColor: [46, 125, 50],

                textColor: [0, 0, 0],

                fontStyle: "bold",

                lineColor: [
                  200,
                  200,
                  200
                ],

                lineWidth: 0.1

              },

              columnStyles: {
                0: { cellWidth: 16 }
              },

              didParseCell: (data) => {

                try {

                  const col =
                    data.column.index;

                  // ===============================
                  // 🎨 COR CURSO
                  // ===============================
                  if (
                    col > 0 &&
                    typeof getCursoInfo ===
                      "function"
                  ) {

                    const curso =
                      getCursoInfo(
                        turmasAtivas[col - 1]
                      );

                    if (curso?.rgb) {

                      data.cell.styles.fillColor =
                        curso.rgb;

                    }

                  }

                  const txt =
                    (
                      data.cell.raw || ""
                    ).toString();

                  const classe =
                    detectarClasse(txt);

                  // ===============================
                  // 🎨 CORES ESPECIAIS
                  // ===============================
                  if (
                    classe &&
                    coresPDF[classe]
                  ) {

                    data.cell.styles.fillColor =
                      coresPDF[classe];

                    if (
                      classe === "pps" ||
                      classe === "reposicao"
                    ) {

                      data.cell.styles.textColor =
                        [255, 255, 255];

                      data.cell.styles.fontStyle =
                        "bold";

                    }

                  }

                  // ===============================
                  // 📏 LINHA VAZIA
                  // ===============================
                  const vazio =
                    data.row.raw
                      .slice(1)
                      .every(
                        v =>
                          !v ||
                          v.trim() === ""
                      );

                  if (vazio) {

                    data.cell.styles.minCellHeight =
                      1.5;

                    data.cell.styles.fontSize =
                      3.5;

                  }

                  // ===============================
                  // 🔲 INTERVALOS
                  // ===============================
                  const t =
                    txt.toUpperCase();

                  if (

                    t.includes("INTERVALO") ||

                    t.includes("[+]") ||

                    t.includes("*") ||

                    t.includes("[R]")

                  ) {

                    data.cell.styles.fillColor = [
                      235,
                      235,
                      235
                    ];

                  }

                } catch (e) {

                  console.warn(
                    "⚠️ Erro didParseCell:",
                    e
                  );

                }

              }

            });

            // ===============================
            // 📍 RODAPÉ
            // ===============================
            pdf.setFontSize(8);

            pdf.text(
              "IFRO - Campus Cacoal | BR 364, Km 228, Lote 2-A | (69) 3443-2445 | dape.cacoal@ifro.edu.br",
              pageWidth / 2,
              205,
              { align: "center" }
            );

          } catch (e) {

            console.warn(
              "⚠️ Erro ao gerar página PDF:",
              e
            );

          }

        });

      // ===============================
      // 💾 SALVAR
      // ===============================
      const nomeArquivo =
        `HORÁRIO ${mod} - SEMANA ${sem}.pdf`;

      pdf.save(nomeArquivo);

    } catch (e) {

      console.error(
        "❌ Erro em exportarPDF:",
        e
      );

      alert(
        "Erro ao gerar PDF."
      );

    }

  }


  // ===============================
  // 🌎 EXPORTAÇÃO GLOBAL
  // ===============================
  window.coresPDF =
    coresPDF;

  window.detectarClasse =
    detectarClasse;

  window.exportarPDF =
    exportarPDF;

})();
