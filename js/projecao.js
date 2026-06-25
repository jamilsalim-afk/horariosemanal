// ============================================================
// MÓDULO DE PROJEÇÃO DE AULAS - IFRO Campus Cacoal
// Calcula aulas dadas + projetadas por professor até 27/11
// ============================================================

const DATA_FIM_LETIVO = "27/11/2026";

// ------------------------------------------------------------
// Converte string "dd/mm/aaaa" para objeto Date
// ------------------------------------------------------------
function projecao_parseData(str) {
    if (!str) return null;
    const [d, m, a] = str.split('/');
    const dt = new Date(Number(a), Number(m) - 1, Number(d));
    dt.setHours(0, 0, 0, 0);
    return dt;
}

// ------------------------------------------------------------
// Retorna true se a data (string dd/mm/aaaa) é feriado
// Usa o array FERIADOS já definido em config.js
// ------------------------------------------------------------
function projecao_isFeriado(dataStr) {
    return FERIADOS.includes(dataStr);
}

// ------------------------------------------------------------
// Gera todas as datas úteis (seg a sex) entre hoje e fim letivo
// excluindo feriados
// ------------------------------------------------------------
function projecao_datasUteisFuturas() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const fim = projecao_parseData(DATA_FIM_LETIVO);
    const datas = [];

    const cursor = new Date(hoje);
    cursor.setDate(cursor.getDate() + 1); // começa amanhã

    while (cursor <= fim) {
        const diaSemana = cursor.getDay();

        // apenas segunda a sexta
        if (diaSemana >= 1 && diaSemana <= 5) {
            const str = cursor.toLocaleDateString('pt-BR');
            if (!projecao_isFeriado(str)) {
                datas.push(str);
            }
        }

        cursor.setDate(cursor.getDate() + 1);
    }

    return datas;
}

// ------------------------------------------------------------
// Mapeia dia da semana número → sufixo da chave BASE_INT_*
// ------------------------------------------------------------
function projecao_sufixoDia(diaSemana) {
    const mapa = { 1: "SEG", 2: "TER", 3: "QUA", 4: "QUI", 5: "SEX" };
    return mapa[diaSemana] || null;
}

// ------------------------------------------------------------
// Monta a grade base por dia da semana para uma modalidade
// Retorna: { "SEG": [ {horario, turma, professor}, ... ], ... }
// ------------------------------------------------------------
function projecao_montarGradeBase(dadosModalidade) {
    const grade = {};

    const cabecalho = dadosModalidade[0];

    for (let i = 1; i < dadosModalidade.length; i++) {
        const linha = dadosModalidade[i];
        const dataStr = linha[0];
        const horario = (linha[1] || "").trim();

        if (!dataStr || !horario) continue;
        if (horario.toUpperCase().includes("INTERVALO")) continue;

        // Extrai o sufixo do dia (SEG, TER, etc.) da coluna A
        // que pode ser "BASE_INT_SEG" ou uma data real "09/02/2026"
        let sufixo = null;

        if (dataStr.includes("_")) {
            // formato BASE_INT_SEG
            const partes = dataStr.split("_");
            sufixo = partes[partes.length - 1].toUpperCase();
        } else {
            // formato de data dd/mm/aaaa
            const dt = projecao_parseData(dataStr);
            if (dt) sufixo = projecao_sufixoDia(dt.getDay());
        }

        if (!sufixo) continue;

        if (!grade[sufixo]) grade[sufixo] = [];

        for (let c = 2; c < linha.length; c++) {
            const valor = (linha[c] || "").trim();
            if (!valor || !valor.includes(" - ")) continue;

            const turma = (cabecalho[c] || "").trim();
            if (!turma) continue;

            const partes = valor.split(" - ");
            const professor = partes[partes.length - 1]
                .replace(/\[.*?\]/g, "")
                .replace(/\*/g, "")
                .trim();

            if (!professor) continue;

            grade[sufixo].push({ horario, turma, professor });
        }
    }

    return grade;
}

// ------------------------------------------------------------
// Conta aulas já dadas por professor (datas passadas)
// Usa BASE_GERAL que já está montado pelo sistema
// ------------------------------------------------------------
function projecao_contarAulasDadas() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const contagem = {};

    BASE_GERAL.forEach(aula => {
        const dt = projecao_parseData(aula.data);
        if (!dt || dt >= hoje) return;

        const valor = (aula.valor || "").trim();
        if (!valor.includes(" - ")) return;

        const partes = valor.split(" - ");
        const professor = partes[partes.length - 1]
            .replace(/\[.*?\]/g, "")
            .replace(/\*/g, "")
            .trim();

        if (!professor) return;

        contagem[professor] = (contagem[professor] || 0) + 1;
    });

    return contagem;
}

// ------------------------------------------------------------
// Conta aulas projetadas por professor (datas futuras)
// Para cada data futura útil, aplica a grade base do dia
// ------------------------------------------------------------
function projecao_contarAulasProjetadas() {
    const contagem = {};

    // Monta grades base de cada modalidade
    const gradeIntegrado = projecao_montarGradeBase(dadosIntegrado);
    const gradeSuperior  = projecao_montarGradeBase(dadosSuperior);

    const datasFuturas = projecao_datasUteisFuturas();

    datasFuturas.forEach(dataStr => {
        const dt = projecao_parseData(dataStr);
        if (!dt) return;

        const sufixo = projecao_sufixoDia(dt.getDay());
        if (!sufixo) return;

        const aulasDoDia = [
            ...(gradeIntegrado[sufixo] || []),
            ...(gradeSuperior[sufixo]  || [])
        ];

        aulasDoDia.forEach(aula => {
            const prof = aula.professor;
            if (!prof) return;
            contagem[prof] = (contagem[prof] || 0) + 1;
        });
    });

    return contagem;
}

// ------------------------------------------------------------
// Função principal: monta o relatório completo de projeção
// Retorna array ordenado por nome do professor
// ------------------------------------------------------------
function projecao_gerarRelatorio() {
    const dadas     = projecao_contarAulasDadas();
    const projetadas = projecao_contarAulasProjetadas();

    // Une todos os professores encontrados
    const todosProfessores = new Set([
        ...Object.keys(dadas),
        ...Object.keys(projetadas)
    ]);

    const relatorio = [];

    todosProfessores.forEach(prof => {
        const qtdDadas     = dadas[prof]     || 0;
        const qtdProjetadas = projetadas[prof] || 0;
        const total         = qtdDadas + qtdProjetadas;

        relatorio.push({
            professor:   prof,
            dadas:       qtdDadas,
            projetadas:  qtdProjetadas,
            total:       total
        });
    });

    // Ordena por nome
    relatorio.sort((a, b) =>
        a.professor.localeCompare(b.professor, 'pt-BR')
    );

    return relatorio;
}

// ------------------------------------------------------------
// Renderiza a aba de projeção na tela
// ------------------------------------------------------------
function renderProjecao() {

    const container = document.getElementById('containerProjecao');
    if (!container) return;

    container.innerHTML = `
        <div style="padding:10px;color:var(--text-muted);font-size:13px;">
            Calculando projeção...
        </div>
    `;

    // Pequeno delay para não travar a UI
    setTimeout(() => {

        const relatorio = projecao_gerarRelatorio();

        const hoje = new Date();
        const fim  = projecao_parseData(DATA_FIM_LETIVO);
        const diasRestantes = Math.ceil((fim - hoje) / (1000 * 60 * 60 * 24));
        const datasUteis = projecao_datasUteisFuturas();

        // Busca de filtro
        const termoBusca = normalizarTexto(
            (document.getElementById('searchProjecao')?.value || "")
        );

        let dados = relatorio;
        if (termoBusca) {
            dados = dados.filter(r =>
                normalizarTexto(r.professor).includes(termoBusca)
            );
        }

        const totalAulas = dados.reduce((s, r) => s + r.total, 0);

        let html = `
            <div class="projecao-info-bar">
                <span>📅 Dias úteis restantes até 27/11: <strong>${datasUteis.length}</strong></span>
                <span>👨‍🏫 Professores: <strong>${dados.length}</strong></span>
                <span>📚 Total de aulas projetadas: <strong>${totalAulas}</strong></span>
            </div>

            <div class="table-responsive">
            <table class="tabela-projecao">
                <thead>
                    <tr>
                        <th>Professor</th>
                        <th title="Aulas registradas em datas passadas">✅ Dadas</th>
                        <th title="Aulas previstas pela grade base até 27/11">🔮 Projetadas</th>
                        <th title="Total do ano letivo">📊 Total</th>
                    </tr>
                </thead>
                <tbody>
        `;

        dados.forEach(r => {
            const pct = r.total > 0
                ? Math.round((r.dadas / r.total) * 100)
                : 0;

            html += `
                <tr>
                    <td class="td-professor">${r.professor}</td>
                    <td class="td-numero">${r.dadas}</td>
                    <td class="td-numero td-projetado">${r.projetadas}</td>
                    <td class="td-numero td-total">
                        <div class="barra-progresso-wrap">
                            <span>${r.total}</span>
                            <div class="barra-progresso">
                                <div class="barra-fill" style="width:${pct}%"></div>
                            </div>
                            <small>${pct}% concluído</small>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
            </div>
        `;

        container.innerHTML = html;

    }, 50);
}

// ------------------------------------------------------------
// Exporta PDF da projeção
// ------------------------------------------------------------
function exportarProjecaoPDF() {

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const relatorio = projecao_gerarRelatorio();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    function cabecalho() {
        pdf.setFontSize(9);
        pdf.text(
            "INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DE RONDÔNIA - IFRO",
            pageWidth / 2, 8, { align: "center" }
        );
        pdf.text(
            "CAMPUS CACOAL - Departamento de Apoio ao Ensino - DAPE",
            pageWidth / 2, 12, { align: "center" }
        );
        pdf.text(
            `PROJEÇÃO DE AULAS POR PROFESSOR - ATÉ ${DATA_FIM_LETIVO}`,
            pageWidth / 2, 16, { align: "center" }
        );
    }

    const linhas = relatorio.map(r => [
        r.professor,
        r.dadas,
        r.projetadas,
        r.total
    ]);

    pdf.autoTable({
        head: [["Professor", "✅ Dadas", "🔮 Projetadas", "📊 Total"]],
        body: linhas,
        startY: 22,
        theme: "grid",
        margin: { top: 25, bottom: 20 },
        styles: {
            fontSize: 8,
            halign: "center",
            valign: "middle",
            cellPadding: 2
        },
        headStyles: {
            fillColor: [46, 125, 50],
            textColor: 255,
            fontStyle: "bold"
        },
        columnStyles: {
            0: { cellWidth: 90, halign: "left" },
            1: { cellWidth: 30 },
            2: { cellWidth: 35 },
            3: { cellWidth: 30 }
        },
        didDrawPage: () => cabecalho()
    });

    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(
            "IFRO - Campus Cacoal | BR 364, Km 228, Lote 2-A | (69) 3443-2445 | dape.cacoal@ifro.edu.br",
            pageWidth / 2, pageHeight - 10, { align: "center" }
        );
    }

    pdf.save("PROJECAO_AULAS_PROFESSORES.pdf");
}
