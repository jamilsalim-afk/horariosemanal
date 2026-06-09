function semanaSelecionadaEhAtual(){

  const semanaSelecionada =
    document.getElementById('selectSemana').value;

  return semanaSelecionada === getSemanaAtual();
}
