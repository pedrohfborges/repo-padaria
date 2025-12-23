
import React, { useState, useEffect } from 'react';
import { Company, Employee, Order, Product, CompanyProductSetting, RecurringOrderConfig } from './types';
import Sidebar from './components/Sidebar';
import CompanyManagement from './components/CompanyProfile';
import EmployeeManagement from './components/EmployeeManagement';
import { BuildingStorefrontIcon, UsersIcon, ClipboardDocumentListIcon, TagIcon, ShoppingBagIcon, CheckCircleIcon } from './components/Icons';
import LoginPage from './components/LoginPage';
import OrderManagement from './components/OrderManagement';
import ProductManagement from './components/ProductManagement';
import CompanyDetailView from './components/CompanyDetailView';
import ScheduledConfirmation from './components/ScheduledConfirmation';

type View = 'companies' | 'employees' | 'orders' | 'door-sales' | 'products' | 'scheduled-confirmation';

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

  // Função Unificada para Confirmar Toda a Fila
  const handleConfirmAllQueue = (data: { drafts: any[], existing: any[] }) => {
    setCompanies(prev => {
      const updated = prev.map(c => {
        let companyOrders = [...c.orders];
        
        // 1. Confirmar pedidos pendentes existentes
        const existingForThisCompany = data.existing.filter(e => e.companyId === c.id);
        if (existingForThisCompany.length > 0) {
          const idsToConfirm = existingForThisCompany.map(e => e.orderId);
          companyOrders = companyOrders.map(o => 
            idsToConfirm.includes(o.id) ? { ...o, status: 'confirmed' as const } : o
          );
        }

        // 2. Oficializar previsões (drafts) como pedidos confirmados
        const draftsForThisCompany = data.drafts.filter(d => d.companyId === c.id);
        if (draftsForThisCompany.length > 0) {
          const newConfirmedOrders: Order[] = draftsForThisCompany.map(d => ({
            ...d.order,
            id: `ord-conf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            status: 'confirmed' as const
          }));
          companyOrders = [...newConfirmedOrders, ...companyOrders];
        }

        return { ...c, orders: companyOrders };
      });
      return updated;
    });
    
    // Feedback de sucesso
    const total = data.drafts.length + data.existing.length;
    alert(`Sucesso! ${total} pedido(s) foram confirmados e enviados para o histórico.`);
  };

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
    const filtered = view === 'door-sales' ? companies.filter(c => c.doorSale) : companies; 
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

  const handleAddOrder = (newOrderData: Omit<Order, 'id'>, companyId?: string) => {
    const targetId = companyId || selectedCompanyId;
    if (!targetId) return;
    setCompanies(prev => prev.map(c => {
      if (c.id === targetId) {
        // Se já tiver status definido (ex: 'confirmed' da venda na porta), mantém. Senão, 'pending'.
        const newOrder: Order = { 
          ...newOrderData, 
          id: `order-manual-${Date.now()}`, 
          status: newOrderData.status || ('pending' as const) 
        };
        return { ...c, orders: [newOrder, ...c.orders].sort((a, b) => b.date.localeCompare(a.date)) };
      }
      return c;
    }));
  };

  const handleDeleteOrder = (orderId: string, companyId?: string) => {
    const targetId = companyId || selectedCompanyId;
    if (!targetId) return;
    setCompanies(prev => prev.map(c => c.id === targetId ? { ...c, orders: c.orders.filter(o => o.id !== orderId) } : c));
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
      case 'scheduled-confirmation': return <ScheduledConfirmation companies={companies} products={products} onConfirmAllQueue={handleConfirmAllQueue} onDeleteOrder={handleDeleteOrder} onAddManualOrder={handleAddOrder} />;
      case 'orders': return <OrderManagement companies={companies} selectedCompany={selectedCompany} products={products} onSelectCompany={setSelectedCompanyId} onAddOrder={handleAddOrder} onDeleteOrder={(id) => handleDeleteOrder(id)} onUpdateOrderSignature={handleUpdateOrderSignature} onUpdateRecurringOrder={handleUpdateRecurringOrder} isDoorSaleMode={false} />;
      case 'door-sales': return <OrderManagement companies={companies.filter(c => c.doorSale)} selectedCompany={selectedCompany} products={products} onSelectCompany={setSelectedCompanyId} onAddOrder={handleAddOrder} onDeleteOrder={(id) => handleDeleteOrder(id)} onUpdateOrderSignature={handleUpdateOrderSignature} isDoorSaleMode={true} />;
      case 'products': return <ProductManagement products={products} onAdd={(p) => setProducts(prev => [...prev, { ...p, id: `prod-${Date.now()}` }])} onUpdate={(p) => setProducts(prev => prev.map(prod => prod.id === p.id ? p : prod))} onDelete={(id) => setProducts(prev => prev.filter(p => p.id !== id))} />;
      default: return null;
    }
  };
  
  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;
  
  const headerInfo = {
    companies: { icon: <BuildingStorefrontIcon className="h-8 w-8 text-orange-500" />, title: 'Gerenciamento de Empresas', subtitle: 'Adicione, visualize e edite as informações das suas empresas clientes.' },
    employees: { icon: <UsersIcon className="h-8 w-8 text-orange-500" />, title: 'Gerenciamento de Funcionários', subtitle: 'Gerencie a equipe da Engenho do Pão.' },
    'scheduled-confirmation': { icon: <CheckCircleIcon className="h-8 w-8 text-orange-500" />, title: 'Fila de Produção & Confirmação', subtitle: 'Gerencie todos os pedidos aguardando confirmação (agendados e manuais).' },
    orders: { icon: <ClipboardDocumentListIcon className="h-8 w-8 text-orange-500" />, title: 'Histórico de pedidos', subtitle: 'Acompanhe o registro histórico de pedidos de todos os clientes.' },
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
