
import React, { useState, useEffect } from 'react';
import { RecurringOrderConfig, Product, OrderItem, RecurrenceType } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { TrashIcon, PlusIcon, CalendarDaysIcon, ArrowPathIcon, UsersIcon } from './Icons';

interface FinancialParametersProps {
  recurringConfig?: RecurringOrderConfig;
  companyName: string;
  availableProducts: Product[];
  onUpdate: (newRecurring?: RecurringOrderConfig) => void;
}

const FinancialParameters: React.FC<FinancialParametersProps> = ({ recurringConfig, companyName, availableProducts, onUpdate }) => {
  const [items, setItems] = useState<Omit<OrderItem, 'id'>[]>(recurringConfig?.items || []);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(recurringConfig?.recurrence.type || 'daily');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setItems(recurringConfig?.items || []);
    setRecurrenceType(recurringConfig?.recurrence.type || 'daily');
    setHasChanges(false);
  }, [recurringConfig]);

  const handleAddItem = () => {
    setItems([...items, { productName: '', quantity: 1 }]);
    setHasChanges(true);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleItemChange = (index: number, field: 'productName' | 'quantity', value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity') {
      newItems[index][field] = Number(value) < 1 ? 1 : Number(value);
    } else {
      newItems[index][field] = value as string;
    }
    setItems(newItems);
    setHasChanges(true);
  };

  const handleRecurrenceTypeChange = (type: RecurrenceType) => {
    setRecurrenceType(type);
    setHasChanges(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalRecurring: RecurringOrderConfig | undefined = undefined;
    
    const validItems = items.filter(it => it.productName !== '');
    if (validItems.length > 0) {
      finalRecurring = {
        items: validItems,
        recurrence: {
          type: recurrenceType,
          interval: 1
        }
      };
    } else {
      // If user cleared all items, we might want to disable recurrence
      finalRecurring = undefined;
    }

    onUpdate(finalRecurring);
    setHasChanges(false);
    alert('Configurações de recorrência salvas com sucesso!');
  };

  const handleCancel = () => {
    setItems(recurringConfig?.items || []);
    setRecurrenceType(recurringConfig?.recurrence.type || 'daily');
    setHasChanges(false);
  }

  return (
    <div className="mt-6 space-y-6 animate-fade-in">
      <Card>
        <form onSubmit={handleSubmit} className="p-8">
            <h3 className="text-xl font-semibold text-amber-800 mb-2">Configuração de Pedidos Recorrentes</h3>
            <p className="text-sm text-amber-600 mb-8">Defina os itens e a frequência para a geração automática de pedidos para {companyName}.</p>
            
            <div className="space-y-6">
                {/* Items section */}
                <div className="bg-orange-50/50 p-6 rounded-lg border border-orange-100 shadow-inner">
                    <label className="block text-sm font-bold text-amber-700 mb-4 flex items-center gap-2">
                        <PlusIcon className="h-5 w-5" />
                        Itens Fixos para Compra Automática
                    </label>
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-end gap-3 bg-white p-3 rounded-md border border-orange-100 shadow-sm animate-fade-in">
                                <div className="flex-1">
                                    <label className="block text-[10px] uppercase font-bold text-amber-500 mb-1 ml-1">Produto</label>
                                    <select
                                        value={item.productName}
                                        onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-orange-200 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm"
                                    >
                                        <option value="" disabled>Escolha o produto</option>
                                        {availableProducts.map(p => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <Input
                                        label="Quantidade"
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        className="h-[42px]"
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-2.5 text-red-400 hover:text-red-600 transition-colors bg-red-50 rounded-md"
                                    title="Remover produto"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                        
                        {items.length === 0 && (
                            <div className="text-center py-6 text-amber-600 italic text-sm">
                                Nenhum item configurado para este agendamento.
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="flex items-center justify-center w-full py-3 border-2 border-dashed border-orange-200 rounded-lg text-sm font-bold text-orange-600 hover:bg-orange-100 hover:border-orange-400 transition-all group"
                        >
                            <PlusIcon className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" /> 
                            Adicionar Produto à Recorrência
                        </button>
                    </div>
                </div>

                {/* Frequency section */}
                <div className="pt-4">
                    <label className="block text-sm font-bold text-amber-700 mb-4 flex items-center gap-2">
                        <CalendarDaysIcon className="h-5 w-5 text-orange-500" />
                        Frequência de Geração
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => handleRecurrenceTypeChange('daily')}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 font-bold transition-all ${
                                recurrenceType === 'daily' ? 'bg-orange-500 border-orange-600 text-white shadow-md scale-105' : 'bg-white border-orange-100 text-amber-700 hover:bg-orange-50 hover:border-orange-200'
                            }`}
                        >
                            <ArrowPathIcon className="h-6 w-6" />
                            <span className="text-sm">Diário</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRecurrenceTypeChange('weekdays')}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 font-bold transition-all ${
                                recurrenceType === 'weekdays' ? 'bg-orange-500 border-orange-600 text-white shadow-md scale-105' : 'bg-white border-orange-100 text-amber-700 hover:bg-orange-50 hover:border-orange-200'
                            }`}
                        >
                            <UsersIcon className="h-6 w-6" />
                            <span className="text-sm">Dias Úteis (Seg-Sex)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRecurrenceTypeChange('weekly')}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 font-bold transition-all ${
                                recurrenceType === 'weekly' ? 'bg-orange-500 border-orange-600 text-white shadow-md scale-105' : 'bg-white border-orange-100 text-amber-700 hover:bg-orange-50 hover:border-orange-200'
                            }`}
                        >
                            <CalendarDaysIcon className="h-6 w-6" />
                            <span className="text-sm">Semanal</span>
                        </button>
                    </div>
                </div>
            </div>

             <div className="mt-10 flex justify-end gap-4 border-t border-orange-100 pt-8">
                <Button type="button" variant="secondary" onClick={handleCancel} disabled={!hasChanges}>
                    Descartar Alterações
                </Button>
                <Button type="submit" disabled={!hasChanges}>
                    Salvar Configuração de Recorrência
                </Button>
            </div>
        </form>
      </Card>
    </div>
  );
};

export default FinancialParameters;
