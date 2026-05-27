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

  function gerarRelatorioDisciplinaProfessorTurma() {

  const base =
  window.BASE_RELATORIO_DPT || [];

  // =====================================
// FILTRO MODALIDADE
// =====================================
const filtroModalidade =
  document.getElementById(
    "selectModalidadeRelatorio"
  )?.value || "TODOS";

// =====================================
// FILTRO BUSCA
// =====================================
const busca =
  (
    document.getElementById(
      "buscaRelatorioDPT"
    )?.value || ""
  )
  .toLowerCase()
  .trim();

  if (!base.length) {

    console.warn(
      "❌ BASE_UNIFICADA vazia"
    );

    return;
  }

  // =====================================
  // REMOVE DUPLICADOS
  // =====================================
  const mapa = new Map();

  base.forEach(item => {

  const valor =
  (item.valor || "").trim();

if (!aulaValida(valor)) {
  return;
}

  // =====================================
  // FILTRO MODALIDADE
  // =====================================
  if (filtroModalidade !== "TODOS") {

    // 🔥 INTEGRADO
    if (
      filtroModalidade === "INTEGRADO" &&
      item.modalidade !== "INTEGRADO"
    ) {
      return;
    }

    // 🔥 SUPERIOR 1
    if (
      filtroModalidade === "SUPERIOR1" &&
      item.modalidade !== "SUPERIOR"
    ) {
      return;
    }

    // 🔥 SUPERIOR 2
    if (
      filtroModalidade === "SUPERIOR2"
    ) {

      return;

    }

  }

    // ===============================
    // NORMALIZA DISCIPLINA
    // ===============================
    const disciplina =
      (item.disciplina || "")
        .replace(/\*/g, "")
        .trim();

    // =====================================
// NORMALIZA PROFESSOR
// =====================================
const professorOriginal =
  (item.professorCurto || "")
    .replace(/\*/g, "")
    .trim();

// 🔥 tenta localizar nome completo
const professor =
  localizarProfessor(professorOriginal)
    || professorOriginal;

    // ===============================
    // TURMA
    // ===============================
    const turma =
      (item.turma || "")
        .trim();

    // ignora inválidos
    if (
      !disciplina ||
      !professor ||
      !turma
    ) {
      return;
    }

    // ignora PPS
    if (
      disciplina
        .toUpperCase()
        .includes("PPS")
    ) {
      return;
    }

    // =====================================
// FILTRO BUSCA
// =====================================
const textoBusca = `
  ${disciplina}
  ${professor}
  ${turma}
`
.toLowerCase();

if (
  busca &&
  !textoBusca.includes(busca)
) {
  return;
}

    // =====================================
    // CHAVE ÚNICA
    // =====================================
    const chave =
      `${disciplina}|||${professor}|||${turma}`;

    mapa.set(chave, {
      disciplina,
      professor,
      turma
    });

  });

  // =====================================
  // ORDENA
  // =====================================
  const linhas =
    [...mapa.values()]
      .sort((a, b) => {

        // disciplina
        let r =
          a.disciplina.localeCompare(
            b.disciplina,
            "pt-BR"
          );

        if (r !== 0) {
          return r;
        }

        // professor
        r =
          a.professor.localeCompare(
            b.professor,
            "pt-BR"
          );

        if (r !== 0) {
          return r;
        }

        // turma
        return a.turma.localeCompare(
          b.turma,
          "pt-BR"
        );

      });

  // =====================================
  // HTML
  // =====================================
  let html = `

    <div class="relatorio-tabela-container">

      <table class="relatorio-tabela">

        <thead>

          <tr>

            <th>
              DISCIPLINA
            </th>

            <th>
              PROFESSOR
            </th>

            <th>
              TURMA
            </th>

          </tr>

        </thead>

        <tbody>

  `;

  linhas.forEach(linha => {

    html += `

      <tr>

        <td>
          ${linha.disciplina}
        </td>

        <td>
          ${linha.professor}
        </td>

        <td>
          ${linha.turma}
        </td>

      </tr>

    `;

  });

  html += `

        </tbody>

      </table>

    </div>

  `;

  // =====================================
  // RENDERIZA
  // =====================================
  const container =
    document.getElementById(
      "resultadoRelatorioDPT"
    );

  if (!container) {

    console.warn(
      "❌ resultadoRelatorioDPT não encontrado"
    );

    return;
  }

  container.innerHTML = html;

}

// ======================================================
// 📄 EXPORTAR PDF RELATÓRIO DPT
// ======================================================
function exportarPDFRelatorioDPT() {

  try {

    if (!window.jspdf?.jsPDF) {

      alert("jsPDF não carregado.");
      return;
    }

    const { jsPDF } = window.jspdf;

    const pdf =
      new jsPDF("p", "mm", "a4");

    // ==================================================
    // 🌍 FILTROS ATIVOS
    // ==================================================
    const modalidade =
      document.getElementById(
        "selectModalidadeRelatorio"
      )?.value || "TODOS";

    const busca =
      document.getElementById(
        "buscaRelatorioDPT"
      )?.value || "";

    // ==================================================
    // 📋 TABELA
    // ==================================================
    const tabela =
      document.querySelector(
        ".relatorio-tabela"
      );

    if (!tabela) {

      alert(
        "Gere o relatório primeiro."
      );

      return;
    }

    // ==================================================
    // 📥 CAPTURA SOMENTE LINHAS VISÍVEIS
    // ==================================================
    const body = [];

    tabela
      .querySelectorAll("tbody tr")
      .forEach(tr => {

        // 🔥 ignora linhas escondidas
        if (
          tr.style.display === "none"
        ) {
          return;
        }

        const tds =
          tr.querySelectorAll("td");

        body.push([

          tds[0]?.innerText || "",
          tds[1]?.innerText || "",
          tds[2]?.innerText || ""

        ]);

      });

    if (!body.length) {

      alert(
        "Nenhum resultado encontrado."
      );

      return;
    }

    // ==================================================
    // 📄 CONFIG
    // ==================================================
    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    // ==================================================
    // 🏛️ CABEÇALHO PADRÃO SISTEMA
    // ==================================================
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

    pdf.setFontSize(14);

    pdf.setTextColor(46, 125, 50);

    pdf.setFont(undefined, "bold");

    pdf.text(
      "RELATÓRIO DISCIPLINA / PROFESSOR / TURMA",
      pageWidth / 2,
      20,
      { align: "center" }
    );

    pdf.setTextColor(0, 0, 0);

    pdf.setFont(undefined, "normal");

    // ==================================================
    // 🔎 FILTROS
    // ==================================================
    // =====================================
// 🎓 INFORMAÇÕES FILTRO
// =====================================
pdf.setDrawColor(46, 125, 50);

pdf.setFillColor(245, 245, 245);

pdf.roundedRect(
  15,
  30,
  pageWidth - 30,
  16,
  2,
  2,
  "FD"
);

pdf.setFontSize(10);

pdf.setFont(undefined, "bold");

pdf.setTextColor(46, 125, 50);

pdf.text(
  "MODALIDADE:",
  22,
  39
);

pdf.setTextColor(0);

pdf.setFont(undefined, "normal");

pdf.text(
  modalidade,
  55,
  39
);

pdf.setFont(undefined, "bold");

pdf.setTextColor(46, 125, 50);

pdf.text(
  "FILTRO:",
  110,
  39
);

pdf.setTextColor(0);

pdf.setFont(undefined, "normal");

pdf.text(
  busca || "TODOS",
  130,
  39
);

    // ==================================================
    // 📊 TABELA
    // ==================================================
    pdf.autoTable({

      startY: 50,

      head: [[

        "DISCIPLINA",
        "PROFESSOR",
        "TURMA"

      ]],

      body,

      theme: "grid",

      margin: {

        left: 6,
        right: 6

      },

      tableLineColor: [
        200,
        200,
        200
      ],

      tableLineWidth: 0.1,

      styles: {

        fontSize: 7,

        cellPadding: 2,

        valign: "middle"

      },

      headStyles: {

        fillColor: [46, 125, 50],

        textColor: [0, 0, 0],

        fontStyle: "bold",

        halign: "center"

      },

      columnStyles: {

        // DISCIPLINA
        0: {
          cellWidth: 90
        },

        // PROFESSOR
        1: {
          cellWidth: 55
        },

        // TURMA
        2: {
          cellWidth: 53,
          halign: "center"
        }

      },

      didParseCell: (data) => {

        // zebra leve
        if (
          data.row.index % 2 === 0 &&
          data.section === "body"
        ) {

          data.cell.styles.fillColor =
            [248, 248, 248];

        }

      }

    });

    // =====================================
// 📍 RODAPÉ EM TODAS AS PÁGINAS
// =====================================
const totalPaginas =
  pdf.internal.getNumberOfPages();

for (let i = 1; i <= totalPaginas; i++) {

  pdf.setPage(i);

  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const pageHeight =
    pdf.internal.pageSize.getHeight();

  pdf.setFontSize(8);

  pdf.setTextColor(90);

  pdf.text(
    "IFRO - Campus Cacoal | BR 364, Km 228, Lote 2-A | (69) 3443-2445 | dape.cacoal@ifro.edu.br",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );

}

    // ==================================================
    // 💾 SALVAR
    // ==================================================
    pdf.save(
      "RELATORIO_DPT.pdf"
    );

  } catch (e) {

    console.error(
      "❌ Erro PDF relatório:",
      e
    );

    alert(
      "Erro ao exportar PDF."
    );
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

  window.gerarRelatorioDisciplinaProfessorTurma =
    gerarRelatorioDisciplinaProfessorTurma;

    window.exportarPDFRelatorioDPT =
  exportarPDFRelatorioDPT;
})();