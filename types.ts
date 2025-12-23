
export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string; // YYYY-MM-DD
  items: OrderItem[];
  signature?: string; // Base64 encoded image string
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

export type RecurrenceType = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface RecurringOrderConfig {
  items: Omit<OrderItem, 'id'>[];
  recurrence: {
    type: RecurrenceType;
    interval?: number;
    lastGeneratedDate?: string; // YYYY-MM-DD
  };
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  cep: string;
  phone: string;
  logoUrl: string;
  orders: Order[];
  productSettings?: CompanyProductSetting[];
  financials?: FinancialParams;
  doorSale?: boolean;
  recurringOrder?: RecurringOrderConfig;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  admissionDate: string;
  salary: number;
  status: 'Ativo' | 'Inativo';
}

export interface Product {
  id: string;
  name: string;
  category: string;
}
