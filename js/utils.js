// ======================================================
// 🔥 FERIADOS
// ======================================================
const FERIADOS = [
"01/01/2026","16/02/2026","17/02/2026","18/02/2026","03/04/2026","20/04/2026","21/04/2026","01/05/2026",
"04/06/2026","05/06/2026","07/09/2026","12/10/2026","02/11/2026",
"15/11/2026","25/12/2026"
];


// ======================================================
// 🔥 NORMALIZAÇÃO (ESSENCIAL DO SISTEMA)
// ======================================================
function normalizarTexto(txt){
  return (txt || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}


// ======================================================
// 🔥 FERIADO
// ======================================================
function isFeriado(d){
  return FERIADOS.includes(d);
}


// ======================================================
// 🔥 CSV MAIS SEGURO (GOOGLE SHEETS)
// ======================================================
function parseCSV(text){

  const linhas = text.split(/\r?\n/);

  return linhas.map(linha => {

    const resultado = [];
    let atual = "";
    let dentroAspas = false;

    for(let i=0;i<linha.length;i++){

      const ch = linha[i];

      if(ch === '"'){
        dentroAspas = !dentroAspas;
        continue;
      }

      if(ch === "," && !dentroAspas){
        resultado.push(atual.trim());
        atual = "";
      } else {
        atual += ch;
      }
    }

    resultado.push(atual.trim());
    return resultado;
  });
}


// ======================================================
// 🔥 ORDENA DATAS BR
// ======================================================
function ordenarDatasBR(arr){

  return arr.sort((a,b)=>{

    const pa = a.split('/');
    const pb = b.split('/');

    return new Date(pa[2],pa[1]-1,pa[0]) -
           new Date(pb[2],pb[1]-1,pb[0]);
  });
}


// ======================================================
// 🔥 SEMANA ATUAL (SEGUNDA-FEIRA)
// ======================================================
function getSemanaAtual(){

  const hoje = new Date();

  const dia = hoje.getDay(); // 0 domingo

  const diff = hoje.getDate() - dia + (dia === 0 ? -6 : 1);

  const segunda = new Date(hoje);

  segunda.setDate(diff);

  const d = String(segunda.getDate()).padStart(2,'0');
  const m = String(segunda.getMonth()+1).padStart(2,'0');
  const a = segunda.getFullYear();

  return `${d}/${m}/${a}`;
}
