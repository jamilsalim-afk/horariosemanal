function abrirRelatorioDia(dia){
  const texto = gerarRelatorioDia(dia);
  mostrarPainelVagas(texto);
}
  
function criarBotoesDias() {
  const sem = document.getElementById('selectSemana').value;
  const dias = semanasAgrupadas[sem].dias;

  let html = `
    <div style="padding:10px;display:flex;gap:10px;flex-wrap:wrap;">
  `;

  Object.keys(dias).forEach(dia => {
    html += `
      <button onclick="abrirRelatorioDia('${dia}')"
        style="padding:10px;background:#2e7d32;color:white;border:none;border-radius:6px;cursor:pointer;">
        📅 ${dia}
      </button>
    `;
  });

  html += `
      <button onclick="abrirRelatorioSemana()"
        style="padding:10px;background:#d32f2f;color:white;border:none;border-radius:6px;cursor:pointer;">
        📊 Semana inteira
      </button>
    </div>
  `;

  document.getElementById("botoesRelatorio").innerHTML = html;
}

  function abrirRelatorioSemana(){
  const texto = gerarRelatorioSemanaTexto();
  mostrarPainelVagas(texto);
}
