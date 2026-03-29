import React, { useState } from 'react';
import { OrderItem, Product } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { TrashIcon, PlusIcon, XMarkIcon, CalendarDaysIcon, SunIcon, ArrowPathIcon, UsersIcon, Cog6ToothIcon } from './Icons';

type RecurrenceType = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly' | 'custom';

interface RecurrenceRule {
    type: RecurrenceType;
    interval?: number;
}

interface RecurringOrderModalProps {
    availableProducts: Product[];
    onSave: (data: { items: Omit<OrderItem, 'id'>[], recurrence: RecurrenceRule }) => void;
    onClose: () => void;
}

const RecurringOrderModal: React.FC<RecurringOrderModalProps> = ({ availableProducts, onSave, onClose }) => {
    const [items, setItems] = useState<Omit<OrderItem, 'id'>[]>([{ productName: '', quantity: 1 }]);
    const [recurrence, setRecurrence] = useState<RecurrenceRule>({ type: 'daily', interval: 1 });

    const handleItemChange = (index: number, field: 'productName' | 'quantity', value: string | number) => {
        const newItems = [...items];
        if (field === 'quantity') {
            newItems[index][field] = Number(value) < 1 ? 1 : Number(value);
        } else {
            newItems[index][field] = value as string;
        }
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { productName: '', quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validItems = items.filter(item => item.productName.trim() !== '' && item.quantity > 0).map(item => ({...item, id: `item-${Date.now()}-${Math.random()}`}));
        if (validItems.length === 0) {
            alert('Adicione pelo menos um item ao pedido.');
            return;
        }
        onSave({ items: validItems, recurrence });
    };

    // FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    // FIX: Corrected the type for `icon` to allow `React.cloneElement` to correctly infer props.
    const recurrenceOptions: { id: RecurrenceType, label: string, icon: React.ReactElement<React.SVGProps<SVGSVGElement>> }[] = [
        { id: 'daily', label: 'Diariamente', icon: <CalendarDaysIcon className="h-5 w-5" /> },
        { id: 'weekdays', label: 'Dias da semana', icon: <UsersIcon className="h-5 w-5" /> },
        { id: 'weekly', label: 'Semanalmente', icon: <ArrowPathIcon className="h-5 w-5" /> },
        { id: 'monthly', label: 'Mensalmente', icon: <CalendarDaysIcon className="h-5 w-5" /> },
        { id: 'yearly', label: 'Anualmente', icon: <SunIcon className="h-5 w-5" /> },
        { id: 'custom', label: 'Personalizar', icon: <Cog6ToothIcon className="h-5 w-5" /> },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
            <Card className="w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <form onSubmit={handleSubmit} className="p-4 flex flex-col flex-grow">
                    <h3 className="text-sm font-black text-amber-900 mb-1 uppercase tracking-tight">Definir Pedido Recorrente</h3>
                    <p className="text-[10px] text-amber-600 mb-4">Configure a geração automática deste pedido.</p>
                    
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                        {/* Items Section */}
                        <div>
                            <h4 className="text-[10px] font-black text-amber-800/40 mb-2 uppercase tracking-widest">Itens do Pedido</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                                {items.map((item, index) => (
                                    <div key={index} className="flex items-end gap-2 p-2 bg-orange-50/30 rounded-lg border border-orange-100/50 shadow-sm">
                                        <div className="flex-grow">
                                            <label htmlFor={`recurring-product-select-${index}`} className="block text-[8px] font-black text-amber-800/40 mb-0.5 uppercase tracking-widest">
                                                Produto
                                            </label>
                                            <select
                                                id={`recurring-product-select-${index}`}
                                                value={item.productName}
                                                onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                                                required
                                                className="w-full px-2 py-1.5 bg-white border border-orange-100 rounded-lg focus:ring-1 focus:ring-orange-500 text-xs font-bold text-amber-900 outline-none"
                                            >
                                                <option value="" disabled>Selecione um produto</option>
                                                {availableProducts.map(p => (
                                                    <option key={p.id} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-16">
                                            <label className="block text-[8px] font-black text-amber-800/40 mb-0.5 uppercase tracking-widest">Qtd</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                required
                                                className="w-full px-2 py-1.5 bg-white border border-orange-100 rounded-lg focus:ring-1 focus:ring-orange-500 text-xs font-bold text-amber-900 outline-none"
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50/50 transition-colors" aria-label="Remover Item">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addItem} className="mt-2 flex items-center justify-center w-full py-2 border border-dashed border-orange-200 rounded-lg text-[10px] font-black text-orange-600 hover:bg-orange-50 transition-all uppercase tracking-widest">
                                <PlusIcon className="h-3 w-3 mr-1" /> Adicionar Item
                            </button>
                        </div>

                        {/* Recurrence Section */}
                        <div>
                            <h4 className="text-[10px] font-black text-amber-800/40 mb-2 uppercase tracking-widest">Frequência</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {recurrenceOptions.map(opt => (
                                    <button
                                        type="button"
                                        key={opt.id}
                                        onClick={() => setRecurrence({ type: opt.id, interval: 1 })}
                                        className={`flex items-center gap-2 p-2 rounded-lg border font-black transition-all ${
                                            recurrence.type === opt.id ? 'bg-orange-500 border-orange-600 text-white shadow-sm' : 'bg-white border-orange-100 text-amber-900 hover:bg-orange-50'
                                        }`}
                                    >
                                        {React.cloneElement(opt.icon, { className: 'h-4 w-4 flex-shrink-0' })}
                                        <span className="text-[10px] uppercase tracking-tight">{opt.label}</span>
                                    </button>
                                ))}
                            </div>

                            {recurrence.type === 'custom' && (
                                <div className="mt-3 p-3 bg-orange-50/30 rounded-lg border border-orange-100/50">
                                    <h5 className="text-[9px] font-black text-amber-800/40 mb-2 uppercase tracking-widest">Opções personalizadas</h5>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-amber-900">
                                        <span>Repetir a cada</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={recurrence.interval}
                                            onChange={e => setRecurrence(r => ({ ...r, interval: parseInt(e.target.value) || 1 }))}
                                            className="w-12 px-2 py-1 bg-white border border-orange-100 rounded-lg focus:ring-1 focus:ring-orange-500 text-xs font-bold text-amber-900 outline-none"
                                        />
                                        <span>dias.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-orange-100">
                        <Button type="button" variant="secondary" onClick={onClose} className="text-[10px] px-3 py-1.5">Cancelar</Button>
                        <Button type="submit" className="text-[10px] px-3 py-1.5">Salvar</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default RecurringOrderModal;