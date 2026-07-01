// ======================================================
// MÓDULO DE LABORATÓRIOS
// ======================================================

let mapaLaboratorios = {};

function inicializarLaboratorios() {

    preencherSelectLaboratorios();

    preencherSemanasLaboratorios();

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

    // Evita duplicidade do mesmo registro
    const existe = mapaLaboratorios[laboratorio].some(r =>

        r.data === registro.data &&
        r.horario === registro.horario &&
        r.turma === registro.turma &&
        r.valor === registro.valor &&
        r.modalidade === registro.modalidade

    );

    if (!existe) {
        mapaLaboratorios[laboratorio].push(registro);
    }

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

function trocarSemanaLaboratorio() {

    semanaLaboratorioSelecionada =
        document.getElementById("selectSemanaLaboratorio").value;

    renderLaboratorio();
}

function preencherSemanasLaboratorios() {

    const selectSemana = document.getElementById("selectSemanaLaboratorio");
    const labSelecionado = document.getElementById("selectLaboratorio").value;

    if (!selectSemana) return;

    const semanas = new Set();

    if (labSelecionado === "TODOS") {

        Object.values(mapaLaboratorios).forEach(lista => {

            lista.forEach(r => {

                const [d, m, a] = r.data.split("/");

                const dt = new Date(a, m - 1, d);

                dt.setDate(dt.getDate() - dt.getDay() + 1);

                semanas.add(dt.toLocaleDateString("pt-BR"));

            });

        });

    } else if (labSelecionado && mapaLaboratorios[labSelecionado]) {

        mapaLaboratorios[labSelecionado].forEach(r => {

            const [d, m, a] = r.data.split("/");

            const dt = new Date(a, m - 1, d);

            dt.setDate(dt.getDate() - dt.getDay() + 1);

            semanas.add(dt.toLocaleDateString("pt-BR"));

        });

    }

    const ordenadas = Array.from(semanas).sort((a, b) => {

        const [da, ma, aa] = a.split("/");
        const [db, mb, ab] = b.split("/");

        return new Date(aa, ma - 1, da) -
               new Date(ab, mb - 1, db);

    });

    selectSemana.innerHTML = "";

    // Calcula a segunda-feira da semana atual
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const segundaAtual = new Date(hoje);
    segundaAtual.setDate(hoje.getDate() - hoje.getDay() + 1);

    const semanaAtual = segundaAtual.toLocaleDateString("pt-BR");

    // Procura a semana atual na lista
    let indiceSelecionado = ordenadas.indexOf(semanaAtual);

    // Se não existir, seleciona a última disponível
    if (indiceSelecionado === -1) {
        indiceSelecionado = Math.max(0, ordenadas.length - 1);
    }

    ordenadas.forEach((semana, indice) => {

        selectSemana.innerHTML += `
            <option
                value="${semana}"
                ${indice === indiceSelecionado ? "selected" : ""}>
                Semana de ${semana}
            </option>
        `;

    });

}

function getDadosLaboratorio(labSelecionado, semanaSelecionada) {

    const registros = mapaLaboratorios[labSelecionado] || [];

    const resultado = [];

    registros.forEach(r => {

        const [d, m, a] = r.data.split("/");
        const dt = new Date(a, m - 1, d);

        const seg = new Date(dt.setDate(dt.getDate() - dt.getDay() + 1))
            .toLocaleDateString("pt-BR");

        if (!semanaSelecionada || semanaSelecionada === seg) {

            resultado.push({
                data: r.data,
                horario: r.horario,
                turma: r.turma,
                disciplina: normalizarDisciplinaLab(r.valor),
                modalidade: r.modalidade
            });

        }

    });

    return resultado;
}

function trocarLaboratorio() {

    preencherSemanasLaboratorios();

    renderLaboratorio();

}

function montarGradeLaboratorio(labSelecionado, semanaSelecionada) {

    const aulas = getDadosLaboratorio(labSelecionado, semanaSelecionada);

    const dias = [
        "SEGUNDA",
        "TERÇA",
        "QUARTA",
        "QUINTA",
        "SEXTA",
        "SÁBADO"
    ];

    const horarios = [

        "07:30 - 08:20",
        "08:20 - 09:10",

        "__INTERVALO_1__",

        "09:30 - 10:20",
        "10:20 - 11:10",
        "11:10 - 12:00",

        "__ALMOCO__",

        "13:50 - 14:40",
        "14:40 - 15:30",

        "__INTERVALO_2__",

        "15:50 - 16:40",
        "16:40 - 17:30",
        "17:30 - 18:20",

        "__JANTAR__",

        "19:00 - 19:50",
        "19:50 - 20:40",

        "__INTERVALO_3__",

        "20:50 - 21:40",
        "21:40 - 22:30"
    ];

    const grade = {};

    horarios.forEach(h => {
        grade[h] = {};
        dias.forEach(d => grade[h][d] = []);
    });

    aulas.forEach(aula => {

        const [d, m, a] = aula.data.split("/");
        const dt = new Date(a, m - 1, d);

        const diaSemana = [
            "DOMINGO",
            "SEGUNDA",
            "TERÇA",
            "QUARTA",
            "QUINTA",
            "SEXTA",
            "SÁBADO"
        ][dt.getDay()];

        const horario = horarios.find(h =>
            h.trim() === (aula.horario || "").trim()
        );

        if (!horario) return;

        if (!grade[horario]) return;

        if (!grade[horario][diaSemana]) return;

        grade[horario][diaSemana].push({

            turma: aula.turma,
            disciplina: aula.disciplina,
            modalidade: aula.modalidade

        });

    });

    return { dias, horarios, grade };
}

function renderLaboratorio() {

    const tabela = document.getElementById("tabelaLaboratorio");

    const lab = document.getElementById("selectLaboratorio").value;
const semana = document.getElementById("selectSemanaLaboratorio").value;

if (!lab) {
    tabela.innerHTML = `
        <div class="relatorio-placeholder">
            Selecione um laboratório.
        </div>`;
    return;
}

    if (lab === "TODOS") {

    renderTodosLaboratorios(semana);
    return;
}

    const { dias, horarios, grade } =
        montarGradeLaboratorio(lab, semana);

    let html = `
    <table class="tabela-professor">
        <thead>
            <tr>
                <th>Horário</th>
    `;

    dias.forEach(d => {
        html += `<th>${d}</th>`;
    });

    html += `</tr></thead><tbody>`;

    horarios.forEach(h => {

    const ehIntervalo =
        h.includes("__INTERVALO") ||
        h.includes("__ALMOCO__") ||
        h.includes("__JANTAR__");

    if (ehIntervalo) {

        html += `
        <tr>
            <td
                colspan="${dias.length + 1}"
                class="intervalo">

                ${formatarIntervalo(h)}

            </td>
        </tr>`;

        return;
    }

    html += `<tr>`;
    html += `<td><strong>${h}</strong></td>`;

        dias.forEach(d => {

            const celula = grade[h][d];

            if (!celula || celula.length === 0) {

    html += `
    <td class="livre">
        🟢 LIVRE
    </td>`;

} else if (celula.length === 1) {

    const aula = celula[0];

    html += `
    <td>
        <strong>${aula.disciplina}</strong><br><br>
        ${aula.turma}<br>
        <small>${aula.professor || ""}</small><br>
        <small style="color:${aula.modalidade === "INTEGRADO" ? "#16a34a" : "#2563eb"}">
            ${aula.modalidade}
        </small>
    </td>`;

} else {

    html += `
    <td style="background:#fee2e2; color:#991b1b;">
        ⚠ CONFLITO<br><br>
        ${celula.map(c => `
            ${c.disciplina} - ${c.turma}<br>
        `).join("")}
    </td>`;

}

        });

        html += `</tr>`;
    });

    html += `</tbody></table>`;

    tabela.innerHTML = html;
}

function renderTodosLaboratorios(semanaSelecionada) {

    const tabela = document.getElementById("tabelaLaboratorio");

    const labs = Object.keys(mapaLaboratorios).sort((a, b) => {

        const na = parseInt(a.match(/\d+/)?.[0] || 999);
        const nb = parseInt(b.match(/\d+/)?.[0] || 999);

        return na - nb;

    });

    const dias = [

        "SEGUNDA",
        "TERÇA",
        "QUARTA",
        "QUINTA",
        "SEXTA",
        "SÁBADO"

    ];

    const horarios = [

        "07:30 - 08:20",
        "08:20 - 09:10",

        "__INTERVALO_1__",

        "09:30 - 10:20",
        "10:20 - 11:10",
        "11:10 - 12:00",

        "__ALMOCO__",

        "13:50 - 14:40",
        "14:40 - 15:30",

        "__INTERVALO_2__",

        "15:50 - 16:40",
        "16:40 - 17:30",
        "17:30 - 18:20",

        "__JANTAR__",

        "19:00 - 19:50",
        "19:50 - 20:40",

        "__INTERVALO_3__",

        "20:50 - 21:40",
        "21:40 - 22:30"

    ];

    let html = `
    <table class="tabela-professor">

        <thead>

            <tr>

                <th>Horário</th>

                <th>Dia</th>

                ${labs.map(l => `<th>${l}</th>`).join("")}

            </tr>

        </thead>

        <tbody>
    `;

    horarios.forEach(h => {

        const ehIntervalo =
            h.includes("__INTERVALO") ||
            h.includes("__ALMOCO__") ||
            h.includes("__JANTAR__");

        if (ehIntervalo) {

            html += `
            <tr>

                <td colspan="${labs.length + 2}" class="intervalo">

                    ${formatarIntervalo(h)}

                </td>

            </tr>`;

            return;

        }

        dias.forEach((dia, indice) => {

            html += `<tr>`;

            if (indice === 0) {

                html += `
                <td rowspan="6">

                    <strong>${h}</strong>

                </td>`;

            }

            html += `<td><strong>${dia}</strong></td>`;

            labs.forEach(lab => {

                const { grade } = montarGradeLaboratorio(lab, semanaSelecionada);

                const celula = grade[h][dia];

                if (!celula.length) {

                    html += `
                    <td class="livre">

                        🟢 LIVRE

                    </td>`;

                    return;

                }

                if (celula.length === 1) {

                    const aula = celula[0];

                    html += `
                    <td>

                        <strong>${aula.disciplina}</strong><br>

                        ${aula.turma}<br>

                        <small style="color:${
                            aula.modalidade === "INTEGRADO"
                                ? "#16a34a"
                                : "#2563eb"
                        }">

                            ${aula.modalidade}

                        </small>

                    </td>`;

                    return;

                }

                html += `
                <td style="background:#fee2e2;color:#991b1b;">

                    ⚠ CONFLITO<br><br>

                    ${celula.map(c => `
                        ${c.disciplina}<br>
                        ${c.turma}<hr>
                    `).join("")}

                </td>`;

            });

            html += `</tr>`;

        });

    });

    html += `
        </tbody>
    </table>`;

    tabela.innerHTML = html;

}

function formatarIntervalo(h) {

    if (h.includes("ALMOCO")) return "🍽 ALMOÇO";
    if (h.includes("JANTAR")) return "🍽 JANTAR";

    if (h.includes("INTERVALO_1")) return "⏸ INTERVALO";
    if (h.includes("INTERVALO_2")) return "⏸ INTERVALO";
    if (h.includes("INTERVALO_3")) return "⏸ INTERVALO";

    return "⏸ INTERVALO";
}
