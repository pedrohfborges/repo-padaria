
import React, { useState, useEffect } from 'react';
import { Company, Order, Product, CompanyProductSetting, RecurringOrderConfig } from './types';
import Sidebar from './components/Sidebar';
import CompanyManagement from './components/CompanyProfile';
import { BuildingStorefrontIcon, ClipboardDocumentListIcon, TagIcon, ShoppingBagIcon, CheckCircleIcon, PlusIcon } from './components/Icons';
import LoginPage from './components/LoginPage';
import OrderManagement from './components/OrderManagement';
import ProductManagement from './components/ProductManagement';
import CompanyDetailView from './components/CompanyDetailView';
import ScheduledConfirmation from './components/ScheduledConfirmation';
import { DocumentTextIcon, ChartBarIcon, ArchiveBoxIcon } from './components/Icons';

type View = 'companies' | 'orders' | 'door-sales' | 'products' | 'scheduled-confirmation' | 'manual-order' | 'invoices' | 'reports' | 'inventory' | 'scheduled-confirmation-morning' | 'scheduled-confirmation-afternoon';

/**
 * ==============================================================================
 * DOCUMENTAÇÃO DE NEGÓCIO - LÓGICA DE APLICAÇÃO
 * ==============================================================================
 * 
 * 1. PERSISTÊNCIA:
 *    - Atualmente utiliza localStorage para simular o banco de dados.
 *    - Em produção, deve ser migrado para o backend (server.ts) com PostgreSQL.
 * 
 * 2. FLUXO DE PRODUÇÃO (handleConfirmAllQueue):
 *    - Oficializa previsões (drafts) geradas por recorrência.
 *    - Transforma pedidos 'pending' em 'confirmed'.
 * 
 * 3. VENDAS NA PORTA:
 *    - Exige assinaturas digitais e timestamps para conformidade.
 * ==============================================================================
 */

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

const initialProducts: Product[] = [
    { id: 'prod-1', name: 'Pão Francês', category: 'Pães' },
    { id: 'prod-2', name: 'Pão de Queijo', category: 'Pães' },
    { id: 'prod-3', name: 'Bolo de Cenoura', category: 'Bolos' }
];

const getTomorrowDay = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.getDay();
};

const initialCompanies: Company[] = [
    {
      id: '1',
      name: 'Padaria Doce Pão',
      type: 'PJ',
      cnpj: '12.345.678/0001-99',
      address: 'Rua das Flores, 123, São Paulo - SP',
      cep: '01234-567',
      phone: '(11)98765-4321',
      logoUrl: 'https://picsum.photos/seed/bakerylogo/200',
      doorSale: true,
      orderScheduling: true,
      orders: [],
      productSettings: [
        { productId: 'prod-1', buys: true, price: 0.75 },
        { productId: 'prod-2', buys: true, price: 5.50 }
      ],
      preferredOrder: {
        [getTomorrowDay()]: {
          morning: [{ productName: 'Pão Francês', quantity: 50 }],
          afternoon: [{ productName: 'Pão de Queijo', quantity: 20 }]
        }
      }
    }
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<View>('companies');
  const [companies, setCompanies] = useState<Company[]>(() => {
    const loaded = loadFromLocalStorage('companies', initialCompanies);
    return [...loaded].sort((a, b) => a.name.localeCompare(b.name));
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const loaded = loadFromLocalStorage('products', initialProducts);
    return [...loaded].sort((a, b) => a.name.localeCompare(b.name));
  });
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [viewingCompanyId, setViewingCompanyId] = useState<string | null>(null);

  useEffect(() => { saveToLocalStorage('companies', companies); }, [companies]);
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
    
    // Feedback de sucesso removido (alert não funciona em iframe)
    console.log(`${data.drafts.length + data.existing.length} pedido(s) confirmados.`);
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
    setCompanies(prev => [...prev, newCompany].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c).sort((a, b) => a.name.localeCompare(b.name)));
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

  const handleUpdateOrderSignature = (orderId: string, signature: string, type: 'seller' | 'buyer') => {
    if (!selectedCompanyId) return;
    const now = new Date().toISOString();
    setCompanies(prev => prev.map(c => c.id === selectedCompanyId ? { 
      ...c, 
      orders: c.orders.map(o => {
        if (o.id === orderId) {
          if (type === 'seller') {
            return { ...o, sellerSignature: signature, sellerSignatureTime: now };
          } else {
            return { ...o, buyerSignature: signature, buyerSignatureTime: now };
          }
        }
        return o;
      }) 
    } : c));
  };

  const renderContent = () => {
    const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;
    const companyToView = companies.find(c => c.id === viewingCompanyId);

    if (currentView === 'companies' && companyToView) {
      return <CompanyDetailView company={companyToView} products={products} onUpdate={handleUpdateCompany} onUpdateProductSettings={(id, s) => setCompanies(prev => prev.map(c => c.id === id ? { ...c, productSettings: s } : c))} onBack={() => setViewingCompanyId(null)} />
    }

    switch (currentView) {
      case 'companies': return <CompanyManagement companies={companies} onAdd={handleAddCompany} onUpdate={handleUpdateCompany} onDelete={handleDeleteCompany} onViewCompany={setViewingCompanyId} />;
      case 'scheduled-confirmation': return <ScheduledConfirmation companies={companies} products={products} onConfirmAllQueue={handleConfirmAllQueue} onDeleteOrder={handleDeleteOrder} onAddManualOrder={handleAddOrder} />;
      case 'scheduled-confirmation-morning': return <ScheduledConfirmation companies={companies} products={products} onConfirmAllQueue={handleConfirmAllQueue} onDeleteOrder={handleDeleteOrder} onAddManualOrder={handleAddOrder} period="morning" />;
      case 'scheduled-confirmation-afternoon': return <ScheduledConfirmation companies={companies} products={products} onConfirmAllQueue={handleConfirmAllQueue} onDeleteOrder={handleDeleteOrder} onAddManualOrder={handleAddOrder} period="afternoon" />;
      case 'manual-order': return <OrderManagement companies={companies} selectedCompany={selectedCompany} products={products} onSelectCompany={setSelectedCompanyId} onAddOrder={handleAddOrder} onDeleteOrder={(id) => handleDeleteOrder(id)} onUpdateOrderSignature={handleUpdateOrderSignature} isDoorSaleMode={false} isManualLaunchMode={true} />;
      case 'orders': return <OrderManagement companies={companies} selectedCompany={selectedCompany} products={products} onSelectCompany={setSelectedCompanyId} onAddOrder={handleAddOrder} onDeleteOrder={(id) => handleDeleteOrder(id)} onUpdateOrderSignature={handleUpdateOrderSignature} isDoorSaleMode={false} />;
      case 'door-sales': return <OrderManagement companies={companies.filter(c => c.doorSale)} selectedCompany={selectedCompany} products={products} onSelectCompany={setSelectedCompanyId} onAddOrder={handleAddOrder} onDeleteOrder={(id) => handleDeleteOrder(id)} onUpdateOrderSignature={handleUpdateOrderSignature} isDoorSaleMode={true} />;
      case 'products': return <ProductManagement products={products} onAdd={(p) => setProducts(prev => [...prev, { ...p, id: `prod-${Date.now()}` }].sort((a, b) => a.name.localeCompare(b.name)))} onUpdate={(p) => setProducts(prev => prev.map(prod => prod.id === p.id ? p : prod).sort((a, b) => a.name.localeCompare(b.name)))} onDelete={(id) => setProducts(prev => prev.filter(p => p.id !== id))} />;
      case 'invoices': return <div className="p-12 text-center text-amber-800 bg-white rounded-2xl shadow-sm border border-orange-100"><DocumentTextIcon className="h-10 w-10 mx-auto mb-3 text-orange-200" /><h2 className="text-sm font-black uppercase tracking-widest mb-1">Nota Fiscal</h2><p className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter opacity-60">Módulo em desenvolvimento.</p></div>;
      case 'reports': return <div className="p-12 text-center text-amber-800 bg-white rounded-2xl shadow-sm border border-orange-100"><ChartBarIcon className="h-10 w-10 mx-auto mb-3 text-orange-200" /><h2 className="text-sm font-black uppercase tracking-widest mb-1">Relatórios</h2><p className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter opacity-60">Módulo em desenvolvimento.</p></div>;
      case 'inventory': return <div className="p-12 text-center text-amber-800 bg-white rounded-2xl shadow-sm border border-orange-100"><ArchiveBoxIcon className="h-10 w-10 mx-auto mb-3 text-orange-200" /><h2 className="text-sm font-black uppercase tracking-widest mb-1">Estoque</h2><p className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter opacity-60">Módulo em desenvolvimento.</p></div>;
      default: return null;
    }
  };
  
  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;
  
  const headerInfo = {
    companies: { icon: <BuildingStorefrontIcon className="h-5 w-5 text-orange-500" />, title: 'Cadastro de cliente', subtitle: 'Gestão de clientes e parceiros.' },
    'scheduled-confirmation': { icon: <CheckCircleIcon className="h-5 w-5 text-orange-500" />, title: 'Produção', subtitle: 'Confirmar pedidos com Recorrência.' },
    'scheduled-confirmation-morning': { icon: <CheckCircleIcon className="h-5 w-5 text-orange-500" />, title: 'Produção - Manhã', subtitle: 'Pedidos agendados para a manhã.' },
    'scheduled-confirmation-afternoon': { icon: <CheckCircleIcon className="h-5 w-5 text-orange-500" />, title: 'Produção - Tarde', subtitle: 'Pedidos agendados para a tarde.' },
    'manual-order': { icon: <PlusIcon className="h-5 w-5 text-orange-500" />, title: 'Pedido Manual', subtitle: 'Lançamento imediato de pedidos.' },
    orders: { icon: <ClipboardDocumentListIcon className="h-5 w-5 text-orange-500" />, title: 'Histórico', subtitle: 'Registro de pedidos realizados.' },
    'door-sales': { icon: <ShoppingBagIcon className="h-5 w-5 text-orange-500" />, title: 'Venda na Porta', subtitle: 'Pedidos específicos de balcão.' },
    products: { icon: <TagIcon className="h-5 w-5 text-orange-500" />, title: 'Cadastro de Produtos', subtitle: 'Catálogo de itens oferecidos.' },
    invoices: { icon: <DocumentTextIcon className="h-5 w-5 text-orange-500" />, title: 'Nota Fiscal', subtitle: 'Emissão e controle de NF.' },
    reports: { icon: <ChartBarIcon className="h-5 w-5 text-orange-500" />, title: 'Relatórios', subtitle: 'Métricas e desempenho.' },
    inventory: { icon: <ArchiveBoxIcon className="h-5 w-5 text-orange-500" />, title: 'Estoque', subtitle: 'Controle de insumos e itens.' },
  };

  return (
    <div className="flex h-screen bg-orange-50/30 font-sans">
      <Sidebar currentView={currentView} setCurrentView={handleSetCurrentView} onLogout={handleLogout} />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {!(currentView === 'companies' && viewingCompanyId) && (
          <header className="mb-6 flex items-center justify-between border-b border-orange-100 pb-4">
              <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-orange-50">
                    {headerInfo[currentView].icon}
                  </div>
                  <div>
                    <h1 className="text-sm font-black text-amber-900 uppercase tracking-widest">{headerInfo[currentView].title}</h1>
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter opacity-60">{headerInfo[currentView].subtitle}</p>
                  </div>
              </div>
          </header>
        )}
        <div className="max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
