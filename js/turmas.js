function gerarFichaTurma(nomeTurma){

  const sem = getSemanaAtualSelecionada();
  const dias = semanasAgrupadas[sem]?.dias || {};

  let resultado = [];

  Object.keys(dias).forEach(dia => {

    dias[dia].forEach(r => {

      const horario = r[1];
      const idx = dadosGlobais[0].indexOf(nomeTurma);

      if(idx === -1) return;

      const val = (r[idx] || "").trim();

      if(val && val !== "-"){

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
