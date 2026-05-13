function filtrarProfessor(){
  const termo = document.getElementById('searchProf').value.toUpperCase();
  const tabela = document.getElementById('tabelaHorario');
  const celulas = tabela.getElementsByTagName('td');

  for(let i=0;i<celulas.length;i++){
    const td = celulas[i];
    const txt = td.innerText.toUpperCase();

    /* 🔥 IGNORA COLUNA DE HORÁRIO E CABEÇALHO DO DIA */
    if(
      td.classList.contains('time-col') ||
      td.parentElement.classList.contains('day-divider')
    ){
      td.classList.remove('opaco');
      td.classList.remove('highlight');
      continue;
    }

    if(termo && txt.includes(termo)){
      td.classList.add('highlight');
      td.classList.remove('opaco');
    } else if(termo){
      td.classList.remove('highlight');
      td.classList.add('opaco');
    } else {
      td.classList.remove('highlight');
      td.classList.remove('opaco');
    }
  }
}
