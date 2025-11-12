import React from 'react';
import { BuildingStorefrontIcon, UsersIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, ClipboardDocumentListIcon } from './Icons';

type View = 'companies' | 'employees' | 'orders';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const navItems = [
    { id: 'companies', label: 'Empresas', icon: <BuildingStorefrontIcon className="h-6 w-6" /> },
    { id: 'employees', label: 'Funcionários', icon: <UsersIcon className="h-6 w-6" /> },
    { id: 'orders', label: 'Pedidos', icon: <ClipboardDocumentListIcon className="h-6 w-6" /> },
  ];

  const NavContent = () => (
     <div className="flex flex-col h-full bg-white shadow-lg">
      <div className="p-6 border-b border-orange-100 flex items-center justify-center gap-3">
        <img src="https://picsum.photos/seed/engenhodopao/40" alt="Logo Engenho do Pão" className="h-10 w-10 rounded-full"/>
        <span className="text-xl font-bold text-amber-800">Engenho do Pão</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id as View);
              setIsOpen(false);
            }}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
              currentView === item.id
                ? 'bg-orange-100 text-orange-600 font-semibold'
                : 'text-amber-700 hover:bg-orange-50 hover:text-orange-500'
            }`}
          >
            {item.icon}
            <span className="ml-4">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="px-4 pb-4 mt-auto">
        <button
          onClick={() => {
            onLogout();
            setIsOpen(false);
          }}
          className="flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 text-amber-700 hover:bg-orange-50 hover:text-orange-500"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
          <span className="ml-4">Sair</span>
        </button>
      </div>
      <div className="p-4 border-t border-orange-100 text-center text-xs text-amber-500">
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
      <aside className="hidden md:block w-64 flex-shrink-0">
        <NavContent />
      </aside>

      {/* Sidebar for Mobile (Drawer) */}
      <div className={`fixed inset-0 z-20 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
         <div className="w-64 h-full">
            <NavContent />
         </div>
      </div>
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/30 z-10 md:hidden"></div>}
    </>
  );
};

export default Sidebar;