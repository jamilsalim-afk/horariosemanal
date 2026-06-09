let mapaProfessores = {};
let professoresLista = [];

/* =========================
   CARREGA LISTA DE PROFESSORES
   ========================= */
async function carregarProfessores() {
  const url =
    `https://docs.google.com/spreadsheets/d/${SHEETS.PROFESSORES.id}/export?format=csv&gid=${SHEETS.PROFESSORES.gid}`;

  const res = await fetch(url);
  const csv = await res.text();
  const dados = parseCSV(csv);

  // A = nome completo / B = variação
  mapaProfessores = {};
  professoresLista = [];

  for (let i = 1; i < dados.length; i++) {
    const nomeCompleto = (dados[i][0] || "").trim();
    const variacao = (dados[i][1] || "").trim();

    if (!nomeCompleto || !variacao) continue;

    mapaProfessores[variacao.toUpperCase()] = nomeCompleto;
    professoresLista.push(nomeCompleto);
  }

  preencherSelectProfessores();
}

/* =========================
   POPULA SELECT
   ========================= */
function preencherSelectProfessores() {
  const sel = document.getElementById("selectProfessor");

  sel.innerHTML = `<option value="">Selecione um professor</option>`;

  professoresLista.sort().forEach(p => {
    sel.innerHTML += `<option value="${p}">${p}</option>`;
  });

  sel.onchange = renderizarProfessor;
}

/* =========================
   PEGA VARIAÇÃO (NOME CURTO)
   ========================= */
function obterVariacaoProfessor(nomeCompleto) {
  for (const k in mapaProfessores) {
    if (mapaProfessores[k] === nomeCompleto) {
      return k; // VARIAÇÃO
    }
  }
  return nomeCompleto.toUpperCase();
}

/* =========================
   FILTRO PRINCIPAL
   ========================= */
function filtrarPorProfessor(valorCelula, variacao) {
  const v = normalizarTexto(valorCelula);
  return v.includes(variacao);
}

/* =========================
   RENDER PRINCIPAL
   ========================= */
function renderizarProfessor() {
  const professor = document.getElementById("selectProfessor").value;
  const sem = document.getElementById("selectSemana").value;

  if (!professor || !semanasAgrupadas[sem]) return;

  const variacao = obterVariacaoProfessor(professor);
  const dias = semanasAgrupadas[sem].dias;

  let htmlLista = `<h3>📅 Relatório semanal - ${professor}</h3>`;
  let htmlTabela = `<h3>📊 Resumo por disciplina</h3>`;

  const resumo = {};

  Object.keys(dias).forEach(dia => {

    dias[dia].forEach(r => {

      const horario = r[1];
      if (normalizarTexto(horario).includes("INTERVALO")) return;

      for (let j = 2; j < r.length; j++) {

        const valor = (r[j] || "").trim();
        if (!valor) continue;

        const valNorm = normalizarTexto(valor);

        if (!filtrarPorProfessor(valNorm, variacao)) continue;

        const turma = dadosGlobais[0][j];

        htmlLista += `
          <div class="card-prof">
            📅 ${dia} | ⏰ ${horario} | 🏫 ${turma}<br>
            📚 ${valor}
          </div>
        `;

        // disciplina
        const disc = valor.split("-")[0].trim();

        if (!resumo[disc]) {
          resumo[disc] = {
            meses: {},
            total: 0
          };
        }

        const mes = dia.split("/")[1];

        resumo[disc].meses[mes] =
          (resumo[disc].meses[mes] || 0) + 1;

        resumo[disc].total++;
      }
    });
  });

  /* =========================
     TABELA RESUMO
     ========================= */
  htmlTabela += `<table border="1" style="width:100%;border-collapse:collapse;">
    <tr>
      <th>Disciplina</th>
      <th>Jan</th><th>Fev</th><th>Mar</th><th>Abr</th>
      <th>Mai</th><th>Jun</th><th>Jul</th><th>Ago</th>
      <th>Set</th><th>Out</th><th>Nov</th><th>Dez</th>
      <th>Total</th>
    </tr>
  `;

  Object.keys(resumo).forEach(disc => {
    const m = resumo[disc].meses;

    htmlTabela += `<tr>
      <td>${disc}</td>
      <td>${m["01"] || 0}</td>
      <td>${m["02"] || 0}</td>
      <td>${m["03"] || 0}</td>
      <td>${m["04"] || 0}</td>
      <td>${m["05"] || 0}</td>
      <td>${m["06"] || 0}</td>
      <td>${m["07"] || 0}</td>
      <td>${m["08"] || 0}</td>
      <td>${m["09"] || 0}</td>
      <td>${m["10"] || 0}</td>
      <td>${m["11"] || 0}</td>
      <td>${m["12"] || 0}</td>
      <td><b>${resumo[disc].total}</b></td>
    </tr>`;
  });

  htmlTabela += `</table>`;

  document.getElementById("cardsProfessor").innerHTML = htmlLista;
  document.getElementById("tabelaProfessor").innerHTML = htmlTabela;
}
