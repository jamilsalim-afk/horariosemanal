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
