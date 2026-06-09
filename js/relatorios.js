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
