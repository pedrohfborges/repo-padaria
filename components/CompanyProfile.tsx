
import React, { useState } from 'react';
import { Company } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { TrashIcon, BuildingStorefrontIcon, PencilIcon, PlusIcon, XMarkIcon, CheckCircleIcon } from './Icons';

// Modal Component - Minimalist Version
const CompanyModal = ({ onSave, onClose }: { onSave: (company: Omit<Company, 'id' | 'orders'>) => void, onClose: () => void }) => {
  
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    address: '',
    cep: '',
    phone: '',
    logoUrl: `https://picsum.photos/seed/${Date.now()}/200`,
    doorSale: false,
    orderScheduling: true,
  });
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        const fullAddress = [data.logradouro, data.bairro, data.localidade, data.uf].filter(Boolean).join(', ');
        setFormData(prev => ({ ...prev, address: fullAddress }));
      }
    } catch (error) {
      console.error('Falha ao buscar CEP:', error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-amber-900/10 z-50 flex items-center justify-center p-4 backdrop-blur-[2px] animate-fade-in" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl shadow-amber-900/5 relative overflow-hidden border border-white">
        <button onClick={onClose} className="absolute top-6 right-6 text-amber-200 hover:text-amber-500 transition-colors p-1" aria-label="Fechar">
          <XMarkIcon className="h-5 w-5" />
        </button>
        
        <form onSubmit={handleSubmit} className="p-10">
          <header className="mb-8">
            <h3 className="text-xl font-medium text-amber-900 tracking-tight">Nova Empresa Cliente</h3>
            <div className="h-0.5 w-8 bg-orange-400 mt-2 rounded-full"></div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <Input label="Nome da Empresa" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="CNPJ" name="cnpj" value={formData.cnpj} onChange={handleChange} required />
            <Input label="CEP" name="cep" value={formData.cep} onChange={handleChange} onBlur={handleCepBlur} required />
            <Input label="Telefone" name="phone" value={formData.phone} onChange={handleChange} required />
            <div className="md:col-span-2">
                <Input 
                    label={isLoadingCep ? "Buscando..." : "Endereço"} 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    required 
                    disabled={isLoadingCep}
                    placeholder="Logradouro, Bairro, Cidade - UF"
                />
            </div>
            <div className="md:col-span-2 flex items-center gap-10 pt-2">
                <div className="flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        id="doorSale" 
                        name="doorSale" 
                        checked={formData.doorSale} 
                        onChange={handleChange}
                        className="h-5 w-5 rounded-lg border-orange-200 text-orange-500 focus:ring-4 focus:ring-orange-500/5 cursor-pointer"
                    />
                    <label htmlFor="doorSale" className="text-xs font-semibold text-amber-800/70 cursor-pointer uppercase tracking-tight">Venda na porta</label>
                </div>
                <div className="flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        id="orderScheduling" 
                        name="orderScheduling" 
                        checked={formData.orderScheduling} 
                        onChange={handleChange}
                        className="h-5 w-5 rounded-lg border-orange-200 text-orange-500 focus:ring-4 focus:ring-orange-500/5 cursor-pointer"
                    />
                    <label htmlFor="orderScheduling" className="text-xs font-semibold text-amber-800/70 cursor-pointer uppercase tracking-tight">Agendamento</label>
                </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end gap-3 border-t border-orange-50/50 pt-8">
            <button type="button" onClick={onClose} className="px-8 py-3.5 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors">Cancelar</button>
            <Button type="submit" className="px-10 py-3.5 rounded-2xl shadow-lg shadow-orange-500/20">Cadastrar Empresa</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CompanyManagementProps {
  companies: Company[];
  onAdd: (company: Omit<Company, 'id' | 'orders'>) => void;
  onUpdate: (company: Company) => void;
  onDelete: (companyId: string) => void;
  onViewCompany: (companyId: string) => void;
}

const CompanyManagement: React.FC<CompanyManagementProps> = ({ companies, onAdd, onUpdate, onDelete, onViewCompany }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSave = (companyData: Omit<Company, 'id' | 'orders'>) => {
    onAdd(companyData);
    setIsAddModalOpen(false);
  };
  
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-lg font-medium text-amber-900/60">Lista de Parceiros</h2>
        <Button onClick={() => setIsAddModalOpen(true)} className="rounded-2xl">
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Empresa
        </Button>
      </div>
      
      {companies.length > 0 ? (
        <div className="bg-white rounded-[2rem] border border-orange-50/50 overflow-hidden shadow-sm">
          <ul className="divide-y divide-orange-50/30">
            {companies.map(company => (
              <li key={company.id} className="px-6 py-5 flex items-center justify-between hover:bg-orange-50/20 transition-all cursor-pointer group" onClick={() => onViewCompany(company.id)}>
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden border border-orange-100/50 shadow-sm flex-shrink-0">
                    <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-amber-900 group-hover:text-orange-600 transition-colors">{company.name}</h3>
                        <div className="flex gap-1.5">
                          {company.doorSale && <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-tight border border-green-100/50">Porta</span>}
                          {company.orderScheduling && <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-tight border border-blue-100/50">Agenda</span>}
                        </div>
                    </div>
                    <p className="text-xs text-amber-800/50 font-medium mt-0.5">{company.cnpj} • {company.phone}</p>
                    <p className="text-[11px] text-amber-800/30 truncate mt-1">{company.address}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); onDelete(company.id); }} className="text-red-200 hover:text-red-500 p-2.5 rounded-xl hover:bg-white transition-all shadow-sm border border-transparent hover:border-red-50">
                      <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
         <div className="text-center py-32 bg-white rounded-[2rem] border border-orange-50/50">
            <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-amber-50" />
            <h3 className="mt-4 text-sm font-medium text-amber-300 uppercase tracking-widest">Nenhuma empresa parceira</h3>
         </div>
      )}

      {isAddModalOpen && <CompanyModal onSave={handleSave} onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
};

export default CompanyManagement;
