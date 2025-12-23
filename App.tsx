
import React, { useState, useEffect } from 'react';
import { Company, Employee, Order, Product, CompanyProductSetting } from './types';
import Sidebar from './components/Sidebar';
import CompanyManagement from './components/CompanyProfile';
import EmployeeManagement from './components/EmployeeManagement';
import { BuildingStorefrontIcon, UsersIcon, ClipboardDocumentListIcon, TagIcon, ShoppingBagIcon } from './components/Icons';
import LoginPage from './components/LoginPage';
import OrderManagement from './components/OrderManagement';
import ProductManagement from './components/ProductManagement';
import CompanyDetailView from './components/CompanyDetailView';

type View = 'companies' | 'employees' | 'orders' | 'door-sales' | 'products';

// Helper functions for localStorage
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error(`Error loading ${key} from localStorage`, error);
    }
    return defaultValue;
};

const saveToLocalStorage = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage`, error);
    }
};


const initialCompanies: Company[] = [
    {
      id: '1',
      name: 'Padaria Doce Pão',
      cnpj: '12.345.678/0001-99',
      address: 'Rua das Flores, 123, São Paulo - SP',
      cep: '01234-567',
      phone: '(11) 98765-4321',
      logoUrl: 'https://picsum.photos/seed/bakerylogo/200',
      doorSale: true,
      orders: [
        { id: 'order-1', date: '2024-07-28', items: [
            { id: 'item-1-1', productName: 'Pão Francês', quantity: 50 },
            { id: 'item-1-2', productName: 'Croissant de Chocolate', quantity: 20 },
        ]},
        { id: 'order-2', date: '2024-07-29', items: [
            { id: 'item-2-1', productName: 'Pão de Queijo', quantity: 100 },
            { id: 'item-2-2', productName: 'Bolo de Fubá', quantity: 5 },
        ]},
      ],
      productSettings: [
        { productId: 'prod-1', buys: true, price: 0.75 },
        { productId: 'prod-2', buys: true, price: 5.50 }
      ]
    },
    {
      id: '2',
      name: 'Café da Esquina',
      cnpj: '98.765.432/0001-11',
      address: 'Avenida Principal, 456, Rio de Janeiro - RJ',
      cep: '23456-789',
      phone: '(21) 12345-6789',
      logoUrl: 'https://picsum.photos/seed/cafelogo/200',
      doorSale: false,
      orders: [],
      productSettings: [
         { productId: 'prod-3', buys: true, price: 15.00 }
      ]
    }
];

const initialEmployees: Employee[] = [
      { id: 'emp-1', name: 'Roberto Carlos', role: 'Padeiro Mestre', admissionDate: '2021-03-20', salary: 3800, status: 'Ativo' },
      { id: 'emp-2', name: 'Ana Maria Braga', role: 'Gerente', admissionDate: '2020-11-01', salary: 5200, status: 'Ativo' },
      { id: 'emp-3', name: 'José das Couves', role: 'Entregador', admissionDate: '2023-08-15', salary: 2500, status: 'Inativo' },
];

const initialProducts: Product[] = [
      { id: 'prod-1', name: 'Pão Francês', category: 'Pães' },
      { id: 'prod-2', name: 'Croissant de Chocolate', category: 'Viennoiserie' },
      { id: 'prod-3', name: 'Bolo de Fubá', category: 'Bolos' },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<View>('companies');
  
  const [companies, setCompanies] = useState<Company[]>(() => loadFromLocalStorage('companies', initialCompanies));
  const [employees, setEmployees] = useState<Employee[]>(() => loadFromLocalStorage('employees', initialEmployees));
  const [products, setProducts] = useState<Product[]>(() => loadFromLocalStorage('products', initialProducts));

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(companies[0]?.id || null);
  const [viewingCompanyId, setViewingCompanyId] = useState<string | null>(null);

  useEffect(() => {
    saveToLocalStorage('companies', companies);
  }, [companies]);

  useEffect(() => {
    saveToLocalStorage('employees', employees);
  }, [employees]);

  useEffect(() => {
    saveToLocalStorage('products', products);
  }, [products]);

  const handleLogin = (user: string, pass: string): boolean => {
    if (user === 'admin' && pass === 'admin') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setViewingCompanyId(null);
  };

  const handleSetCurrentView = (view: View) => {
    setCurrentView(view);
    setViewingCompanyId(null); // Reset detail view when changing main view
    
    // Reset selected company when switching between orders and door-sales to avoid showing wrong list
    const filtered = view === 'orders' 
        ? companies.filter(c => !c.doorSale) 
        : view === 'door-sales' 
            ? companies.filter(c => c.doorSale) 
            : companies;
    
    if (filtered.length > 0) {
        setSelectedCompanyId(filtered[0].id);
    } else {
        setSelectedCompanyId(null);
    }
  }

  const handleAddCompany = (newCompanyData: Omit<Company, 'id' | 'orders'>) => {
    const newCompany: Company = {
      ...newCompanyData,
      id: Date.now().toString(),
      orders: [],
      productSettings: []
    };
    setCompanies(prev => [...prev, newCompany]);
  };

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
  };
  
  const handleUpdateCompanyProductSettings = (companyId: string, newSettings: CompanyProductSetting[]) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return { ...c, productSettings: newSettings };
      }
      return c;
    }));
  };

  const handleDeleteCompany = (companyId: string) => {
    const remainingCompanies = companies.filter(c => c.id !== companyId);
    setCompanies(remainingCompanies);
    if (selectedCompanyId === companyId) {
      setSelectedCompanyId(remainingCompanies.length > 0 ? remainingCompanies[0].id : null);
    }
     if (viewingCompanyId === companyId) {
      setViewingCompanyId(null);
    }
  };

  const handleAddEmployee = (newEmployeeData: Omit<Employee, 'id' | 'status'>) => {
    const newEmployee: Employee = { 
        ...newEmployeeData, 
        id: `emp-${Date.now()}`,
        status: 'Ativo' 
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
  };

  const handleUpdateEmployeeStatus = (employeeId: string, status: Employee['status']) => {
    setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, status } : e));
  };

  const handleAddOrder = (newOrderData: Omit<Order, 'id'>) => {
    if (!selectedCompanyId) return;
    setCompanies(prev => prev.map(c => {
      if (c.id === selectedCompanyId) {
        const newOrder: Order = { ...newOrderData, id: `order-${Date.now()}` };
        const sortedOrders = [...c.orders, newOrder].sort((a, b) => b.date.localeCompare(a.date));
        return { ...c, orders: sortedOrders };
      }
      return c;
    }));
  };

  const handleDeleteOrder = (orderId: string) => {
    if (!selectedCompanyId) return;
    setCompanies(prev => prev.map(c => {
      if (c.id === selectedCompanyId) {
        return { ...c, orders: c.orders.filter(o => o.id !== orderId) };
      }
      return c;
    }));
  };

  const handleUpdateOrderSignature = (orderId: string, signature: string) => {
    if (!selectedCompanyId) return;
    setCompanies(prev => prev.map(c => {
      if (c.id === selectedCompanyId) {
        return {
          ...c,
          orders: c.orders.map(o => o.id === orderId ? { ...o, signature } : o)
        };
      }
      return c;
    }));
  };
  
  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: `prod-${Date.now()}`,
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const renderContent = () => {
    const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;
    const companyToView = companies.find(c => c.id === viewingCompanyId);

    if (currentView === 'companies' && companyToView) {
      return <CompanyDetailView 
        company={companyToView}
        products={products}
        onUpdate={handleUpdateCompany} 
        onUpdateProductSettings={handleUpdateCompanyProductSettings}
        onBack={() => setViewingCompanyId(null)}
      />
    }

    switch (currentView) {
      case 'companies':
        return <CompanyManagement 
                  companies={companies}
                  onAdd={handleAddCompany}
                  onUpdate={handleUpdateCompany}
                  onDelete={handleDeleteCompany}
                  onViewCompany={setViewingCompanyId}
                />;
      case 'employees':
        return <EmployeeManagement 
                  employees={employees}
                  onAddEmployee={handleAddEmployee} 
                  onDeleteEmployee={handleDeleteEmployee}
                  onUpdateEmployeeStatus={handleUpdateEmployeeStatus}
                />;
      case 'orders':
        return <OrderManagement 
                  companies={companies.filter(c => !c.doorSale)}
                  selectedCompany={selectedCompany}
                  products={products}
                  onSelectCompany={setSelectedCompanyId}
                  onAddOrder={handleAddOrder}
                  onDeleteOrder={handleDeleteOrder}
                  onUpdateOrderSignature={handleUpdateOrderSignature}
                  isDoorSaleMode={false}
               />;
      case 'door-sales':
        return <OrderManagement 
                  companies={companies.filter(c => c.doorSale)}
                  selectedCompany={selectedCompany}
                  products={products}
                  onSelectCompany={setSelectedCompanyId}
                  onAddOrder={handleAddOrder}
                  onDeleteOrder={handleDeleteOrder}
                  onUpdateOrderSignature={handleUpdateOrderSignature}
                  isDoorSaleMode={true}
               />;
      case 'products':
        return <ProductManagement 
                  products={products}
                  onAdd={handleAddProduct}
                  onUpdate={handleUpdateProduct}
                  onDelete={handleDeleteProduct}
                />;
      default:
        return null;
    }
  };
  
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }
  
  const headerInfo = {
    companies: { icon: <BuildingStorefrontIcon className="h-8 w-8 text-orange-500" />, title: 'Gerenciamento de Empresas', subtitle: 'Adicione, visualize e edite as informações das suas empresas clientes.' },
    employees: { icon: <UsersIcon className="h-8 w-8 text-orange-500" />, title: 'Gerenciamento de Funcionários', subtitle: 'Gerencie a equipe da Engenho do Pão.' },
    orders: { icon: <ClipboardDocumentListIcon className="h-8 w-8 text-orange-500" />, title: 'Gerenciamento de Pedidos', subtitle: 'Registre e acompanhe os pedidos diários de clientes regulares.' },
    'door-sales': { icon: <ShoppingBagIcon className="h-8 w-8 text-orange-500" />, title: 'Venda na Porta', subtitle: 'Gerencie pedidos específicos de venda na porta.' },
    products: { icon: <TagIcon className="h-8 w-8 text-orange-500" />, title: 'Gerenciamento de Produtos', subtitle: 'Cadastre e organize os produtos oferecidos pela padaria.' },
  };
  
  const companyToView = companies.find(c => c.id === viewingCompanyId);

  return (
    <div className="flex h-screen bg-orange-50 font-sans">
      <Sidebar currentView={currentView} setCurrentView={handleSetCurrentView} onLogout={handleLogout} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {!(currentView === 'companies' && companyToView) && (
          <header className="mb-8">
              <div className="flex items-center gap-4">
                  {headerInfo[currentView].icon}
                  <h1 className="text-3xl font-bold text-amber-800">
                    {headerInfo[currentView].title}
                  </h1>
              </div>
              <p className="text-amber-600 mt-1">
                  {headerInfo[currentView].subtitle}
              </p>
          </header>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
