
import React, { useState, useEffect } from 'react';
import { RecurringOrderConfig, Product, OrderItem, RecurrenceType } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { TrashIcon, PlusIcon, CalendarDaysIcon, ArrowPathIcon, UsersIcon, Cog6ToothIcon, CheckCircleIcon } from './Icons';

interface FinancialParametersProps {
  recurringConfig?: RecurringOrderConfig;
  companyName: string;
  availableProducts: Product[];
  onUpdate: (newRecurring?: RecurringOrderConfig) => void;
}

const FinancialParameters: React.FC<FinancialParametersProps> = ({ recurringConfig, companyName, availableProducts, onUpdate }) => {
  const [items, setItems] = useState<Omit<OrderItem, 'id'>[]>(recurringConfig?.items || []);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(recurringConfig?.recurrence.type || 'daily');
  const [selectedDays, setSelectedDays] = useState<number[]>(recurringConfig?.recurrence.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setItems(recurringConfig?.items || []);
    setRecurrenceType(recurringConfig?.recurrence.type || 'daily');
    setSelectedDays(recurringConfig?.recurrence.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
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
      const val = Number(value);
      newItems[index][field] = isNaN(val) || val < 1 ? 1 : val;
    } else {
      newItems[index][field] = value as string;
    }
    setItems(newItems);
    setHasChanges(true);
  };

  const handleRecurrenceTypeChange = (type: RecurrenceType) => {
    setRecurrenceType(type);
    if (type === 'daily') setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    else if (type === 'weekdays') setSelectedDays([1, 2, 3, 4, 5]);
    setHasChanges(true);
  };

  const toggleDay = (day: number) => {
    if (recurrenceType !== 'custom') return;
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day].sort();
    setSelectedDays(newDays);
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
          daysOfWeek: selectedDays,
          interval: 1
        }
      };
    }

    onUpdate(finalRecurring);
    setHasChanges(false);
    alert('Configurações de recorrência salvas com sucesso!');
  };

  const handleCancel = () => {
    setItems(recurringConfig?.items || []);
    setRecurrenceType(recurringConfig?.recurrence.type || 'daily');
    setSelectedDays(recurringConfig?.recurrence.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
    setHasChanges(false);
  }

  const daysLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const fullDaysLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="mt-4 space-y-4 animate-fade-in">
      <Card className="p-4 rounded-xl">
        <form onSubmit={handleSubmit}>
            <h3 className="text-sm font-black text-amber-900 mb-1 uppercase tracking-tight">Agendamento de Pedidos</h3>
            <p className="text-[10px] text-amber-600 mb-4">Defina os itens e a frequência para a geração automática de pedidos.</p>
            
            <div className="space-y-4">
                {/* Items section */}
                <div className="bg-orange-50/30 p-4 rounded-lg border border-orange-100/50">
                    <label className="block text-[10px] font-black text-amber-800/40 mb-3 flex items-center gap-2 uppercase tracking-widest">
                        <PlusIcon className="h-3 w-3" />
                        Itens Fixos
                    </label>
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-end gap-2 bg-white p-2 rounded-lg border border-orange-100/50 shadow-sm animate-fade-in">
                                <div className="flex-1">
                                    <label className="block text-[8px] uppercase font-black text-amber-800/40 mb-0.5 ml-1 tracking-widest">Produto</label>
                                    <select
                                        value={item.productName}
                                        onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                                        className="w-full px-2 py-1.5 bg-orange-50/30 border border-orange-100 rounded-lg focus:ring-1 focus:ring-orange-500 text-xs font-bold text-amber-900 outline-none"
                                    >
                                        <option value="" disabled>Escolha o produto</option>
                                        {availableProducts.map(p => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-20">
                                    <label className="block text-[8px] uppercase font-black text-amber-800/40 mb-0.5 ml-1 tracking-widest">Qtd</label>
                                    <input
                                        type="number"
                                        value={isNaN(item.quantity) ? '' : item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        className="w-full px-2 py-1.5 bg-orange-50/30 border border-orange-100 rounded-lg focus:ring-1 focus:ring-orange-500 text-xs font-bold text-amber-900 outline-none"
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-2 text-red-400 hover:text-red-600 transition-colors bg-red-50/50 rounded-lg"
                                    title="Remover produto"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="flex items-center justify-center w-full py-2 border border-dashed border-orange-200 rounded-lg text-[10px] font-black text-orange-600 hover:bg-orange-50 transition-all uppercase tracking-widest"
                        >
                            <PlusIcon className="h-3 w-3 mr-1" /> 
                            Adicionar Produto
                        </button>
                    </div>
                </div>

                {/* Frequency section */}
                <div className="pt-2">
                    <label className="block text-[10px] font-black text-amber-800/40 mb-3 flex items-center gap-2 uppercase tracking-widest">
                        <CalendarDaysIcon className="h-3 w-3 text-orange-500" />
                        Frequência
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => handleRecurrenceTypeChange('daily')}
                            className={`flex items-center justify-center gap-2 p-2 rounded-lg border font-black transition-all ${
                                recurrenceType === 'daily' ? 'bg-orange-500 border-orange-600 text-white shadow-sm' : 'bg-white border-orange-100 text-amber-900 hover:bg-orange-50'
                            }`}
                        >
                            <ArrowPathIcon className="h-4 w-4" />
                            <span className="text-[10px] uppercase tracking-tight">Diário</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRecurrenceTypeChange('weekdays')}
                            className={`flex items-center justify-center gap-2 p-2 rounded-lg border font-black transition-all ${
                                recurrenceType === 'weekdays' ? 'bg-orange-500 border-orange-600 text-white shadow-sm' : 'bg-white border-orange-100 text-amber-900 hover:bg-orange-50'
                            }`}
                        >
                            <UsersIcon className="h-4 w-4" />
                            <span className="text-[10px] uppercase tracking-tight">Úteis</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRecurrenceTypeChange('custom')}
                            className={`flex items-center justify-center gap-2 p-2 rounded-lg border font-black transition-all ${
                                recurrenceType === 'custom' ? 'bg-orange-500 border-orange-600 text-white shadow-sm' : 'bg-white border-orange-100 text-amber-900 hover:bg-orange-50'
                            }`}
                        >
                            <Cog6ToothIcon className="h-4 w-4" />
                            <span className="text-[10px] uppercase tracking-tight">Custom</span>
                        </button>
                    </div>

                    {/* Days selector for custom */}
                    {(recurrenceType === 'custom' || true) && (
                        <div className={`mt-3 p-3 bg-orange-50/10 border border-orange-100 rounded-lg transition-all duration-300 ${recurrenceType === 'custom' ? 'opacity-100 scale-100' : 'opacity-30 pointer-events-none'}`}>
                            <h4 className="text-[9px] font-black text-amber-800/40 mb-2 uppercase tracking-widest text-center">Dias da Semana</h4>
                            <div className="flex justify-center gap-1.5">
                                {daysLabels.map((label, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => toggleDay(index)}
                                        title={fullDaysLabels[index]}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px] transition-all border ${
                                            selectedDays.includes(index)
                                                ? 'bg-orange-500 border-orange-600 text-white shadow-sm'
                                                : 'bg-white border-orange-200 text-amber-300 hover:border-orange-400'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

             <div className="mt-6 flex justify-end gap-2 border-t border-orange-100 pt-4">
                <Button type="button" variant="secondary" onClick={handleCancel} disabled={!hasChanges} className="text-[10px] px-3 py-1.5">
                    Descartar
                </Button>
                <Button type="submit" disabled={!hasChanges || selectedDays.length === 0} className="text-[10px] px-3 py-1.5">
                    Salvar
                </Button>
            </div>
        </form>
      </Card>
    </div>
  );
};

export default FinancialParameters;
