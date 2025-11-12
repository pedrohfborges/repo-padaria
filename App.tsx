import React, { useState } from 'react';
import { Company, Employee, Order } from './types';
import Sidebar from './components/Sidebar';
import CompanyManagement from './components/CompanyProfile';
import EmployeeManagement from './components/EmployeeManagement';
import { BuildingStorefrontIcon, UsersIcon, ClipboardDocumentListIcon } from './components/Icons';
import LoginPage from './components/LoginPage';
import OrderManagement from './components/OrderManagement';

type View = 'companies' | 'employees' | 'orders';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<View>('companies');
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: '1',
      name: 'Padaria Doce Pão',
      cnpj: '12.345.678/0001-99',
      address: 'Rua das Flores, 123, São Paulo - SP',
      phone: '(11) 98765-4321',
      logoUrl: 'https://picsum.photos/seed/bakerylogo/200',
      orders: [
        { id: 'order-1', date: '2024-07-28', status: 'Entregue', items: [
            { id: 'item-1-1', productName: 'Pão Francês', quantity: 50 },
            { id: 'item-1-2', productName: 'Croissant', quantity: 20 },
        ]},
        { id: 'order-2', date: '2024-07-29', status: 'Pendente', items: [
            { id: 'item-2-1', productName: 'Pão de Queijo', quantity: 100 },
            { id: 'item-2-2', productName: 'Bolo de Fubá', quantity: 5 },
        ]},
      ]
    },
    {
      id: '2',
      name: 'Café da Esquina',
      cnpj: '98.765.432/0001-11',
      address: 'Avenida Principal, 456, Rio de Janeiro - RJ',
      phone: '(21) 12345-6789',
      logoUrl: 'https://picsum.photos/seed/cafelogo/200',
      orders: []
    }
  ]);
  const [employees, setEmployees] = useState<Employee[]>([
      { id: 'emp-1', name: 'Roberto Carlos', role: 'Padeiro Mestre', admissionDate: '2021-03-20', salary: 3800, status: 'Ativo' },
      { id: 'emp-2', name: 'Ana Maria Braga', role: 'Gerente', admissionDate: '2020-11-01', salary: 5200, status: 'Ativo' },
      { id: 'emp-3', name: 'José das Couves', role: 'Entregador', admissionDate: '2023-08-15', salary: 2500, status: 'Inativo' },
  ]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(companies[0]?.id || null);

  const handleLogin = (user: string, pass: string): boolean => {
    if (user === 'admin' && pass === 'admin') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleAddCompany = (newCompanyData: Omit<Company, 'id' | 'orders'>) => {
    const newCompany: Company = {
      ...newCompanyData,
      id: Date.now().toString(),
      orders: []
    };
    setCompanies(prev => [...prev, newCompany]);
  };

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
  };

  const handleDeleteCompany = (companyId: string) => {
    setCompanies(prev => prev.filter(c => c.id !== companyId));
    if (selectedCompanyId === companyId) {
      const remainingCompany = companies.find(c => c.id !== companyId);
      setSelectedCompanyId(remainingCompany ? remainingCompany.id : null);
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

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    if (!selectedCompanyId) return;
    setCompanies(prev => prev.map(c => {
      if (c.id === selectedCompanyId) {
        return {
          ...c,
          orders: c.orders.map(o => o.id === orderId ? { ...o, status } : o)
        };
      }
      return c;
    }));
  };

  const renderContent = () => {
    const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;

    switch (currentView) {
      case 'companies':
        return <CompanyManagement 
                  companies={companies}
                  onAdd={handleAddCompany}
                  onUpdate={handleUpdateCompany}
                  onDelete={handleDeleteCompany}
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
                  companies={companies}
                  selectedCompany={selectedCompany}
                  onSelectCompany={setSelectedCompanyId}
                  onAddOrder={handleAddOrder}
                  onDeleteOrder={handleDeleteOrder}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
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
    orders: { icon: <ClipboardDocumentListIcon className="h-8 w-8 text-orange-500" />, title: 'Gerenciamento de Pedidos', subtitle: 'Registre e acompanhe os pedidos diários de cada cliente.' },
  };

  return (
    <div className="flex h-screen bg-orange-50 font-sans">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
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
        {renderContent()}
      </main>
    </div>
  );
};

export default App;