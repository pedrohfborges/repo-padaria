
import React, { useState, useEffect } from 'react';
import { Company, Order, OrderItem, Product } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { CheckCircleIcon, CalendarDaysIcon, PaperAirplaneIcon, TrashIcon, PencilSquareIcon, XMarkIcon, PlusIcon, ArrowPathIcon, SunIcon, MoonIcon } from './Icons';
import { getTomorrowRecurringPJOrders, QueueItem, getTomorrowDateStr } from '../src/services/orderService';

/**
 * ==============================================================================
 * DOCUMENTAÇÃO DE NEGÓCIO - CONFERÊNCIA DE PEDIDOS RECORRENTES (PJ)
 * ==============================================================================
 * 
 * 1. FLUXO DE TRABALHO:
 *    - Esta aba funciona como uma "API de Produção" que consolida todos os
 *      pedidos de clientes CNPJ (PJ) que possuem agendamento ativo.
 *    - O foco é o fechamento da produção de AMANHÃ para lançamento no histórico.
 * 
 * 2. REGRAS DE EXIBIÇÃO:
 *    - Apenas Clientes PJ.
 *    - Apenas com 'orderScheduling' = true.
 *    - Data fixa: Amanhã (conforme solicitado pelo usuário).
 * 
 * 3. AÇÕES:
 *    - Editar: Permite ajustar quantidades antes de oficializar.
 *    - Confirmar: Move o pedido do estado 'pendente/previsão' para o histórico
 *      do cliente como 'confirmado'.
 * ==============================================================================
 */

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
    <div className="fixed inset-0 bg-amber-900/20 z-50 flex items-center justify-center p-4 backdrop-blur-[2px] animate-fade-in">
      <Card className="w-full max-w-md shadow-xl border-none rounded-xl overflow-hidden">
        <div className="p-4 border-b border-orange-50 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <img src={order.company.logoUrl} className="h-8 w-8 rounded-lg object-cover" />
            <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Editar Pedido</h3>
          </div>
          <button onClick={onClose} className="text-amber-400 hover:text-amber-600"><XMarkIcon className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <select 
                    value={item.productName} 
                    onChange={e => handleItemChange(index, 'productName', e.target.value)}
                    className="w-full px-2 py-1.5 bg-orange-50/30 border border-orange-100 rounded-lg text-xs font-bold text-amber-900 outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">Produto...</option>
                    {products.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div className="w-16">
                  <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-full px-2 py-1.5 border border-orange-100 rounded-lg text-center font-black text-xs text-amber-900 outline-none focus:ring-1 focus:ring-orange-500" />
                </div>
                <button type="button" onClick={() => removeItem(index)} className="text-red-300 hover:text-red-500 p-1.5"><TrashIcon className="h-4 w-4" /></button>
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-[10px] font-black text-orange-600 flex items-center gap-1 uppercase tracking-widest hover:text-orange-700 transition-colors"><PlusIcon className="h-3 w-3" /> ADICIONAR ITEM</button>
          </div>
          <div className="pt-4 flex gap-2 border-t border-orange-50">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 text-[10px] py-2">Cancelar</Button>
            <Button type="submit" className="flex-1 text-[10px] py-2">Salvar</Button>
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
  period?: 'morning' | 'afternoon';
}

const ScheduledConfirmation: React.FC<ScheduledConfirmationProps> = ({ companies, products, onConfirmAllQueue, onDeleteOrder, onAddManualOrder, period }) => {
  const [editingItem, setEditingItem] = useState<QueueItem | null>(null);
  const [allQueueItems, setAllQueueItems] = useState<QueueItem[]>([]);
  const [isConfirmExpanded, setIsConfirmExpanded] = useState(false);

  // Carrega os dados da "API" (Service)
  useEffect(() => {
    let items = getTomorrowRecurringPJOrders(companies);
    if (period) {
      items = items.filter(item => item.order.period === period);
    }
    setAllQueueItems(items);
  }, [companies, period]);

  // Resumo de Produção (Soma de todos os itens da fila)
  const productionSummary = allQueueItems.reduce((acc: Record<string, number>, item) => {
    item.order.items.forEach((it: any) => {
      acc[it.productName] = (acc[it.productName] || 0) + it.quantity;
    });
    return acc;
  }, {});

  const handleConfirmAll = (period?: 'morning' | 'afternoon') => {
    const filteredItems = period 
      ? allQueueItems.filter(item => item.order.period === period)
      : allQueueItems;

    if (filteredItems.length === 0) return;
    
    const drafts = filteredItems.filter(i => i.isDraft).map(d => ({ 
      companyId: d.company.id, 
      order: { ...d.order, items: d.order.items.map(it => ({ ...it, id: Math.random().toString() })) } 
    }));

    const existing = filteredItems.filter(i => !i.isDraft).map(p => ({ 
      companyId: p.company.id, 
      orderId: p.order.id 
    }));

    onConfirmAllQueue({ drafts, existing });
    setIsConfirmExpanded(false);
  };

  const handleConfirmIndividual = (item: QueueItem) => {
    onConfirmAllQueue({
      drafts: item.isDraft ? [{ 
        companyId: item.company.id, 
        order: { ...item.order, items: item.order.items.map((it: any) => ({ ...it, id: Math.random().toString() })) } 
      }] : [],
      existing: !item.isDraft ? [{ 
        companyId: item.company.id, 
        orderId: item.order.id 
      }] : []
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

  const morningItems = allQueueItems.filter(item => item.order.period === 'morning');
  const afternoonItems = allQueueItems.filter(item => item.order.period === 'afternoon');

  const renderQueueList = (items: QueueItem[], title: string, period: 'morning' | 'afternoon') => (
    <div className="flex-1 min-w-0 flex flex-col h-full">
      <div className={`p-3 border-b flex justify-between items-center ${period === 'morning' ? 'bg-amber-50/50 border-amber-100' : 'bg-orange-50/50 border-orange-100'}`}>
        <div className="flex items-center gap-2">
          {period === 'morning' ? <SunIcon className="h-4 w-4 text-amber-600" /> : <MoonIcon className="h-4 w-4 text-orange-600" />}
          <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-900">{title}</h3>
          <span className="bg-white px-1.5 py-0.5 rounded text-[8px] font-black text-amber-500 border border-orange-50">{items.length}</span>
        </div>
        <Button 
          onClick={() => handleConfirmAll(period)}
          disabled={items.length === 0}
          className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border-none shadow-sm ${
            period === 'morning' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-orange-600 hover:bg-orange-700'
          } text-white`}
        >
          Confirmar {period === 'morning' ? 'Manhã' : 'Tarde'}
        </Button>
      </div>
      
      <div className="divide-y divide-orange-50 flex-1 overflow-y-auto min-h-[200px]">
        {items.length === 0 ? (
          <div className="p-8 text-center h-full flex items-center justify-center">
            <p className="text-[9px] font-bold text-amber-900/20 uppercase tracking-widest">Sem pedidos para este período</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.order.id} className="p-3 hover:bg-orange-50/10 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <img src={item.company.logoUrl} className="h-6 w-6 rounded-md object-cover border border-orange-50" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-amber-900 truncate leading-tight">{item.company.name}</p>
                    <p className="text-[7px] font-black text-amber-400 uppercase tracking-tighter">{item.company.cnpj || 'PJ'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingItem(item)} className="p-1 text-amber-300 hover:text-amber-500"><PencilSquareIcon className="h-3 w-3" /></button>
                  <button onClick={() => handleConfirmIndividual(item)} className="p-1 text-green-400 hover:text-green-600"><CheckCircleIcon className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.order.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-orange-50/50">
                    <span className="text-[9px] font-black text-amber-900">{it.quantity}</span>
                    <span className="text-[8px] font-bold text-amber-500 uppercase tracking-tighter">{it.productName}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const tomorrowFormatted = new Date();
  tomorrowFormatted.setDate(tomorrowFormatted.getDate() + 1);
  const displayDate = tomorrowFormatted.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4 animate-fade-in max-w-5xl mx-auto pb-10">
      {editingItem && <EditOrderModal order={editingItem} products={products} onSave={handleSaveEdit} onClose={() => setEditingItem(null)} />}

      {/* Cabeçalho Minimalista */}
      <div className="flex flex-col sm:flex-row justify-between items-end border-b border-orange-100 pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-amber-900 tracking-tight">
            Conferência PJ {period === 'morning' ? '(Manhã)' : period === 'afternoon' ? '(Tarde)' : '(Amanhã)'}
          </h2>
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">
            Produção de {displayDate}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Total na Fila</p>
            <p className="text-sm font-black text-amber-900">{allQueueItems.length}</p>
          </div>
          
          {!period && (
            <Button 
              onClick={() => setIsConfirmExpanded(!isConfirmExpanded)}
              disabled={allQueueItems.length === 0}
              className={`border-none px-6 py-2 rounded-xl text-[10px] uppercase font-black flex items-center gap-2 transition-all duration-300 ${
                isConfirmExpanded ? 'bg-amber-900 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isConfirmExpanded ? 'Fechar Subjanelas' : 'Confirmar pedidos com recorrência'}
              {isConfirmExpanded ? <XMarkIcon className="h-3 w-3" /> : <ArrowPathIcon className="h-3 w-3" />}
            </Button>
          )}

          {period && (
            <Button 
              onClick={() => handleConfirmAll(period)}
              disabled={allQueueItems.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white border-none px-6 py-2 rounded-xl text-[10px] uppercase font-black flex items-center gap-2"
            >
              Confirmar Tudo ({period === 'morning' ? 'Manhã' : 'Tarde'})
              <CheckCircleIcon className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Resumo de Produção */}
      {allQueueItems.length > 0 && !isConfirmExpanded && (
        <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 flex flex-wrap gap-4 items-center">
          <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest border-r border-orange-200 pr-4">Resumo Total:</span>
          {Object.entries(productionSummary).map(([name, qty]) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-amber-900">{qty}</span>
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter">{name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Subjanelas Manhã e Tarde (Aparecem ao clicar na visão geral ou se um período específico for selecionado) */}
      {isConfirmExpanded || period ? (
        <div className={`grid grid-cols-1 ${!period ? 'md:grid-cols-2' : ''} gap-4 animate-in slide-in-from-bottom-4 duration-500`}>
          {(!period || period === 'morning') && (
            <Card className="rounded-2xl border-orange-100 overflow-hidden shadow-md flex flex-col h-[500px]">
              {renderQueueList(morningItems, 'Pedidos da Manhã', 'morning')}
            </Card>
          )}
          
          {(!period || period === 'afternoon') && (
            <Card className="rounded-2xl border-orange-100 overflow-hidden shadow-md flex flex-col h-[500px]">
              {renderQueueList(afternoonItems, 'Pedidos da Tarde', 'afternoon')}
            </Card>
          )}
        </div>
      ) : (
        /* Tabela Simplificada (Visão Geral) */
        <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 bg-orange-50/30 border-b border-orange-100 p-3">
            <div className="col-span-4 text-[9px] font-black text-amber-900/40 uppercase tracking-widest">Cliente</div>
            <div className="col-span-5 text-[9px] font-black text-amber-900/40 uppercase tracking-widest">Produtos</div>
            <div className="col-span-3 text-right text-[9px] font-black text-amber-900/40 uppercase tracking-widest">Status</div>
          </div>

          <div className="divide-y divide-orange-50">
            {allQueueItems.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-xs font-bold text-amber-900/20 uppercase tracking-widest">Nenhum pedido pendente</p>
              </div>
            ) : (
              allQueueItems.map((item) => (
                <div key={item.order.id} className="grid grid-cols-12 p-3 items-center hover:bg-orange-50/20 transition-colors">
                  <div className="col-span-4 flex items-center gap-3">
                    <img src={item.company.logoUrl} className="h-8 w-8 rounded-lg object-cover border border-orange-100" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-amber-900 truncate">{item.company.name}</p>
                      <p className="text-[7px] font-black text-amber-400 uppercase">{item.order.period === 'morning' ? 'Manhã' : 'Tarde'}</p>
                    </div>
                  </div>
                  <div className="col-span-5 flex flex-wrap gap-2">
                    {item.order.items.map((it: any, idx: number) => (
                      <span key={idx} className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">
                        {it.quantity}x {it.productName}
                      </span>
                    ))}
                  </div>
                  <div className="col-span-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${item.isDraft ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                      {item.isDraft ? 'Previsão' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <p className="text-center text-[10px] font-black text-amber-200 uppercase tracking-widest pt-8 opacity-40">
        FIM DA LISTA DE PRODUÇÃO PJ
      </p>
    </div>
  );
};

export default ScheduledConfirmation;
