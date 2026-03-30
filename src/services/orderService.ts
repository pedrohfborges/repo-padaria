
import { Company, Order, OrderItem } from '../../types';

/**
 * ==============================================================================
 * DOCUMENTAÇÃO DE NEGÓCIO - API DE PEDIDOS RECORRENTES (PJ)
 * ==============================================================================
 * 
 * 1. OBJETIVO:
 *    - Centralizar a lógica de busca de pedidos que devem ser confirmados
 *      para a produção do dia seguinte (Amanhã).
 * 
 * 2. CRITÉRIOS DE FILTRAGEM (REQUISITOS DO USUÁRIO):
 *    - Apenas clientes do tipo 'PJ' (CNPJ).
 *    - Clientes com a funcionalidade 'orderScheduling' (Agendamento) ativa.
 *    - Pedidos com data de 'Amanhã'.
 * 
 * 3. TIPOS DE PEDIDOS RETORNADOS:
 *    - Pedidos Pendentes: Já existem no sistema mas aguardam confirmação.
 *    - Previsões (Drafts): Gerados dinamicamente com base na configuração de
 *      recorrência do cliente para a data alvo.
 * ==============================================================================
 */

export interface QueueItem {
  company: Company;
  order: Order;
  isDraft: boolean;
}

/**
 * Retorna a data de amanhã no formato YYYY-MM-DD
 */
export const getTomorrowDateStr = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

/**
 * API que puxa todos os pedidos de CNPJ (PJ) marcados com recorrência ativa para amanhã.
 */
export const getTomorrowRecurringPJOrders = (companies: Company[]): QueueItem[] => {
  const tomorrowStr = getTomorrowDateStr();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowDay = tomorrowDate.getDay();

  // 1. Filtrar apenas empresas PJ com agendamento ativo
  const pjCompanies = companies.filter(c => c.type === 'PJ' && c.orderScheduling);

  const queue: QueueItem[] = [];

  pjCompanies.forEach(company => {
    // 2. Buscar pedidos reais pendentes de amanhã
    const pendingOrders = company.orders.filter(o => 
      o.status === 'pending' && 
      !o.isDoorSale && 
      o.date === tomorrowStr
    );

    pendingOrders.forEach(order => {
      queue.push({ company, order, isDraft: false });
    });

    // 3. Se não houver pedido real para amanhã, verificar se há recorrência configurada via preferredOrder
    const hasOrderForTomorrow = company.orders.some(o => o.date === tomorrowStr);
    
    if (!hasOrderForTomorrow && company.preferredOrder && company.preferredOrder[tomorrowDay]) {
      const dayConfig = company.preferredOrder[tomorrowDay];
      
      // Adicionar rascunho de manhã se existir
      if (dayConfig.morning && dayConfig.morning.length > 0) {
        queue.push({
          company,
          order: {
            id: `draft-${company.id}-morning`,
            date: tomorrowStr,
            items: dayConfig.morning.map((item, idx) => ({
              id: `item-${idx}`,
              productName: item.productName,
              quantity: item.quantity,
              price: 0
            })),
            status: 'pending',
            period: 'morning'
          },
          isDraft: true
        });
      }

      // Adicionar rascunho de tarde se existir
      if (dayConfig.afternoon && dayConfig.afternoon.length > 0) {
        queue.push({
          company,
          order: {
            id: `draft-${company.id}-afternoon`,
            date: tomorrowStr,
            items: dayConfig.afternoon.map((item, idx) => ({
              id: `item-${idx}`,
              productName: item.productName,
              quantity: item.quantity,
              price: 0
            })),
            status: 'pending',
            period: 'afternoon'
          },
          isDraft: true
        });
      }
    }
  });

  return queue.sort((a, b) => a.company.name.localeCompare(b.company.name));
};
