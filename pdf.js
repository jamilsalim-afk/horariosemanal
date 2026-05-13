const coresPDF = {
    "reserva-ensino": [212, 237, 218], // verde claro
    "pps": [11, 61, 145], // azul escuro (texto)
    "estudos": [255, 229, 180], // laranja claro
    "reuniao": [208, 235, 255], // azul claro
    "caed": [255, 243, 205], // amarelo
    "reposicao": [30, 126, 52], // verde escuro
    "marcacao-extra": [224, 224, 224]
};

function exportarPDF(){
const { jsPDF } = window.jspdf;
const pdf = new jsPDF('l','mm','a4');

const sem = document.getElementById('selectSemana').value;
const diasObj = semanasAgrupadas[sem].dias;

const turmasAtivas = document.getElementById('selectModalidade').value === "SUPERIOR"
? getTurmasAtivasNaSemana(diasObj)
: turmasDaPlanilha;

const nomes = ["DOMINGO","SEGUNDA-FEIRA","TERÇA-FEIRA","QUARTA-FEIRA","QUINTA-FEIRA","SEXTA-FEIRA","SÁBADO"];
};
