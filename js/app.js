async function init(){

  document.getElementById('searchProf').value = "";

  document.getElementById("painelAlteracoes").style.display = "none";

  try{

    // ==========================
    // CARREGA INTEGRADO
    // ==========================

    const urlIntegrado =
      `https://docs.google.com/spreadsheets/d/${SHEETS.INTEGRADO.id}/export?format=csv&gid=${SHEETS.INTEGRADO.gid}`;

    // ==========================
    // CARREGA SUPERIOR
    // ==========================

    const urlSuperior =
      `https://docs.google.com/spreadsheets/d/${SHEETS.SUPERIOR.id}/export?format=csv&gid=${SHEETS.SUPERIOR.gid}`;

    // ==========================
    // DOWNLOAD EM PARALELO
    // ==========================

    const [resIntegrado,resSuperior] =
      await Promise.all([
        fetch(urlIntegrado),
        fetch(urlSuperior)
      ]);

    // ==========================
    // CONVERTE CSV
    // ==========================

    dadosIntegrado =
      parseCSV(await resIntegrado.text());

    dadosSuperior =
      parseCSV(await resSuperior.text());

    // ==========================
    // DEFINE MODALIDADE ATIVA
    // ==========================

    const modalidadeAtual =
      document.getElementById(
        'selectModalidade'
      ).value;

    if(modalidadeAtual === "INTEGRADO"){
      dadosGlobais = dadosIntegrado;
    }else{
      dadosGlobais = dadosSuperior;
    }

    // ==========================
    // PROCESSA HORÁRIOS
    // ==========================

    processarDados();

    // ==========================
    // GERA DASHBOARD
    // ==========================

    gerarDashboard();

    // ==========================
    // VERIFICA ALTERAÇÕES
    // ==========================

    await carregarProfessores();

    setTimeout(() => {

      if(
        document.getElementById(
          'selectModalidade'
        ).value
      ){
        verificarMudancaAoAbrir();
      }

    },200);

  }catch(erro){

    console.error(erro);

    alert(
      "Erro ao carregar planilhas."
    );
  }
}

function trocarModalidade(){

  limparPainelAlteracoes();

  const mod =
    document.getElementById(
      "selectModalidade"
    ).value;

  if(mod==="INTEGRADO"){
    dadosGlobais = dadosIntegrado;
  }else{
    dadosGlobais = dadosSuperior;
  }

  processarDados();

  setTimeout(()=>{
    verificarMudancaAoAbrir();
  },200);
}
