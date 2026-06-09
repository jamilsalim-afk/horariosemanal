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
