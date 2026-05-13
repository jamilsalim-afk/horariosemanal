const SHEETS={
INTEGRADO:{id:'1j33kiPqwtzZNuvkBgYDaIiXZvVMY_J0qWAtRfYGdnD8',gid:'1357770092'},
SUPERIOR:{id:'14ALXZgFIT68ee9ajuIdG63SpGVm0HyTjwp63-J6vRyg',gid:'669887707'}
};

let dadosGlobais=[],turmasDaPlanilha=[],semanasAgrupadas={};

  function isSemanaPassada(dataStr){
  const [d,m,a] = dataStr.split('/');
  const data = new Date(a, m-1, d);

  const hoje = new Date();

  // pega segunda-feira da semana atual
  const dia = hoje.getDay();
  const diff = hoje.getDate() - dia + (dia === 0 ? -6 : 1);
  const segundaAtual = new Date(hoje.setDate(diff));

  return data < segundaAtual;
}

function limparPainelAlteracoes(){
  document.getElementById("conteudoAlteracoes").innerText = "";
  document.getElementById("painelAlteracoes").style.display = "none";
}

function mostrarPainelVagas(texto){
  document.getElementById("conteudoVagas").innerText = texto;

  document.querySelector("#painelVagas strong").innerText = "📅 Aulas Vagas";

  document.getElementById("painelVagas").style.display = "block";
}

function fecharPainelVagas(){
  document.getElementById("painelVagas").style.display = "none";
}

function copiarVagas(){
  const texto = document.getElementById("conteudoVagas").innerText;
  navigator.clipboard.writeText(texto).then(()=>{
    alert("Copiado!");
  });
}
  
function trocarModalidade(){
  window.trocouModalidade = true;

  limparPainelAlteracoes(); // 🔥 ESSENCIAL

  init();
}

  function trocarSemana(){
  limparPainelAlteracoes(); // 🔥 ESSENCIAL
  renderizarTabela();
}
