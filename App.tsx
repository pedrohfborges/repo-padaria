
import React, { useState, useEffect } from 'react';
import { Company, Employee, Order, Product, CompanyProductSetting, RecurringOrderConfig } from './types';
import Sidebar from './components/Sidebar';
import CompanyManagement from './components/CompanyProfile';
import EmployeeManagement from './components/EmployeeManagement';
import { BuildingStorefrontIcon, UsersIcon, ClipboardDocumentListIcon, TagIcon, ShoppingBagIcon } from './components/Icons';
import LoginPage from './components/LoginPage';
import OrderManagement from './components/OrderManagement';
import ProductManagement from './components/ProductManagement';
import CompanyDetailView from './components/CompanyDetailView';

type View = 'companies' | 'employees' | 'orders' | 'door-sales' | 'products';

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) return JSON.parse(storedValue);
    } catch (error) { console.error(`Error loading ${key}`, error); }
    return defaultValue;
};

const saveToLocalStorage = <T,>(key: string, value: T) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { console.error(`Error saving ${key}`, error); }
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
      orders: [],
      productSettings: [
        { productId: 'prod-1', buys: true, price: 0.75 },
        { productId: 'prod-2', buys: true, price: 5.50 }
      ]
    }
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<View>('companies');
  const [companies, setCompanies] = useState<Company[]>(() => loadFromLocalStorage('companies', initialCompanies));
  const [employees, setEmployees] = useState<Employee[]>(() => loadFromLocalStorage('employees', []));
  const [products, setProducts] = useState<Product[]>(() => loadFromLocalStorage('products', []));
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [viewingCompanyId, setViewingCompanyId] = useState<string | null>(null);

  useEffect(() => { saveToLocalStorage('companies', companies); }, [companies]);
  useEffect(() => { saveToLocalStorage('employees', employees); }, [employees]);
  useEffect(() => { saveToLocalStorage('products', products); }, [products]);

  // Lógica de Geração Automática de Pedidos Recorrentes
  useEffect(() => {
    if (isAuthenticated) {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayDay = new Date().getDay(); // 0 (Dom) a 6 (Sab)
      
      setCompanies(prevCompanies => prevCompanies.map(company => {
        if (!company.recurringOrder) return company;
        
        const { recurrence, items } = company.recurringOrder;
        
        // Verifica se já gerou hoje para evitar duplicatas
        const alreadyGeneratedToday = company.orders.some(o => o.date === todayStr);
        if (alreadyGeneratedToday) return company;

        let shouldGenerate = false;
        switch (recurrence.type) {
          case 'daily': 
            shouldGenerate = true; 
            break;
          case 'weekdays': 
            shouldGenerate = todayDay >= 1 && todayDay <= 5; 
            break;
          case 'weekly':
            // Se for o mesmo dia da semana configurado inicialmente (simulação)
            shouldGenerate = true; 
            break;
          default: 
            shouldGenerate = false;
        }

        if (shouldGenerate) {
          const newOrder: Order = {
            id: `auto-${Date.now()}-${company.id}`,
            date: todayStr,
            items: items.map((it, idx) => ({ ...it, id: `item-auto-${idx}-${Date.now()}` }))
          };
          return {
            ...company,
            orders: [newOrder, ...company.orders]
          };
        }
        return company;
      }));
    }
  }, [isAuthenticated]);

  const handleUpdateRecurringOrder = (companyId: string, config: RecurringOrderConfig) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, recurringOrder: config } : c));
  };

  const handleLogin = (user: string, pass: string): boolean => {
    if (user === 'admin' && pass === 'admin') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => { setIsAuthenticated(false); setViewingCompanyId(null); };

  const handleSetCurrentView = (view: View) => {
    setCurrentView(view);
    setViewingCompanyId(null);
    const filtered = view === 'orders' ? companies.filter(c => !c.doorSale) : view === 'door-sales' ? companies.filter(c => c.doorSale) : companies;
    setSelectedCompanyId(filtered.length > 0 ? filtered[0].id : null);
  }

  const handleAddCompany = (newCompanyData: Omit<Company, 'id' | 'orders'>) => {
    const newCompany: Company = { ...newCompanyData, id: Date.now().toString(), orders: [], productSettings: [] };
    setCompanies(prev => [...prev, newCompany]);
  };

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
  };

  const handleDeleteCompany = (companyId: string) => {
    const remaining = companies.filter(c => c.id !== companyId);
    setCompanies(remaining);
    if (selectedCompanyId === companyId) setSelectedCompanyId(remaining.length > 0 ? remaining[0].id : null);
  };

  const handleAddOrder = (newOrderData: Omit<Order, 'id'>) => {
    if (!selectedCompanyId) return;
    setCompanies(prev => prev.map(c => {
      if (c.id === selectedCompanyId) {
        const newOrder: Order = { ...newOrderData, id: `order-${Date.now()}` };
        return { ...c, orders: [newOrder, ...c.orders].sort((a, b) => b.date.localeCompare(a.date)) };
      }
      return c;
    }));
  };

  const handleDeleteOrder = (orderId: string) => {
    if (!selectedCompanyId) return;
    setCompanies(prev => prev.map(c => c.id === selectedCompanyId ? { ...c, orders: c.orders.filter(o => o.id !== orderId) } : c));
  };

  const handleUpdateOrderSignature = (orderId: string, signature: string) => {
    if (!selectedCompanyId) return;
    setCompanies(prev => prev.map(c => c.id === selectedCompanyId ? { ...c, orders: c.orders.map(o => o.id === orderId ? { ...o, signature } : o) } : c));
  };

  const renderContent = () => {
    const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;
    const companyToView = companies.find(c => c.id === viewingCompanyId);

    if (currentView === 'companies' && companyToView) {
      return <CompanyDetailView company={companyToView} products={products} onUpdate={handleUpdateCompany} onUpdateProductSettings={(id, s) => setCompanies(prev => prev.map(c => c.id === id ? { ...c, productSettings: s } : c))} onBack={() => setViewingCompanyId(null)} />
    }

    switch (currentView) {
      case 'companies': return <CompanyManagement companies={companies} onAdd={handleAddCompany} onUpdate={handleUpdateCompany} onDelete={handleDeleteCompany} onViewCompany={setViewingCompanyId} />;
      case 'employees': return <EmployeeManagement employees={employees} onAddEmployee={(e) => setEmployees(prev => [...prev, { ...e, id: `emp-${Date.now()}`, status: 'Ativo' }])} onDeleteEmployee={(id) => setEmployees(prev => prev.filter(e => e.id !== id))} onUpdateEmployeeStatus={(id, s) => setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: s } : e))} />;
      case 'orders': return <OrderManagement companies={companies.filter(c => !c.doorSale)} selectedCompany={selectedCompany} products={products} onSelectCompany={setSelectedCompanyId} onAddOrder={handleAddOrder} onDeleteOrder={handleDeleteOrder} onUpdateOrderSignature={handleUpdateOrderSignature} onUpdateRecurringOrder={handleUpdateRecurringOrder} isDoorSaleMode={false} />;
      case 'door-sales': return <OrderManagement companies={companies.filter(c => c.doorSale)} selectedCompany={selectedCompany} products={products} onSelectCompany={setSelectedCompanyId} onAddOrder={handleAddOrder} onDeleteOrder={handleDeleteOrder} onUpdateOrderSignature={handleUpdateOrderSignature} isDoorSaleMode={true} />;
      case 'products': return <ProductManagement products={products} onAdd={(p) => setProducts(prev => [...prev, { ...p, id: `prod-${Date.now()}` }])} onUpdate={(p) => setProducts(prev => prev.map(prod => prod.id === p.id ? p : prod))} onDelete={(id) => setProducts(prev => prev.filter(p => p.id !== id))} />;
      default: return null;
    }
  };
  
  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;
  
  const headerInfo = {
    companies: { icon: <BuildingStorefrontIcon className="h-8 w-8 text-orange-500" />, title: 'Gerenciamento de Empresas', subtitle: 'Adicione, visualize e edite as informações das suas empresas clientes.' },
    employees: { icon: <UsersIcon className="h-8 w-8 text-orange-500" />, title: 'Gerenciamento de Funcionários', subtitle: 'Gerencie a equipe da Engenho do Pão.' },
    orders: { icon: <ClipboardDocumentListIcon className="h-8 w-8 text-orange-500" />, title: 'Gerenciamento de Pedidos', subtitle: 'Registre e acompanhe os pedidos diários de clientes regulares.' },
    'door-sales': { icon: <ShoppingBagIcon className="h-8 w-8 text-orange-500" />, title: 'Venda na Porta', subtitle: 'Gerencie pedidos específicos de venda na porta.' },
    products: { icon: <TagIcon className="h-8 w-8 text-orange-500" />, title: 'Gerenciamento de Produtos', subtitle: 'Cadastre e organize os produtos oferecidos pela padaria.' },
  };

  return (
    <div className="flex h-screen bg-orange-50 font-sans">
      <Sidebar currentView={currentView} setCurrentView={handleSetCurrentView} onLogout={handleLogout} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {!(currentView === 'companies' && viewingCompanyId) && (
          <header className="mb-8">
              <div className="flex items-center gap-4">
                  {headerInfo[currentView].icon}
                  <h1 className="text-3xl font-bold text-amber-800">{headerInfo[currentView].title}</h1>
              </div>
              <p className="text-amber-600 mt-1">{headerInfo[currentView].subtitle}</p>
          </header>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
