
import React, { useState } from 'react';
import { Company, Order, OrderItem, Product } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { CheckCircleIcon, CalendarDaysIcon, PaperAirplaneIcon, TrashIcon, PencilSquareIcon, XMarkIcon, PlusIcon } from './Icons';

const getLocalDateStr = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const EditOrderModal = ({ order, products, onSave, onClose }: any) => {
  const [items, setItems] = useState<Omit<OrderItem, 'id'>[]>(
    order.order.items.map((it: any) => ({ productName: it.productName, quantity: it.quantity }))
  );

  const handleItemChange = (index: number, field: 'productName' | 'quantity', value: any) => {
    const newItems = [...items];
    if (field === 'quantity') {
      newItems[index].quantity = Math.max(1, Number(value));
    } else {
      newItems[index].productName = value;
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { productName: '', quantity: 1 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(it => it.productName !== '');
    if (validItems.length === 0) return;
    onSave(validItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-amber-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-lg shadow-2xl border-none">
        <div className="p-6 border-b border-orange-50 flex justify-between items-center bg-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <img src={order.company.logoUrl} className="h-10 w-10 rounded-lg object-cover" />
            <h3 className="text-lg font-black text-amber-900">Editar Pedido - {order.company.name}</h3>
          </div>
          <button onClick={onClose} className="text-amber-400 hover:text-amber-600"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white rounded-b-xl max-h-[70vh] overflow-y-auto">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <select 
                    value={item.productName} 
                    onChange={e => handleItemChange(index, 'productName', e.target.value)}
                    className="w-full px-3 py-2 bg-orange-50/30 border border-orange-100 rounded-lg text-sm"
                  >
                    <option value="">Produto...</option>
                    {products.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div className="w-20">
                  <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-center font-black" />
                </div>
                <button type="button" onClick={() => removeItem(index)} className="text-red-300 p-2"><TrashIcon className="h-5 w-5" /></button>
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-xs font-black text-orange-600 flex items-center gap-1"><PlusIcon className="h-4 w-4" /> ADICIONAR ITEM</button>
          </div>
          <div className="pt-6 flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Salvar Alterações</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

interface ScheduledConfirmationProps {
  companies: Company[];
  products: Product[];
  onConfirmAllQueue: (data: { drafts: any[], existing: any[] }) => void;
  onDeleteOrder: (orderId: string, companyId: string) => void;
  onAddManualOrder: (order: Omit<Order, 'id'>, companyId: string) => void;
}

const ScheduledConfirmation: React.FC<ScheduledConfirmationProps> = ({ companies, products, onConfirmAllQueue, onDeleteOrder, onAddManualOrder }) => {
  const [editingItem, setEditingItem] = useState<any>(null);

  const tomorrowStr = getLocalDateStr(new Date(Date.now() + 86400000));
  const tomorrowDay = new Date(Date.now() + 86400000).getDay();

  // Pedidos reais pendentes (manuais ou já gerados) - EXCLUI VENDAS NA PORTA
  const pendingOrders = companies.flatMap(c => 
    c.orders.filter(o => o.status === 'pending' && !o.isDoorSale).map(o => ({ company: c, order: o, isDraft: false }))
  );

  // Previsões para amanhã baseadas na recorrência - Apenas para empresas com Agendamento de Pedidos ATIVO
  const draftOrders = companies
    .filter(c => {
      if (!c.orderScheduling || !c.recurringOrder || c.orders.some(o => o.date === tomorrowStr)) return false;
      const { type, daysOfWeek } = c.recurringOrder.recurrence;
      return daysOfWeek?.includes(tomorrowDay) || type === 'daily' || (type === 'weekdays' && tomorrowDay >= 1 && tomorrowDay <= 5);
    })
    .map(c => ({
      company: c,
      order: {
        id: `draft-${c.id}`,
        date: tomorrowStr,
        items: c.recurringOrder!.items,
        status: 'pending' as const
      },
      isDraft: true
    }));

  const allQueueItems = [...pendingOrders, ...draftOrders].sort((a, b) => a.order.date.localeCompare(b.order.date));

  const handleConfirmAll = () => {
    if (allQueueItems.length === 0) return;
    
    // Passamos todos os dados necessários para o App.tsx processar
    onConfirmAllQueue({
      drafts: draftOrders.map(d => ({ 
        companyId: d.company.id, 
        order: { ...d.order, items: d.order.items.map(it => ({ ...it, id: Math.random().toString() })) } 
      })),
      existing: pendingOrders.map(p => ({ 
        companyId: p.company.id, 
        orderId: p.order.id 
      }))
    });
  };

  const handleSaveEdit = (newItems: any) => {
    if (!editingItem) return;
    if (!editingItem.isDraft) onDeleteOrder(editingItem.order.id, editingItem.company.id);
    onAddManualOrder({ 
      date: editingItem.order.date, 
      items: newItems.map((it: any) => ({ ...it, id: Math.random().toString() })), 
      status: 'pending' 
    }, editingItem.company.id);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      {editingItem && <EditOrderModal order={editingItem} products={products} onSave={handleSaveEdit} onClose={() => setEditingItem(null)} />}

      {/* Cabeçalho com o Botão 'Box' Estilizado conforme print */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-orange-100 gap-6">
        <div>
          <h2 className="text-xl font-black text-amber-900 leading-tight">Fila de Produção</h2>
          <p className="text-xs font-bold text-amber-500 uppercase tracking-tighter">PEDIDOS ATIVOS E PREVISÕES</p>
        </div>
        
        {/* Botão de Confirmação Principal conforme o Print - Ajustado Ícone */}
        <button 
          onClick={handleConfirmAll}
          disabled={allQueueItems.length === 0}
          className="flex flex-col items-center justify-center p-5 bg-white border-2 border-black rounded-xl hover:bg-orange-50 transition-all disabled:opacity-30 disabled:grayscale group min-w-[280px]"
        >
          <PaperAirplaneIcon className="h-7 w-7 text-black mb-2" />
          <span className="text-sm font-bold text-black uppercase tracking-tight">
            Confirmar pedidos de amanhã ({allQueueItems.length})
          </span>
        </button>
      </div>

      {/* Lista de Pedidos em Cards Horizontais Redesenhados */}
      <div className="space-y-3">
        {allQueueItems.length === 0 ? (
          <div className="text-center p-16 bg-white/40 border-2 border-dashed border-orange-100 rounded-3xl">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-orange-200" />
            <p className="mt-4 text-sm font-bold text-amber-600">Nenhum pedido na fila de hoje ou amanhã.</p>
          </div>
        ) : (
          allQueueItems.map((item) => (
            <Card key={item.order.id} className="p-4 border border-orange-50 bg-white hover:border-orange-200 transition-all shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Lado Esquerdo: Info da Empresa */}
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="relative flex-shrink-0">
                    <img src={item.company.logoUrl} className="h-14 w-14 rounded-2xl object-cover border border-orange-50 shadow-sm" />
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center bg-orange-500">
                       <CalendarDaysIcon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-amber-900 truncate">{item.company.name}</h3>
                    <div className="mt-1 flex flex-col gap-0.5">
                      <span className={`inline-block self-start text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${item.isDraft ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-700'}`}>
                        {item.isDraft ? 'PREVISÃO' : 'PENDENTE'}
                      </span>
                      <p className="text-[10px] font-black text-orange-400 uppercase mt-0.5">
                        {new Date(item.order.date + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Centro: Produtos em Chips Estilizados */}
                <div className="flex flex-wrap gap-1.5 flex-[2] justify-start md:justify-center w-full">
                  {item.order.items.map((it: any, idx: number) => (
                    <div key={idx} className="bg-orange-50/70 px-3 py-1.5 rounded-full border border-orange-100/50 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-800">{it.productName}</span>
                      <span className="text-[11px] font-black text-orange-600">{it.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Lado Direito: Ações */}
                <div className="flex items-center gap-1 w-full md:w-auto justify-end">
                  <button 
                    onClick={() => setEditingItem(item)}
                    className="p-3 text-amber-400 hover:text-amber-600 transition-colors"
                    title="Editar pedido"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  
                  {!item.isDraft && (
                    <button 
                      onClick={() => onDeleteOrder(item.order.id, item.company.id)} 
                      className="p-3 text-red-200 hover:text-red-400 transition-colors"
                      title="Remover pedido"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

              </div>
            </Card>
          ))
        )}
      </div>
      
      <p className="text-center text-[10px] font-black text-amber-200 uppercase tracking-widest pt-8 opacity-40">
        FIM DA LISTA DE PRODUÇÃO
      </p>
    </div>
  );
};

export default ScheduledConfirmation;
