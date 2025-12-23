
import React, { useState, useRef, useEffect } from 'react';
import { Company, Order, OrderItem, Product } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { TrashIcon, PlusIcon, BuildingStorefrontIcon, XMarkIcon, ClipboardDocumentListIcon, CalendarDaysIcon, PencilSquareIcon, CheckCircleIcon, EyeIcon } from './Icons';
import RecurringOrderModal from './RecurringOrderModal';

// Modal for viewing an existing signature
const ViewSignatureModal = ({ signature, onClose }: { signature: string, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-lg bg-white p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar">
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h3 className="text-lg font-bold text-amber-800 mb-4">Assinatura Coletada</h3>
        <div className="bg-gray-50 border border-orange-100 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
          <img src={signature} alt="Assinatura" className="max-h-48" />
        </div>
        <div className="mt-6">
          <Button onClick={onClose} className="w-full">Fechar</Button>
        </div>
      </Card>
    </div>
  );
};

// Signature Canvas Component for collecting new signature
const SignatureModal = ({ onSave, onClose }: { onSave: (signature: string) => void, onClose: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: (e as MouseEvent).clientX - rect.left,
      y: (e as MouseEvent).clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
    ctx?.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.lineTo(pos.x, pos.y);
    ctx?.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-amber-800">Assinatura do Funcionário</h3>
          <button onClick={onClose} aria-label="Fechar"><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
        </div>
        <div className="border-2 border-dashed border-orange-200 rounded-lg bg-gray-50 mb-6">
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            className="w-full h-48 cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <div className="flex justify-between gap-4">
          <Button variant="secondary" onClick={clear} className="flex-1">Limpar</Button>
          <Button onClick={save} className="flex-1">Confirmar Assinatura</Button>
        </div>
      </Card>
    </div>
  );
};

// Modal for adding a new order
const OrderModal = ({ availableProducts, onSave, onClose }: { availableProducts: Product[], onSave: (order: Omit<Order, 'id'>) => void, onClose: () => void }) => {
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
      return;
    }
    onSave({ date, items: validItems });
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
                     <label htmlFor={`product-select-${index}`} className="block text-sm font-medium text-amber-700 mb-1">
                        Produto {index + 1}
                    </label>
                    <select
                        id={`product-select-${index}`}
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
          <div className="mt-8 flex justify-end gap-4 pt-4 border-t border-orange-100">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar Pedido</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Main Component
interface OrderManagementProps {
  companies: Company[];
  selectedCompany: Company | null;
  products: Product[];
  onSelectCompany: (companyId: string) => void;
  onAddOrder: (order: Omit<Order, 'id'>) => void;
  onDeleteOrder: (orderId: string) => void;
  onUpdateOrderSignature?: (orderId: string, signature: string) => void;
  isDoorSaleMode?: boolean;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ companies, selectedCompany, products, onSelectCompany, onAddOrder, onDeleteOrder, onUpdateOrderSignature, isDoorSaleMode = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [signatureOrderId, setSignatureOrderId] = useState<string | null>(null);
  const [viewSignatureUrl, setViewSignatureUrl] = useState<string | null>(null);

  const handleSaveOrder = (order: Omit<Order, 'id'>) => {
    onAddOrder(order);
    setIsModalOpen(false);
  };

  const handleSaveRecurringOrder = (data: { items: Omit<OrderItem, 'id'>[], recurrence: any }) => {
    console.log("Saving recurring order:", data);
    setIsRecurringModalOpen(false);
  };

  const handleSaveSignature = (signature: string) => {
    if (signatureOrderId && onUpdateOrderSignature) {
      onUpdateOrderSignature(signatureOrderId, signature);
    }
    setSignatureOrderId(null);
  };
  
  const availableProductsForCompany = selectedCompany
    ? products.filter(p => 
        selectedCompany.productSettings?.some(s => s.productId === p.id && s.buys)
      )
    : [];

  return (
    <div className="space-y-6">
      {isModalOpen && <OrderModal availableProducts={availableProductsForCompany} onSave={handleSaveOrder} onClose={() => setIsModalOpen(false)} />}
      {isRecurringModalOpen && <RecurringOrderModal availableProducts={availableProductsForCompany} onSave={handleSaveRecurringOrder} onClose={() => setIsRecurringModalOpen(false)} />}
      {signatureOrderId && <SignatureModal onSave={handleSaveSignature} onClose={() => setSignatureOrderId(null)} />}
      {viewSignatureUrl && <ViewSignatureModal signature={viewSignatureUrl} onClose={() => setViewSignatureUrl(null)} />}
      
      <Card>
        <div className="p-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div className="flex-1">
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
            <div className="flex flex-col sm:flex-row gap-2">
                {!isDoorSaleMode && (
                  <Button variant="secondary" onClick={() => setIsRecurringModalOpen(true)}>
                      <CalendarDaysIcon className="h-5 w-5 mr-2" />
                      Definir Pedido Recorrente
                  </Button>
                )}
                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Adicionar Pedido
                </Button>
            </div>
          )}
        </div>
      </Card>
    
      {selectedCompany ? (
        <div className="space-y-4">
          {selectedCompany.orders.length > 0 ? (
            <Card className="p-0">
              <ul className="divide-y divide-orange-100">
                {selectedCompany.orders.map(order => (
                  <li key={order.id} className="p-6 hover:bg-orange-50/30 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-amber-800">
                          Pedido de {new Date(order.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => onDeleteOrder(order.id)} 
                          className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" 
                          aria-label="Deletar Pedido"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 bg-orange-50/50 rounded-lg p-4 border border-orange-100">
                        <ul className="divide-y divide-orange-100/50">
                          {order.items.map(item => (
                            <li key={item.id} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                              <span className="text-gray-700 font-medium">{item.productName}</span>
                              <span className="text-amber-800 font-bold bg-white px-2 py-1 rounded border border-orange-100 text-sm">
                                {item.quantity} un.
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {isDoorSaleMode && (
                        <div className="flex flex-col justify-center gap-3">
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Assinatura do Funcionário</p>
                          {order.signature ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between animate-fade-in shadow-sm">
                              <div className="flex items-center gap-2 text-green-700 font-bold text-xs">
                                <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
                                <span>Assinatura coletada com sucesso</span>
                              </div>
                              <button 
                                onClick={() => setViewSignatureUrl(order.signature!)}
                                className="p-1.5 bg-white border border-green-200 rounded-md text-green-600 hover:bg-green-100 transition-all shadow-sm active:scale-90"
                                title="Visualizar Assinatura"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setSignatureOrderId(order.id)}
                              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-orange-200 rounded-lg p-6 text-amber-600 hover:bg-orange-50 hover:border-orange-400 transition-all group"
                            >
                              <PencilSquareIcon className="h-8 w-8 group-hover:scale-110 transition-transform" />
                              <span className="text-xs font-bold">Obter Assinatura</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
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
