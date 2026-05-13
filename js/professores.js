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

function gerarGradeProfessor(nomeProf){

  const sem = document.getElementById('selectSemana').value;
  const dias = semanasAgrupadas[sem].dias;

  const diasSemana = ["SEGUNDA-FEIRA","TERÇA-FEIRA","QUARTA-FEIRA","QUINTA-FEIRA","SEXTA-FEIRA", "SÁBADO"];

  const mapa = {}; // horario -> {dia: valor}

  Object.keys(dias).forEach(dia => {

    const [d, m, a] = dia.split('/');
const dataObj = new Date(a, m - 1, d); // 🔥 forma correta (local time)
    const nomeDia = ["DOMINGO","SEGUNDA-FEIRA","TERÇA-FEIRA","QUARTA-FEIRA","QUINTA-FEIRA","SEXTA-FEIRA","SÁBADO"][dataObj.getDay()];

    if(!diasSemana.includes(nomeDia)) return;

    dias[dia].forEach(r => {

      const horario = r[1];

      if(!mapa[horario]){
        mapa[horario] = {};
      }

      turmasDaPlanilha.forEach(turma => {
        const idx = dadosGlobais[0].indexOf(turma);
        const val = (r[idx] || "");

        const nomeBusca = normalizarTexto(nomeProf);
const valNorm = normalizarTexto(val);

const nomesSeparados = valNorm.split(/[\n,;/]/); // quebra por vários separadores

if(nomesSeparados.some(n => n.includes(nomeBusca))){
          if(!mapa[horario][nomeDia]){
  mapa[horario][nomeDia] = [];
}

mapa[horario][nomeDia].push({
  turma: turma,
  aula: val
});
        }
      });

    });

  });

  return mapa;
}

function mostrarFichaProfessorTabela(nome){

  const grade = gerarGradeProfessor(nome);

  const diasSemana = ["SEGUNDA-FEIRA","TERÇA-FEIRA","QUARTA-FEIRA","QUINTA-FEIRA","SEXTA-FEIRA","SÁBADO"];

  let html = `
    <h3>👨‍🏫 FICHA SEMANAL - ${nome}</h3>
    <table border="1" style="border-collapse:collapse;width:100%;font-size:12px;">
      <tr>
        <th>Horário</th>
        ${diasSemana.map(d=>`<th>${d}</th>`).join("")}
      </tr>
  `;

  Object.keys(grade).forEach(horario => {

    html += `<tr>`;
    html += `<td><b>${horario}</b></td>`;

    diasSemana.forEach(dia=>{
      let conteudo = grade[horario][dia];

if(Array.isArray(conteudo)){
  conteudo = conteudo.map(item => {
    return `<b>${item.turma}</b><br>${item.aula}`;
  }).join("<hr style='margin:3px 0;'>");
}

html += `<td>${conteudo || "-"}</td>`;
    });

    html += `</tr>`;
  });

  html += `</table>`;

  document.getElementById("conteudoVagas").innerHTML = html;
  document.getElementById("painelVagas").style.display = "block";
}

  function gerarPreviewProfessor(){
  const nome = document.getElementById('searchProf').value.trim();

  if(nome.length > 3){
    mostrarFichaProfessorTabela(nome);

    document.querySelector("#painelVagas strong").innerText = "👨‍🏫 Ficha do Professor";

  } else {
    document.getElementById("painelVagas").style.display = "none";
  }
}
