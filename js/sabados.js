function carregarSabados(){

  const modalidade =
    document.getElementById(
      "selectModalidadeSabado"
    ).value;

  const dados =
    modalidade === "INTEGRADO"
      ? dadosIntegrado
      : dadosSuperior;

  const sabados = [];

  let ultimaData = "";

  for(let i=1;i<dados.length;i++){

      if(dados[i][0])
         ultimaData = dados[i][0];

      if(!ultimaData)
         continue;

      const [d,m,a] =
        ultimaData.split('/');

      const data =
        new Date(a,m-1,d);

      if(data.getDay() !== 6)
         continue;

      if(!sabados.includes(ultimaData))
         sabados.push(ultimaData);
  }

  sabados.sort((a,b)=>{

      const pa = a.split('/');
      const pb = b.split('/');

      return new Date(
          pa[2],
          pa[1]-1,
          pa[0]
      ) - new Date(
          pb[2],
          pb[1]-1,
          pb[0]
      );

  });

  const select =
    document.getElementById(
      "selectSabado"
    );

  select.innerHTML = "";

  sabados.forEach(data=>{

      select.innerHTML += `
      <option value="${data}">
        ${data}
      </option>
      `;
  });

  renderizarSabadoSelecionado();
}
   
   function renderizarSabados(){

  const modalidade =
    document.getElementById(
      "selectModalidadeSabado"
    ).value;

  const dados =
    modalidade === "INTEGRADO"
      ? dadosIntegrado
      : dadosSuperior;

  let html = "";

  let ultimaData = "";

  let diasSabado = {};

  for(let i=1;i<dados.length;i++){

      const row = dados[i];

      if(row[0])
         ultimaData = row[0];

      const dataStr = ultimaData;

      if(!dataStr) continue;

      const [d,m,a] =
        dataStr.split('/');

      const data =
        new Date(a,m-1,d);

      if(data.getDay() !== 6)
         continue;

      if(!diasSabado[dataStr])
         diasSabado[dataStr] = [];

      diasSabado[dataStr].push(row);
  }

  const turmas =
    dados[0].slice(2).filter(Boolean);

  Object.keys(diasSabado).forEach(dia=>{

      html += `
      <table>

      <tr class="day-divider">
        <td colspan="${turmas.length+1}">
          SÁBADO LETIVO - ${dia}
        </td>
      </tr>

      <tr>
        <th class="time-col">Horário</th>
      `;

      turmas.forEach(t=>{

          html += `
          <th class="${getCursoInfo(t).cl}">
            ${t}
          </th>`;
      });

      html += "</tr>";

      diasSabado[dia].forEach(r=>{

          html += `
          <tr>

            <td class="time-col">
              ${r[1]}
            </td>
          `;

          turmas.forEach(t=>{

              const idx =
                dados[0].indexOf(t);

              const val =
                (r[idx] || "").trim();

              html += `
              <td class="aula-cell ${getCursoInfo(t).cl}">
                ${val}
              </td>`;
          });

          html += "</tr>";
      });

      html += "</table><br>";
  });

  document.getElementById(
    "tabelaSabados"
  ).innerHTML = html;
}

   function renderizarSabadoSelecionado(){

  const modalidade =
    document.getElementById(
      "selectModalidadeSabado"
    ).value;

  const sabado =
    document.getElementById(
      "selectSabado"
    ).value;

  const dados =
    modalidade === "INTEGRADO"
      ? dadosIntegrado
      : dadosSuperior;

  let ultimaData = "";

  const linhas = [];

  for(let i=1;i<dados.length;i++){

      if(dados[i][0])
         ultimaData = dados[i][0];

      if(ultimaData === sabado){
         linhas.push(dados[i]);
      }
  }

  const turmas =
    dados[0]
      .slice(2)
      .filter(Boolean);

  let html = `
  <table>

    <tr class="day-divider">
      <td colspan="${turmas.length+1}">
        SÁBADO LETIVO - ${sabado}
      </td>
    </tr>

    <tr>
      <th class="time-col">
        Horário
      </th>
  `;

  turmas.forEach(t=>{

      html += `
      <th class="${getCursoInfo(t).cl}">
        ${t}
      </th>
      `;
  });

  html += "</tr>";

  linhas.forEach(r=>{

      html += `
      <tr>

        <td class="time-col">
          ${r[1]}
        </td>
      `;

      turmas.forEach(t=>{

          const idx =
            dados[0].indexOf(t);

          const valor =
            (r[idx] || "").trim();

          html += `
          <td class="aula-cell ${getCursoInfo(t).cl}">
            ${valor}
          </td>
          `;
      });

      html += "</tr>";
  });

  html += "</table>";

  document.getElementById(
    "tabelaSabados"
  ).innerHTML = html;
}
