// ======================================================
// 🔥 PDF ENGINE GLOBAL - IFRO
// ======================================================

window.pdfEngine = {

  // ======================================================
  // 🔥 CONFIG GLOBAL
  // ======================================================

  config: {

    instituicao:
      "INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DE RONDÔNIA - IFRO",

    campus:
      "CAMPUS CACOAL - Departamento de Apoio ao Ensino - DAPE",

    rodape:
      "IFRO - Campus Cacoal | BR 364, Km 228, Lote 2-A | (69) 3443-2445 | dape.cacoal@ifro.edu.br"

  },

  // ======================================================
  // 🔥 CRIAR PDF
  // ======================================================

  criarPDF(orientacao = "l") {

    const { jsPDF } = window.jspdf;

    return new jsPDF(
      orientacao,
      "mm",
      "a4"
    );

  },

  // ======================================================
  // 🔥 CABEÇALHO PADRÃO
  // ======================================================

  adicionarCabecalho(
    pdf,
    titulo,
    subtitulo = ""
  ) {

    const largura =
      pdf.internal.pageSize.getWidth();

    pdf.setFontSize(9);

    pdf.setTextColor(0,0,0);

    pdf.text(
      this.config.instituicao,
      largura / 2,
      8,
      { align: "center" }
    );

    pdf.text(
      this.config.campus,
      largura / 2,
      12,
      { align: "center" }
    );

    pdf.setFontSize(13);

    pdf.setFont(
      undefined,
      "bold"
    );

    pdf.setTextColor(46,125,50);

    pdf.text(
      titulo,
      largura / 2,
      20,
      { align: "center" }
    );

    if (subtitulo) {

      pdf.setFontSize(10);

      pdf.setTextColor(80,80,80);

      pdf.text(
        subtitulo,
        largura / 2,
        26,
        { align: "center" }
      );

    }

    pdf.setTextColor(0,0,0);

    pdf.setFont(
      undefined,
      "normal"
    );

  },

  // ======================================================
  // 🔥 RODAPÉ PADRÃO
  // ======================================================

  adicionarRodape(pdf) {

    const largura =
      pdf.internal.pageSize.getWidth();

    const altura =
      pdf.internal.pageSize.getHeight();

    pdf.setFontSize(7);

    pdf.setTextColor(100,100,100);

    pdf.text(
      this.config.rodape,
      largura / 2,
      altura - 4,
      { align: "center" }
    );

  },

  // ======================================================
  // 🔥 CORES PADRÃO
  // ======================================================

  cores: {

    cabecalho: [46,125,50],

    textoCabecalho: [255,255,255],

    borda: [210,210,210],

    intervalo: [235,235,235],

    reserva: [255,243,224],

    estudos: [255,249,196],

    reuniao: [232,234,246],

    pps: [13,71,161],

    reposicao: [183,28,28],

    caed: [224,224,224]

  },

  // ======================================================
  // 🔥 DETECTAR CLASSE PDF
  // ======================================================

  detectarClasse(valor = "") {

    const v =
      normalizarTexto(valor);

    if (v.includes("RESERVA ENSINO"))
      return "reserva";

    if (v.includes("ESTUDOS INDIVIDUAIS"))
      return "estudos";

    if (v.includes("PPS/ATENDIMENTO"))
      return "pps";

    if (v.includes("REUNIAO"))
      return "reuniao";

    if (
      v.includes("CAED") ||
      v.includes("PRE-CONSELHO")
    )
      return "caed";

    if (v.includes("_REP -"))
      return "reposicao";

    return null;

  },

  // ======================================================
  // 🔥 ESTILIZAR CÉLULA
  // ======================================================

  aplicarEstiloCelula(data) {

    const txt =
      (data.cell.raw || "").toString();

    const classe =
      this.detectarClasse(txt);

    if (!classe) return;

    const cor =
      this.cores[classe];

    if (!cor) return;

    data.cell.styles.fillColor = cor;

    // texto branco
    if (
      classe === "pps" ||
      classe === "reposicao"
    ) {

      data.cell.styles.textColor =
        [255,255,255];

      data.cell.styles.fontStyle =
        "bold";

    }

  },

  // ======================================================
  // 🔥 EXPORTAÇÃO TABELA
  // ======================================================

  exportarTabela({

    orientacao = "l",

    titulo = "",

    subtitulo = "",

    head = [],

    body = [],

    nomeArquivo = "arquivo.pdf",

    columnStyles = {},

    didParseCell = null,

    fontSize = 5,

    startY = 30

  }) {

    const pdf =
      this.criarPDF(orientacao);

    // cabeçalho
    this.adicionarCabecalho(
      pdf,
      titulo,
      subtitulo
    );

    // tabela
    pdf.autoTable({

      head: [head],

      body,

      startY,

      theme: "grid",

      margin: {
        top: startY,
        left: 2,
        right: 2,
        bottom: 8
      },

      styles: {

        fontSize,

        halign: "center",

        valign: "middle",

        cellPadding: 1

      },

      headStyles: {

        fillColor:
          this.cores.cabecalho,

        textColor:
          this.cores.textoCabecalho,

        fontStyle: "bold"

      },

      tableLineColor:
        this.cores.borda,

      tableLineWidth: 0.1,

      columnStyles,

      didParseCell: (data) => {

        // estilo padrão
        this.aplicarEstiloCelula(data);

        // callback externo
        if (didParseCell) {
          didParseCell(data);
        }

      }

    });

    // rodapé
    this.adicionarRodape(pdf);

    // salvar
    pdf.save(nomeArquivo);

  },

  // ======================================================
  // 🔥 EXPORTAÇÃO MATRIZ SEMANAL
  // ======================================================

  exportarMatrizSemanal({

    titulo,

    subtitulo,

    matriz,

    dias,

    horarios,

    nomeArquivo,

    orientacao = "p"

  }) {

    const head = [
      "Horário",
      ...dias
    ];

    const body = [];

    horarios.forEach(horario => {

      const linha = [horario];

      dias.forEach(dia => {

        linha.push(
          matriz?.[dia]?.[horario] || ""
        );

      });

      body.push(linha);

    });

    this.exportarTabela({

      orientacao,

      titulo,

      subtitulo,

      head,

      body,

      nomeArquivo,

      fontSize: 7,

      columnStyles: {
        0: {
          cellWidth: 24
        }
      }

    });

  },

  // ======================================================
  // 🔥 EXPORTAÇÃO RELATÓRIO
  // ======================================================

  exportarRelatorio({

    titulo,

    linhas,

    nomeArquivo

  }) {

    const body =
      linhas.map(i => [

        i.disciplina,

        i.professor,

        i.turma

      ]);

    this.exportarTabela({

      orientacao: "p",

      titulo,

      head: [
        "DISCIPLINA",
        "PROFESSOR",
        "TURMA"
      ],

      body,

      nomeArquivo,

      fontSize: 8,

      columnStyles: {

        0: {
          cellWidth: 70
        },

        1: {
          cellWidth: 70
        },

        2: {
          cellWidth: 45
        }

      }

    });

  }

};