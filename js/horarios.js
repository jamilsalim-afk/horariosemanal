function trocarSemana(){
  limparPainelAlteracoes(); // 🔥 ESSENCIAL
  renderizarTabela();
}

function processarDados(){
semanasAgrupadas={};
turmasDaPlanilha=dadosGlobais[0].slice(2).filter(t=>t);
let ultima="";
for(let i=1;i<dadosGlobais.length;i++){
let r=[...dadosGlobais[i]];
if(r[0]) ultima=r[0];
r[0]=ultima;
if(!r[0]) continue;

const [d,m,a]=r[0].split('/');
const dt=new Date(a,m-1,d);
const seg=new Date(dt.setDate(dt.getDate()-dt.getDay()+1)).toLocaleDateString('pt-BR');

if(!semanasAgrupadas[seg]) semanasAgrupadas[seg]={dias:{}};
if(!semanasAgrupadas[seg].dias[r[0]]) semanasAgrupadas[seg].dias[r[0]]=[];
semanasAgrupadas[seg].dias[r[0]].push(r);
}

const sel=document.getElementById('selectSemana');
sel.innerHTML="";
const semanaAtual = getSemanaAtual();

ordenarDatasBR(Object.keys(semanasAgrupadas)).forEach(s=>{
  sel.innerHTML+=`<option value="${s}">Semana de ${s}</option>`;
});

/* 🔥 SELECIONA SEMANA ATUAL SE EXISTIR */
if(semanasAgrupadas[semanaAtual]){
  sel.value = semanaAtual;
}

renderizarTabela();
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

    // 🔥 Regras de destaque
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
        html += `<tr class="day-divider">
                    <td colspan="${turmasAtivas.length+1}">
                        ${nomes[dObj.getDay()]} - ${dia}
                    </td>
                 </tr>`;

        html += `<tr>
                    <th class="time-col">Horário</th>`;

        turmasAtivas.forEach(t => {
            html += `<th class="${getCursoInfo(t).cl}">${t}</th>`;
        });

        html += `</tr>`;

        dias[dia].forEach(r => {
            const isInt = r[1].toUpperCase().includes("INTERVALO");
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
              
                // 🔥 manter regras antigas
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
        });

        html += `</table><br>`;
    });

    container.innerHTML = html;
  criarBotoesDias();
}

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

function mostrarRelatorioDia(dia){

  const texto = gerarRelatorioDia(dia);

  mostrarMensagemPainel(
    `📅 Relatório de aulas vagas - ${dia}`,
    texto
  );
}
