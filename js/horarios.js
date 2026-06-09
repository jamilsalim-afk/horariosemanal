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
