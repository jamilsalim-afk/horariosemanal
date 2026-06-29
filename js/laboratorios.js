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

function extrairNomeLaboratorio(texto) {

    if (!texto) return null;

    const match = texto.match(/_Lab\s*(.+)$/i);

    return match ? "Lab " + match[1].trim() : null;

}

function normalizarDisciplinaLab(texto) {

    if (!texto) return "";

    return texto.replace(/_Lab\s*.+$/i, "").trim();

}

function adicionarAoMapaLaboratorios({
    semana,
    dia,
    horario,
    disciplina,
    professor,
    turma,
    modalidade
}) {

    const laboratorio = extrairNomeLaboratorio(disciplina);

    if (!laboratorio) return;

    disciplina = normalizarDisciplinaLab(disciplina);

    if (!mapaLaboratorios[laboratorio])
        mapaLaboratorios[laboratorio] = {};

    if (!mapaLaboratorios[laboratorio][semana])
        mapaLaboratorios[laboratorio][semana] = {};

    if (!mapaLaboratorios[laboratorio][semana][dia])
        mapaLaboratorios[laboratorio][semana][dia] = {};

    mapaLaboratorios[laboratorio][semana][dia][horario] = {

        disciplina,
        professor,
        turma,
        modalidade

    };

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
