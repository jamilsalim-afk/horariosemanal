// ======================================================
// MÓDULO DE LABORATÓRIOS
// ======================================================

let mapaLaboratorios = {};

function inicializarLaboratorios() {

    mapaLaboratorios = {};

    preencherSelectLaboratorios();

    preencherSemanasLaboratorios();

    renderLaboratorio();

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
