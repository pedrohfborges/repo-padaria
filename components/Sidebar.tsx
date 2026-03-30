
import React from 'react';
import { BuildingStorefrontIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, ClipboardDocumentListIcon, TagIcon, ShoppingBagIcon, CheckCircleIcon, DocumentTextIcon, ChartBarIcon, ArchiveBoxIcon, PlusIcon, ArrowPathIcon, SunIcon, MoonIcon } from './Icons';

type View = 'companies' | 'orders' | 'door-sales' | 'products' | 'scheduled-confirmation' | 'manual-order' | 'invoices' | 'reports' | 'inventory' | 'scheduled-confirmation-morning' | 'scheduled-confirmation-afternoon';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  
  const navItems = [
    { id: 'products', label: 'Cadastro de Produtos', icon: <TagIcon className="h-6 w-6" /> },
    { id: 'companies', label: 'Cadastro de cliente', icon: <BuildingStorefrontIcon className="h-6 w-6" /> },
    { id: 'manual-order', label: 'Pedido Manual', icon: <PlusIcon className="h-6 w-6" /> },
    { 
      id: 'scheduled-confirmation', 
      label: 'Confirmar pedidos com Recorrência', 
      icon: <CheckCircleIcon className="h-6 w-6" />,
      subItems: [
        { id: 'scheduled-confirmation-morning', label: 'Manhã', icon: <SunIcon className="h-4 w-4" /> },
        { id: 'scheduled-confirmation-afternoon', label: 'Tarde', icon: <MoonIcon className="h-4 w-4" /> },
      ]
    },
    { id: 'orders', label: 'Histórico de pedidos', icon: <ClipboardDocumentListIcon className="h-6 w-6" /> },
    { id: 'door-sales', label: 'Venda na Porta', icon: <ShoppingBagIcon className="h-6 w-6" /> },
    { id: 'invoices', label: 'Nota Fiscal', icon: <DocumentTextIcon className="h-6 w-6" /> },
    { id: 'reports', label: 'Relatórios', icon: <ChartBarIcon className="h-6 w-6" /> },
    { id: 'inventory', label: 'Controle de estoque', icon: <ArchiveBoxIcon className="h-6 w-6" /> },
  ];

  const [expandedMenu, setExpandedMenu] = React.useState<string | null>(() => {
    const itemWithSub = navItems.find(item => item.subItems?.some(sub => sub.id === currentView));
    return itemWithSub ? itemWithSub.id : null;
  });

  const NavContent = () => (
     <div className="flex flex-col h-full bg-white shadow-sm border-r border-orange-100">
      <div className="p-4 border-b border-orange-50 flex items-center gap-2">
        <img src="https://picsum.photos/seed/engenhodopao/40" alt="Logo" className="h-6 w-6 rounded-full"/>
        <span className="text-xs font-black text-amber-900 uppercase tracking-widest">Engenho do Pão</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isExpanded = expandedMenu === item.id;
          const isSelected = currentView === item.id || (item.subItems?.some(sub => sub.id === currentView));
          
          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  if (item.subItems) {
                    setExpandedMenu(isExpanded ? null : item.id);
                  } else {
                    setCurrentView(item.id as View);
                    setExpandedMenu(null);
                    setIsOpen(false);
                  }
                }}
                className={`flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 text-left group ${
                  isSelected
                    ? 'bg-orange-500 text-white font-black shadow-sm'
                    : isExpanded
                    ? 'bg-orange-100 text-orange-600 font-black'
                    : 'text-amber-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <div className={`${isSelected ? 'text-white' : isExpanded ? 'text-orange-600' : 'text-amber-400 group-hover:text-orange-500'} transition-colors`}>
                  {React.cloneElement(item.icon as React.ReactElement, { className: 'h-4 w-4' })}
                </div>
                <span className="ml-3 text-[10px] uppercase font-black tracking-widest">{item.label}</span>
              </button>
              
              {item.subItems && isExpanded && (
                <div className="ml-6 space-y-1 animate-in slide-in-from-left-2 duration-300">
                  {item.subItems.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setCurrentView(sub.id as View);
                        setIsOpen(false);
                      }}
                      className={`flex items-center w-full px-3 py-1.5 rounded-lg transition-all duration-200 text-left group ${
                        currentView === sub.id
                          ? 'bg-orange-100 text-orange-600 font-black'
                          : 'text-amber-600 hover:bg-orange-50 hover:text-orange-500'
                      }`}
                    >
                      <div className={`${currentView === sub.id ? 'text-orange-600' : 'text-amber-300 group-hover:text-orange-400'} transition-colors`}>
                        {React.cloneElement(sub.icon as React.ReactElement, { className: 'h-3 w-3' })}
                      </div>
                      <span className="ml-3 text-[9px] uppercase font-bold tracking-wider">{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="px-2 pb-2 mt-auto space-y-1">
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 text-amber-400 hover:bg-orange-50 hover:text-orange-600 text-left group"
          >
            <ArrowPathIcon className="h-4 w-4 group-hover:text-orange-600" />
            <span className="ml-3 text-[10px] uppercase font-black tracking-widest">Resetar Sistema</span>
          </button>
        ) : (
          <div className="flex flex-col gap-1 p-1 bg-orange-50 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-[8px] font-bold text-amber-900 text-center uppercase tracking-tighter">Limpar tudo?</p>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="flex-1 py-1 bg-red-500 text-white text-[8px] font-black uppercase rounded hover:bg-red-600"
              >
                Sim
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-1 bg-amber-200 text-amber-900 text-[8px] font-black uppercase rounded hover:bg-amber-300"
              >
                Não
              </button>
            </div>
          </div>
        )}
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
