
import { Company, Order, OrderItem } from '../../types';

/**
 * ==============================================================================
 * DOCUMENTAÇÃO DE NEGÓCIO - API DE PEDIDOS RECORRENTES (PJ)
 * ==============================================================================
 * 
 * 1. OBJETIVO:
 *    - Centralizar a lógica de busca de pedidos que devem ser confirmados
 *      para a produção do dia anterior (Ontem).
 * 
 * 2. CRITÉRIOS DE FILTRAGEM (REQUISITOS DO USUÁRIO):
 *    - Apenas clientes do tipo 'PJ' (CNPJ).
 *    - Clientes com a funcionalidade 'orderScheduling' (Agendamento) ativa.
 *    - Pedidos com data de 'Ontem'.
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
 * Retorna a data de ontem no formato YYYY-MM-DD
 */
export const getYesterdayDateStr = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

/**
 * API que puxa todos os pedidos de CNPJ (PJ) marcados com recorrência ativa para ontem.
 */
export const getYesterdayRecurringPJOrders = (companies: Company[]): QueueItem[] => {
  const yesterdayStr = getYesterdayDateStr();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayDay = yesterdayDate.getDay();

  // 1. Filtrar apenas empresas PJ com agendamento ativo
  const pjCompanies = companies.filter(c => c.type === 'PJ' && c.orderScheduling);

  const queue: QueueItem[] = [];

  pjCompanies.forEach(company => {
    // 2. Buscar pedidos reais pendentes de ontem
    const pendingOrders = company.orders.filter(o => 
      o.status === 'pending' && 
      !o.isDoorSale && 
      o.date === yesterdayStr
    );

    pendingOrders.forEach(order => {
      queue.push({ company, order, isDraft: false });
    });

    // 3. Se não houver pedido real para ontem, verificar se há recorrência configurada
    const hasOrderForYesterday = company.orders.some(o => o.date === yesterdayStr);
    
    if (!hasOrderForYesterday && company.recurringOrder) {
      const { type, daysOfWeek } = company.recurringOrder.recurrence;
      
      const isScheduledForYesterday = 
        type === 'daily' || 
        (type === 'weekdays' && yesterdayDay >= 1 && yesterdayDay <= 5) ||
        (daysOfWeek?.includes(yesterdayDay));

      if (isScheduledForYesterday) {
        queue.push({
          company,
          order: {
            id: `draft-${company.id}`,
            date: yesterdayStr,
            items: company.recurringOrder.items as OrderItem[],
            status: 'pending'
          },
          isDraft: true
        });
      }
    }
  });

  return queue.sort((a, b) => a.company.name.localeCompare(b.company.name));
};
