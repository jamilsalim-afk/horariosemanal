 function deveCompararDia(dataStr){

  const [d,m,a] = dataStr.split('/');
  const data = new Date(a, m-1, d);

  const hoje = new Date();

  // remove hora
  hoje.setHours(0,0,0,0);
  data.setHours(0,0,0,0);

  // segunda-feira da semana atual
  const segunda = new Date(hoje);
  const diaSemana = segunda.getDay();
  const ajuste = diaSemana === 0 ? -6 : 1 - diaSemana;
  segunda.setDate(segunda.getDate() + ajuste);
  segunda.setHours(0,0,0,0);

  // sábado da semana atual
  const sabado = new Date(segunda);
  sabado.setDate(sabado.getDate() + 5);
  sabado.setHours(23,59,59,999);

  // só compara dias da semana atual
  if(data < segunda) return false;
  if(data > sabado) return false;

  // só compara de hoje para frente
  if(data < hoje) return false;

  return true;
}
