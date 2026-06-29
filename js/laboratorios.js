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

    const match = texto.match(/_Lab\s*([^-]+)/i);

    if (!match) return null;

    return "Lab " + match[1].trim();

}

function normalizarDisciplinaLab(texto) {

    if (!texto) return "";

    return texto.replace(/_Lab\s*.*$/i, "").trim();

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

    const labs = Object.keys(mapaLaboratorios).sort((a, b) => {

        const na = parseInt(a.match(/\d+/)?.[0] || 999);
        const nb = parseInt(b.match(/\d+/)?.[0] || 999);

        return na - nb;

    });

    select.innerHTML = `
        <option value="TODOS">Todos os Laboratórios</option>
    `;

    labs.forEach(lab => {

        select.innerHTML += `
            <option value="${lab}">
                ${lab}
            </option>
        `;

    });

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
    const laboratorio = document.getElementById("selectLaboratorio").value;

    if (!tabela) return;

    if (laboratorio === "TODOS") {

        tabela.innerHTML = `
            <div style="
                padding:40px;
                text-align:center;
                font-size:22px;
                color:#666;">
                Selecione um laboratório para visualizar os horários.
            </div>
        `;

        return;

    }

    const registros = mapaLaboratorios[laboratorio] || [];

    let html = `
    <table class="tabelaHorario">
        <thead>
            <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Turma</th>
                <th>Disciplina</th>
                <th>Modalidade</th>
            </tr>
        </thead>
        <tbody>
    `;

    registros.forEach(r => {

        html += `
        <tr>
            <td>${r.data}</td>
            <td>${r.horario}</td>
            <td>${r.turma}</td>
            <td>${normalizarDisciplinaLab(r.valor)}</td>
            <td>${r.modalidade}</td>
        </tr>
        `;

    });

    html += `
        </tbody>
    </table>
    `;

    tabela.innerHTML = html;

}
