document.addEventListener("DOMContentLoaded", function () {
  // Seletores de elementos da interface
  const dataInicialInput = document.getElementById("dataInicial");
  const dataFinalInput = document.getElementById("dataFinal");
  const pesquisarButton = document.getElementById("pesquisar");
  // Seletores para os KPIs de cada filial e do grupo
  const kpis = {
    1: {
      receberPago: document.getElementById("receberPagoFilial1"),
      receberTitulo: document.getElementById("receberTituloFilial1"),
      pagarPago: document.getElementById("pagarPagoFilial1"),
      pagarTitulo: document.getElementById("pagarTituloFilial1"),
    },
    2: {
      receberPago: document.getElementById("receberPagoFilial2"),
      receberTitulo: document.getElementById("receberTituloFilial2"),
      pagarPago: document.getElementById("pagarPagoFilial2"),
      pagarTitulo: document.getElementById("pagarTituloFilial2"),
    },
    3: {
      receberPago: document.getElementById("receberPagoFilial3"),
      receberTitulo: document.getElementById("receberTituloFilial3"),
      pagarPago: document.getElementById("pagarPagoFilial3"),
      pagarTitulo: document.getElementById("pagarTituloFilial3"),
    },
  };
let updateTimer; // Timer para atualização automática

  // Funções utilitárias
  // Função para formatar número em formato de moeda
  function formatarMoeda(numero) {
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // Função para validar datas
  function validarDatas(dataInicial, dataFinal) {
    return new Date(dataInicial) <= new Date(dataFinal);
  }

  // Função para formatar datas
  function formatarData(data) {
    return data.split("-").reverse().join("-");
  }

  // Função definir as cores dos valores dos KPIs
  function definirCorDoValor(valorFormatado, elemento) {
    // Removendo o símbolo de moeda e convertendo para número
    const valor = Number(valorFormatado.replace(/R\$\s?|(\.)/g, '').replace(',', '.'));
  
    // Definindo a cor baseada no valor
    if (valor > 0) {
      elemento.style.color = 'green';
    } else if (valor < 0) {
      elemento.style.color = 'red';
    } else {
      elemento.style.color = 'black';
    }
  }
  // Comunicação com a API
  // Função para buscar dados da API
  async function buscarDadosAPI(apiUrl) {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao buscar dados da API: ${response.status} - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Função para buscar dados para o gráfico
  async function buscarDadosFluxoDeCaixaDia() {
    const apiUrl = `https://sga.grupobrf1.com:4445/fluxo_de_caixa_dia?data_inicial=${formatarData(dataInicialInput.value)}&data_final=${formatarData(dataFinalInput.value)}`;
    try {
        const dados = await buscarDadosAPI(apiUrl);
        criarGraficoFluxoDeCaixa(dados);
    } catch (error) {
        console.error("Erro ao buscar dados para o gráfico:", error);
    }
  }

  // Funções de atualização e processamento de dados
  // Atualiza KPIs de Contas a Receber/Pagar
  async function atualizarKPIsContas() {
    const apiUrl = `https://sga.grupobrf1.com:4445/fluxo_de_caixa?data_inicial=${formatarData(dataInicialInput.value)}&data_final=${formatarData(dataFinalInput.value)}`;
    const dados = await buscarDadosAPI(apiUrl);
    processarKPIsContas(dados);
  }

  // Processa KPIs de Contas a Receber/Pagar
  function processarKPIsContas(dados) {
    dados.forEach(dado => {
        const { CODFILIAL, RECEBER_VALORPAGO, RECEBER_VALORTITULO, PAGAR_VALORPAGO, PAGAR_VALORTITULO } = dado;

        // Atualiza os valores e cores para cada filial
        if (kpis.hasOwnProperty(CODFILIAL)) {
            kpis[CODFILIAL].receberPago.textContent = formatarMoeda(RECEBER_VALORPAGO);
            definirCorDoValor(kpis[CODFILIAL].receberPago.textContent, kpis[CODFILIAL].receberPago);

            kpis[CODFILIAL].receberTitulo.textContent = formatarMoeda(RECEBER_VALORTITULO);
            definirCorDoValor(kpis[CODFILIAL].receberTitulo.textContent, kpis[CODFILIAL].receberTitulo);

            kpis[CODFILIAL].pagarPago.textContent = formatarMoeda(PAGAR_VALORPAGO);
            definirCorDoValor(kpis[CODFILIAL].pagarPago.textContent, kpis[CODFILIAL].pagarPago);

            kpis[CODFILIAL].pagarTitulo.textContent = formatarMoeda(PAGAR_VALORTITULO);
            definirCorDoValor(kpis[CODFILIAL].pagarTitulo.textContent, kpis[CODFILIAL].pagarTitulo);
        }
    });
  }


  // Atualiza saldos dos bancos
  async function atualizarSaldosBanco() {
    const dadosSaldoBanco = await buscarDadosAPI("https://sga.grupobrf1.com:4445/saldo_banco");
    processarSaldosBanco(dadosSaldoBanco);
  }

  // Processa saldos dos bancos
  function processarSaldosBanco(dados) {
    let saldoTotalGrupoBRF1 = 0;
    const saldosPorFilial = {
        '1': [],
        '2': [],
        '3': [],
    };

    dados.forEach(dado => {
        const { CODFILIAL, BANCO, VALOR } = dado;
        saldoTotalGrupoBRF1 += VALOR;

        if (saldosPorFilial.hasOwnProperty(CODFILIAL)) {
            const valorFormatado = formatarMoeda(VALOR);
            const elementoSaldo = document.createElement('span');
            const nomeBanco = document.createTextNode(`${BANCO}: `);
            const valorElemento = document.createElement('span');
            valorElemento.innerHTML = valorFormatado;
            definirCorDoValor(valorFormatado, valorElemento);

            elementoSaldo.appendChild(nomeBanco);
            elementoSaldo.appendChild(valorElemento);
            saldosPorFilial[CODFILIAL].push(elementoSaldo.outerHTML);
        }
    });

    // Atualiza a interface para cada filial
    Object.keys(saldosPorFilial).forEach(filialId => {
        const container = document.getElementById(`saldoBancoFilial${filialId}Detalhes`);
        container.innerHTML = saldosPorFilial[filialId].join("<br>");
    });

    // Atualiza total do Grupo BRF1
    const containerGrupoBRF1 = document.getElementById('saldoBancoGrupoDetalhes');
    const valorTotalFormatado = formatarMoeda(saldoTotalGrupoBRF1);
    const totalElemento = document.createElement('span');
    totalElemento.innerHTML = `Total: ${valorTotalFormatado}`;
    definirCorDoValor(valorTotalFormatado, totalElemento);
    containerGrupoBRF1.innerHTML = '';
    containerGrupoBRF1.appendChild(totalElemento);
  }

  // Gestão de gráficos
  let graficoFluxoDeCaixa = null; // Variável global para armazenar o gráfico

  // Cria gráfico de fluxo de caixa
  function criarGraficoFluxoDeCaixa(dados) {
    const labels = dados.map(d => d.DTVENC);
    const saldoDisponivelData = dados.map(d => d.SALDO_DISP);
    const saldoPrevistoData = dados.map(d => d.SALDO_PREVISTO);

    if (graficoFluxoDeCaixa) {
        // Gráfico já existe, atualize os dados
        graficoFluxoDeCaixa.data.labels = labels;
        graficoFluxoDeCaixa.data.datasets[0].data = saldoDisponivelData;
        graficoFluxoDeCaixa.data.datasets[1].data = saldoPrevistoData;
        graficoFluxoDeCaixa.update();
    } else {
        // Gráfico não existe, crie um novo
        const ctx = document.getElementById('graficoFluxoDeCaixa').getContext('2d');
        graficoFluxoDeCaixa = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Saldo Disponível',
                    data: saldoDisponivelData,
                    borderColor: 'rgb(54, 162, 235)',
                    tension: 0.1
                }, {
                    label: 'Saldo Previsto',
                    data: saldoPrevistoData,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

  // Temporizador e eventos da interface
  // Inicia o temporizador para atualização automática
  function iniciarTemporizador() {
    pararTemporizador();
    updateTimer = setInterval(atualizarTodosKPIs, 60000);
  }

  // Para o temporizador de atualização automática
  function pararTemporizador() {
    if (updateTimer) {
      clearInterval(updateTimer);
      updateTimer = null; // Adicione esta linha para limpar a referência
    }
  }

  // Atualiza todos os KPIs (Contas, Saldos e Gráfico)
  async function atualizarTodosKPIs() {
    if (!validarDatas(dataInicialInput.value, dataFinalInput.value)) {
        alert("Erro: A data inicial não pode ser maior que a data final.");
        return;
    }
    await atualizarKPIsContas();
    await atualizarSaldosBanco();
    await buscarDadosFluxoDeCaixaDia(); // Atualiza o gráfico
  }

  // Evento de clique para o botão de pesquisa
  pesquisarButton.addEventListener("click", function() {
    pararTemporizador(); // Parar a atualização automática ao realizar uma pesquisa manual
    atualizarTodosKPIs(); // Realizar a atualização de dados manualmente
  });


  // Busca o acumulado do mês atual ao carregar a página
  async function buscarAcumuladoMesAtual() {
    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = (dataAtual.getMonth() + 1).toString().padStart(2, "0");
    const primeiroDiaDoMes = "01";
    const diaAtual = dataAtual.getDate().toString().padStart(2, "0"); // Dia atual

    const dataInicialFormatada = formatarData(`${ano}-${mes}-${primeiroDiaDoMes}`);
    const dataFinalFormatada = formatarData(`${ano}-${mes}-${diaAtual}`);

    dataInicialInput.value = `${ano}-${mes}-${primeiroDiaDoMes}`;
    dataFinalInput.value = `${ano}-${mes}-${diaAtual}`; // Define a data final como hoje
    await atualizarTodosKPIs();
    iniciarTemporizador();
  }

  buscarAcumuladoMesAtual(); // Executa ao carregar a página
});
