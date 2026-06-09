function semanaSelecionadaEhAtual(){

  const semanaSelecionada =
    document.getElementById('selectSemana').value;

  return semanaSelecionada === getSemanaAtual();
}

function limparPainelAlteracoes(){
  document.getElementById("conteudoAlteracoes").innerText = "";
  document.getElementById("painelAlteracoes").style.display = "none";
}
