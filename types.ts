export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string; // YYYY-MM-DD
  items: OrderItem[];
  status: 'Pendente' | 'Entregue' | 'Cancelado';
}

export interface CompanyProductSetting {
  productId: string;
  buys: boolean;
  price: number;
}

// FIX: Added FinancialParams interface to be used by FinancialParameters component and Company type.
export interface FinancialParams {
  defaultMargin: number;
  defaultDeliveryFee: number;
  maxDiscount: number;
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
  // FIX: Added optional financials property to Company type.
  financials?: FinancialParams;
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