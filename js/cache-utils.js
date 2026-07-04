/* =====================================================
   cache-utils.js
   Arquivo NOVO e independente — não altera nenhum dos
   arquivos .js existentes (base, config, core, dashboard,
   horario, laboratorios, professor, projecao, relatorios,
   sabado, turma).

   Função: limparCacheEAtualizar()
   - Remove qualquer Service Worker registrado (caso exista)
   - Limpa o Cache Storage do navegador (caso exista)
   - Recarrega a página forçando buscar tudo de novo do
     servidor (bypass do cache HTTP), acrescentando um
     parâmetro de versão único na URL

   Uso: <button onclick="limparCacheEAtualizar()">...</button>
===================================================== */

async function limparCacheEAtualizar() {

  const botao = document.getElementById('btnLimparCache');

  try {

    if (botao) {
      botao.disabled = true;
      botao.textContent = '⏳ Atualizando...';
    }

    // 1) Remove Service Workers registrados (se houver)
    if ('serviceWorker' in navigator) {
      const registros = await navigator.serviceWorker.getRegistrations();
      for (const registro of registros) {
        await registro.unregister();
      }
    }

    // 2) Limpa o Cache Storage (API usada por PWAs / Service Workers)
    if (window.caches && caches.keys) {
      const chaves = await caches.keys();
      await Promise.all(chaves.map((chave) => caches.delete(chave)));
    }

    // 3) Recarrega a página ignorando o cache HTTP do navegador,
    //    acrescentando um parâmetro único para forçar a busca
    //    de arquivos novos (html, css, js) direto do servidor.
    const url = new URL(window.location.href);
    url.searchParams.set('cache_bust', Date.now().toString());
    window.location.href = url.toString();

  } catch (erro) {
    console.error('Erro ao limpar cache:', erro);

    // Mesmo se algo falhar (ex: navegador sem suporte a alguma
    // API), ainda tentamos recarregar forçando busca no servidor.
    const url = new URL(window.location.href);
    url.searchParams.set('cache_bust', Date.now().toString());
    window.location.href = url.toString();
  }
}
