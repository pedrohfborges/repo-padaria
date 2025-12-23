
import React, { useState } from 'react';
import { Company } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { TrashIcon, BuildingStorefrontIcon, PencilIcon, PlusIcon, XMarkIcon, CheckCircleIcon } from './Icons';

// Modal Component for Adding a new Company
const CompanyModal = ({ onSave, onClose }: { onSave: (company: Omit<Company, 'id' | 'orders'>) => void, onClose: () => void }) => {
  
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    address: '',
    cep: '',
    phone: '',
    logoUrl: `https://picsum.photos/seed/${Date.now()}/200`,
    doorSale: false,
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
      if (!response.ok) throw new Error('Erro ao consultar a API de CEP.');
      const data = await response.json();
      if (data.erro) {
        setFormData(prev => ({ ...prev, address: '' }));
      } else {
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
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
      <Card className="w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar">
          <XMarkIcon className="h-6 w-6" />
        </button>
        <form onSubmit={handleSubmit} className="p-8">
          <h3 className="text-xl font-semibold text-amber-800 mb-6">Adicionar Nova Empresa</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nome da Empresa" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="CNPJ" name="cnpj" value={formData.cnpj} onChange={handleChange} required />
            <Input label="CEP" name="cep" value={formData.cep} onChange={handleChange} onBlur={handleCepBlur} required />
            <Input label="Telefone" name="phone" value={formData.phone} onChange={handleChange} required />
            <div className="md:col-span-2">
                <Input 
                    label={isLoadingCep ? "Buscando endereço..." : "Endereço"} 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    required 
                    disabled={isLoadingCep}
                    placeholder={isLoadingCep ? "Aguarde..." : "Preenchido automaticamente pelo CEP"}
                />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="doorSale" 
                    name="doorSale" 
                    checked={formData.doorSale} 
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-orange-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="doorSale" className="text-sm font-medium text-amber-700 cursor-pointer">Venda na porta</label>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Adicionar Empresa</Button>
          </div>
        </form>
      </Card>
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
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Empresa
        </Button>
      </div>
      
      {companies.length > 0 ? (
        <Card className="p-0">
          <ul className="divide-y divide-orange-100">
            {companies.map(company => (
              <li key={company.id} className="px-4 py-3 flex items-start sm:items-center justify-between hover:bg-orange-50/50 transition-colors flex-col sm:flex-row gap-3 cursor-pointer" onClick={() => onViewCompany(company.id)}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img src={company.logoUrl} alt={`Logo de ${company.name}`} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-amber-800 truncate">{company.name}</h3>
                        {company.doorSale && (
                            <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold uppercase">
                                <CheckCircleIcon className="h-3 w-3" />
                                Porta
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-amber-600">{company.cnpj}</p>
                        <span className="text-gray-300">•</span>
                        <p className="text-xs text-amber-600">{company.phone}</p>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{company.address}</p>
                  </div>
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                  <button onClick={(e) => { e.stopPropagation(); onDelete(company.id); }} className="text-red-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors" aria-label="Deletar Empresa">
                      <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
         <Card className="text-center p-12">
            <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma empresa cadastrada</h3>
            <p className="mt-1 text-sm text-gray-500">Comece adicionando uma nova empresa cliente.</p>
         </Card>
      )}

      {isAddModalOpen && <CompanyModal onSave={handleSave} onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
};

export default CompanyManagement;
