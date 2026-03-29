import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

/**
 * ==============================================================================
 * DOCUMENTAÇÃO DE NEGÓCIO - SISTEMA DE GESTÃO DE PADARIA
 * ==============================================================================
 * 
 * 1. GESTÃO DE CLIENTES (COMPANIES)
 *    - O sistema diferencia entre Pessoa Física (PF) e Pessoa Jurídica (PJ).
 *    - Cada cliente possui configurações específicas de faturamento e entrega.
 *    - 'doorSale': Define se o cliente é elegível para vendas diretas "na porta".
 *    - 'orderScheduling': Habilita o agendamento automático de pedidos para o cliente.
 *    - 'productSettings': Permite definir preços customizados por produto para cada cliente.
 *      Se um produto não estiver marcado como 'buys' ou tiver preço zero, ele não aparece
 *      nas opções de venda para aquele cliente.
 * 
 * 2. GESTÃO DE PRODUTOS (PRODUCTS)
 *    - Catálogo centralizado de itens com nome e categoria.
 *    - Os preços base não são globais, mas sim definidos na relação Cliente-Produto.
 * 
 * 3. PEDIDOS E VENDAS (ORDERS)
 *    - Pedidos Manuais: Lançados diretamente no histórico do cliente.
 *    - Venda na Porta: Modalidade de venda rápida que exige coleta de assinaturas
 *      digitais do vendedor e do comprador para fins de auditoria e confirmação.
 *    - Status:
 *      - 'pending': Pedido agendado ou lançado que aguarda confirmação de produção.
 *      - 'confirmed': Pedido já produzido/entregue e oficializado no financeiro.
 * 
 * 4. PEDIDOS RECORRENTES E AGENDAMENTO
 *    - Clientes podem ter uma configuração de recorrência (Diário, Dias Úteis, Semanal, Personalizado).
 *    - O sistema gera "previsões" (drafts) baseadas nessa recorrência.
 *    - Módulo de Produção: Interface onde o padeiro/gestor confirma o que foi produzido
 *      no dia, transformando as previsões em pedidos reais confirmados.
 * 
 * 5. PARÂMETROS FINANCEIROS
 *    - Cada cliente pode ter margens de lucro, taxas de entrega e limites de desconto
 *      específicos, garantindo flexibilidade nas negociações comerciais.
 * 
 * 6. MÓDULOS FUTUROS (ROADMAP)
 *    - Emissão de Nota Fiscal (NF-e/NFC-e).
 *    - Relatórios de Desempenho e Métricas de Venda.
 *    - Controle de Estoque de Insumos e Produtos Acabados.
 * ==============================================================================
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware para JSON
  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Sistema de Gestão de Padaria Online" });
  });

  // Vite middleware para desenvolvimento
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Servir arquivos estáticos em produção
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Fallback para SPA (Express v5 usa *all)
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Erro ao iniciar o servidor:", err);
});
