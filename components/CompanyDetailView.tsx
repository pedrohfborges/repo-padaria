
import React, { useState, useEffect } from 'react';
import { Company, Product, CompanyProductSetting, FinancialParams, RecurringOrderConfig } from '../types';
import { PencilIcon, ChevronLeftIcon, CheckCircleIcon } from './Icons';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import FinancialParameters from './FinancialParameters';

interface CompanyDetailViewProps {
  company: Company;
  products: Product[];
  onUpdate: (updatedCompany: Company) => void;
  onUpdateProductSettings: (companyId: string, settings: CompanyProductSetting[]) => void;
  onBack: () => void;
}

const CompanyDetailView: React.FC<CompanyDetailViewProps> = ({ company, products, onUpdate, onUpdateProductSettings, onBack }) => {
  const [activeTab, setActiveTab] = useState<'dadosGerais' | 'preco' | 'configuracaoCompra'>('dadosGerais');

  // Ajusta tab ativa se o agendamento for desativado
  useEffect(() => {
    if (!company.orderScheduling && activeTab === 'configuracaoCompra') {
      setActiveTab('dadosGerais');
    }
  }, [company.orderScheduling, activeTab]);

  const handleUpdateRecurringOnly = (newRecurring?: RecurringOrderConfig) => {
    onUpdate({ 
        ...company, 
        recurringOrder: newRecurring 
    });
  };

  const availableProductsForRecurrence = products.filter(p => 
    company.productSettings?.some(s => s.productId === p.id && s.buys)
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="mb-8">
        <button onClick={onBack} className="flex items-center text-sm text-amber-600 hover:text-amber-800 mb-2">
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Voltar para Empresas
        </button>
        <h1 className="text-3xl font-bold text-amber-800">{company.name}</h1>
      </header>
      
      {/* Tabs */}
      <div className="border-b border-orange-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('dadosGerais')}
            className={`${
              activeTab === 'dadosGerais'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
          >
            Dados Gerais
          </button>
          <button
            onClick={() => setActiveTab('preco')}
            className={`${
              activeTab === 'preco'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
          >
            Preço
          </button>
          
          {/* Exibe Configuração de Compra apenas se Agendamento estiver ativo */}
          {company.orderScheduling && (
            <button
              onClick={() => setActiveTab('configuracaoCompra')}
              className={`${
                activeTab === 'configuracaoCompra'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
            >
              Agendamento de Pedidos
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'dadosGerais' && <GeneralDataTab company={company} onUpdate={onUpdate} />}
        {activeTab === 'preco' && (
            <ProductSettingsTab 
                company={company}
                allProducts={products}
                onUpdate={(newSettings) => onUpdateProductSettings(company.id, newSettings)}
            />
        )}
        {activeTab === 'configuracaoCompra' && company.orderScheduling && (
            <FinancialParameters 
                companyName={company.name}
                recurringConfig={company.recurringOrder}
                availableProducts={availableProductsForRecurrence}
                onUpdate={handleUpdateRecurringOnly}
            />
        )}
      </div>
    </div>
  );
};

// Sub-component for Product Settings Tab
const ProductSettingsTab = ({ company, allProducts, onUpdate }: { company: Company, allProducts: Product[], onUpdate: (settings: CompanyProductSetting[]) => void }) => {
    const [settings, setSettings] = useState<CompanyProductSetting[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setSettings(company.productSettings || []);
        setHasChanges(false);
    }, [company]);

    const handleSettingChange = (productId: string, field: 'buys' | 'price', value: boolean | number) => {
        setSettings(currentSettings => {
            const settingIndex = currentSettings.findIndex(s => s.productId === productId);
            let newSettings = [...currentSettings];

            if (settingIndex > -1) {
                const updatedSetting = { ...newSettings[settingIndex], [field]: value };
                newSettings[settingIndex] = updatedSetting;
            } else {
                const newSetting: CompanyProductSetting = {
                    productId: productId,
                    buys: field === 'buys' ? (value as boolean) : false,
                    price: field === 'price' ? (value as number) : 0,
                };
                newSettings.push(newSetting);
            }
            return newSettings;
        });
        setHasChanges(true);
    };
    
    const handleSave = () => {
        onUpdate(settings);
        setHasChanges(false);
    };
    
    const handleCancel = () => {
        setSettings(company.productSettings || []);
        setHasChanges(false);
    }

    const mergedSettings = allProducts.map(product => {
        const existingSetting = settings.find(s => s.productId === product.id);
        return {
            product,
            setting: existingSetting || { productId: product.id, buys: false, price: 0 }
        };
    });

    return (
        <Card>
            <div className="p-8">
                <h3 className="text-xl font-semibold text-amber-800 mb-2">Preços de Produtos para {company.name}</h3>
                <p className="text-sm text-amber-600 mb-6">Defina quais produtos esta empresa compra e o preço específico para cada um.</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-orange-200">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-amber-700">Produto</th>
                                <th className="p-4 text-sm font-semibold text-amber-700 w-32 text-center">Compra</th>
                                <th className="p-4 text-sm font-semibold text-amber-700 w-48">Preço (R$)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mergedSettings.map(({ product, setting }) => (
                                <tr key={product.id} className="border-b border-orange-100">
                                    <td className="p-4 font-medium text-gray-800">{product.name}</td>
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={setting.buys}
                                            onChange={(e) => handleSettingChange(product.id, 'buys', e.target.checked)}
                                            className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <Input
                                            label=""
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={setting.price}
                                            onChange={(e) => handleSettingChange(product.id, 'price', parseFloat(e.target.value))}
                                            disabled={!setting.buys}
                                            className="w-full disabled:bg-gray-200"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="mt-8 flex justify-end gap-4 border-t border-orange-100 pt-6">
                    <Button type="button" variant="secondary" onClick={handleCancel} disabled={!hasChanges}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={!hasChanges}>
                        Salvar Alterações
                    </Button>
                </div>
            </div>
        </Card>
    );
};


// Sub-component for General Data Tab
const GeneralDataTab = ({ company, onUpdate }: { company: Company, onUpdate: (c: Company) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(company);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  useEffect(() => {
    setFormData(company);
  }, [company, isEditing]);

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

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Card>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-amber-800">Dados Gerais da Empresa</h3>
            {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Editar
                </button>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InfoField label="Nome da Empresa" value={formData.name} name="name" isEditing={isEditing} onChange={handleChange} />
            <InfoField label="CNPJ" value={formData.cnpj} name="cnpj" isEditing={isEditing} onChange={handleChange} onBlur={handleCepBlur} />
            <InfoField label="CEP" value={formData.cep} name="cep" isEditing={isEditing} onChange={handleChange} onBlur={handleCepBlur} />
            <InfoField label="Telefone" value={formData.phone} name="phone" isEditing={isEditing} onChange={handleChange} />
            <div className="md:col-span-2">
               <InfoField 
                  label={isLoadingCep ? "Buscando endereço..." : "Endereço"} 
                  value={formData.address} 
                  name="address" 
                  isEditing={isEditing} 
                  onChange={handleChange}
                  disabled={isLoadingCep}
                  placeholder={isLoadingCep ? "Aguarde..." : "Preenchido automaticamente pelo CEP"}
               />
            </div>
            
            {/* Boxes de Opções (Venda na Porta e Agendamento) */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                <div>
                    {isEditing ? (
                        <div className="flex items-center gap-2 h-[42px]">
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
                    ) : (
                        <div>
                            <p className="block text-sm font-medium text-amber-700 mb-1">Venda na porta</p>
                            <div className="flex items-center gap-2 text-gray-800 bg-gray-100/50 px-4 py-2 rounded-md min-h-[42px]">
                                {formData.doorSale ? (
                                    <span className="flex items-center gap-1 text-green-700 font-bold text-sm">
                                        <CheckCircleIcon className="h-5 w-5" />
                                        Sim
                                    </span>
                                ) : (
                                    <span className="text-gray-500 text-sm italic">Não</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    {isEditing ? (
                        <div className="flex items-center gap-2 h-[42px]">
                            <input 
                                type="checkbox" 
                                id="orderScheduling" 
                                name="orderScheduling" 
                                checked={formData.orderScheduling} 
                                onChange={handleChange}
                                className="h-5 w-5 rounded border-orange-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                            />
                            <label htmlFor="orderScheduling" className="text-sm font-medium text-amber-700 cursor-pointer">Agendamento de pedidos</label>
                        </div>
                    ) : (
                        <div>
                            <p className="block text-sm font-medium text-amber-700 mb-1">Agendamento de pedidos</p>
                            <div className="flex items-center gap-2 text-gray-800 bg-gray-100/50 px-4 py-2 rounded-md min-h-[42px]">
                                {formData.orderScheduling ? (
                                    <span className="flex items-center gap-1 text-green-700 font-bold text-sm">
                                        <CheckCircleIcon className="h-5 w-5" />
                                        Sim
                                    </span>
                                ) : (
                                    <span className="text-gray-500 text-sm italic">Não</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {isEditing && (
            <div className="mt-8 flex justify-end gap-4 border-t border-orange-100 pt-6">
                <Button type="button" variant="secondary" onClick={handleCancel}>Cancelar</Button>
                <Button type="button" onClick={handleSave}>Salvar Alterações</Button>
            </div>
        )}
      </div>
    </Card>
  );
};


// Helper component for displaying fields
const InfoField = ({ label, value, name, isEditing, onChange, ...props }: { label: string, value: string, name: string, isEditing: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, [x:string]: any }) => {
    if (isEditing) {
        return <Input label={label} name={name} value={value} onChange={onChange} {...props} />;
    }
    return (
        <div>
            <p className="block text-sm font-medium text-amber-700 mb-1">{label}</p>
            <p className="text-gray-800 bg-gray-100/50 px-4 py-2 rounded-md min-h-[42px]">{value || '-'}</p>
        </div>
    );
}

export default CompanyDetailView;
