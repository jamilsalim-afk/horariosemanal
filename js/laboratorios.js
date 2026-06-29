// ======================================================
// MÓDULO DE LABORATÓRIOS
// ======================================================

let mapaLaboratorios = {};

function inicializarLaboratorios() {

    preencherSelectLaboratorios();

    preencherSemanasLaboratorios();

    renderLaboratorio();

    console.log("Mapa de Laboratórios:", mapaLaboratorios);

}

function extrairNomeLaboratorio(texto) {

    if (!texto) return null;

    const match = texto.match(/_Lab\s*(.+)$/i);

    return match ? "Lab " + match[1].trim() : null;

}

function normalizarDisciplinaLab(texto) {

    if (!texto) return "";

    return texto.replace(/_Lab\s*.+$/i, "").trim();

}

function adicionarRegistroLaboratorio(registro) {

    const laboratorio = extrairNomeLaboratorio(registro.valor);

    if (!laboratorio) return;

    if (!mapaLaboratorios[laboratorio]) {
        mapaLaboratorios[laboratorio] = [];
    }

    mapaLaboratorios[laboratorio].push(registro);

}

function preencherSelectLaboratorios() {

    const select = document.getElementById("selectLaboratorio");

    if (!select) return;

    select.innerHTML = `
        <option value="TODOS">Todos os Laboratórios</option>
    `;

}

function preencherSemanasLaboratorios() {

    const select = document.getElementById("selectSemanaLaboratorio");

    if (!select) return;

    select.innerHTML = `
        <option value="">Semana</option>
    `;

}

function renderLaboratorio() {

    const tabela = document.getElementById("tabelaLaboratorio");

    if (!tabela) return;

    tabela.innerHTML = `
        <div style="
            text-align:center;
            padding:60px;
            font-size:22px;
            color:#777;">
            💻 Laboratórios prontos para receber os dados.
        </div>
    `;

}
