  function gerarFichaTurma(nomeTurma){

  const sem = document.getElementById('selectSemana').value;
  const dias = semanasAgrupadas[sem].dias;

  let resultado = [];

  Object.keys(dias).forEach(dia => {

    dias[dia].forEach(r => {

      const horario = r[1];
      const idx = dadosGlobais[0].indexOf(nomeTurma);
      const val = (r[idx] || "");

      if(val){
        resultado.push({
          dia,
          horario,
          aula: val
        });
      }

    });

  });

  return resultado;
}
