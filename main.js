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
      },
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
  
      dados.forEach(dado => {
      const { CODFILIAL, RECEBER_VALORPAGO, RECEBER_VALORTITULO, PAGAR_VALORPAGO, PAGAR_VALORTITULO } = dado;
  
      // Soma os totais para o Grupo BRF1
      totalReceberPagoGrupo += RECEBER_VALORPAGO;
      totalReceberTituloGrupo += RECEBER_VALORTITULO;
      totalPagarPagoGrupo += PAGAR_VALORPAGO;
      totalPagarTituloGrupo += PAGAR_VALORTITULO;
  
      // Atualiza os valores para cada filial
      if (kpis.hasOwnProperty(CODFILIAL)) {
          kpis[CODFILIAL].receberPago.textContent = formatarMoeda(RECEBER_VALORPAGO);
          kpis[CODFILIAL].receberTitulo.textContent = formatarMoeda(RECEBER_VALORTITULO);
          kpis[CODFILIAL].pagarPago.textContent = formatarMoeda(PAGAR_VALORPAGO);
          kpis[CODFILIAL].pagarTitulo.textContent = formatarMoeda(PAGAR_VALORTITULO);
      }
      });
  
      // Atualiza os totais para o Grupo BRF1
      kpis.grupoBRF1.receberPago.textContent = formatarMoeda(totalReceberPagoGrupo);
      kpis.grupoBRF1.receberTitulo.textContent = formatarMoeda(totalReceberTituloGrupo);
      kpis.grupoBRF1.pagarPago.textContent = formatarMoeda(totalPagarPagoGrupo);
      kpis.grupoBRF1.pagarTitulo.textContent = formatarMoeda(totalPagarTituloGrupo);
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
          saldosPorFilial[CODFILIAL].push(`${BANCO}: ${formatarMoeda(VALOR)}`);
      }
      });
  
      // Atualiza a interface para cada filial e o total do Grupo BRF1
      Object.keys(saldosPorFilial).forEach(filialId => {
      const container = document.getElementById(`saldoBancoFilial${filialId}Detalhes`);
      container.innerHTML = saldosPorFilial[filialId].join("<br>");
      });
  
      // Atualiza total do Grupo BRF1
      const containerGrupoBRF1 = document.getElementById('saldoBancoGrupoDetalhes');
      containerGrupoBRF1.innerHTML = `Total: ${formatarMoeda(saldoTotalGrupoBRF1)}`;
  }

  // Calcula KPIs com base nos dados filtrados
  function calcularKPIs(dadosFiltrados) {
      const receberPagoTotal = dadosFiltrados.reduce(
        (total, item) => total + item.RECEBER_VALORPAGO,
        0
      );
      const receberTituloTotal = dadosFiltrados.reduce(
        (total, item) => total + item.RECEBER_VALORTITULO,
        0
      );
      const pagarPagoTotal = dadosFiltrados.reduce(
        (total, item) => total + item.PAGAR_VALORPAGO,
        0
      );
      const pagarTituloTotal = dadosFiltrados.reduce(
        (total, item) => total + item.PAGAR_VALORTITULO,
        0
      );
  
      return {
        receberPagoTotal,
        receberTituloTotal,
        pagarPagoTotal,
        pagarTituloTotal,
      };
    }

  // Atualiza os valores na interface para cada filial
  function atualizarValoresKPIs(filialId, kpiValues) {
      const kpiElements = kpis[filialId];
      kpiElements.receberPago.textContent = formatarMoeda(
        kpiValues.receberPagoTotal
      );
      kpiElements.receberTitulo.textContent = formatarMoeda(
        kpiValues.receberTituloTotal
      );
      kpiElements.pagarPago.textContent = formatarMoeda(kpiValues.pagarPagoTotal);
      kpiElements.pagarTitulo.textContent = formatarMoeda(
        kpiValues.pagarTituloTotal
      );
    }

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
  }

  pesquisarButton.addEventListener("click", atualizarTodosKPIs);
  buscarAcumuladoMesAtual();

  // Busca o acumulado do mês atual ao carregar a página
  async function buscarAcumuladoMesAtual() {
      const dataAtual = new Date();
      const ano = dataAtual.getFullYear();
      const mes = (dataAtual.getMonth() + 1).toString().padStart(2, "0");
      const primeiroDiaDoMes = "01";
      const ultimoDiaDoMes = new Date(ano, dataAtual.getMonth() + 1, 0).getDate();
      const dataInicialFormatada = formatarData(
        `${ano}-${mes}-${primeiroDiaDoMes}`
      );
      const dataFinalFormatada = formatarData(
        `${ano}-${mes}-${ultimoDiaDoMes.toString().padStart(2, "0")}`
      );
  
      dataInicialInput.value = `${ano}-${mes}-${primeiroDiaDoMes}`;
      dataFinalInput.value = `${ano}-${mes}-${ultimoDiaDoMes
        .toString()
        .padStart(2, "0")}`;
        atualizarTodosKPIs();
      iniciarTemporizador();
    }
  });
