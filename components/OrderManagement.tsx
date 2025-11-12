import React, { useState } from 'react';
import { Company, Order, OrderItem } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { TrashIcon, PlusIcon, BuildingStorefrontIcon, XMarkIcon, ClipboardDocumentListIcon } from './Icons';

// Modal for adding a new order
const OrderModal = ({ onSave, onClose }: { onSave: (order: Omit<Order, 'id'>) => void, onClose: () => void }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<Omit<OrderItem, 'id'>[]>([{ productName: '', quantity: 1 }]);

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
      // Maybe show an error message
      return;
    }
    onSave({ date, items: validItems, status: 'Pendente' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
      <Card className="w-full max-w-2xl relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar">
          <XMarkIcon className="h-6 w-6" />
        </button>
        <form onSubmit={handleSubmit} className="p-8 flex flex-col flex-grow">
          <h3 className="text-xl font-semibold text-amber-800 mb-6">Adicionar Novo Pedido</h3>
          <div className="flex-grow overflow-y-auto pr-2">
            <Input label="Data do Pedido" name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <h4 className="text-lg font-medium text-amber-700 mt-6 mb-2">Itens do Pedido</h4>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-end gap-2 p-3 bg-orange-50/50 rounded-md border border-orange-100">
                  <div className="flex-grow">
                    <Input label={`Produto ${index + 1}`} name="productName" value={item.productName} onChange={(e) => handleItemChange(index, 'productName', e.target.value)} required />
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
          <div className="mt-8 flex justify-end gap-4 pt-4 border-t border-orange-100">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar Pedido</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const statusColors: Record<Order['status'], string> = {
    Pendente: 'bg-yellow-100 text-yellow-800',
    Entregue: 'bg-green-100 text-green-800',
    Cancelado: 'bg-red-100 text-red-800',
};

// Main Component
interface OrderManagementProps {
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (companyId: string) => void;
  onAddOrder: (order: Omit<Order, 'id'>) => void;
  onDeleteOrder: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ companies, selectedCompany, onSelectCompany, onAddOrder, onDeleteOrder, onUpdateOrderStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveOrder = (order: Omit<Order, 'id'>) => {
    onAddOrder(order);
    setIsModalOpen(false);
  };
  
  return (
    <div className="space-y-8">
      {isModalOpen && <OrderModal onSave={handleSaveOrder} onClose={() => setIsModalOpen(false)} />}
      <Card>
        <div className="p-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <label htmlFor="company-select" className="block text-sm font-medium text-amber-700 mb-1">
                Selecione uma empresa para gerenciar
            </label>
            <select
                id="company-select"
                value={selectedCompany?.id || ''}
                onChange={(e) => onSelectCompany(e.target.value)}
                className="w-full max-w-sm px-4 py-2 bg-white border border-orange-200 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
                <option value="" disabled>-- Escolha uma empresa --</option>
                {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>
          {selectedCompany && (
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Adicionar Pedido
            </Button>
          )}
        </div>
      </Card>
    
      {selectedCompany ? (
        <div className="space-y-6">
          {selectedCompany.orders.length > 0 ? (
            selectedCompany.orders.map(order => (
              <Card key={order.id}>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-amber-800">Pedido de {new Date(order.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })}</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="bg-white border border-orange-200 rounded-md text-sm p-1.5 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option>Pendente</option>
                            <option>Entregue</option>
                            <option>Cancelado</option>
                        </select>
                       <button onClick={() => onDeleteOrder(order.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors" aria-label="Deletar Pedido">
                         <TrashIcon className="h-5 w-5" />
                       </button>
                    </div>
                  </div>
                  <ul className="divide-y divide-orange-100 border-t border-orange-100 pt-4">
                    {order.items.map(item => (
                      <li key={item.id} className="flex justify-between items-center py-2">
                        <span className="text-gray-700">{item.productName}</span>
                        <span className="font-medium text-gray-800">{item.quantity} un.</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))
          ) : (
             <Card className="text-center p-12">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum pedido encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">Comece adicionando o primeiro pedido para {selectedCompany.name}.</p>
             </Card>
          )}
        </div>
      ) : (
         <Card className="text-center p-12">
            <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma empresa selecionada</h3>
            <p className="mt-1 text-sm text-gray-500">Por favor, selecione uma empresa acima para ver seus pedidos.</p>
         </Card>
      )}
    </div>
  );
};

export default OrderManagement;