// ============================================================
// professor.js — PRD/PGD integrado na grade com rowspan
// Manhã: 5 períodos + intervalo = rowspan 6
// Tarde: 5 períodos + intervalo = rowspan 6
// PDF: formato original retrato
// ============================================================

const HORARIOS_MANHA = [
    "07:30 - 08:20",
    "08:20 - 09:10",
    "__INTERVALO_1__",
    "09:30 - 10:20",
    "10:20 - 11:10",
    "11:10 - 12:00"
];

const HORARIOS_TARDE = [
    "13:50 - 14:40",
    "14:40 - 15:30",
    "__INTERVALO_2__",
    "15:50 - 16:40",
    "16:40 - 17:30",
    "17:30 - 18:20"
];

const HORARIOS_NOITE = [
    "19:00 - 19:50",
    "19:50 - 20:40",
    "__INTERVALO_3__",
    "20:50 - 21:40",
    "21:40 - 22:30"
];

const TODOS_HORARIOS = [
    ...HORARIOS_MANHA,
    "__ALMOCO__",
    ...HORARIOS_TARDE,
    "__JANTAR__",
    ...HORARIOS_NOITE
];

const DIAS_SEMANA = ["SEGUNDA","TERÇA","QUARTA","QUINTA","SEXTA","SÁBADO"];
const DIAS_INDEX  = ["DOMINGO","SEGUNDA","TERÇA","QUARTA","QUINTA","SEXTA","SÁBADO"];
const DIA_IDX     = { "SEGUNDA":0,"TERÇA":1,"QUARTA":2,"QUINTA":3,"SEXTA":4 };

// Separadores visuais (não são horários reais)
const SEPARADORES = {
    "__INTERVALO_1__": ["09:10 - 09:30","INTERVALO","var(--intervalo)"],
    "__INTERVALO_2__": ["15:30 - 15:50","INTERVALO","var(--intervalo)"],
    "__INTERVALO_3__": ["20:40 - 20:50","INTERVALO","var(--intervalo)"],
    "__ALMOCO__":      ["12:00 - 13:50","ALMOÇO",   "var(--caed)"],
    "__JANTAR__":      ["18:20 - 19:00","JANTAR",   "var(--caed)"]
};

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

// Verifica se um horário (incluindo separadores) pertence à manhã ou tarde
function getTurnoDoHorario(h) {
    if (HORARIOS_MANHA.includes(h)) return "M";
    if (HORARIOS_TARDE.includes(h)) return "T";
    return null;
}

// Retorna info do PRD/PGD para uma célula: null ou {tipo, cor, bgLight, rowspan, primeiro}
// rowspan = 6 (5 períodos + 1 intervalo)
function getPrdPgdCelula(h, dia, prd, pgd) {
    const diaIdx = DIA_IDX[dia];
    if (diaIdx === undefined) return null; // SÁBADO não tem PRD/PGD

    const turno = getTurnoDoHorario(h);
    if (!turno) return null;

    const turnoIdx = turno === "M" ? 0 : 1;
    const blocoHorarios = turno === "M" ? HORARIOS_MANHA : HORARIOS_TARDE;

    // Verifica PRD
    if (prd[diaIdx * 2 + turnoIdx]) {
        return {
            tipo:    "PRD",
            cor:     "#2e7d32",
            bgLight: "#e8f5e9",
            rowspan: blocoHorarios.length, // 6 (inclui intervalo)
            primeiro: h === blocoHorarios[0]
        };
    }

    // Verifica PGD
    if (pgd[diaIdx * 2 + turnoIdx]) {
        return {
            tipo:    "PGD",
            cor:     "#1565c0",
            bgLight: "#e3f2fd",
            rowspan: blocoHorarios.length,
            primeiro: h === blocoHorarios[0]
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
    TODOS_HORARIOS.forEach(h => { grade[h]={}; DIAS_SEMANA.forEach(d=>{ grade[h][d]=[]; }); });
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

    // Cards resumo
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

    // Células a pular por rowspan
    const pular = {};

    TODOS_HORARIOS.forEach(h => {
        // ALMOÇO e JANTAR — sempre linha inteira
        if (h === "__ALMOCO__" || h === "__JANTAR__") {
            const [label, nome, bg] = SEPARADORES[h];
            html += `<tr style="background:${bg};color:var(--text);font-weight:bold;text-align:center;">
                <td style="border:1px solid #ccc;padding:6px;">${label}</td>
                <td colspan="${DIAS_SEMANA.length}" style="border:1px solid #ccc;padding:6px;">${nome}</td>
            </tr>`;
            return;
        }

        // Intervalos — podem ser cobertos por rowspan do PRD/PGD
        if (SEPARADORES[h]) {
            const [label, nome, bg] = SEPARADORES[h];
            html += `<tr>`;
            html += `<td style="border:1px solid #ccc;padding:4px;font-size:10px;text-align:center;background:${bg};color:var(--text);font-weight:bold;">${label}</td>`;
            DIAS_SEMANA.forEach(dia => {
                const chave = `${h}|${dia}`;
                if (pular[chave]) return; // coberto por rowspan
                html += `<td style="border:1px solid #ccc;padding:4px;text-align:center;background:${bg};color:var(--text);font-weight:bold;">${nome}</td>`;
            });
            html += `</tr>`;
            return;
        }

        // Linha de horário normal
        html += `<tr>`;
        html += `<td style="border:1px solid #ccc;padding:6px;font-weight:bold;text-align:center;background:var(--time-bg);color:var(--text);">${h}</td>`;

        DIAS_SEMANA.forEach(dia => {
            const chave = `${h}|${dia}`;
            if (pular[chave]) return;

            const prdpgd = getPrdPgdCelula(h, dia, prd, pgd);

            if (prdpgd && prdpgd.primeiro) {
                // Marca todas as linhas do bloco (incluindo separador) para pular
                const blocoHorarios = getTurnoDoHorario(h) === "M" ? HORARIOS_MANHA : HORARIOS_TARDE;
                blocoHorarios.slice(1).forEach(hFuturo => {
                    pular[`${hFuturo}|${dia}`] = true;
                });

                html += `<td rowspan="${prdpgd.rowspan}" style="
                    border:2px solid ${prdpgd.cor};
                    background:${prdpgd.bgLight};
                    text-align:center;
                    vertical-align:middle;
                    font-weight:bold;
                    font-size:16px;
                    color:${prdpgd.cor};
                    padding:6px;
                ">${prdpgd.tipo}</td>`;
                return;
            }

            if (prdpgd && !prdpgd.primeiro) return;

            const conteudo = grade[h]?.[dia] || [];
            html += `<td style="border:1px solid #ccc;padding:6px;vertical-align:top;">
                ${Array.isArray(conteudo) ? conteudo.join("") : conteudo}
            </td>`;
        });

        html += `</tr>`;
    });

    // Linha totais por dia
    const aulasPorDia = {};
    DIAS_SEMANA.forEach(d=>{ aulasPorDia[d]=0; });
    aulas.forEach(aula => {
        const [d,m,a] = aula.data.split("/");
        const dia = DIAS_INDEX[new Date(a,m-1,d).getDay()];
        if (aulasPorDia[dia]!==undefined) aulasPorDia[dia]++;
    });

    html += `<tr style="background:var(--intervalo);color:var(--text);font-weight:bold;text-align:center;">
        <td style="border:1px solid #ccc;padding:6px;">AULAS / DIA</td>
        ${DIAS_SEMANA.map(d=>`<td style="border:1px solid #ccc;padding:6px;">${aulasPorDia[d]||0}</td>`).join("")}
    </tr></tbody></table>`;

    container.innerHTML = html;
}

// ============================================================
// PDF — formato original retrato, PRD/PGD como texto simples
// ============================================================
function exportarFichaProfessorPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();

    const professor = document.getElementById("selectProfessor")?.value;
    const semana    = document.getElementById("selectSemanaProfessor")?.value;
    if (!professor || !semana) return;

    const aulas = getDadosProfessor(professor, semana);
    const { prd, pgd } = obterPrdPgdProfessor(professor);

    const totalAulasSegSex = aulas.filter(a => { const [d,m,an]=a.data.split("/"); const dt=new Date(an,m-1,d); return dt.getDay()>=1&&dt.getDay()<=5; }).length;
    const totalAulasSab    = aulas.filter(a => { const [d,m,an]=a.data.split("/"); const dt=new Date(an,m-1,d); return dt.getDay()===6; }).length;
    const totalAulas  = totalAulasSegSex + totalAulasSab;
    const totalTurmas = new Set(aulas.map(a=>a.turma)).size;
    const totalDias   = new Set(aulas.map(a=>a.data)).size;

    // Cabeçalho
    pdf.setFontSize(10);
    pdf.text("INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DE RONDÔNIA - IFRO", pageWidth/2, 10, {align:"center"});
    pdf.text("CAMPUS CACOAL - Departamento de Apoio ao Ensino - DAPE", pageWidth/2, 14, {align:"center"});
    pdf.setFontSize(11); pdf.setFont(undefined,"bold");
    pdf.text(`FICHA DO PROFESSOR: ${professor}`, pageWidth/2, 22, {align:"center"});
    pdf.setFontSize(9);  pdf.setFont(undefined,"normal");
    pdf.text(`Semana de ${semana}`, pageWidth/2, 27, {align:"center"});

    // Cards
    pdf.setDrawColor(180);
    pdf.roundedRect(10,33,60,22,2,2); pdf.roundedRect(75,33,60,22,2,2); pdf.roundedRect(140,33,60,22,2,2);
    pdf.setFontSize(8);
    pdf.text("TOTAL DE AULAS",40,38,{align:"center"});
    pdf.text("TURMAS",105,38,{align:"center"});
    pdf.text("DIAS COM AULA",170,38,{align:"center"});
    pdf.setFontSize(18); pdf.setFont(undefined,"bold");
    pdf.text(String(totalAulas),40,46,{align:"center"});
    pdf.text(String(totalTurmas),105,46,{align:"center"});
    pdf.text(String(totalDias),170,46,{align:"center"});
    pdf.setFontSize(7); pdf.setFont(undefined,"normal");
    pdf.text(`Seg-Sex: ${totalAulasSegSex} | Sáb: ${totalAulasSab}`,40,52,{align:"center"});

    // PRD/PGD como texto simples abaixo dos cards
    const nomesDia = ["Segunda","Terça","Quarta","Quinta","Sexta"];
    const gerarTexto = (marcacoes) => nomesDia.map((dia,i) => {
        const m = marcacoes[i*2], t = marcacoes[i*2+1];
        if (m && t) return `${dia}: dia inteiro`;
        if (m) return `${dia}: manhã`;
        if (t) return `${dia}: tarde`;
        return null;
    }).filter(Boolean).join("   |   ");

    const textoPrd = gerarTexto(prd);
    const textoPgd = gerarTexto(pgd);

    let yAtual = 57;
    if (textoPrd) {
        pdf.setFontSize(8); pdf.setFont(undefined,"bold");
        pdf.text("PRD:", 12, yAtual);
        pdf.setFont(undefined,"normal");
        pdf.text(textoPrd, 25, yAtual);
        yAtual += 5;
    }
    if (textoPgd) {
        pdf.setFontSize(8); pdf.setFont(undefined,"bold");
        pdf.text("PGD:", 12, yAtual);
        pdf.setFont(undefined,"normal");
        pdf.text(textoPgd, 25, yAtual);
        yAtual += 5;
    }

    const startY = yAtual + 2;

    // Grade — monta igual ao original
    const grade = {};
    TODOS_HORARIOS.forEach(h => { grade[h]={}; DIAS_SEMANA.forEach(d=>{ grade[h][d]=[]; }); });
    aulas.forEach(aula => {
        const [d,m,a] = aula.data.split("/");
        const dia = DIAS_INDEX[new Date(a,m-1,d).getDay()];
        const horario = TODOS_HORARIOS.find(h=>h.trim()===(aula.horario||"").trim());
        if (!horario||!grade[horario]||!grade[horario][dia]) return;
        grade[horario][dia].push(`${aula.turma}\n${aula.disciplina}`);
    });

    const horarios = TODOS_HORARIOS;
    const dias = DIAS_SEMANA;

    const body = horarios.map(h => {
        if (SEPARADORES[h]) {
            const [label, nome] = SEPARADORES[h];
            return [label, {content:nome, colSpan:6, styles:{halign:"center",fontStyle:"bold",fillColor:[241,245,249]}}];
        }
        const row = [h];
        dias.forEach(d => {
            let c = grade[h]?.[d] || [];
            row.push((Array.isArray(c)?c.join(" "):String(c)).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim());
        });
        return row;
    });

    // Linha totais
    const aulasPorDia = dias.map(d => aulas.filter(a => {
        const [da,m,an] = a.data.split("/");
        return DIAS_INDEX[new Date(an,m-1,da).getDay()] === d;
    }).length);
    body.push(["AULAS/DIA",...aulasPorDia]);

    pdf.autoTable({
        head: [["Horário",...dias]],
        body,
        startY,
        theme:"grid",
        styles:{fontSize:6,cellPadding:1,valign:"middle",halign:"center",overflow:"linebreak"},
        headStyles:{fillColor:[21,128,61],textColor:[255,255,255],halign:"center"},
        columnStyles:{
            0:{cellWidth:20,halign:"center"},
            1:{cellWidth:28},2:{cellWidth:28},
            3:{cellWidth:28},4:{cellWidth:28},
            5:{cellWidth:28},6:{cellWidth:28}
        },
        didParseCell:(data) => {
            if (data.row.index === body.length-1) {
                data.cell.styles.fillColor = [232,245,233];
                data.cell.styles.fontStyle = "bold";
            }
        }
    });

    pdf.setFontSize(8);
    pdf.text("IFRO - Campus Cacoal | BR 364, Km 228, Lote 2-A | (69) 3443-2445 | dape.cacoal@ifro.edu.br", pageWidth/2, 285, {align:"center"});
    pdf.save(`${professor.replace(/\s+/g,'_')}_Semana_de_${semana.replace(/\//g,'-')}.pdf`);
}
