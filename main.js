document.addEventListener("DOMContentLoaded", function () {
  // Seletores de elementos da interface
  const dataInicialInput = document.getElementById("dataInicial");
  const dataFinalInput = document.getElementById("dataFinal");
  const pesquisarButton = document.getElementById("pesquisar");
  // Seletores para os KPIs de cada filial e do grupo
  // Seletores para os KPIs de cada filial e do grupo
  const kpis = {
    1: {
      receberPago: document.getElementById("receberPagoFilial1"),
      receberTitulo: document.getElementById("receberTituloFilial1"),
      pagarPago: document.getElementById("pagarPagoFilial1"),
      pagarTitulo: document.getElementById("pagarTituloFilial1"),
      vendas: document.getElementById("valorVendasFilial1"),
      compras: document.getElementById("valorComprasFilial1"),
      saldoPago: document.getElementById("saldoPagoFilial1"),
      saldoTitulo: document.getElementById("saldoTituloFilial1"),
    },
    2: {
      receberPago: document.getElementById("receberPagoFilial2"),
      receberTitulo: document.getElementById("receberTituloFilial2"),
      pagarPago: document.getElementById("pagarPagoFilial2"),
      pagarTitulo: document.getElementById("pagarTituloFilial2"),
      vendas: document.getElementById("valorVendasFilial2"),
      compras: document.getElementById("valorComprasFilial2"),
      saldoPago: document.getElementById("saldoPagoFilial2"),
      saldoTitulo: document.getElementById("saldoTituloFilial2"),
    },
    3: {
      receberPago: document.getElementById("receberPagoFilial3"),
      receberTitulo: document.getElementById("receberTituloFilial3"),
      pagarPago: document.getElementById("pagarPagoFilial3"),
      pagarTitulo: document.getElementById("pagarTituloFilial3"),
      vendas: document.getElementById("valorVendasFilial3"),
      compras: document.getElementById("valorComprasFilial3"),
      saldoPago: document.getElementById("saldoPagoFilial3"),
      saldoTitulo: document.getElementById("saldoTituloFilial3"),
    },
    brf1: {
      receberPago: document.getElementById("receberPagoBrf1"),
      receberTitulo: document.getElementById("receberTituloBrf1"),
      pagarPago: document.getElementById("pagarPagoBrf1"),
      pagarTitulo: document.getElementById("pagarTituloBrf1"),
      vendas: document.getElementById("valorVendasBrf1"),
      compras: document.getElementById("valorComprasBrf1"),
      saldoPago: document.getElementById("saldoPagoBrf1"),
      saldoTitulo: document.getElementById("saldoTituloBrf1"),
    }
  };

let updateTimer; // Timer para atualização automática

  // Funções utilitárias
  // Função para formatar número em formato de moeda
  function formatarMoeda(numero) {
    if (numero === null || numero === undefined) {
      return 'R$ 0,00'; // ou alguma outra representação para valores nulos
    }
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

  // Funções de atualização e processamento de dados
  // Atualiza KPIs de Contas a Receber/Pagar
  async function atualizarKPIsContas() {
    const apiUrl = `https://sga.grupobrf1.com:4445/fluxo_de_caixa?data_inicial=${formatarData(dataInicialInput.value)}&data_final=${formatarData(dataFinalInput.value)}`;
    const dados = await buscarDadosAPI(apiUrl);
    processarKPIsContas(dados);
  }

  // Processa KPIs de Contas a Receber/Pagar
  function processarKPIsContas(dados) {
    let totaisBrf1 = {
      receberPago: 0,
      receberTitulo: 0,
      pagarPago: 0,
      pagarTitulo: 0,
      vendas: 0,
      compras: 0,
      saldoPago: 0,
      saldoTitulo: 0
    };

    dados.forEach(dado => {
      const { CODFILIAL, RECEBER_VALORPAGO, RECEBER_VALORTITULO, PAGAR_VALORPAGO, PAGAR_VALORTITULO, VLSAIDAS, VLENTRADAS, SALDO_VALORPAGO, SALDO_VALORTITULO } = dado;

      // Acumula os valores para a filial BRF1
      totaisBrf1.receberPago += RECEBER_VALORPAGO;
      totaisBrf1.receberTitulo += RECEBER_VALORTITULO;
      totaisBrf1.pagarPago += PAGAR_VALORPAGO;
      totaisBrf1.pagarTitulo += PAGAR_VALORTITULO;
      totaisBrf1.vendas += VLSAIDAS;
      totaisBrf1.compras += VLENTRADAS;
      totaisBrf1.saldoPago += SALDO_VALORPAGO;
      totaisBrf1.saldoTitulo += SALDO_VALORTITULO;

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

            kpis[CODFILIAL].vendas.textContent = formatarMoeda(VLSAIDAS);
            definirCorDoValor(kpis[CODFILIAL].vendas.textContent, kpis[CODFILIAL].vendas);

            kpis[CODFILIAL].compras.textContent = formatarMoeda(VLENTRADAS);
            definirCorDoValor(kpis[CODFILIAL].compras.textContent, kpis[CODFILIAL].compras);

            kpis[CODFILIAL].saldoPago.textContent = formatarMoeda(SALDO_VALORPAGO);
            definirCorDoValor(kpis[CODFILIAL].saldoPago.textContent, kpis[CODFILIAL].saldoPago);

            kpis[CODFILIAL].saldoTitulo.textContent = formatarMoeda(SALDO_VALORTITULO);
            definirCorDoValor(kpis[CODFILIAL].saldoTitulo.textContent, kpis[CODFILIAL].saldoTitulo);
        }
  });

  // Atualiza a interface para a filial BRF1
  kpis['brf1'].receberPago.textContent = formatarMoeda(totaisBrf1.receberPago);
  definirCorDoValor(kpis['brf1'].receberPago.textContent, kpis['brf1'].receberPago);

  kpis['brf1'].receberTitulo.textContent = formatarMoeda(totaisBrf1.receberTitulo);
  definirCorDoValor(kpis['brf1'].receberTitulo.textContent, kpis['brf1'].receberTitulo);

  kpis['brf1'].pagarPago.textContent = formatarMoeda(totaisBrf1.pagarPago);
  definirCorDoValor(kpis['brf1'].pagarPago.textContent, kpis['brf1'].pagarPago);

  kpis['brf1'].pagarTitulo.textContent = formatarMoeda(totaisBrf1.pagarTitulo);
  definirCorDoValor(kpis['brf1'].pagarTitulo.textContent, kpis['brf1'].pagarTitulo);

  kpis['brf1'].vendas.textContent = formatarMoeda(totaisBrf1.vendas);
  definirCorDoValor(kpis['brf1'].vendas.textContent, kpis['brf1'].vendas);

  kpis['brf1'].compras.textContent = formatarMoeda(totaisBrf1.compras);
  definirCorDoValor(kpis['brf1'].compras.textContent, kpis['brf1'].compras);

  kpis['brf1'].saldoPago.textContent = formatarMoeda(totaisBrf1.saldoPago);
  definirCorDoValor(kpis['brf1'].saldoPago.textContent, kpis['brf1'].saldoPago);

  kpis['brf1'].saldoTitulo.textContent = formatarMoeda(totaisBrf1.saldoTitulo);
  definirCorDoValor(kpis['brf1'].saldoTitulo.textContent, kpis['brf1'].saldoTitulo);
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
      'brf1': []
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

    // Adiciona o saldo total ao container da filial BRF1
    const valorTotalFormatado = formatarMoeda(saldoTotalGrupoBRF1);
    const elementoTotal = document.createElement('span');
    elementoTotal.innerHTML = `Total: ${valorTotalFormatado}`;
    definirCorDoValor(valorTotalFormatado, elementoTotal);
    saldosPorFilial['brf1'].push(elementoTotal.outerHTML);

    // Atualiza a interface para cada filial
    Object.keys(saldosPorFilial).forEach(filialId => {
      const container = document.getElementById(`saldoBanco${filialId === 'brf1' ? 'Brf1' : 'Filial' + filialId}Detalhes`);
      if (container) { 
        container.innerHTML = saldosPorFilial[filialId].join("<br>");
      }
    });
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