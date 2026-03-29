
/**
 * ==============================================================================
 * DOCUMENTAÇÃO DE NEGÓCIO - MODELOS DE DADOS
 * ==============================================================================
 * 
 * 1. CLIENTES (COMPANY):
 *    - Diferencia PF/PJ.
 *    - 'doorSale': Habilita venda direta no balcão com assinaturas.
 *    - 'orderScheduling': Habilita agendamento automático via recorrência.
 *    - 'productSettings': Preços customizados por cliente.
 * 
 * 2. PEDIDOS (ORDER):
 *    - 'pending': Agendado, aguardando produção.
 *    - 'confirmed': Produzido e oficializado.
 *    - 'isDoorSale': Venda rápida com assinaturas de vendedor e comprador.
 * 
 * 3. RECORRÊNCIA (RECURRINGORDERCONFIG):
 *    - Define a lógica de geração automática de pedidos para a produção.
 * ==============================================================================
 */

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string; // YYYY-MM-DD
  items: OrderItem[];
  signature?: string; // Base64 encoded image string
  sellerSignature?: string; // Base64 encoded image string
  sellerSignatureTime?: string; // ISO string
  buyerSignature?: string; // Base64 encoded image string
  buyerSignatureTime?: string; // ISO string
  status?: 'pending' | 'confirmed';
  isDoorSale?: boolean; // Novo campo para identificar vendas na porta
}

export interface CompanyProductSetting {
  productId: string;
  buys: boolean;
  price: number;
}

export interface FinancialParams {
  defaultMargin: number;
  defaultDeliveryFee: number;
  maxDiscount: number;
}

export type RecurrenceType = 'daily' | 'weekdays' | 'weekly' | 'custom';

export interface RecurringOrderConfig {
  items: Omit<OrderItem, 'id'>[];
  recurrence: {
    type: RecurrenceType;
    daysOfWeek?: number[]; // 0=Dom, 1=Seg, ..., 6=Sab
    interval?: number;
    lastGeneratedDate?: string; // YYYY-MM-DD
  };
}

export interface Company {
  id: string;
  name: string;
  type: 'PF' | 'PJ';
  cnpj?: string;
  cpf?: string;
  address: string;
  number?: string;
  bairro?: string;
  cep: string;
  municipio?: string;
  uf?: string;
  phone: string;
  logoUrl: string;
  orders: Order[];
  productSettings?: CompanyProductSetting[];
  financials?: FinancialParams;
  doorSale?: boolean;
  orderScheduling?: boolean; // Novo campo
  recurringOrder?: RecurringOrderConfig;
  emiteNF?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
}
