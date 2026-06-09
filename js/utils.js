 function deveCompararDia(dataStr){

  const [d,m,a] = dataStr.split('/');
  const data = new Date(a, m-1, d);

  const hoje = new Date();

  // remove hora
  hoje.setHours(0,0,0,0);
  data.setHours(0,0,0,0);

  // segunda-feira da semana atual
  const segunda = new Date(hoje);
  const diaSemana = segunda.getDay();
  const ajuste = diaSemana === 0 ? -6 : 1 - diaSemana;
  segunda.setDate(segunda.getDate() + ajuste);
  segunda.setHours(0,0,0,0);

  // sábado da semana atual
  const sabado = new Date(segunda);
  sabado.setDate(sabado.getDate() + 5);
  sabado.setHours(23,59,59,999);

  // só compara dias da semana atual
  if(data < segunda) return false;
  if(data > sabado) return false;

  // só compara de hoje para frente
  if(data < hoje) return false;

  return true;
}

function isSemanaPassada(dataStr){
  const [d,m,a] = dataStr.split('/');
  const data = new Date(a, m-1, d);

  const hoje = new Date();

  // pega segunda-feira da semana atual
  const dia = hoje.getDay();
  const diff = hoje.getDate() - dia + (dia === 0 ? -6 : 1);
  const segundaAtual = new Date(hoje.setDate(diff));

  return data < segundaAtual;
}

function valorMudou(v1, v2){
  const t1 = (v1 || "").trim();
  const t2 = (v2 || "").trim();

  if (t1 !== t2) return true;

  const n1 = normalizarTexto(t1);
  const n2 = normalizarTexto(t2);

  return n1 !== n2;
}

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

const CURSOS_MAP = [
  { key: "AGROEC", cl:"c-agroec", rgb:[232,245,233] },
  { key: "AGROPEC", cl:"c-agropec", rgb:[227,242,253] },
  { key: "INFO", cl:"c-info", rgb:[255,248,225] },
  { key: "GEO", cl:"c-geo", rgb:[243,229,245] },
  { key: "MAT", cl:"c-mat", rgb:[224,247,250] },
  { key: "AGRONEG", cl:"c-agroneg", rgb:[239,235,233] },
  { key: "ZOO", cl:"c-zoo", rgb:[252,228,236] },
  { key: "AGRON", cl:"c-agron", rgb:[241,248,233] }
];

function getCursoInfo(t){
  t = t.toUpperCase();
  const found = CURSOS_MAP.find(c => t.includes(c.key));
  return found || { cl:"", rgb:[255,255,255] };
}
