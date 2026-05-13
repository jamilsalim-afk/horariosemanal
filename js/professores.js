// ===============================
// 🔍 FILTRO DE PROFESSOR (POR ABA)
// ===============================
function filtrarProfessor() {

  const input = document.getElementById('searchProf');
  if (!input) return;

  const termo = input.value.toUpperCase();

  const abaAtiva = document.querySelector(".tab.active")?.dataset.tab;
  if (!abaAtiva) return;

  const container = document.getElementById(`aba-${abaAtiva}`);
  if (!container) return;

  const celulas = container.getElementsByTagName('td');

  for (let i = 0; i < celulas.length; i++) {

    const td = celulas[i];
    const txt = td.innerText.toUpperCase();

    if (
      td.classList.contains('time-col') ||
      td.parentElement.classList.contains('day-divider')
    ) {
      td.classList.remove('highlight', 'opaco');
      continue;
    }

    if (termo && txt.includes(termo)) {
      td.classList.add('highlight');
      td.classList.remove('opaco');
    } else if (termo) {
      td.classList.remove('highlight');
      td.classList.add('opaco');
    } else {
      td.classList.remove('highlight', 'opaco');
    }
  }
}


// ===============================
// 🧠 NORMALIZAÇÃO DE PROFESSOR
// ===============================
function normalizarProfessor(nome) {

  if (!nome) return "";

  return normalizarTexto(nome)
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 2)
    .join(" ");
}


// ===============================
// 📊 GRADE DO PROFESSOR
// ===============================
function gerarGradeProfessor(nomeProf) {

  const sem =
    window.appState?.semana ||
    document.getElementById('selectSemana')?.value;

  const dias = semanasAgrupadas?.[sem]?.dias || {};

  const diasSemana = [
    "SEGUNDA-FEIRA","TERÇA-FEIRA","QUARTA-FEIRA",
    "QUINTA-FEIRA","SEXTA-FEIRA","SÁBADO"
  ];

  const mapa = {};

  const nomeBusca = normalizarTexto(nomeProf);

  Object.keys(dias).forEach(dia => {

    const [d, m, a] = dia.split('/');
    const dataObj = new Date(a, m - 1, d);

    const nomesDias = [
      "DOMINGO",
      "SEGUNDA-FEIRA",
      "TERÇA-FEIRA",
      "QUARTA-FEIRA",
      "QUINTA-FEIRA",
      "SEXTA-FEIRA",
      "SÁBADO"
    ];

    const nomeDia = nomesDias[dataObj.getDay()];
    if (!diasSemana.includes(nomeDia)) return;

    dias[dia].forEach(r => {

      const horario = r[1];

      if (!mapa[horario]) {
        mapa[horario] = {};
      }

      turmasDaPlanilha.forEach(turma => {

        const idx = dadosGlobais[0].indexOf(turma);
        const val = (r[idx] || "");

        const valNorm = normalizarTexto(val);

        if (valNorm.includes(nomeBusca)) {

          if (!mapa[horario][nomeDia]) {
            mapa[horario][nomeDia] = [];
          }

          mapa[horario][nomeDia].push({
            turma,
            aula: val
          });
        }
      });

    });
  });

  return mapa;
}


// ===============================
// 👨‍🏫 FICHA DO PROFESSOR (ABA)
// ===============================
function mostrarFichaProfessorTabela(nome) {

  const grade = gerarGradeProfessor(nome);

  const diasSemana = [
    "SEGUNDA-FEIRA","TERÇA-FEIRA","QUARTA-FEIRA",
    "QUINTA-FEIRA","SEXTA-FEIRA","SÁBADO"
  ];

  let html = `
    <h3>👨‍🏫 FICHA SEMANAL - ${nome}</h3>
    <table style="border-collapse:collapse;width:100%;font-size:12px;">
      <tr>
        <th>Horário</th>
        ${diasSemana.map(d => `<th>${d}</th>`).join("")}
      </tr>
  `;

  Object.keys(grade).forEach(horario => {

    html += `<tr>`;
    html += `<td><b>${horario}</b></td>`;

    diasSemana.forEach(dia => {

      let conteudo = grade[horario]?.[dia];

      if (Array.isArray(conteudo)) {
        conteudo = conteudo.map(item =>
          `<b>${item.turma}</b><br>${item.aula}`
        ).join("<hr style='margin:3px 0;'>");
      }

      html += `<td>${conteudo || "-"}</td>`;
    });

    html += `</tr>`;
  });

  html += `</table>`;

  const container = document.getElementById("aba-professor");

  if (container) {
    container.innerHTML = html;
  }
}


// ===============================
// 🔎 PREVIEW PROFESSOR (ABA)
// ===============================
function gerarPreviewProfessor() {

  const nome = document.getElementById('searchProf')?.value.trim();

  if (nome.length > 3) {
    mostrarFichaProfessorTabela(nome);
  } else {
    const container = document.getElementById("aba-professor");
    if (container) container.innerHTML = "";
  }
}
