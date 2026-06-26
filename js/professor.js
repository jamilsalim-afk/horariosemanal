// ============================================================
// professor.js — com PRD/PGD na ficha do professor
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
        const registro = {
            data: item.data,
            horario: item.horario,
            turma: item.turma,
            disciplina,
            professor,
            modalidade: item.modalidade
        };
        INDEX_PROFESSOR[profNorm].push(registro);

        const turma = item.turma || "";
        if (!turma) return;
        if (!INDEX_TURMA[turma]) INDEX_TURMA[turma] = [];
        INDEX_TURMA[turma].push(registro);
    });
}

function normalizarProfessor(nome) {
    if (!nome) return "";
    return nome.toString().toUpperCase()
        .replace(/\[.*?\]/g, "")
        .replace(/\*/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function carregarListaProfessores() {
    const select = document.getElementById("selectProfessor");
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um professor</option>';

    const professoresAtivos = Object.keys(INDEX_PROFESSOR);

    dadosProfessores.slice(1)
        .sort((a, b) => (a[0] || "").localeCompare(b[0] || "", "pt-BR"))
        .forEach(linha => {
            const nomeCompleto = (linha[0] || "").trim();
            if (!nomeCompleto) return;
            const nomeCurto = normalizarProfessor(linha[1] || nomeCompleto);
            if (!professoresAtivos.includes(nomeCurto)) return;
            select.innerHTML += `<option value="${nomeCompleto}">${nomeCompleto}</option>`;
        });
}

function traduzirProfessor(nomeCompleto) {
    if (!nomeCompleto) return "";
    const nomeNorm = normalizarProfessor(nomeCompleto);
    for (let i = 1; i < dadosProfessores.length; i++) {
        const nomeExibicao = normalizarProfessor(dadosProfessores[i][0]);
        const variacao = normalizarProfessor(dadosProfessores[i][1]);
        if (nomeExibicao === nomeNorm) return variacao;
    }
    return nomeNorm;
}

function obterNomeCompletoProfessor(nome) {
    if (!nome) return "";
    const nomeNorm = normalizarProfessor(nome);
    for (let i = 1; i < dadosProfessores.length; i++) {
        const nomeCompleto = (dadosProfessores[i][0] || "").trim();
        const nomeCurto = normalizarProfessor(dadosProfessores[i][1]);
        if (nomeCurto === nomeNorm) return nomeCompleto;
    }
    return nome;
}

// ============================================================
// PRD / PGD — lê as 20 colunas da planilha de professores
// ============================================================
function obterPrdPgdProfessor(nomeCompleto) {
    const nomeNorm = normalizarProfessor(nomeCompleto);
    for (let i = 1; i < dadosProfessores.length; i++) {
        const exibicao = normalizarProfessor(dadosProfessores[i][0]);
        if (exibicao !== nomeNorm) continue;

        const linha = dadosProfessores[i];
        const prd = PRD_PGD_LABELS.map((_, idx) =>
            (linha[PRD_INICIO_COL + idx] || "").trim().toUpperCase() === "X"
        );
        const pgd = PRD_PGD_LABELS.map((_, idx) =>
            (linha[PGD_INICIO_COL + idx] || "").trim().toUpperCase() === "X"
        );
        return { prd, pgd };
    }
    return {
        prd: Array(10).fill(false),
        pgd: Array(10).fill(false)
    };
}

// Monta HTML da tabela PRD ou PGD
function renderTabelaPrdPgd(titulo, emoji, cor, marcacoes) {
    const dias  = ["SEG","TER","QUA","QUI","SEX"];
    const turnos = ["M","T"];

    const temAlgo = marcacoes.some(Boolean);
    if (!temAlgo) return "";

    // Monta legenda de texto (ex: "Segunda - dia inteiro", "Terça - manhã")
    const descricoes = [];
    dias.forEach((dia, i) => {
        const m = marcacoes[i * 2];
        const t = marcacoes[i * 2 + 1];
        const nomesDia = { SEG:"Segunda", TER:"Terça", QUA:"Quarta", QUI:"Quinta", SEX:"Sexta" };
        if (m && t)  descricoes.push(`${nomesDia[dia]} — dia inteiro`);
        else if (m)  descricoes.push(`${nomesDia[dia]} — manhã`);
        else if (t)  descricoes.push(`${nomesDia[dia]} — tarde`);
    });

    let html = `
        <div style="
            background:var(--surface);
            border-radius:10px;
            padding:14px;
            margin-bottom:12px;
            box-shadow:0 2px 6px rgba(0,0,0,.1);
            border-left:4px solid ${cor};
        ">
        <div style="font-weight:bold;font-size:13px;color:${cor};margin-bottom:10px;">
            ${emoji} ${titulo}
        </div>
        <table style="border-collapse:collapse;font-size:12px;width:auto;">
            <thead>
                <tr>
                    <th style="padding:6px 10px;background:${cor};color:white;border-radius:4px 0 0 0;"></th>
                    ${dias.map(d => `<th style="padding:6px 14px;background:${cor};color:white;text-align:center;">${d}</th>`).join("")}
                </tr>
            </thead>
            <tbody>
    `;

    turnos.forEach((turno, ti) => {
        html += `<tr>
            <td style="padding:6px 10px;font-weight:bold;background:var(--time-bg);color:var(--text);">${turno}</td>`;
        dias.forEach((_, di) => {
            const marcado = marcacoes[di * 2 + ti];
            html += `<td style="
                padding:6px 14px;
                text-align:center;
                background:${marcado ? cor + '22' : 'transparent'};
                color:var(--text);
                border:1px solid var(--border);
            ">${marcado ? `<span style="color:${cor};font-size:16px;">✅</span>` : ""}</td>`;
        });
        html += `</tr>`;
    });

    html += `</tbody></table>`;

    if (descricoes.length > 0) {
        html += `<div style="margin-top:8px;font-size:12px;color:var(--text-soft);">
            ${descricoes.map(d => `<span style="margin-right:12px;">• ${d}</span>`).join("")}
        </div>`;
    }

    html += `</div>`;
    return html;
}

function getDadosProfessor(professor, semana) {
    const profCurto = traduzirProfessor(professor);
    return (INDEX_PROFESSOR[profCurto] || []).filter(aula => {
        const semanaAula = obterInicioSemana(aula.data);
        return semanaAula === semana;
    });
}

function carregarSemanasProfessor() {
    const origem = document.getElementById('selectSemana');
    const destino = document.getElementById('selectSemanaProfessor');
    if (!origem || !destino) return;
    destino.innerHTML = origem.innerHTML;
    destino.value = origem.value;
    destino.dataset.ready = "true";
}

function montarGradeProfessor(dados, professorSelecionado, semanaSelecionada) {
    const aulas = getDadosProfessor(professorSelecionado, semanaSelecionada);

    const dias = ["SEGUNDA","TERÇA","QUARTA","QUINTA","SEXTA","SÁBADO"];
    const horarios = [
        "07:30 - 08:20","08:20 - 09:10","__INTERVALO_1__",
        "09:30 - 10:20","10:20 - 11:10","11:10 - 12:00","__ALMOCO__",
        "13:50 - 14:40","14:40 - 15:30","__INTERVALO_2__",
        "15:50 - 16:40","16:40 - 17:30","17:30 - 18:20","__JANTAR__",
        "19:00 - 19:50","19:50 - 20:40","__INTERVALO_3__",
        "20:50 - 21:40","21:40 - 22:30"
    ];

    const grade = {};
    horarios.forEach(h => {
        grade[h] = {};
        dias.forEach(d => { grade[h][d] = []; });
    });

    aulas.forEach(aula => {
        const [d, m, a] = aula.data.split("/");
        const dt = new Date(a, m - 1, d);
        const diaSemana = ["DOMINGO","SEGUNDA","TERÇA","QUARTA","QUINTA","SEXTA","SÁBADO"][dt.getDay()];
        const horario = horarios.find(h => h.trim() === (aula.horario || "").trim());
        if (!horario || !grade[horario] || !grade[horario][diaSemana]) return;
        grade[horario][diaSemana].push(`
            <div style="margin-bottom:4px;padding:3px;border-left:3px solid #15803d;">
                <b>${aula.turma}</b><br>${aula.disciplina}
            </div>`);
    });

    return { dias, horarios, grade };
}

function renderProfessor() {
    const semanaEl = document.getElementById("selectSemanaProfessor");
    if (semanaEl && semanaEl.dataset.ready !== "true") return;

    const professor = document.getElementById("selectProfessor")?.value;
    const semana = semanaEl?.value;
    if (!professor || !semana) return;

    const container = document.getElementById("tabelaProfessor");
    const { dias, horarios, grade } = montarGradeProfessor(BASE_GERAL, professor, semana);
    const aulas = getDadosProfessor(professor, semana);

    const totalAulas  = aulas.length;
    const totalTurmas = new Set(aulas.map(a => a.turma)).size;
    const totalDias   = new Set(aulas.map(a => a.data)).size;

    // PRD / PGD
    const { prd, pgd } = obterPrdPgdProfessor(professor);
    const htmlPrd = renderTabelaPrdPgd("PRD — Planejamento", "📋", "#2e7d32", prd);
    const htmlPgd = renderTabelaPrdPgd("PGD — Prog. Gestão Desempenho", "📊", "#1565c0", pgd);

    let html = `
    <div style="display:flex;gap:15px;margin-bottom:15px;flex-wrap:wrap;">
        <div style="background:var(--surface);color:var(--text);padding:15px;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,.15);min-width:160px;text-align:center;">
            <div style="font-size:12px;color:var(--text-soft)">TOTAL DE AULAS</div>
            <div style="font-size:30px;font-weight:bold;color:#2e7d32;">${totalAulas}</div>
        </div>
        <div style="background:var(--surface);color:var(--text);padding:15px;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,.15);min-width:160px;text-align:center;">
            <div style="font-size:12px;color:var(--text-soft)">TURMAS</div>
            <div style="font-size:30px;font-weight:bold;color:#1565c0;">${totalTurmas}</div>
        </div>
        <div style="background:var(--surface);color:var(--text);padding:15px;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,.15);min-width:160px;text-align:center;">
            <div style="font-size:12px;color:var(--text-soft)">DIAS COM AULA</div>
            <div style="font-size:30px;font-weight:bold;color:#ef6c00;">${totalDias}</div>
        </div>
    </div>

    ${htmlPrd}
    ${htmlPgd}

    <table style="width:100%;border-collapse:collapse;background:var(--surface);color:var(--text);font-size:12px;">
    <thead>
    <tr style="background:#15803d;color:white;">
        <th style="padding:8px;border:1px solid #ccc">HORÁRIO</th>
        ${dias.map(d => `<th style="padding:8px;border:1px solid #ccc;">${d}</th>`).join("")}
    </tr>
    </thead>
    <tbody>`;

    horarios.forEach(h => {
        const especiais = {
            "__INTERVALO_1__": ["09:10 - 09:30", "INTERVALO", "var(--intervalo)"],
            "__INTERVALO_2__": ["15:30 - 15:50", "INTERVALO", "var(--intervalo)"],
            "__INTERVALO_3__": ["20:40 - 20:50", "INTERVALO", "var(--intervalo)"],
            "__ALMOCO__":      ["12:00 - 13:50", "ALMOÇO",    "var(--caed)"],
            "__JANTAR__":      ["18:20 - 19:00", "JANTAR",    "var(--caed)"]
        };
        if (especiais[h]) {
            const [label, nome, bg] = especiais[h];
            html += `<tr style="background:${bg};color:var(--text);font-weight:bold;text-align:center;">
                <td>${label}</td><td colspan="6">${nome}</td></tr>`;
            return;
        }
        html += `<tr><td style="border:1px solid #ccc;padding:6px;font-weight:bold;text-align:center;background:var(--time-bg);color:var(--text);">${h}</td>`;
        dias.forEach(d => {
            const conteudo = grade[h]?.[d] || [];
            html += `<td style="border:1px solid #ccc;padding:6px;vertical-align:top;min-height:50px;">${Array.isArray(conteudo) ? conteudo.join("") : conteudo}</td>`;
        });
        html += `</tr>`;
    });

    const aulasPorDia = { "SEGUNDA":0,"TERÇA":0,"QUARTA":0,"QUINTA":0,"SEXTA":0,"SÁBADO":0 };
    aulas.forEach(aula => {
        const [d, m, a] = aula.data.split("/");
        const dt = new Date(a, m - 1, d);
        const dia = ["DOMINGO","SEGUNDA","TERÇA","QUARTA","QUINTA","SEXTA","SÁBADO"][dt.getDay()];
        if (aulasPorDia[dia] !== undefined) aulasPorDia[dia]++;
    });

    html += `<tr style="background:var(--intervalo);color:var(--text);font-weight:bold;text-align:center;">
        <td>AULAS / DIA</td>
        ${dias.map(d => `<td>${aulasPorDia[d] || 0}</td>`).join("")}
    </tr></tbody></table>`;

    container.innerHTML = html;
}

// PDF mantém estrutura atual + adiciona PRD/PGD como texto
function exportarFichaProfessorPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const professor = document.getElementById("selectProfessor")?.value;
    const semana    = document.getElementById("selectSemanaProfessor")?.value;
    if (!professor || !semana) return;

    const { dias, horarios, grade } = montarGradeProfessor(BASE_GERAL, professor, semana);
    const aulas = getDadosProfessor(professor, semana);
    const totalAulasSegSex = aulas.filter(a => { const [d,m,a2]=a.data.split("/"); const dt=new Date(a2,m-1,d); return dt.getDay()>=1&&dt.getDay()<=5; }).length;
    const totalAulasSab    = aulas.filter(a => { const [d,m,a2]=a.data.split("/"); const dt=new Date(a2,m-1,d); return dt.getDay()===6; }).length;
    const totalAulas  = totalAulasSegSex + totalAulasSab;
    const totalTurmas = new Set(aulas.map(a => a.turma)).size;
    const totalDias   = new Set(aulas.map(a => a.data)).size;

    pdf.setFontSize(10);
    pdf.text("INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DE RONDÔNIA - IFRO", pageWidth/2, 10, {align:"center"});
    pdf.text("CAMPUS CACOAL - Departamento de Apoio ao Ensino - DAPE", pageWidth/2, 14, {align:"center"});
    pdf.setFontSize(11); pdf.setFont(undefined,"bold");
    pdf.text(`FICHA DO PROFESSOR: ${professor}`, pageWidth/2, 22, {align:"center"});
    pdf.setFontSize(9);  pdf.setFont(undefined,"normal");
    pdf.text(`Semana de ${semana}`, pageWidth/2, 27, {align:"center"});

    pdf.setDrawColor(180);
    pdf.roundedRect(10,33,60,22,2,2); pdf.roundedRect(75,33,60,22,2,2); pdf.roundedRect(140,33,60,22,2,2);
    pdf.setFontSize(8);
    pdf.text("TOTAL DE AULAS",40,38,{align:"center"}); pdf.text("TURMAS",105,38,{align:"center"}); pdf.text("DIAS COM AULA",170,38,{align:"center"});
    pdf.setFontSize(18); pdf.setFont(undefined,"bold");
    pdf.text(String(totalAulas),40,46,{align:"center"}); pdf.text(String(totalTurmas),105,46,{align:"center"}); pdf.text(String(totalDias),170,46,{align:"center"});
    pdf.setFontSize(7); pdf.setFont(undefined,"normal");
    pdf.text(`Seg-Sex: ${totalAulasSegSex} | Sáb: ${totalAulasSab}`,40,52,{align:"center"});

    // PRD/PGD no PDF
    const { prd, pgd } = obterPrdPgdProfessor(professor);
    const nomesDia = ["Segunda","Terça","Quarta","Quinta","Sexta"];
    const gerarTextoPrdPgd = (marcacoes) =>
        nomesDia.map((dia, i) => {
            const m = marcacoes[i*2], t = marcacoes[i*2+1];
            if (m && t) return `${dia}: dia inteiro`;
            if (m) return `${dia}: manhã`;
            if (t) return `${dia}: tarde`;
            return null;
        }).filter(Boolean).join("  |  ");

    const textoPrd = gerarTextoPrdPgd(prd);
    const textoPgd = gerarTextoPrdPgd(pgd);

    let yInfo = 57;
    if (textoPrd) {
        pdf.setFontSize(8); pdf.setFont(undefined,"bold"); pdf.text("PRD:", 12, yInfo);
        pdf.setFont(undefined,"normal"); pdf.text(textoPrd, 25, yInfo);
        yInfo += 5;
    }
    if (textoPgd) {
        pdf.setFontSize(8); pdf.setFont(undefined,"bold"); pdf.text("PGD:", 12, yInfo);
        pdf.setFont(undefined,"normal"); pdf.text(textoPgd, 25, yInfo);
        yInfo += 5;
    }

    const startY = textoPrd || textoPgd ? yInfo + 2 : 62;

    const body = horarios.map(h => {
        const sep = {__INTERVALO_1__:"INTERVALO",__INTERVALO_2__:"INTERVALO",__INTERVALO_3__:"INTERVALO",__ALMOCO__:"ALMOÇO",__JANTAR__:"JANTAR"};
        if (sep[h]) return [sep[h],{content:sep[h],colSpan:6,styles:{halign:"center",fontStyle:"bold",fillColor:[241,245,249]}}];
        const row = [h];
        dias.forEach(d => {
            let c = grade[h]?.[d] || [];
            let txt = Array.isArray(c) ? c.join(" ") : String(c);
            row.push(txt.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim());
        });
        return row;
    });

    const aulasPorDia = dias.map(d => aulas.filter(a => {
        const [da,m,an] = a.data.split("/"); const dt = new Date(an,m-1,da);
        return ["DOMINGO","SEGUNDA","TERÇA","QUARTA","QUINTA","SEXTA","SÁBADO"][dt.getDay()] === d;
    }).length);
    body.push(["AULAS/DIA",...aulasPorDia]);

    pdf.autoTable({
        head: [["Horário",...dias]], body, startY,
        theme:"grid",
        styles:{fontSize:6,cellPadding:1,valign:"middle",halign:"center",overflow:"linebreak"},
        headStyles:{fillColor:[21,128,61],textColor:[255,255,255],halign:"center"},
        columnStyles:{0:{cellWidth:20},1:{cellWidth:28},2:{cellWidth:28},3:{cellWidth:28},4:{cellWidth:28},5:{cellWidth:28},6:{cellWidth:28}},
        didParseCell:(data) => {
            if (data.row.index === body.length-1) {
                data.cell.styles.fillColor = [232,245,233];
                data.cell.styles.fontStyle = "bold";
            }
        }
    });

    pdf.setFontSize(8);
    pdf.text("IFRO - Campus Cacoal | BR 364, Km 228, Lote 2-A | (69) 3443-2445 | dape.cacoal@ifro.edu.br", pageWidth/2, 285, {align:"center"});
    pdf.save(`${professor.replace(/\s+/g,'_')}_Semana_${semana.replace(/\//g,'-')}.pdf`);
}
