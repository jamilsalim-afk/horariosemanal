function getCursoInfo(t){
t=t.toUpperCase();
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
