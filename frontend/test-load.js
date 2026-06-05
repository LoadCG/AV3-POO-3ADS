const http = require("http");

const URL = "http://localhost:3000/api/perf";
const CONCURRENCY_LEVELS = [1, 5, 10];
const ROUNDS_PER_LEVEL = 15; // Número de iterações para obter médias estatísticas estáveis

// Função auxiliar para fazer uma requisição HTTP GET usando o módulo nativo do Node
function sendRequest() {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const req = http.get(URL, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        if (res.statusCode !== 200) {
          reject(new Error(`Erro HTTP ${res.statusCode}: ${data}`));
          return;
        }

        try {
          const json = JSON.parse(data);
          if (json.ok) {
            const processingTime = json.processingTimeMs;
            const latency = Math.max(0, responseTime - processingTime);
            resolve({
              responseTime,
              processingTime,
              latency,
            });
          } else {
            reject(new Error(json.erro || "Erro desconhecido no servidor"));
          }
        } catch (e) {
          reject(new Error("Falha ao fazer parse do JSON retornado"));
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
}

// Executa um lote de requisições concorrentes
async function runBatch(concurrency) {
  const promises = [];
  for (let i = 0; i < concurrency; i++) {
    promises.push(sendRequest());
  }
  return Promise.all(promises);
}

// Função principal de execução dos testes de carga
async function main() {
  console.log("=================================================================");
  console.log("INICIANDO TESTES DE CARGA E PERFORMANCE - SKYFORGE (AV3)");
  console.log("=================================================================\n");

  // Fase de Aquecimento (Warm-up) para carregar cache, pools de conexão e compilação JIT do Next.js
  console.log(">> Fase de Aquecimento (Warm-up): enviando 10 requisições iniciais...");
  for (let i = 0; i < 10; i++) {
    try {
      await sendRequest();
      process.stdout.write(".");
    } catch (e) {
      console.error("\nErro durante o aquecimento:", e.message);
      console.log("Certifique-se de que o servidor local está rodando em http://localhost:3000");
      process.exit(1);
    }
  }
  console.log("\nAquecimento completo!\n");

  const results = {};

  for (const concurrency of CONCURRENCY_LEVELS) {
    console.log(`>> Executando teste com nível de concorrência: ${concurrency} usuário(s)...`);
    
    let allMetrics = [];

    // Executa múltiplos lotes para coletar dados representativos
    for (let round = 1; round <= ROUNDS_PER_LEVEL; round++) {
      try {
        const batchResults = await runBatch(concurrency);
        allMetrics = allMetrics.concat(batchResults);
        process.stdout.write(`[R${round}]`);
        // Pequena pausa entre rodadas para não estressar excessivamente a porta serial/rede local
        await new Promise((r) => setTimeout(r, 100));
      } catch (e) {
        console.error(`\nErro na rodada ${round}:`, e.message);
      }
    }
    console.log("\nConcluído.\n");

    // Cálculo das médias e valores
    const totalRequests = allMetrics.length;
    const avgResponse = allMetrics.reduce((acc, curr) => acc + curr.responseTime, 0) / totalRequests;
    const avgProcessing = allMetrics.reduce((acc, curr) => acc + curr.processingTime, 0) / totalRequests;
    const avgLatency = allMetrics.reduce((acc, curr) => acc + curr.latency, 0) / totalRequests;

    results[concurrency] = {
      concurrency,
      totalRequests,
      avgResponse,
      avgProcessing,
      avgLatency,
      minResponse: Math.min(...allMetrics.map(m => m.responseTime)),
      maxResponse: Math.max(...allMetrics.map(m => m.responseTime)),
    };
  }

  console.log("=================================================================");
  console.log("RESULTADOS FINAIS (MÉDIAS EM MILISSEGUNDOS)");
  console.log("=================================================================");
  console.table(
    Object.values(results).map((r) => ({
      "Usuários Concorrentes": r.concurrency,
      "Total Requisições": r.totalRequests,
      "Tempo Processamento (ms)": r.avgProcessing.toFixed(2),
      "Latência de Rede (ms)": r.avgLatency.toFixed(2),
      "Tempo Resposta (ms)": r.avgResponse.toFixed(2),
      "Mín. Resposta (ms)": r.minResponse.toFixed(2),
      "Máx. Resposta (ms)": r.maxResponse.toFixed(2),
    }))
  );
  console.log("=================================================================\n");
  
  // Imprime também o resultado formatado para inserção direta no relatório
  console.log("Valores para Markdown:");
  Object.values(results).forEach(r => {
    console.log(`Concorrência: ${r.concurrency} - Processamento: ${r.avgProcessing.toFixed(2)}ms, Latência: ${r.avgLatency.toFixed(2)}ms, Resposta: ${r.avgResponse.toFixed(2)}ms`);
  });
}

main();
