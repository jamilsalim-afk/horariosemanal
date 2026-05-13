const FERIADOS=[
"01/01/2026","16/02/2026","17/02/2026","18/02/2026","03/04/2026","20/04/2026","21/04/2026","01/05/2026",
"04/06/2026","05/06/2026","07/09/2026","12/10/2026","02/11/2026",
"15/11/2026","25/12/2026"
];

function normalizarTexto(txt){
    return (txt || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/\s+/g, " ") // espaços duplos
        .trim()
        .toUpperCase();
}
  
function isFeriado(d){return FERIADOS.includes(d);}

function parseCSV(text){
return text.split(/\r?\n/).map(l=>{
let r=[],c='',q=false;
for(let i=0;i<l.length;i++){
let ch=l[i];
if(ch=='"') q=!q;
else if(ch==','&&!q){r.push(c.trim());c='';}
else c+=ch;
}
r.push(c.trim());
return r;
});
}

function ordenarDatasBR(arr){
return arr.sort((a,b)=>{
const pa=a.split('/'),pb=b.split('/');
return new Date(pa[2],pa[1]-1,pa[0]) - new Date(pb[2],pb[1]-1,pb[0]);
});
}

function getSemanaAtual(){
  const hoje = new Date();

  // calcula segunda-feira da semana atual
  const dia = hoje.getDay(); // 0 = domingo
  const diff = hoje.getDate() - dia + (dia === 0 ? -6 : 1);

  const segunda = new Date(hoje.setDate(diff));

  const d = String(segunda.getDate()).padStart(2,'0');
  const m = String(segunda.getMonth()+1).padStart(2,'0');
  const a = segunda.getFullYear();

  return `${d}/${m}/${a}`;
}

function detectarClasse(valor){
    let valNorm = normalizarTexto(valor);

    if(valNorm.includes("RESERVA ENSINO")) return "reserva-ensino";
    if(valNorm.includes("PPS/ATENDIMENTO")) return "pps";
    if(valNorm.includes("ESTUDOS INDIVIDUAIS")) return "estudos";
    if(valNorm.includes("REUNIAO DE SERVIDORES")) return "reuniao";
    if(valNorm.includes("CAED") || valNorm.includes("PRE-CONSELHO")) return "caed";
    if(valNorm.includes("_REP -")) return "reposicao";

    if(
        valNorm.includes("[+]") ||
        valNorm.includes("*") ||
        valNorm.includes("[R]") ||
        valNorm.includes("INTERVALO")
    ){
        return "marcacao-extra";
    }

    return null;
}
