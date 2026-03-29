
import React, { useState, useEffect } from 'react';
import { Company, Product, CompanyProductSetting, FinancialParams, RecurringOrderConfig } from '../types';
import { PencilIcon, ChevronLeftIcon, CheckCircleIcon } from './Icons';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import FinancialParameters from './FinancialParameters';
import { maskCPF, maskCNPJ, maskPhone, maskCEP, formatCurrency, parseCurrency } from '../src/lib/masks';

interface CompanyDetailViewProps {
  company: Company;
  products: Product[];
  onUpdate: (updatedCompany: Company) => void;
  onUpdateProductSettings: (companyId: string, settings: CompanyProductSetting[]) => void;
  onBack: () => void;
}

/**
 * ==============================================================================
 * DOCUMENTAÇÃO DE NEGÓCIO - DETALHES DO CLIENTE
 * ==============================================================================
 * 
 * 1. DADOS GERAIS:
 *    - Cadastro completo com máscaras de CPF/CNPJ, CEP e Telefone.
 * 
 * 2. PREÇO (PRODUCT SETTINGS):
 *    - Implementa máscara de moeda brasileira (R$ X,00).
 *    - O usuário edita apenas a parte inteira do valor.
 *    - Produtos desmarcados ('buys' == false) têm o campo de preço desabilitado.
 * 
 * 3. CONFIGURAÇÃO DE COMPRA:
 *    - Gerencia pedidos recorrentes e parâmetros financeiros (margens/taxas).
 * ==============================================================================
 */

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
      <header className="mb-4">
        <button onClick={onBack} className="flex items-center text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-800 mb-1">
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Voltar
        </button>
        <h1 className="text-xl font-black text-amber-900">{company.name}</h1>
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
        <Card className="p-4 rounded-xl">
            <div>
                <h3 className="text-sm font-black text-amber-900 mb-1 uppercase tracking-tight">Preços de Produtos</h3>
                <p className="text-[10px] text-amber-600 mb-4">Defina quais produtos esta empresa compra e o preço específico.</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-orange-100">
                            <tr>
                                <th className="pb-2 text-[10px] font-bold text-amber-800/40 uppercase tracking-widest">Produto</th>
                                <th className="pb-2 text-[10px] font-bold text-amber-800/40 uppercase tracking-widest w-20 text-center">Compra</th>
                                <th className="pb-2 text-[10px] font-bold text-amber-800/40 uppercase tracking-widest w-32">Preço (R$)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-50/30">
                            {mergedSettings.map(({ product, setting }) => (
                                <tr key={product.id} className="hover:bg-orange-50/10 transition-colors">
                                    <td className="py-2 font-bold text-amber-900 text-xs">{product.name}</td>
                                    <td className="py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={setting.buys}
                                            onChange={(e) => handleSettingChange(product.id, 'buys', e.target.checked)}
                                            className="h-4 w-4 rounded border-orange-200 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                        />
                                    </td>
                                    <td className="py-2">
                                        <div className={`flex items-center bg-orange-50/30 border border-orange-100 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-orange-500 transition-all ${!setting.buys ? 'opacity-30' : ''}`}>
                                            <span className="text-[10px] font-black text-amber-900/40 mr-1 select-none">R$</span>
                                            <input
                                                type="text"
                                                value={setting.price === 0 ? '' : setting.price.toString()}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    const num = val === '' ? 0 : parseInt(val, 10);
                                                    handleSettingChange(product.id, 'price', num);
                                                }}
                                                disabled={!setting.buys}
                                                placeholder="0"
                                                className="w-full bg-transparent text-xs font-bold text-amber-900 outline-none placeholder:text-amber-900/20 text-right"
                                            />
                                            <span className="text-xs font-bold text-amber-900/40 ml-0.5">,00</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="mt-4 flex justify-end gap-2 border-t border-orange-100 pt-4">
                    <Button type="button" variant="secondary" onClick={handleCancel} disabled={!hasChanges} className="text-[10px] px-3 py-1.5">
                        Cancelar
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={!hasChanges} className="text-[10px] px-3 py-1.5">
                        Salvar
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
      if (!response.ok) throw new Error('Erro ao consultar a API de CEP.');
      const data = await response.json();
      if (data.erro) {
        setFormData(prev => ({ ...prev, address: '', bairro: '', municipio: '', uf: '' }));
      } else {
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

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Card className="p-4 rounded-xl">
      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Dados Gerais</h3>
            {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="secondary" className="px-3 py-1 text-[10px]">
                    <PencilIcon className="h-3 w-3 mr-1" />
                    Editar
                </Button>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <div className="md:col-span-2">
                {isEditing ? (
                    <div className="flex gap-4 p-1 bg-orange-50/50 rounded-xl border border-orange-100 max-w-xs">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'PJ' }))}
                            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                formData.type === 'PJ' ? 'bg-white text-orange-600 shadow-sm' : 'text-amber-900/40 hover:text-amber-900/60'
                            }`}
                        >
                            PJ
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'PF' }))}
                            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                formData.type === 'PF' ? 'bg-white text-orange-600 shadow-sm' : 'text-amber-900/40 hover:text-amber-900/60'
                            }`}
                        >
                            PF
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="block text-[10px] font-bold text-amber-800/40 mb-0.5 uppercase tracking-widest">Tipo de Cliente</p>
                        <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-1 rounded-md font-bold uppercase border border-amber-100">
                            {formData.type === 'PF' ? 'Pessoa Física (PF)' : 'Pessoa Jurídica (PJ)'}
                        </span>
                    </div>
                )}
            </div>
            <InfoField label="Nome do Cliente" value={formData.name} name="name" isEditing={isEditing} onChange={handleChange} />
            {formData.type === 'PJ' ? (
                <InfoField label="CNPJ" value={formData.cnpj || ''} name="cnpj" isEditing={isEditing} onChange={handleChange} />
            ) : (
                <InfoField label="CPF" value={formData.cpf || ''} name="cpf" isEditing={isEditing} onChange={handleChange} />
            )}
            <div className="grid grid-cols-12 gap-2 md:col-span-2">
              <div className="col-span-3">
                <InfoField label="CEP" value={formData.cep} name="cep" isEditing={isEditing} onChange={handleChange} onBlur={handleCepBlur} />
              </div>
              <div className="col-span-7">
                <InfoField 
                    label={isLoadingCep ? "Buscando..." : "Endereço"} 
                    value={formData.address} 
                    name="address" 
                    isEditing={isEditing} 
                    onChange={handleChange}
                    disabled={isLoadingCep}
                    placeholder={isLoadingCep ? "Aguarde..." : "Endereço completo"}
                />
              </div>
              <div className="col-span-2">
                <InfoField label="Número" value={formData.number || ''} name="number" isEditing={isEditing} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 md:col-span-2">
              <InfoField label="Bairro" value={formData.bairro || ''} name="bairro" isEditing={isEditing} onChange={handleChange} disabled={isLoadingCep} />
              <InfoField label="UF" value={formData.uf || ''} name="uf" isEditing={isEditing} onChange={handleChange} disabled={isLoadingCep} />
              <InfoField label="Município" value={formData.municipio || ''} name="municipio" isEditing={isEditing} onChange={handleChange} disabled={isLoadingCep} />
            </div>
            <InfoField label="Telefone" value={formData.phone} name="phone" isEditing={isEditing} onChange={handleChange} />
            
            {/* Boxes de Opções (Venda na Porta, Agendamento e Emite NF) */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                <div>
                    {isEditing ? (
                        <div className="flex items-center gap-2 h-8">
                            <input 
                                type="checkbox" 
                                id="doorSale" 
                                name="doorSale" 
                                checked={formData.doorSale} 
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                            />
                            <label htmlFor="doorSale" className="text-[10px] font-bold text-amber-700 cursor-pointer uppercase tracking-tight">Venda na porta</label>
                        </div>
                    ) : (
                        <div>
                            <p className="block text-[10px] font-bold text-amber-800/40 mb-0.5 uppercase tracking-widest">Venda na porta</p>
                            <div className="flex items-center gap-2 text-amber-900 bg-orange-50/30 px-3 py-1.5 rounded-lg">
                                <input 
                                    type="checkbox" 
                                    checked={formData.doorSale} 
                                    readOnly 
                                    className="h-4 w-4 rounded border-orange-200 text-orange-600 focus:ring-orange-500 cursor-default"
                                />
                                <span className={`text-[10px] font-black uppercase ${formData.doorSale ? 'text-amber-900' : 'text-gray-300'}`}>
                                    {formData.doorSale ? 'Sim' : 'Não'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    {isEditing ? (
                        <div className="flex items-center gap-2 h-8">
                            <input 
                                type="checkbox" 
                                id="orderScheduling" 
                                name="orderScheduling" 
                                checked={formData.orderScheduling} 
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                            />
                            <label htmlFor="orderScheduling" className="text-[10px] font-bold text-amber-700 cursor-pointer uppercase tracking-tight">Agendamento</label>
                        </div>
                    ) : (
                        <div>
                            <p className="block text-[10px] font-bold text-amber-800/40 mb-0.5 uppercase tracking-widest">Agendamento</p>
                            <div className="flex items-center gap-2 text-amber-900 bg-orange-50/30 px-3 py-1.5 rounded-lg">
                                <input 
                                    type="checkbox" 
                                    checked={formData.orderScheduling} 
                                    readOnly 
                                    className="h-4 w-4 rounded border-orange-200 text-orange-600 focus:ring-orange-500 cursor-default"
                                />
                                <span className={`text-[10px] font-black uppercase ${formData.orderScheduling ? 'text-amber-900' : 'text-gray-300'}`}>
                                    {formData.orderScheduling ? 'Sim' : 'Não'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    {isEditing ? (
                        <div className="flex items-center gap-2 h-8">
                            <input 
                                type="checkbox" 
                                id="emiteNF" 
                                name="emiteNF" 
                                checked={formData.emiteNF} 
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                            />
                            <label htmlFor="emiteNF" className="text-[10px] font-bold text-amber-700 cursor-pointer uppercase tracking-tight">Emite NF?</label>
                        </div>
                    ) : (
                        <div>
                            <p className="block text-[10px] font-bold text-amber-800/40 mb-0.5 uppercase tracking-widest">Emite NF?</p>
                            <div className="flex items-center gap-2 text-amber-900 bg-orange-50/30 px-3 py-1.5 rounded-lg">
                                <input 
                                    type="checkbox" 
                                    checked={formData.emiteNF} 
                                    readOnly 
                                    className="h-4 w-4 rounded border-orange-200 text-orange-600 focus:ring-orange-500 cursor-default"
                                />
                                <span className={`text-[10px] font-black uppercase ${formData.emiteNF ? 'text-amber-900' : 'text-gray-300'}`}>
                                    {formData.emiteNF ? 'Sim' : 'Não'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {isEditing && (
            <div className="mt-6 flex justify-end gap-2 border-t border-orange-100 pt-4">
                <Button type="button" variant="secondary" onClick={handleCancel} className="text-[10px] px-3 py-1.5">Cancelar</Button>
                <Button type="button" onClick={handleSave} className="text-[10px] px-3 py-1.5">Salvar</Button>
            </div>
        )}
      </div>
    </Card>
  );
};


// Helper component for displaying fields
const InfoField = ({ label, value, name, isEditing, onChange, ...props }: { label: string, value: string, name: string, isEditing: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, [x:string]: any }) => {
    if (isEditing) {
        return <Input label={label} name={name} value={value} onChange={onChange} className="text-xs" {...props} />;
    }
    return (
        <div>
            <p className="block text-[10px] font-bold text-amber-800/40 mb-0.5 uppercase tracking-widest">{label}</p>
            <p className="text-amber-900 bg-orange-50/30 px-3 py-1.5 rounded-lg text-xs font-bold min-h-[32px] flex items-center">{value || '-'}</p>
        </div>
    );
}

export default CompanyDetailView;
