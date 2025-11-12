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

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  logoUrl: string;
  orders: Order[];
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  admissionDate: string;
  salary: number;
  status: 'Ativo' | 'Inativo';
}