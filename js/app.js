// ======================================================
// 🚀 APP.JS
// NÚCLEO DE DADOS DO SISTEMA
// ======================================================
// ======================================================
// 🔄 PONTES DE COMPATIBILIDADE DEFINITIVAS
// Conecta Core.js, Utils.js e App.js sem alterar as funções originais
// ======================================================
if (window.dadosSistema) {
    window.dadosGlobais = window.dadosSistema.integrado; 
    window.eventosGlobais = window.dadosSistema.eventos;
    window.relatorioDPT = window.dadosSistema.relatorios;
    
    Object.defineProperty(window, 'professoresNormalizados', {
        get: () => window.dadosSistema.professoresNormalizados,
        set: (val) => { window.dadosSistema.professoresNormalizados = val; },
        configurable: true
    });
    
    Object.defineProperty(window, 'semanasAgrupadas', {
        get: () => window.dadosSistema.semanas,
        set: (val) => { window.dadosSistema.semanas = val; },
        configurable: true
    });
    
    Object.defineProperty(window, 'dadosProcessados', {
        get: () => window.dadosSistema.integrado,
        set: (val) => { },
        configurable: true
    });
}

// 🎛️ Adaptação de nomes entre App.js e as funções do seu Utils.js
if (typeof window.mostrarLoader !== 'function') window.mostrarLoader = () => { if (typeof showLoading === 'function') showLoading(); };
if (typeof window.esconderLoader !== 'function') window.esconderLoader = () => { if (typeof hideLoading === 'function') hideLoading(); };
if (typeof window.validarData !== 'function') window.validarData = (d) => typeof ehData === 'function' ? ehData(d) : false;

// 📅 Função de cálculo de intervalo de semanas para o agrupamento do App.js
if (typeof window.obterSemanaDaData !== 'function') {
    window.obterSemanaDaData = function(dataStr) {
        if (typeof parseDataBR !== 'function' || typeof formatarData !== 'function') return `Semana de ${dataStr}`;
        const data = parseDataBR(dataStr);
        if (!data) return `Semana de ${dataStr}`;
        
        // Encontra a segunda-feira daquela semana
        const diaSemana = data.getDay();
        const diferencaParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
        
        const segunda = new Date(data);
        segunda.setDate(data.getDate() + diferencaParaSegunda);
        
        const sexta = new Date(segunda);
        sexta.setDate(segunda.getDate() + 4);
        
        return `Semana de ${formatarData(segunda)} a ${formatarData(sexta)}`;
    };
}

// 💬 Tratamento para evitar falha se o gerenciador de mensagens na tela (Toast) não estiver carregado
if (typeof window.mostrarToast !== 'function') {
    window.mostrarToast = (mensagem, tipo) => {
        console.log(`[TOAST - ${tipo.toUpperCase()}] ${mensagem}`);
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px;';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.style.cssText = `background: ${tipo === 'success' ? '#10b981' : '#ef4444'}; color: white; padding: 12px 24px; border-radius: 6px; font-family: sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.1);`;
        toast.textContent = mensagem;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    };
}

// 📺 Fallback seguro de renderização inicial
if (typeof window.renderizarAbaAtual !== 'function') {
    window.renderizarAbaAtual = () => {
        const aba = window.appState.abaAtual;
        console.log(`📺 Interface pronta. Aguardando gatilho de renderização da aba: ${aba}`);
        if (aba === "horarios" && typeof renderizarGradePrincipal === "function") renderizarGradePrincipal();
    };
}
// ======================================================
// 🔗 ENDPOINTS GOOGLE SHEETS
// ======================================================

const PLANILHAS = {

  INTEGRADO:
    "https://docs.google.com/spreadsheets/d/1j33kiPqwtzZNuvkBgYDaIiXZvVMY_J0qWAtRfYGdnD8/gviz/tq?tqx=out:json&gid=1357770092",

  SUPERIOR1:
    "https://docs.google.com/spreadsheets/d/14ALXZgFIT68ee9ajuIdG63SpGVm0HyTjwp63-J6vRyg/gviz/tq?tqx=out:json&gid=669887707",

  EVENTOS:
    "https://docs.google.com/spreadsheets/d/1IDjs0oS6lQBGDrL7ja1Ge0vaBdNCNIULDH7J5p89c5s/gviz/tq?tqx=out:json&gid=0",

  PROFESSORES:
    "https://docs.google.com/spreadsheets/d/1IDjs0oS6lQBGDrL7ja1Ge0vaBdNCNIULDH7J5p89c5s/gviz/tq?tqx=out:json&gid=1694280391",

  RELATORIO_INTEGRADO:
    "https://docs.google.com/spreadsheets/d/1j33kiPqwtzZNuvkBgYDaIiXZvVMY_J0qWAtRfYGdnD8/gviz/tq?tqx=out:json&gid=657984342",

  RELATORIO_SUPERIOR1:
    "https://docs.google.com/spreadsheets/d/14ALXZgFIT68ee9ajuIdG63SpGVm0HyTjwp63-J6vRyg/gviz/tq?tqx=out:json&gid=1064095810"

};

// ======================================================
// 📦 BASES GLOBAIS
// ======================================================

window.dadosGlobais = [];

window.dadosProcessados = [];

window.eventosGlobais = [];

window.professoresNormalizados = {};

window.relatorioDPT = [];

window.semanasAgrupadas = {};

window.snapshots = {};

window.alteracoesDetectadas = [];

window.cacheSistema = {};

// ======================================================
// 🚀 INICIALIZAÇÃO PRINCIPAL
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {

  try {

    mostrarLoader();

    await init();

    esconderLoader();

    mostrarToast(
      "Sistema carregado com sucesso",
      "success"
    );

  } catch (erro) {

    console.error(erro);

    esconderLoader();

    mostrarToast(
      "Erro ao carregar sistema",
      "error"
    );

  }

});

// ======================================================
// 🚀 INIT GERAL
// ======================================================

async function init() {

  console.log("🚀 Iniciando sistema...");

  await carregarBases();

  processarMatriz();

  aplicarEventos();

  agruparSemanas();

  preencherSelectSemanas();

  preencherSelectProfessores();

  preencherSelectTurmas();

  detectarSemanaAtual();

  await verificarSnapshots();

  renderizarAbaAtual();

}

// ======================================================
// 📡 CARREGAMENTO DE TODAS BASES
// ======================================================

async function carregarBases() {

  await Promise.all([

    carregarIntegrado(),

    carregarSuperior(),

    carregarEventos(),

    carregarProfessores(),

    carregarRelatorios()

  ]);

}

// ======================================================
// 🔥 FETCH PADRÃO GOOGLE SHEETS
// ======================================================

async function carregarPlanilha(url) {

  const response = await fetch(url);

  const texto = await response.text();

  const json = JSON.parse(
    texto
      .substring(47)
      .slice(0, -2)
  );

  return json.table.rows.map(r => {

    return r.c.map(c => {

      return c?.v || "";

    });

  });

}

// ======================================================
// 📘 INTEGRADO
// ======================================================

async function carregarIntegrado() {

  const dados =
    await carregarPlanilha(
      PLANILHAS.INTEGRADO
    );

  dadosGlobais.push(...dados);

}

// ======================================================
// 🎓 SUPERIOR
// ======================================================

async function carregarSuperior() {

  const dados =
    await carregarPlanilha(
      PLANILHAS.SUPERIOR1
    );

  dadosGlobais.push(...dados);

}

// ======================================================
// 📅 EVENTOS
// ======================================================

async function carregarEventos() {

  eventosGlobais =
    await carregarPlanilha(
      PLANILHAS.EVENTOS
    );

}

// ======================================================
// 👨‍🏫 PROFESSORES
// ======================================================

async function carregarProfessores() {

  const dados =
    await carregarPlanilha(
      PLANILHAS.PROFESSORES
    );

  professoresNormalizados = {};

  dados.forEach(r => {

    const curto =
      normalizarTexto(r[0] || "");

    const completo =
      r[1] || "";

    if (curto) {

      professoresNormalizados[curto] =
        completo;

    }

  });

}

// ======================================================
// 📄 RELATÓRIOS
// ======================================================

async function carregarRelatorios() {

  const integrado =
    await carregarPlanilha(
      PLANILHAS.RELATORIO_INTEGRADO
    );

  const superior =
    await carregarPlanilha(
      PLANILHAS.RELATORIO_SUPERIOR1
    );

  relatorioDPT = [

    ...integrado,

    ...superior

  ];

}

// ======================================================
// 🔥 PROCESSAR MATRIZ
// ======================================================

function processarMatriz() {

  dadosProcessados = [];

  dadosGlobais.forEach(linha => {

    // ignora linhas totalmente vazias
    if (
      linha.every(c => !c)
    ) {
      return;
    }

    dadosProcessados.push(linha);

  });

}

// ======================================================
// 📅 AGRUPAR SEMANAS
// ======================================================

function agruparSemanas() {

  semanasAgrupadas = {};

  let semanaAtual = null;

  dadosProcessados.forEach(linha => {

    const data = linha[0];

    if (
      validarData(data)
    ) {

      const semana =
        obterSemanaDaData(data);

      if (
        !semanasAgrupadas[semana]
      ) {

        semanasAgrupadas[semana] = {

          dias: {}

        };

      }

      semanaAtual = semana;

      if (
        !semanasAgrupadas[semana]
          .dias[data]
      ) {

        semanasAgrupadas[semana]
          .dias[data] = [];

      }

      semanasAgrupadas[semana]
        .dias[data]
        .push(linha);

    }

  });

}

// ======================================================
// 📅 DETECTA SEMANA ATUAL
// ======================================================

function detectarSemanaAtual() {

  const hoje =
    formatarData(new Date());

  const semanas =
    Object.keys(semanasAgrupadas);

  const encontrada =
    semanas.find(s =>
      s.includes(hoje)
    );

  window.appState.semanaAtual =
    encontrada || semanas[0];

}

// ======================================================
// 🔥 EVENTOS EXTERNOS
// ======================================================

function aplicarEventos() {

  console.log(
    "📅 Aplicando eventos..."
  );

}

// ======================================================
// 🔥 SNAPSHOTS
// ======================================================

async function verificarSnapshots() {

  console.log(
    "📸 Verificando snapshots..."
  );

}

// ======================================================
// 🔥 PREENCHER SEMANAS
// ======================================================

function preencherSelectSemanas() {

  const semanas =
    Object.keys(semanasAgrupadas);

  const selects = [

    "selectSemana",
    "selectSemanaProfessor",
    "selectSemanaTurma"

  ];

  selects.forEach(id => {

    const select =
      document.getElementById(id);

    if (!select) return;

    select.innerHTML = "";

    semanas.forEach(semana => {

      const option =
        document.createElement("option");

      option.value = semana;

      option.textContent = semana;

      select.appendChild(option);

    });

  });

}

// ======================================================
// 👨‍🏫 PREENCHER PROFESSORES
// ======================================================

function preencherSelectProfessores() {

  const select =
    document.getElementById(
      "selectProfessor"
    );

  if (!select) return;

  select.innerHTML = `
    <option value="">
      Selecione o professor
    </option>
  `;

  Object.values(
    professoresNormalizados
  )

  .sort()

  .forEach(nome => {

    const option =
      document.createElement("option");

    option.value = nome;

    option.textContent = nome;

    select.appendChild(option);

  });

}

// ======================================================
// 🎓 PREENCHER TURMAS
// ======================================================

function preencherSelectTurmas() {

  const select =
    document.getElementById(
      "selectTurmaFicha"
    );

  if (!select) return;

  select.innerHTML = `
    <option value="">
      Selecione a turma
    </option>
  `;

  const modalidade =
    window.appState.modalidade;

  const turmas =
    modalidade === "SUPERIOR"
      ? TURMAS_SUPERIOR
      : TURMAS_INTEGRADO;

  turmas.forEach(turma => {

    const option =
      document.createElement("option");

    option.value = turma;

    option.textContent = turma;

    select.appendChild(option);

  });

}