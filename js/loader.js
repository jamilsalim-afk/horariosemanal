// ======================================================
// 🌍 URLS DAS PLANILHAS
// ======================================================

const GOOGLE_SHEETS = {

  INTEGRADO:
    "https://docs.google.com/spreadsheets/d/1j33kiPqwtzZNuvkBgYDaIiXZvVMY_J0qWAtRfYGdnD8/export?format=xlsx",

  SUPERIOR1:
    "https://docs.google.com/spreadsheets/d/14ALXZgFIT68ee9ajuIdG63SpGVm0HyTjwp63-J6vRyg/export?format=xlsx",

  // 🔥 futuro
  SUPERIOR2: null,

  EVENTOS:
    "https://docs.google.com/spreadsheets/d/1IDjs0oS6lQBGDrL7ja1Ge0vaBdNCNIULDH7J5p89c5s/export?format=xlsx"

};

// ======================================================
// 🔥 DOWNLOAD XLSX
// ======================================================

async function baixarPlanilha(url) {

  try {

    const response = await fetch(url);

    const arrayBuffer = await response.arrayBuffer();

    const workbook = XLSX.read(arrayBuffer, {
      type: "array"
    });

    return workbook;

  } catch (err) {

    console.error("Erro ao baixar planilha:", err);

    return null;
  }
}

// ======================================================
// 🔥 CONVERTE ABA PARA MATRIZ
// ======================================================

function sheetParaMatriz(sheet) {

  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: ""
  });
}

// ======================================================
// 🔥 CARREGA PLANILHA COMPLETA
// ======================================================

async function carregarFonte(nome, url) {

  if (!url) return null;

  try {

    const workbook = await baixarPlanilha(url);

    if (!workbook) return null;

    // 🔥 pega primeira aba
    const primeiraAba =
      workbook.Sheets[workbook.SheetNames[0]];

    const matriz = sheetParaMatriz(primeiraAba);

    console.log(`✅ ${nome} carregado`);

    return {
      nome,
      workbook,
      matriz
    };

  } catch (err) {

    console.error(`Erro em ${nome}:`, err);

    return null;
  }
}

// ======================================================
// 🔥 CARREGA EVENTOS
// ======================================================

async function carregarEventos() {

  const workbook =
    await baixarPlanilha(GOOGLE_SHEETS.EVENTOS);

  if (!workbook) return [];

  const abaEventos =
    workbook.Sheets[workbook.SheetNames[0]];

  const matriz =
    sheetParaMatriz(abaEventos);

  return matriz;
}

// ======================================================
// 🔥 CARREGA PROFESSORES NORMALIZADOS
// ======================================================

async function carregarProfessoresNormalizados() {

  const workbook =
    await baixarPlanilha(GOOGLE_SHEETS.EVENTOS);

  if (!workbook) return [];

  // 🔥 segunda aba
  const aba =
    workbook.Sheets[workbook.SheetNames[1]];

  const matriz =
    sheetParaMatriz(aba);

  return matriz;
}

// ======================================================
// 🔥 CARREGA RELATÓRIO DPT
// ======================================================

async function carregarRelatorioDPT(url) {

  const workbook =
    await baixarPlanilha(url);

  if (!workbook) return [];

  const aba =
    workbook.Sheets[workbook.SheetNames[0]];

  return sheetParaMatriz(aba);
}

// ======================================================
// 🔥 CARREGA TODAS AS FONTES
// ======================================================

async function carregarTodasFontes() {

  UI.mostrarLoader("Baixando planilhas...");

  try {

    const [
      integrado,
      superior1,
      eventos,
      professores
    ] = await Promise.all([

      carregarFonte(
        "INTEGRADO",
        GOOGLE_SHEETS.INTEGRADO
      ),

      carregarFonte(
        "SUPERIOR1",
        GOOGLE_SHEETS.SUPERIOR1
      ),

      carregarEventos(),

      carregarProfessoresNormalizados()

    ]);

    AppState.fontes.integrado =
      integrado?.matriz || [];

    AppState.fontes.superior1 =
      superior1?.matriz || [];

    AppState.fontes.eventos =
      eventos || [];

    AppState.fontes.professores =
      professores || [];

    console.log("✅ Todas as fontes carregadas");

  } catch (err) {

    console.error(err);

    UI.toast(
      "Erro ao carregar planilhas",
      "error"
    );

  } finally {

    UI.fecharLoader();
  }
}