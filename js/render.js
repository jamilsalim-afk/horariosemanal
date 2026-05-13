// ======================================================
// 🔥 CURSO INFO
// ======================================================
function getCursoInfo(t){
  t = (t || "").toUpperCase();

  if(t.includes("AGROEC")) return {cl:"c-agroec",rgb:[232,245,233]};
  if(t.includes("AGROPEC")) return {cl:"c-agropec",rgb:[227,242,253]};
  if(t.includes("INFO")) return {cl:"c-info",rgb:[255,248,225]};
  if(t.includes("GEO")) return {cl:"c-geo",rgb:[243,229,245]};
  if(t.includes("MAT")) return {cl:"c-mat",rgb:[224,247,250]};
  if(t.includes("AGRONEG")) return {cl:"c-agroneg",rgb:[239,235,233]};
  if(t.includes("ZOO")) return {cl:"c-zoo",rgb:[252,228,236]};
  if(t.includes("AGRON")) return {cl:"c-agron",rgb:[241,248,233]};

  return {cl:"",rgb:[255,255,255]};
}

// ======================================================
// 🔥 PROCESSAR DADOS (SEM BUG DE ABA)
// ======================================================
function processarDados(){

  semanasAgrupadas = {};
  turmasDaPlanilha = dadosGlobais[0].slice(2).filter(t => t);

  let ultima = "";

  for(let i=1;i<dadosGlobais.length;i++){

    let r = [...dadosGlobais[i]];

    if(r[0]) ultima = r[0];
    r[0] = ultima;

    if(!r[0]) continue;

    const [d,m,a] = r[0].split('/');
    const dt = new Date(a,m-1,d);

    const seg = new Date(dt.setDate(dt.getDate()-dt.getDay()+1))
      .toLocaleDateString('pt-BR');

    if(!semanasAgrupadas[seg]){
      semanasAgrupadas[seg] = {dias:{}};
    }

    if(!semanasAgrupadas[seg].dias[r[0]]){
      semanasAgrupadas[seg].dias[r[0]] = [];
    }

    semanasAgrupadas[seg].dias[r[0]].push(r);
  }

  // 🔥 SELECT SEMANA (CORRETO PARA ABAS)
  const sel =
    document.querySelector("#aba-horarios .selectSemana") ||
    document.getElementById("selectSemana");

  sel.innerHTML = "";

  const semanaAtual = getSemanaAtual();

  ordenarDatasBR(Object.keys(semanasAgrupadas)).forEach(s=>{
    sel.innerHTML += `<option value="${s}">Semana de ${s}</option>`;
  });

  if(semanasAgrupadas[semanaAtual]){
    sel.value = semanaAtual;
  }

  renderizarTabela();
  filtrarProfessor();
gerarPreviewProfessor();
}


// ======================================================
// 🔥 TURMAS ATIVAS
// ======================================================
function getTurmasAtivasNaSemana(dias){

  return turmasDaPlanilha.filter(t => {

    const idx = dadosGlobais[0].indexOf(t);

    return Object.values(dias).some(d =>
      d.some(r => {
        const v = (r[idx] || "").trim();
        return v && v !== "-" && !r[1].toUpperCase().includes("INTERVALO");
      })
    );
  });
}


// ======================================================
// 🔥 RENDER PRINCIPAL (SEM DUPLICAÇÃO, SEM BUG)
// ======================================================
function abreviarTurma(nome){

  return nome

    /* =========================
       SEMESTRES
    ========================= */

    .replaceAll("1 SEMESTRE", "1º")
    .replaceAll("2 SEMESTRE", "2º")
    .replaceAll("3 SEMESTRE", "3º")
    .replaceAll("4 SEMESTRE", "4º")
    .replaceAll("5 SEMESTRE", "5º")
    .replaceAll("6 SEMESTRE", "6º")
    .replaceAll("7 SEMESTRE", "7º")
    .replaceAll("8 SEMESTRE", "8º")
    .replaceAll("9 SEMESTRE", "9º")
    .replaceAll("10 SEMESTRE", "10º")

    /* =========================
       INTEGRADO
    ========================= */

    .replaceAll("AGROECOLOGIA", "AGROEC.")
    .replaceAll("AGROPECUÁRIA", "AGROP.")
    .replaceAll("AGROPECUARIA", "AGROP.")
    .replaceAll("INFORMÁTICA", "INFO")
    .replaceAll("INFORMATICA", "INFO")

    /* =========================
       SUPERIOR
    ========================= */

    .replaceAll("GEOGRAFIA", "GEO.")
    .replaceAll("MATEMÁTICA", "MAT.")
    .replaceAll("MATEMATICA", "MAT.")
    .replaceAll("AGRONEGÓCIO", "AGRONEG.")
    .replaceAll("AGRONEGOCIO", "AGRONEG.")
    .replaceAll("ZOOTECNIA", "ZOO.")
    .replaceAll("AGRONOMIA", "AGRON.")

    /* =========================
       TURNOS
    ========================= */

    .replaceAll("MATUTINO", "MAT.")
    .replaceAll("VESPERTINO", "VESP.")
    .replaceAll("NOTURNO", "NOT.")

    /* =========================
       MODALIDADES
    ========================= */

    .replaceAll("INTEGRADO", "INT.")
    .replaceAll("SUPERIOR", "SUP.")

    /* =========================
       LIMPEZA
    ========================= */

    .replace(/\s+/g, " ")
    .trim();
}
    
  
function renderizarTabela(){
    const sem = document.getElementById('selectSemana').value;
    const dias = semanasAgrupadas[sem].dias;
    const container = document.getElementById('tabelaHorario');

    const turmasAtivas = document.getElementById('selectModalidade').value === "SUPERIOR"
        ? getTurmasAtivasNaSemana(dias)
        : turmasDaPlanilha;

    const nomes = ["DOMINGO","SEGUNDA-FEIRA","TERÇA-FEIRA","QUARTA-FEIRA","QUINTA-FEIRA","SEXTA-FEIRA","SÁBADO"];

    let html = "";

    const regrasDestaque = [
        { match: v => v.includes("RESERVA ENSINO"), classe: "reserva-ensino" },
        { match: v => v.includes("PPS/ATENDIMENTO"), classe: "pps" },
        { match: v => v.includes("ESTUDOS INDIVIDUAIS"), classe: "estudos" },
        { match: v => v.includes("REUNIAO DE SERVIDORES"), classe: "reuniao" },
        { match: v => v.includes("CAED") || v.includes("PRE-CONSELHO"), classe: "caed" },
        { match: v => v.includes("_REP -"), classe: "reposicao" }
    ];

    Object.keys(dias).forEach(dia => {

        const p = dia.split('/');
        const dObj = new Date(p[2], p[1]-1, p[0]);

        // 🔴 FERIADO
        if (isFeriado(dia)){
            html += `<table>
                <tr class="day-divider">
                    <td colspan="${turmasAtivas.length+1}">
                        ${nomes[dObj.getDay()]} - ${dia}
                    </td>
                </tr>
                <tr>
                    <td colspan="${turmasAtivas.length+1}" class="feriado">
                        FERIADO
                    </td>
                </tr>
            </table><br>`;
            return;
        }

        html += `<table>`;

        // 🔹 CABEÇALHO DO DIA
        html += `<tr class="day-divider">
                    <td colspan="${turmasAtivas.length+1}">
                        ${nomes[dObj.getDay()]} - ${dia}
                    </td>
                 </tr>`;

        // 🔹 CABEÇALHO DAS TURMAS
        html += `<tr>
                    <th class="time-col">Horário</th>`;

       turmasAtivas.forEach(t => {

    html += `
      <th
        class="${getCursoInfo(t).cl}"
        title="${t}"
      >
        ${abreviarTurma(t)}
      </th>
    `;

});

        html += `</tr>`;

        let linhas = dias[dia];
        let i = 0;

        while(i < linhas.length){

            const r = linhas[i];
            const horario = r[1];

            const eventoGeral = getEventoGeral(dia, horario);

if(eventoGeral){

    let inicio = i;
    let fim = i;

    const inicioMin = horaParaMinutos(linhas[inicio][1].split(" - ")[0]);

    // 🔥 VAI ATÉ O FINAL REAL DO EVENTO (ex: 18:20)
    while(fim + 1 < linhas.length){

        const prox = linhas[fim + 1];
        const horarioProx = prox[1];

        if(!horarioProx) break;

        const proxMin = horaParaMinutos(horarioProx.split(" - ")[0]);

        const proxEvento = getEventoGeral(dia, horarioProx);

        // 🔥 REGRA: continua se ainda estiver dentro do evento
        if(proxEvento === eventoGeral){
            fim++;
        }
        // 🔥 mantém INTERVALO dentro do bloco
        else if(horarioProx.toUpperCase().includes("INTERVALO")){
            fim++;
        }
        else{
            break;
        }
    }

    const totalLinhas = (fim - inicio) + 1;

    html += `
      <tr class="evento-geral">
        <td class="time-col">${linhas[inicio][1]}</td>
        <td rowspan="${totalLinhas}" colspan="${turmasAtivas.length}" class="evento-bloco">
          ${eventoGeral}
        </td>
      </tr>
    `;

    i = fim + 1;
    continue;
            }

            // 🔹 LINHA NORMAL (ORIGINAL PRESERVADA)
            const isInt = r[1] && r[1].toUpperCase().includes("INTERVALO");
            const linhaVazia = r.slice(2).every(v => !v || v.trim() === "");

            html += `<tr class="${isInt ? 'intervalo' : ''} ${linhaVazia ? 'linha-vazia' : ''}">
                        <td class="time-col">${r[1]}</td>`;

            turmasAtivas.forEach(t => {

                const idx = dadosGlobais[0].indexOf(t);
                let val = (r[idx] || "").trim();

                let classesExtras = [];
                const valNorm = normalizarTexto(val);

                regrasDestaque.forEach(regra => {
                    if (regra.match(valNorm)) {
                        classesExtras.push(regra.classe);
                    }
                });

                if (
                    val.includes("[+]") ||
                    val.includes("*") ||
                    val.includes("[R]") ||
                    valNorm.includes("INTERVALO")
                ) {
                    classesExtras.push("marcacao-extra");
                }

                html += `<td class="aula-cell ${getCursoInfo(t).cl} ${classesExtras.join(" ")}">
                            ${val}
                         </td>`;
            });

            html += `</tr>`;

            i++;
        }

        html += `</table><br>`;
    });

   container.innerHTML = html;

criarBotoesDias();

/* 🔥 reaplica busca automaticamente */
filtrarProfessor();
gerarPreviewProfessor();

}


// ======================================================
// 🔥 FILTRO PROFESSOR (SÓ ABA HORÁRIOS)
// ======================================================
function filtrarProfessor(){

  if(getAbaAtiva() !== "horarios") return;

  const termo = document.getElementById("searchProf").value.toUpperCase();
  const tabela = document.getElementById("tabelaHorario");

  const celulas = tabela.getElementsByTagName("td");

  for(let i=0;i<celulas.length;i++){

    const td = celulas[i];
    const txt = td.innerText.toUpperCase();

    if(
      td.classList.contains("time-col") ||
      td.parentElement.classList.contains("day-divider")
    ){
      td.classList.remove("opaco","highlight");
      continue;
    }

    if(termo && txt.includes(termo)){
      td.classList.add("highlight");
      td.classList.remove("opaco");
    } else if(termo){
      td.classList.add("opaco");
      td.classList.remove("highlight");
    } else {
      td.classList.remove("opaco","highlight");
    }
  }
}


// ======================================================
// 🔥 VAGAS / RELATÓRIOS (INALTERADO FUNCIONAL)
// ======================================================
function coletarVagasDoDia(dia) {

  const sem = getSemanaAtualSelecionada?.() || document.getElementById('selectSemana').value;
  const dias = semanasAgrupadas[sem]?.dias;

  const vagas = [];

  if (!dias || !dias[dia]) return vagas;

  // 🔥 filtra apenas SEG–SEX
  const [d, m, a] = dia.split('/');
  const dataObj = new Date(a, m - 1, d);
  const diaSemana = dataObj.getDay(); // 0 dom, 6 sáb

  if (diaSemana === 0 || diaSemana === 6) {
    return []; // ignora domingo e sábado
  }

  dias[dia].forEach(r => {

    const horario = r[1];

    turmasDaPlanilha.forEach(turma => {

      const idx = dadosGlobais[0].indexOf(turma);
      const val = (r[idx] || "").toUpperCase();

      if (
        val.includes("RESERVA ENSINO") ||
        val.includes("ESTUDOS INDIVIDUAIS")
      ) {
        vagas.push({ turma, horario });
      }
    });
  });

  return vagas;
}
