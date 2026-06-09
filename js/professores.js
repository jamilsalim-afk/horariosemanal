let professoresLista = [];
let mapaProfessores = {};

async function carregarProfessores(){

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEETS.PROFESSORES.id}/export?format=csv&gid=${SHEETS.PROFESSORES.gid}`;

  const res = await fetch(url);
  const dados = parseCSV(await res.text());

  professoresLista = [];
  mapaProfessores = {};

  for(let i=1;i<dados.length;i++){

    const nomeExibicao = (dados[i][0] || "").trim();
    const variacao = (dados[i][1] || "").trim();

    if(!nomeExibicao || !variacao) continue;

    professoresLista.push({
      nome: nomeExibicao,
      variacao: variacao
    });

    mapaProfessores[variacao.toUpperCase()] = nomeExibicao;
  }

  popularSelectProfessores();
}

function popularSelectProfessores(){

  const sel = document.getElementById("selectProfessor");
  sel.innerHTML = "";

  professoresLista.forEach(p=>{
    sel.innerHTML += `
      <option value="${p.variacao}">
        ${p.nome}
      </option>
    `;
  });

  sel.onchange = renderizarProfessor;
  renderizarProfessor();
}

function renderizarProfessor(){

  const variacao =
    document.getElementById("selectProfessor").value;

  const nomeCompleto =
    mapaProfessores[variacao.toUpperCase()] || variacao;

  const sem =
    document.getElementById("selectSemana").value;

  const dias =
    semanasAgrupadas[sem].dias;

  const linhas = [];

  Object.keys(dias).forEach(dia=>{

    dias[dia].forEach(r=>{

      const horario = r[1];

      for(let j=2;j<r.length;j++){

        const cell = (r[j] || "").trim();

        if(!cell) continue;

        if(cell.toUpperCase().includes(variacao.toUpperCase())){

          const turma =
            dadosGlobais[0][j];

          const disciplina =
            cell.split("-")[0].trim();

          linhas.push({
            dia,
            horario,
            turma,
            disciplina
          });
        }
      }
    });
  });

  montarTabelaProfessor(nomeCompleto, linhas);
  montarResumoProfessor(linhas);
}

function montarTabelaProfessor(nome, linhas){

  let html = `
    <h2 style="margin:10px 0;">👨‍🏫 ${nome}</h2>

    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <th>Dia</th>
        <th>Horário</th>
        <th>Turma</th>
        <th>Disciplina</th>
      </tr>
  `;

  linhas.forEach(l=>{
    html += `
      <tr>
        <td>${l.dia}</td>
        <td>${l.horario}</td>
        <td>${l.turma}</td>
        <td>${l.disciplina}</td>
      </tr>
    `;
  });

  html += "</table>";

  document.getElementById("tabelaProfessor").innerHTML = html;
}

function montarResumoProfessor(linhas){

  const total = linhas.length;

  const turmas = [...new Set(linhas.map(l=>l.turma))];
  const disciplinas = [...new Set(linhas.map(l=>l.disciplina))];

  document.getElementById("cardsProfessor").innerHTML = `
    <div class="dashboard-grid">

      <div class="dash-card">
        <h3>Total de Aulas</h3>
        <strong>${total}</strong>
      </div>

      <div class="dash-card">
        <h3>Turmas</h3>
        <strong>${turmas.length}</strong>
      </div>

      <div class="dash-card">
        <h3>Disciplinas</h3>
        <strong>${disciplinas.length}</strong>
      </div>

    </div>
  `;
}
