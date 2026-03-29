
import React from 'react';
import { BuildingStorefrontIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, ClipboardDocumentListIcon, TagIcon, ShoppingBagIcon, CheckCircleIcon, DocumentTextIcon, ChartBarIcon, ArchiveBoxIcon, PlusIcon } from './Icons';

type View = 'companies' | 'orders' | 'door-sales' | 'products' | 'scheduled-confirmation' | 'manual-order' | 'invoices' | 'reports' | 'inventory';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const navItems = [
    { id: 'products', label: 'Cadastro de Produtos', icon: <TagIcon className="h-6 w-6" /> },
    { id: 'companies', label: 'Cadastro de cliente', icon: <BuildingStorefrontIcon className="h-6 w-6" /> },
    { id: 'manual-order', label: 'Pedido Manual', icon: <PlusIcon className="h-6 w-6" /> },
    { id: 'scheduled-confirmation', label: 'Confirmar pedidos com Recorrência', icon: <CheckCircleIcon className="h-6 w-6" /> },
    { id: 'orders', label: 'Histórico de pedidos', icon: <ClipboardDocumentListIcon className="h-6 w-6" /> },
    { id: 'door-sales', label: 'Venda na Porta', icon: <ShoppingBagIcon className="h-6 w-6" /> },
    { id: 'invoices', label: 'Nota Fiscal', icon: <DocumentTextIcon className="h-6 w-6" /> },
    { id: 'reports', label: 'Relatórios', icon: <ChartBarIcon className="h-6 w-6" /> },
    { id: 'inventory', label: 'Controle de estoque', icon: <ArchiveBoxIcon className="h-6 w-6" /> },
  ];

  const NavContent = () => (
     <div className="flex flex-col h-full bg-white shadow-sm border-r border-orange-100">
      <div className="p-4 border-b border-orange-50 flex items-center gap-2">
        <img src="https://picsum.photos/seed/engenhodopao/40" alt="Logo" className="h-6 w-6 rounded-full"/>
        <span className="text-xs font-black text-amber-900 uppercase tracking-widest">Engenho do Pão</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id as View);
              setIsOpen(false);
            }}
            className={`flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 text-left group ${
              currentView === item.id
                ? 'bg-orange-500 text-white font-black shadow-sm'
                : 'text-amber-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <div className={`${currentView === item.id ? 'text-white' : 'text-amber-400 group-hover:text-orange-500'} transition-colors`}>
              {React.cloneElement(item.icon as React.ReactElement, { className: 'h-4 w-4' })}
            </div>
            <span className="ml-3 text-[10px] uppercase font-black tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="px-2 pb-2 mt-auto">
        <button
          onClick={() => {
            onLogout();
            setIsOpen(false);
          }}
          className="flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 text-amber-400 hover:bg-orange-50 hover:text-red-500 text-left group"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 group-hover:text-red-500" />
          <span className="ml-3 text-[10px] uppercase font-black tracking-widest">Sair</span>
        </button>
      </div>
      <div className="p-3 border-t border-orange-50 text-center text-[8px] font-black text-amber-200 uppercase tracking-tighter">
        <p>&copy; {new Date().getFullYear()} Engenho do Pão</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="fixed top-4 left-4 z-30 md:hidden p-2 bg-white rounded-full shadow-md text-amber-700"
        aria-label="Toggle menu"
      >
        {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:block w-52 flex-shrink-0">
        <NavContent />
      </aside>

      {/* Sidebar for Mobile (Drawer) */}
      <div className={`fixed inset-0 z-20 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
         <div className="w-52 h-full">
            <NavContent />
         </div>
      </div>
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/30 z-10 md:hidden"></div>}
    </>
  );
};

export default Sidebar;
