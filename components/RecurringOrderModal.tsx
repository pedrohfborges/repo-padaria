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
                <form onSubmit={handleSubmit} className="p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-amber-800 mb-6">Definir Pedido Recorrente</h3>
                    <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                        {/* Items Section */}
                        <div>
                            <h4 className="text-lg font-medium text-amber-700 mb-2">Itens do Pedido</h4>
                            <div className="space-y-4 max-h-48 overflow-y-auto p-1">
                                {items.map((item, index) => (
                                    <div key={index} className="flex items-end gap-2 p-3 bg-orange-50/50 rounded-md border border-orange-100">
                                        <div className="flex-grow">
                                            <label htmlFor={`recurring-product-select-${index}`} className="block text-sm font-medium text-amber-700 mb-1">
                                                Produto {index + 1}
                                            </label>
                                            <select
                                                id={`recurring-product-select-${index}`}
                                                value={item.productName}
                                                onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                                                required
                                                className="w-full px-4 py-2 bg-white border border-orange-200 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                            >
                                                <option value="" disabled>Selecione um produto</option>
                                                {availableProducts.map(p => (
                                                    <option key={p.id} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <Input label="Qtd." name="quantity" type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required />
                                        </div>
                                        <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors" aria-label="Remover Item">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="secondary" onClick={addItem} className="mt-4">
                                <PlusIcon className="h-4 w-4 mr-2" /> Adicionar Item
                            </Button>
                        </div>

                        {/* Recurrence Section */}
                        <div>
                            <h4 className="text-lg font-medium text-amber-700 mb-2">Frequência</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {recurrenceOptions.map(opt => (
                                    <button
                                        type="button"
                                        key={opt.id}
                                        onClick={() => setRecurrence({ type: opt.id, interval: 1 })}
                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                                            recurrence.type === opt.id ? 'bg-orange-100 border-orange-500 text-orange-700 shadow-sm' : 'bg-white border-orange-200 hover:bg-orange-50 hover:border-orange-400'
                                        }`}
                                    >
                                        {React.cloneElement(opt.icon, { className: 'h-6 w-6 flex-shrink-0' })}
                                        <span className="font-semibold text-sm">{opt.label}</span>
                                    </button>
                                ))}
                            </div>

                            {recurrence.type === 'custom' && (
                                <div className="mt-4 p-4 bg-orange-50/50 rounded-lg border border-orange-200">
                                    <h5 className="font-semibold text-amber-700 mb-2">Opções personalizadas</h5>
                                    <div className="flex items-center gap-2">
                                        <span>Repetir a cada</span>
                                        <Input
                                            label=""
                                            type="number"
                                            min="1"
                                            value={recurrence.interval}
                                            onChange={e => setRecurrence(r => ({ ...r, interval: parseInt(e.target.value) || 1 }))}
                                            className="w-20"
                                        />
                                        <span>dias.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-4 pt-4 border-t border-orange-100">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Salvar Pedido Recorrente</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default RecurringOrderModal;