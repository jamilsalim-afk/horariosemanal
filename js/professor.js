// ============================================================
// professor.js — PRD/PGD integrado na grade com rowspan
// ============================================================

// Horários da manhã e tarde (sem intervalos/almoço)
const HORARIOS_MANHA = [
    "07:30 - 08:20",
    "08:20 - 09:10",
    "09:30 - 10:20",
    "10:20 - 11:10",
    "11:10 - 12:00"
];
const HORARIOS_TARDE = [
    "13:50 - 14:40",
    "14:40 - 15:30",
    "15:50 - 16:40",
    "16:40 - 17:30",
    "17:30 - 18:20"
];
const HORARIOS_NOITE = [
    "19:00 - 19:50",
    "19:50 - 20:40",
    "20:50 - 21:40",
    "21:40 - 22:30"
];

const TODOS_HORARIOS = [
    "07:30 - 08:20","08:20 - 09:10",
    "__INTERVALO_1__",
    "09:30 - 10:20","10:20 - 11:10","11:10 - 12:00",
    "__ALMOCO__",
    "13:50 - 14:40","14:40 - 15:30",
    "__INTERVALO_2__",
    "15:50 - 16:40","16:40 - 17:30","17:30 - 18:20",
    "__JANTAR__",
    "19:00 - 19:50","19:50 - 20:40",
    "__INTERVALO_3__",
    "20:50 - 21:40","21:40 - 22:30"
];

const DIAS_SEMANA = ["SEGUNDA","TERÇA","QUARTA","QUINTA","SEXTA","SÁBADO"];
const DIAS_INDEX  = ["DOMINGO","SEGUNDA","TERÇA","QUARTA","QUINTA","SEXTA","SÁBADO"];

// Índice do dia na ordem SEG=0..SEX=4 (para PRD_PGD_LABELS)
const DIA_IDX = { "SEGUNDA":0,"TERÇA":1,"QUARTA":2,"QUINTA":3,"SEXTA":4 };

// ============================================================
function montarIndiceProfessores() {
    INDEX_PROFESSOR = {};
    INDEX_TURMA = {};
    BASE_GERAL.forEach(item => {
        const valor = item.valor || "";
        if (!valor.includes(" - ")) return;
        const [disciplina, professor] = valor.split(" - ").map(v => v.trim());
        if (!professor) return;
        const profNorm = normalizarProfessor(professor);
        if (!INDEX_PROFESSOR[profNorm]) INDEX_PROFESSOR[profNorm] = [];
        const reg = { data:item.data, horario:item.horario, turma:item.turma, disciplina, professor, modalidade:item.modalidade };
        INDEX_PROFESSOR[profNorm].push(reg);
        const turma = item.turma || "";
        if (!turma) return;
        if (!INDEX_TURMA[turma]) INDEX_TURMA[turma] = [];
        INDEX_TURMA[turma].push(reg);
    });
}

function normalizarProfessor(nome) {
    if (!nome) return "";
    return nome.toString().toUpperCase()
        .replace(/\[.*?\]/g,"").replace(/\*/g,"").replace(/\s+/g," ").trim();
}

function carregarListaProfessores() {
    const select = document.getElementById("selectProfessor");
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um professor</option>';
    const ativos = Object.keys(INDEX_PROFESSOR);
    dadosProfessores.slice(1)
        .sort((a,b) => (a[0]||"").localeCompare(b[0]||"","pt-BR"))
        .forEach(linha => {
            const nomeCompleto = (linha[0]||"").trim();
            if (!nomeCompleto) return;
            const nomeCurto = normalizarProfessor(linha[1]||nomeCompleto);
            if (!ativos.includes(nomeCurto)) return;
            select.innerHTML += `<option value="${nomeCompleto}">${nomeCompleto}</option>`;
        });
}

function traduzirProfessor(nomeCompleto) {
    if (!nomeCompleto) return "";
    const norm = normalizarProfessor(nomeCompleto);
    for (let i=1; i<dadosProfessores.length; i++) {
        if (normalizarProfessor(dadosProfessores[i][0]) === norm)
            return normalizarProfessor(dadosProfessores[i][1]);
    }
    return norm;
}

function obterNomeCompletoProfessor(nome) {
    if (!nome) return "";
    const norm = normalizarProfessor(nome);
    for (let i=1; i<dadosProfessores.length; i++) {
        if (normalizarProfessor(dadosProfessores[i][1]) === norm)
            return (dadosProfessores[i][0]||"").trim();
    }
    return nome;
}

// ============================================================
// PRD / PGD
// ============================================================
function obterPrdPgdProfessor(nomeCompleto) {
    const norm = normalizarProfessor(nomeCompleto);
    for (let i=1; i<dadosProfessores.length; i++) {
        if (normalizarProfessor(dadosProfessores[i][0]) !== norm) continue;
        const linha = dadosProfessores[i];
        const prd = PRD_PGD_LABELS.map((_,idx) => (linha[PRD_INICIO_COL+idx]||"").trim().toUpperCase()==="X");
        const pgd = PRD_PGD_LABELS.map((_,idx) => (linha[PGD_INICIO_COL+idx]||"").trim().toUpperCase()==="X");
        return { prd, pgd };
    }
    return { prd:Array(10).fill(false), pgd:Array(10).fill(false) };
}

// Retorna o tipo de célula para um horário+dia: null | {tipo:'PRD'|'PGD', cor, rowspan, primeiro}
// primeiro=true na primeira linha do bloco (onde vai renderizar a célula mesclada)
// primeiro=false nas demais (pula a célula — já coberta pelo rowspan)
function getPrdPgdCelula(horario, dia, prd, pgd) {
    const diaIdx = DIA_IDX[dia];
    if (diaIdx === undefined) return null; // SÁBADO não tem PRD/PGD

    const blocos = [
        { label:"PRD", cor:"#2e7d32", bgLight:"#e8f5e9", horarios: HORARIOS_MANHA, turnoIdx: 0 },
        { label:"PRD", cor:"#2e7d32", bgLight:"#e8f5e9", horarios: HORARIOS_TARDE, turnoIdx: 1 },
        { label:"PGD", cor:"#1565c0", bgLight:"#e3f2fd", horarios: HORARIOS_MANHA, turnoIdx: 0, fonte: pgd },
        { label:"PGD", cor:"#1565c0", bgLight:"#e3f2fd", horarios: HORARIOS_TARDE, turnoIdx: 1, fonte: pgd }
    ];

    for (const bloco of blocos) {
        const fonte = bloco.fonte || prd;
        const marcado = fonte[diaIdx * 2 + bloco.turnoIdx];
        if (!marcado) continue;
        if (!bloco.horarios.includes(horario)) continue;

        const isPrimeiro = bloco.horarios[0] === horario;
        return {
            tipo:     bloco.label,
            cor:      bloco.cor,
            bgLight:  bloco.bgLight,
            rowspan:  bloco.horarios.length,
            primeiro: isPrimeiro
        };
    }
    return null;
}

function getDadosProfessor(professor, semana) {
    const profCurto = traduzirProfessor(professor);
    return (INDEX_PROFESSOR[profCurto]||[]).filter(aula => obterInicioSemana(aula.data) === semana);
}

function carregarSemanasProfessor() {
    const origem  = document.getElementById('selectSemana');
    const destino = document.getElementById('selectSemanaProfessor');
    if (!origem||!destino) return;
    destino.innerHTML = origem.innerHTML;
    destino.value = origem.value;
    destino.dataset.ready = "true";
}

// ============================================================
// RENDER PRINCIPAL
// ============================================================
function renderProfessor() {
    const semanaEl = document.getElementById("selectSemanaProfessor");
    if (semanaEl && semanaEl.dataset.ready !== "true") return;
    const professor = document.getElementById("selectProfessor")?.value;
    const semana    = semanaEl?.value;
    if (!professor || !semana) return;

    const container = document.getElementById("tabelaProfessor");
    const aulas = getDadosProfessor(professor, semana);
    const { prd, pgd } = obterPrdPgdProfessor(professor);

    const totalAulas  = aulas.length;
    const totalTurmas = new Set(aulas.map(a=>a.turma)).size;
    const totalDias   = new Set(aulas.map(a=>a.data)).size;

    // Monta grade de aulas
    const grade = {};
    TODOS_HORARIOS.forEach(h => {
        grade[h] = {};
        DIAS_SEMANA.forEach(d => { grade[h][d] = []; });
    });
    aulas.forEach(aula => {
        const [d,m,a] = aula.data.split("/");
        const dia = DIAS_INDEX[new Date(a,m-1,d).getDay()];
        const horario = TODOS_HORARIOS.find(h => h.trim()===(aula.horario||"").trim());
        if (!horario||!grade[horario]||!grade[horario][dia]) return;
        grade[horario][dia].push(`
            <div style="margin-bottom:3px;padding:3px;border-left:3px solid #15803d;">
                <b>${aula.turma}</b><br>${aula.disciplina}
            </div>`);
    });

    // Cards de resumo
    let html = `
    <div style="display:flex;gap:15px;margin-bottom:15px;flex-wrap:wrap;">
        <div style="background:var(--surface);color:var(--text);padding:15px;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,.15);min-width:150px;text-align:center;">
            <div style="font-size:11px;color:var(--text-soft)">TOTAL DE AULAS</div>
            <div style="font-size:28px;font-weight:bold;color:#2e7d32;">${totalAulas}</div>
        </div>
        <div style="background:var(--surface);color:var(--text);padding:15px;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,.15);min-width:150px;text-align:center;">
            <div style="font-size:11px;color:var(--text-soft)">TURMAS</div>
            <div style="font-size:28px;font-weight:bold;color:#1565c0;">${totalTurmas}</div>
        </div>
        <div style="background:var(--surface);color:var(--text);padding:15px;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,.15);min-width:150px;text-align:center;">
            <div style="font-size:11px;color:var(--text-soft)">DIAS COM AULA</div>
            <div style="font-size:28px;font-weight:bold;color:#ef6c00;">${totalDias}</div>
        </div>
    </div>

    <table style="width:100%;border-collapse:collapse;background:var(--surface);color:var(--text);font-size:12px;">
    <thead>
    <tr style="background:#15803d;color:white;">
        <th style="padding:8px;border:1px solid #ccc;min-width:85px;">HORÁRIO</th>
        ${DIAS_SEMANA.map(d=>`<th style="padding:8px;border:1px solid #ccc;">${d}</th>`).join("")}
    </tr>
    </thead>
    <tbody>`;

    // Células a pular por causa de rowspan
    const pular = {}; // chave: "horario|dia"

    TODOS_HORARIOS.forEach(h => {
        // Separadores
        const sep = {
            "__INTERVALO_1__": ["09:10 - 09:30","INTERVALO","var(--intervalo)"],
            "__INTERVALO_2__": ["15:30 - 15:50","INTERVALO","var(--intervalo)"],
            "__INTERVALO_3__": ["20:40 - 20:50","INTERVALO","var(--intervalo)"],
            "__ALMOCO__":      ["12:00 - 13:50","ALMOÇO",   "var(--caed)"],
            "__JANTAR__":      ["18:20 - 19:00","JANTAR",   "var(--caed)"]
        };
        if (sep[h]) {
            const [label,nome,bg] = sep[h];
            html += `<tr style="background:${bg};color:var(--text);font-weight:bold;text-align:center;">
                <td style="border:1px solid #ccc;padding:6px;">${label}</td>
                <td colspan="${DIAS_SEMANA.length}" style="border:1px solid #ccc;padding:6px;">${nome}</td>
            </tr>`;
            return;
        }

        html += `<tr>`;
        html += `<td style="border:1px solid #ccc;padding:6px;font-weight:bold;text-align:center;background:var(--time-bg);color:var(--text);">${h}</td>`;

        DIAS_SEMANA.forEach(dia => {
            const chave = `${h}|${dia}`;

            // Célula já coberta por rowspan anterior
            if (pular[chave]) return;

            const prdpgd = getPrdPgdCelula(h, dia, prd, pgd);

            if (prdpgd && prdpgd.primeiro) {
                // Marca as próximas linhas para pular
                const blocoHorarios = prdpgd.rowspan === HORARIOS_MANHA.length
                    ? (HORARIOS_MANHA.includes(h) ? HORARIOS_MANHA : HORARIOS_TARDE)
                    : (HORARIOS_TARDE.includes(h) ? HORARIOS_TARDE : HORARIOS_MANHA);

                blocoHorarios.slice(1).forEach(hFuturo => {
                    pular[`${hFuturo}|${dia}`] = true;
                });

                html += `<td rowspan="${prdpgd.rowspan}" style="
                    border:2px solid ${prdpgd.cor};
                    background:${prdpgd.bgLight};
                    text-align:center;
                    vertical-align:middle;
                    font-weight:bold;
                    font-size:15px;
                    color:${prdpgd.cor};
                    padding:6px;
                ">${prdpgd.tipo}</td>`;
                return;
            }

            if (prdpgd && !prdpgd.primeiro) return; // pula — já marcado acima

            // Célula normal de aula
            const conteudo = grade[h]?.[dia] || [];
            html += `<td style="border:1px solid #ccc;padding:6px;vertical-align:top;min-height:40px;">
                ${Array.isArray(conteudo) ? conteudo.join("") : conteudo}
            </td>`;
        });

        html += `</tr>`;
    });

    // Linha de totais por dia
    const aulasPorDia = {};
    DIAS_SEMANA.forEach(d => { aulasPorDia[d] = 0; });
    aulas.forEach(aula => {
        const [d,m,a] = aula.data.split("/");
        const dia = DIAS_INDEX[new Date(a,m-1,d).getDay()];
        if (aulasPorDia[dia] !== undefined) aulasPorDia[dia]++;
    });

    html += `<tr style="background:var(--intervalo);color:var(--text);font-weight:bold;text-align:center;">
        <td style="border:1px solid #ccc;padding:6px;">AULAS / DIA</td>
        ${DIAS_SEMANA.map(d=>`<td style="border:1px solid #ccc;padding:6px;">${aulasPorDia[d]||0}</td>`).join("")}
    </tr></tbody></table>`;

    container.innerHTML = html;
}

// ============================================================
// PDF
// ============================================================
function exportarFichaProfessorPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('l', 'mm', 'a4'); // paisagem para caber tudo
    const pageWidth  = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const professor = document.getElementById("selectProfessor")?.value;
    const semana    = document.getElementById("selectSemanaProfessor")?.value;
    if (!professor || !semana) return;

    const aulas = getDadosProfessor(professor, semana);
    const { prd, pgd } = obterPrdPgdProfessor(professor);

    const totalAulas  = aulas.length;
    const totalTurmas = new Set(aulas.map(a=>a.turma)).size;
    const totalDias   = new Set(aulas.map(a=>a.data)).size;
    const totalSab    = aulas.filter(a=>{ const [d,m,an]=a.data.split("/"); return new Date(an,m-1,d).getDay()===6; }).length;

    // Cabeçalho
    pdf.setFontSize(9);
    pdf.text("INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DE RONDÔNIA - IFRO", pageWidth/2, 8, {align:"center"});
    pdf.text("CAMPUS CACOAL - Departamento de Apoio ao Ensino - DAPE", pageWidth/2, 12, {align:"center"});
    pdf.setFontSize(11); pdf.setFont(undefined,"bold");
    pdf.text(`FICHA DO PROFESSOR: ${professor}`, pageWidth/2, 18, {align:"center"});
    pdf.setFontSize(9);  pdf.setFont(undefined,"normal");
    pdf.text(`Semana de ${semana}`, pageWidth/2, 23, {align:"center"});

    // Cards
    [[10,"TOTAL AULAS",totalAulas],[80,"TURMAS",totalTurmas],[150,"DIAS COM AULA",totalDias],[220,"SÁBADOS",totalSab]].forEach(([x,label,val]) => {
        pdf.setDrawColor(180); pdf.roundedRect(x,27,60,18,2,2);
        pdf.setFontSize(7);  pdf.setFont(undefined,"normal"); pdf.text(label,x+30,32,{align:"center"});
        pdf.setFontSize(16); pdf.setFont(undefined,"bold");   pdf.text(String(val),x+30,42,{align:"center"});
    });

    // Monta grade + PRD/PGD para o autoTable
    const grade = {};
    TODOS_HORARIOS.forEach(h => { grade[h]={}; DIAS_SEMANA.forEach(d=>{ grade[h][d]=[]; }); });
    aulas.forEach(aula => {
        const [d,m,a] = aula.data.split("/");
        const dia = DIAS_INDEX[new Date(a,m-1,d).getDay()];
        const horario = TODOS_HORARIOS.find(h=>h.trim()===(aula.horario||"").trim());
        if (!horario||!grade[horario]||!grade[horario][dia]) return;
        grade[horario][dia].push(`${aula.turma}\n${aula.disciplina}`);
    });

    // Monta body do autoTable com rowSpans para PRD/PGD
    const body = [];
    const pularPDF = {};

    TODOS_HORARIOS.forEach(h => {
        const sep = {
            "__INTERVALO_1__":["09:10 - 09:30","INTERVALO"],
            "__INTERVALO_2__":["15:30 - 15:50","INTERVALO"],
            "__INTERVALO_3__":["20:40 - 20:50","INTERVALO"],
            "__ALMOCO__":     ["12:00 - 13:50","ALMOÇO"],
            "__JANTAR__":     ["18:20 - 19:00","JANTAR"]
        };
        if (sep[h]) {
            const [label,nome] = sep[h];
            body.push([
                {content:label, styles:{fontStyle:"bold",fillColor:[230,230,230]}},
                {content:nome, colSpan:DIAS_SEMANA.length, styles:{halign:"center",fontStyle:"bold",fillColor:[230,230,230]}}
            ]);
            return;
        }

        const row = [{content:h, styles:{fontStyle:"bold",halign:"center",fillColor:[240,240,240]}}];

        DIAS_SEMANA.forEach(dia => {
            const chave = `${h}|${dia}`;
            if (pularPDF[chave]) return;

            const prdpgd = getPrdPgdCelula(h, dia, prd, pgd);

            if (prdpgd && prdpgd.primeiro) {
                const blocoHorarios = HORARIOS_MANHA.includes(h) ? HORARIOS_MANHA : HORARIOS_TARDE;
                blocoHorarios.slice(1).forEach(hf => { pularPDF[`${hf}|${dia}`] = true; });

                const corRGB = prdpgd.tipo === "PRD"
                    ? [232,245,233]
                    : [227,242,253];

                row.push({
                    content: prdpgd.tipo,
                    rowSpan: prdpgd.rowspan,
                    styles: {
                        halign:"center", valign:"middle",
                        fontStyle:"bold", fontSize:10,
                        fillColor: corRGB,
                        textColor: prdpgd.tipo==="PRD" ? [46,125,50] : [21,101,192]
                    }
                });
                return;
            }

            if (prdpgd && !prdpgd.primeiro) return;

            const conteudo = (grade[h]?.[dia]||[]).join("\n");
            row.push({ content: conteudo, styles:{fontSize:6,halign:"center",valign:"middle"} });
        });

        body.push(row);
    });

    // Linha totais
    const aulasPorDia = {};
    DIAS_SEMANA.forEach(d=>{ aulasPorDia[d]=0; });
    aulas.forEach(a => {
        const [d,m,an] = a.data.split("/");
        const dia = DIAS_INDEX[new Date(an,m-1,d).getDay()];
        if (aulasPorDia[dia]!==undefined) aulasPorDia[dia]++;
    });
    body.push([
        {content:"AULAS/DIA", styles:{fontStyle:"bold",fillColor:[232,245,233]}},
        ...DIAS_SEMANA.map(d=>({content:String(aulasPorDia[d]||0), styles:{fontStyle:"bold",halign:"center",fillColor:[232,245,233]}}))
    ]);

    pdf.autoTable({
        head: [["HORÁRIO",...DIAS_SEMANA]],
        body,
        startY: 50,
        theme: "grid",
        styles: { fontSize:7, cellPadding:2, valign:"middle", overflow:"linebreak" },
        headStyles: { fillColor:[21,128,61], textColor:255, halign:"center", fontStyle:"bold" },
        columnStyles: {
            0: { cellWidth:22, halign:"center" },
            1: { cellWidth:38 }, 2: { cellWidth:38 },
            3: { cellWidth:38 }, 4: { cellWidth:38 },
            5: { cellWidth:38 }, 6: { cellWidth:38 }
        }
    });

    pdf.setFontSize(7);
    pdf.text("IFRO - Campus Cacoal | BR 364, Km 228, Lote 2-A | (69) 3443-2445 | dape.cacoal@ifro.edu.br", pageWidth/2, pageHeight-5, {align:"center"});
    pdf.save(`${professor.replace(/\s+/g,'_')}_${semana.replace(/\//g,'-')}.pdf`);
}
