
import React, { useState } from 'react';
import { Company } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { TrashIcon, BuildingStorefrontIcon, PlusIcon, XMarkIcon, MagnifyingGlassIcon } from './Icons';
import { maskCPF, maskCNPJ, maskPhone, maskCEP } from '../src/lib/masks';

// Modal Component - Minimalist Version
const CompanyModal = ({ onSave, onClose }: { onSave: (company: Omit<Company, 'id' | 'orders'>) => void, onClose: () => void }) => {
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'PJ' as 'PF' | 'PJ',
    cnpj: '',
    cpf: '',
    address: '',
    number: '',
    bairro: '',
    cep: '',
    municipio: '',
    uf: '',
    phone: '',
    logoUrl: `https://picsum.photos/seed/${Date.now()}/200`,
    doorSale: false,
    orderScheduling: true,
    emiteNF: false,
  });
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let maskedValue = value;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === 'cpf') maskedValue = maskCPF(value);
    if (name === 'cnpj') maskedValue = maskCNPJ(value);
    if (name === 'phone') maskedValue = maskPhone(value);
    if (name === 'cep') maskedValue = maskCEP(value);

    setFormData(prev => ({ 
      ...prev, 
      [name]: maskedValue 
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
        setFormData(prev => ({ 
          ...prev, 
          address: data.logradouro || '',
          bairro: data.bairro || '',
          municipio: data.localidade || '',
          uf: data.uf || ''
        }));
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
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1" aria-label="Fechar">
          <XMarkIcon className="h-5 w-5" />
        </button>
        
        <form onSubmit={handleSubmit} className="p-8 max-h-[90vh] overflow-y-auto">
          <header className="mb-6">
            <h3 className="text-xl font-bold text-amber-900">Cadastro</h3>
          </header>
          
          <div className="space-y-4">
            <div className="flex gap-4 p-1 bg-orange-50/50 rounded-xl border border-orange-100">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'PJ' }))}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  formData.type === 'PJ' ? 'bg-white text-orange-600 shadow-sm' : 'text-amber-900/40 hover:text-amber-900/60'
                }`}
              >
                Pessoa Jurídica (PJ)
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'PF' }))}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  formData.type === 'PF' ? 'bg-white text-orange-600 shadow-sm' : 'text-amber-900/40 hover:text-amber-900/60'
                }`}
              >
                Pessoa Física (PF)
              </button>
            </div>

            <Input label="Nome do Cliente" name="name" value={formData.name} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-4">
              {formData.type === 'PJ' ? (
                <Input label="CNPJ" name="cnpj" value={formData.cnpj} onChange={handleChange} required />
              ) : (
                <Input label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} required />
              )}
              <Input label="Telefone" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <Input label="CEP" name="cep" value={formData.cep} onChange={handleChange} onBlur={handleCepBlur} required />
              </div>
              <div className="col-span-7">
                <Input label="Endereço" name="address" value={formData.address} onChange={handleChange} required disabled={isLoadingCep} />
              </div>
              <div className="col-span-2">
                <Input label="Número" name="number" value={formData.number} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Bairro" name="bairro" value={formData.bairro} onChange={handleChange} required disabled={isLoadingCep} />
              <Input label="UF" name="uf" value={formData.uf} onChange={handleChange} required disabled={isLoadingCep} />
              <Input label="Município" name="municipio" value={formData.municipio} onChange={handleChange} required disabled={isLoadingCep} />
            </div>
            <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="doorSale" 
                        name="doorSale" 
                        checked={formData.doorSale} 
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="doorSale" className="text-xs font-medium text-gray-700 cursor-pointer uppercase tracking-tight">Venda na porta</label>
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="orderScheduling" 
                        name="orderScheduling" 
                        checked={formData.orderScheduling} 
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="orderScheduling" className="text-xs font-medium text-gray-700 cursor-pointer uppercase tracking-tight">Agendamento</label>
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="emiteNF" 
                        name="emiteNF" 
                        checked={formData.emiteNF} 
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="emiteNF" className="text-xs font-medium text-gray-700 cursor-pointer uppercase tracking-tight">Emite NF?</label>
                </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Cadastrar</Button>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSave = (companyData: Omit<Company, 'id' | 'orders'>) => {
    onAdd(companyData);
    setIsAddModalOpen(false);
  };

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.cnpj && company.cnpj.includes(searchTerm)) ||
    (company.cpf && company.cpf.includes(searchTerm))
  );
  
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-amber-900/40 uppercase tracking-widest">Clientes</h2>
        
        <div className="flex items-center gap-2">
          {isSearchOpen && (
            <div className="relative animate-in slide-in-from-right-2 fade-in duration-200">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400" />
              <input 
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2.5 bg-white border border-orange-100 rounded-lg text-xs font-bold text-amber-900 outline-none focus:ring-1 focus:ring-orange-500 transition-all w-32 sm:w-64"
                autoFocus
              />
            </div>
          )}
          
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2.5 rounded-lg border transition-all ${
              isSearchOpen 
                ? 'bg-amber-900 text-white border-amber-900 shadow-inner' 
                : 'bg-white text-amber-900 border-orange-100 hover:bg-orange-50 shadow-sm'
            }`}
            title="Pesquisar"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
          </button>
          
          <Button onClick={() => setIsAddModalOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Cadastro
          </Button>
        </div>
      </div>
      
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {filteredCompanies.map(company => (
            <div 
              key={company.id} 
              className="bg-white p-3 rounded-xl flex items-center justify-between hover:shadow-sm transition-all cursor-pointer group border border-orange-50/50" 
              onClick={() => onViewCompany(company.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                  <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
                </div>
                  <div className="min-w-0">
                  <div className="flex items-center gap-2">
                      <h3 className="font-bold text-amber-900 text-sm truncate">{company.name}</h3>
                      <div className="flex gap-1">
                        <span className="text-[7px] bg-amber-50 text-amber-600 px-1 py-0.5 rounded font-bold uppercase border border-amber-100">{company.type || 'PJ'}</span>
                        {company.doorSale && <span className="text-[7px] bg-green-50 text-green-600 px-1 py-0.5 rounded font-bold uppercase border border-green-100">Porta</span>}
                        {company.orderScheduling && <span className="text-[7px] bg-blue-50 text-blue-600 px-1 py-0.5 rounded font-bold uppercase border border-blue-100">Agenda</span>}
                      </div>
                  </div>
                  <p className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">
                    {company.type === 'PF' ? company.cpf : company.cnpj} • {company.phone}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(company.id); }} 
                  className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                  title="Excluir Empresa"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : companies.length > 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-orange-200">
          <MagnifyingGlassIcon className="mx-auto h-10 w-10 text-orange-100" />
          <p className="mt-2 text-xs font-bold text-orange-200 uppercase tracking-widest">Nenhum cliente encontrado para "{searchTerm}"</p>
        </div>
      ) : (
         <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-orange-200">
            <BuildingStorefrontIcon className="mx-auto h-10 w-10 text-orange-100" />
            <p className="mt-2 text-xs font-bold text-orange-200 uppercase tracking-widest">Nenhuma empresa cadastrada</p>
         </div>
      )}

      {isAddModalOpen && <CompanyModal onSave={handleSave} onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
};

export default CompanyManagement;
