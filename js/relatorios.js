function gerarRelatorioDia(dia) {
  const vagas = coletarVagasDoDia(dia);

  let texto = `Olá Professores, na data de hoje (${dia}), identificamos várias turmas com aulas vagas. Segue a lista das turmas e horários.\n\n`;

  if (vagas.length === 0) {
    texto += "Não há aulas vagas no dia informado.";
    return texto;
  }

  // 🔥 AGRUPAMENTO
  const agrupado = {};

  vagas.forEach(v => {
    if (!agrupado[v.turma]) {
      agrupado[v.turma] = [];
    }

    agrupado[v.turma].push(v.horario);
  });

  // 🔥 MONTAGEM FINAL
  Object.keys(agrupado).forEach(turma => {

    const horariosUnicos = [...new Set(agrupado[turma])];

    texto += `📅 DATA: ${dia}\n`;
    texto += `🏫 TURMA: ${turma}\n`;
    texto += `⏰ AULAS VAGAS: ${horariosUnicos.join(", ")}\n\n`;
  });

  return texto;
}

function gerarRelatorioSemana() {
  const sem = document.getElementById('selectSemana').value;
  const dias = semanasAgrupadas[sem].dias;

  let texto = `Olá Professores, identificamos várias turmas com aula vaga esta semana. Segue a lista dos dias, turmas e horários.\n\n`;

  const agrupado = {};

  // 🔥 AGRUPA DIA + TURMA
  Object.keys(dias).forEach(dia => {
    const vagas = coletarVagasDoDia(dia);

    vagas.forEach(v => {
      const chave = `${dia}__${v.turma}`;

      if (!agrupado[chave]) {
        agrupado[chave] = {
          dia,
          turma: v.turma,
          horarios: []
        };
      }

      agrupado[chave].horarios.push(v.horario);
    });
  });

  const listaFinal = Object.values(agrupado);

  if (listaFinal.length === 0) {

  texto += "Não há aulas vagas na semana.";

  mostrarMensagemPainel(
    "📊 Relatório semanal de aulas vagas",
    texto
  );

  return;
}

  // 🔥 ORGANIZA POR DIA
  listaFinal.sort((a, b) => {
    const [da, ma, aa] = a.dia.split('/');
    const [db, mb, ab] = b.dia.split('/');
    return new Date(aa, ma-1, da) - new Date(ab, mb-1, db);
  });

  let diaAtual = "";

  listaFinal.forEach(item => {

    // 🔥 quebra por dia
    if (item.dia !== diaAtual) {
      texto += `📅 DATA: ${item.dia}\n\n`;
      diaAtual = item.dia;
    }

    const horariosUnicos = [...new Set(item.horarios)];

    texto += `🏫 TURMA: ${item.turma}\n`;
    texto += `⏰ AULAS VAGAS: ${horariosUnicos.join(", ")}\n\n`;
  });

  mostrarMensagemPainel(
  "📊 Relatório semanal de aulas vagas",
  texto
);
}
