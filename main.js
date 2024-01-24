document.addEventListener("DOMContentLoaded", function () {
  // Elementos de interface
  const dataInicialInput = document.getElementById("dataInicial");
  const dataFinalInput = document.getElementById("dataFinal");
  const pesquisarButton = document.getElementById("pesquisar");

  // Seletores para os KPIs de cada filial e do grupo
  const kpis = {
      grupoBRF1: {
        receberPago: document.getElementById("receberPagoGrupo"),
        receberTitulo: document.getElementById("receberTituloGrupo"),
        pagarPago: document.getElementById("pagarPagoGrupo"),
        pagarTitulo: document.getElementById("pagarTituloGrupo"),
        saldoDisponivel: document.getElementById("saldoDisponivelGrupo"),
        saldoPrevisto: document.getElementById("saldoPrevistoGrupo"),
      },
      1: {
        receberPago: document.getElementById("receberPagoFilial1"),
        receberTitulo: document.getElementById("receberTituloFilial1"),
        pagarPago: document.getElementById("pagarPagoFilial1"),
        pagarTitulo: document.getElementById("pagarTituloFilial1"),
        saldoDisponivel: document.getElementById("saldoDisponivelFilial1"),
        saldoPrevisto: document.getElementById("saldoPrevistoFilial1"),
      },
      2: {
        receberPago: document.getElementById("receberPagoFilial2"),
        receberTitulo: document.getElementById("receberTituloFilial2"),
        pagarPago: document.getElementById("pagarPagoFilial2"),
        pagarTitulo: document.getElementById("pagarTituloFilial2"),
        saldoDisponivel: document.getElementById("saldoDisponivelFilial2"),
        saldoPrevisto: document.getElementById("saldoPrevistoFilial2"),
      },
      3: {
        receberPago: document.getElementById("receberPagoFilial3"),
        receberTitulo: document.getElementById("receberTituloFilial3"),
        pagarPago: document.getElementById("pagarPagoFilial3"),
        pagarTitulo: document.getElementById("pagarTituloFilial3"),
        saldoDisponivel: document.getElementById("saldoDisponivelFilial3"),
        saldoPrevisto: document.getElementById("saldoPrevistoFilial3"),
      },
    };
  let updateTimer;

  // Formata um número para o formato de moeda brasileira
  function formatarMoeda(numero) {
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // Busca dados da API e trata erros de rede ou resposta
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

  
  
  async function buscarDadosFluxoDeCaixaDia() {
    const apiUrl = `https://192.168.121.145:4445/fluxo_de_caixa_dia?data_inicial=${formatarData(dataInicialInput.value)}&data_final=${formatarData(dataFinalInput.value)}`;
    try {
        const dados = await buscarDadosAPI(apiUrl);
        criarGraficoFluxoDeCaixa(dados);
    } catch (error) {
        console.error("Erro ao buscar dados para o gráfico:", error);
    }
  }


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
  


  // Atualiza os KPIs de Contas a Receber/Pagar
  async function atualizarKPIsContas() {
    const apiUrl = `https://192.168.121.145:4445/fluxo_de_caixa?data_inicial=${formatarData(dataInicialInput.value)}&data_final=${formatarData(dataFinalInput.value)}`;
    const dados = await buscarDadosAPI(apiUrl);
    processarKPIsContas(dados);
  }

  // Processa e exibe os KPIs de Contas a Receber/Pagar
  function processarKPIsContas(dados) {
    let totalReceberPagoGrupo = 0;
    let totalReceberTituloGrupo = 0;
    let totalPagarPagoGrupo = 0;
    let totalPagarTituloGrupo = 0;
    let totalSaldoDisponivelGrupo = 0;
    let totalSaldoPrevistoGrupo = 0;

    dados.forEach(dado => {
        const { CODFILIAL, RECEBER_VALORPAGO, RECEBER_VALORTITULO, PAGAR_VALORPAGO, PAGAR_VALORTITULO, SALDO_DISP, SALDO_PREVISTO } = dado;

        // Soma os totais para o Grupo BRF1
        totalReceberPagoGrupo += RECEBER_VALORPAGO;
        totalReceberTituloGrupo += RECEBER_VALORTITULO;
        totalPagarPagoGrupo += PAGAR_VALORPAGO;
        totalPagarTituloGrupo += PAGAR_VALORTITULO;
        totalSaldoDisponivelGrupo += SALDO_DISP;
        totalSaldoPrevistoGrupo += SALDO_PREVISTO;

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

            kpis[CODFILIAL].saldoDisponivel.textContent = formatarMoeda(SALDO_DISP);
            definirCorDoValor(kpis[CODFILIAL].saldoDisponivel.textContent, kpis[CODFILIAL].saldoDisponivel);

            kpis[CODFILIAL].saldoPrevisto.textContent = formatarMoeda(SALDO_PREVISTO);
            definirCorDoValor(kpis[CODFILIAL].saldoPrevisto.textContent, kpis[CODFILIAL].saldoPrevisto);
        }
    });

    // Atualiza e define as cores dos totais para o Grupo BRF1
    kpis.grupoBRF1.receberPago.textContent = formatarMoeda(totalReceberPagoGrupo);
    definirCorDoValor(kpis.grupoBRF1.receberPago.textContent, kpis.grupoBRF1.receberPago);

    kpis.grupoBRF1.receberTitulo.textContent = formatarMoeda(totalReceberTituloGrupo);
    definirCorDoValor(kpis.grupoBRF1.receberTitulo.textContent, kpis.grupoBRF1.receberTitulo);

    kpis.grupoBRF1.pagarPago.textContent = formatarMoeda(totalPagarPagoGrupo);
    definirCorDoValor(kpis.grupoBRF1.pagarPago.textContent, kpis.grupoBRF1.pagarPago);

    kpis.grupoBRF1.pagarTitulo.textContent = formatarMoeda(totalPagarTituloGrupo);
    definirCorDoValor(kpis.grupoBRF1.pagarTitulo.textContent, kpis.grupoBRF1.pagarTitulo);

    kpis.grupoBRF1.saldoDisponivel.textContent = formatarMoeda(totalSaldoDisponivelGrupo);
    definirCorDoValor(kpis.grupoBRF1.saldoDisponivel.textContent, kpis.grupoBRF1.saldoDisponivel);

    kpis.grupoBRF1.saldoPrevisto.textContent = formatarMoeda(totalSaldoPrevistoGrupo);
    definirCorDoValor(kpis.grupoBRF1.saldoPrevisto.textContent, kpis.grupoBRF1.saldoPrevisto);
  }



  // Atualiza os saldos dos bancos
  async function atualizarSaldosBanco() {
    const dadosSaldoBanco = await buscarDadosAPI("https://sga.grupobrf1.com:4445/saldo_banco");
    processarSaldosBanco(dadosSaldoBanco);
  }

  // Processa e exibe os saldos dos bancos
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

  // Inicia o temporizador para atualização automática
  function iniciarTemporizador() {
      pararTemporizador();
      updateTimer = setInterval(atualizarTodosKPIs, 2000);
  }

  // Para o temporizador de atualização automática
  function pararTemporizador() {
      if (updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null; // Adicione esta linha para limpar a referência
      }
    }

  // Valida se a data inicial é menor ou igual à data final
  function validarDatas(dataInicial, dataFinal) {
    return new Date(dataInicial) <= new Date(dataFinal);
  }

  // Formata a data para o formato "DD-MM-AAAA"
  function formatarData(data) {
    return data.split("-").reverse().join("-");
  }

  // Atualiza todos os KPIs (Contas e Saldos)
  async function atualizarTodosKPIs() {
    if (!validarDatas(dataInicialInput.value, dataFinalInput.value)) {
        alert("Erro: A data inicial não pode ser maior que a data final.");
        return;
    }
    await atualizarKPIsContas();
    await atualizarSaldosBanco();
    await buscarDadosFluxoDeCaixaDia(); // Atualiza o gráfico
  }

  pesquisarButton.addEventListener("click", atualizarTodosKPIs);
  buscarAcumuladoMesAtual();

  let graficoFluxoDeCaixa = null; // Variável global para armazenar o gráfico


  function criarGraficoFluxoDeCaixa(dados) {
    // Destruir o gráfico existente, se houver
    if (graficoFluxoDeCaixa) {
        graficoFluxoDeCaixa.destroy();
    }

    // Processar os dados para o formato necessário pelo Chart.js
    const labels = dados.map(d => d.DTVENC);
    const saldoDisponivelData = dados.map(d => d.SALDO_DISP);
    const saldoPrevistoData = dados.map(d => d.SALDO_PREVISTO);

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

    // Busca o acumulado do mês atual até a data atual ao carregar a página
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
  });
