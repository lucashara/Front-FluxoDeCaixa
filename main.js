document.addEventListener("DOMContentLoaded", function () {
  // Elementos da interface
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

  // Variável para controlar o temporizador de atualização
  let updateTimer;

  // Função para formatar um número como moeda brasileira (Real)
  function formatarMoeda(numero) {
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // Função para buscar dados da API e atualizar KPIs
  async function atualizarKPIs() {
    const dataInicialFormatada = formatarData(dataInicialInput.value);
    const dataFinalFormatada = formatarData(dataFinalInput.value);

    try {
      const dados = await buscarDadosAPI(
        dataInicialFormatada,
        dataFinalFormatada
      );

      // Inicializa os valores dos KPIs para o Grupo BRF1
      let receberPagoTotalGrupo = 0;
      let receberTituloTotalGrupo = 0;
      let pagarPagoTotalGrupo = 0;
      let pagarTituloTotalGrupo = 0;

      // Calcular KPIs para cada filial e para o Grupo BRF1
      for (const filialId in kpis) {
        if (kpis.hasOwnProperty(filialId)) {
          const dadosFiltrados = filtrarDadosPorFilial(dados, filialId);
          const kpiValues = calcularKPIs(dadosFiltrados);

          if (filialId !== "grupoBRF1") {
            atualizarValoresKPIs(filialId, kpiValues);
          }

          // Somar os valores ao Grupo BRF1
          receberPagoTotalGrupo += kpiValues.receberPagoTotal;
          receberTituloTotalGrupo += kpiValues.receberTituloTotal;
          pagarPagoTotalGrupo += kpiValues.pagarPagoTotal;
          pagarTituloTotalGrupo += kpiValues.pagarTituloTotal;
        }
      }

      // Atualizar os valores para o Grupo BRF1
      atualizarValoresKPIs("grupoBRF1", {
        receberPagoTotal: receberPagoTotalGrupo,
        receberTituloTotal: receberTituloTotalGrupo,
        pagarPagoTotal: pagarPagoTotalGrupo,
        pagarTituloTotal: pagarTituloTotalGrupo,
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar dados da API.");
    }
  }

  async function buscarDadosAPI(dataInicial, dataFinal) {
    const apiUrl = `https://192.168.121.145:4445/fluxo_de_caixa?data_inicial=${dataInicial}&data_final=${dataFinal}`;
    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        // Lançar um erro com a resposta da API para diagnóstico
        const errorText = await response.text();
        throw new Error(
          `Erro ao buscar dados da API: ${response.status} - ${errorText}`
        );
      }

      return response.json();
    } catch (error) {
      console.error(error);
      throw error; // Relançar o erro para ser capturado pelo bloco try/catch externo
    }
  }

  // Função para filtrar os dados com base na filial selecionada
  function filtrarDadosPorFilial(dados, selectedFilial) {
    return dados.filter((item) => item.CODFILIAL === selectedFilial);
  }

  // Função para calcular os KPIs
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

  // Função para atualizar os valores na interface para cada filial
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

  // Função para iniciar o temporizador de atualização
  function iniciarTemporizador() {
    pararTemporizador();
    updateTimer = setInterval(atualizarKPIs, 60000);
  }

  // Função para parar o temporizador de atualização
  function pararTemporizador() {
    if (updateTimer) {
      clearInterval(updateTimer);
      updateTimer = null; // Adicione esta linha para limpar a referência
    }
  }

  function validarDatas(dataInicial, dataFinal) {
    const dataInicialObj = new Date(dataInicial);
    const dataFinalObj = new Date(dataFinal);

    if (dataInicialObj > dataFinalObj) {
      alert("Erro: A data inicial não pode ser maior que a data final.");
      return false;
    }
    return true;
  }

  // Ajuste o event listener do botão "Pesquisar" para parar o temporizador
  pesquisarButton.addEventListener("click", async function () {
    const dataInicial = dataInicialInput.value;
    const dataFinal = dataFinalInput.value;

    if (!validarDatas(dataInicial, dataFinal)) {
      return; // Interrompe se as datas não são válidas
    }

    pararTemporizador(); // Parar o temporizador ao iniciar a pesquisa
    await atualizarKPIs();
    // Não reinicie o temporizador aqui, pois a intenção é pará-lo após a pesquisa
  });

  // Função para formatar a data no formato "DD-MM-AAAA"
  function formatarData(data) {
    const partes = data.split("-");
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }

  // Chame a função para buscar o acumulado do mês atual ao carregar a página
  buscarAcumuladoMesAtual();

  // Função para buscar o acumulado do mês atual automaticamente ao carregar a página
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
    atualizarKPIs();
    iniciarTemporizador();
  }
});
