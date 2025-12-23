
import React, { useState } from 'react';
import { Company, Order, OrderItem, Product } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { TrashIcon, XMarkIcon, PlusIcon, CheckCircleIcon, EyeIcon, ShoppingBagIcon } from './Icons';

// Modal para Visualizar Assinatura
const ViewSignatureModal = ({ signature, onClose }: { signature: string, onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
    <Card className="w-full max-w-lg bg-white p-6 relative" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
        <XMarkIcon className="h-6 w-6" />
      </button>
      <h3 className="text-sm font-black text-amber-900 mb-4 uppercase tracking-tight">Assinatura Coletada</h3>
      <div className="bg-gray-50 border border-orange-100 rounded-xl p-4 flex items-center justify-center min-h-[200px]">
        <img src={signature} alt="Assinatura" className="max-h-48" />
      </div>
      <Button onClick={onClose} className="w-full mt-6">Fechar</Button>
    </Card>
  </div>
);

// Modal de Coleta de Assinatura
const SignatureModal = ({ onSave, onClose }: { onSave: (signature: string) => void, onClose: () => void }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) { 
      ctx.strokeStyle = '#000'; 
      ctx.lineWidth = 3; 
      ctx.lineCap = 'round'; 
      ctx.beginPath(); 
      ctx.moveTo(pos.x, pos.y); 
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    canvasRef.current?.getContext('2d')?.lineTo(pos.x, pos.y);
    canvasRef.current?.getContext('2d')?.stroke();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (canvas) onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg bg-white p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black text-amber-900 uppercase">Coletar Assinatura Digital</h3>
          <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
        </div>
        <div className="border border-gray-200 rounded-xl bg-gray-50 mb-6 overflow-hidden">
          <canvas 
            ref={canvasRef} 
            width={500} 
            height={250} 
            className="w-full h-56 cursor-crosshair touch-none bg-white" 
            onMouseDown={startDrawing} 
            onMouseMove={draw} 
            onMouseUp={() => setIsDrawing(false)} 
            onTouchStart={startDrawing} 
            onTouchMove={draw} 
            onTouchEnd={() => setIsDrawing(false)} 
          />
        </div>
        <div className="flex gap-3">
          <Button onClick={() => { const c = canvasRef.current; c?.getContext('2d')?.clearRect(0,0,c.width,c.height); }} variant="secondary" className="flex-1">Limpar</Button>
          <Button onClick={save} className="flex-1">Confirmar Assinatura</Button>
        </div>
      </Card>
    </div>
  );
};

// Modal para Novo Pedido
const AddOrderModal = ({ products, onSave, onClose }: { products: Product[], onSave: (items: Omit<OrderItem, 'id'>[]) => void, onClose: () => void }) => {
  const [items, setItems] = useState<Omit<OrderItem, 'id'>[]>([{ productName: '', quantity: 1 }]);

  const handleAddItem = () => setItems([...items, { productName: '', quantity: 1 }]);
  const handleRemoveItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const handleItemChange = (idx: number, field: string, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = field === 'quantity' ? Math.max(1, Number(value)) : value;
    setItems(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-white p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-amber-900 uppercase">Novo Lançamento na Porta</h3>
          <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
        </div>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 mb-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-end bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Produto</label>
                <select 
                  value={item.productName} 
                  onChange={e => handleItemChange(idx, 'productName', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-bold text-amber-900"
                >
                  <option value="">Selecione...</option>
                  {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div className="w-20">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Qtd</label>
                <input 
                  type="number" 
                  value={item.quantity} 
                  onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-black text-center"
                />
              </div>
              <button type="button" onClick={() => handleRemoveItem(idx)} className="p-2 text-red-300 hover:text-red-500">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={handleAddItem} className="w-full py-2 border-2 border-dashed border-orange-200 rounded-xl text-[10px] font-black text-orange-500 uppercase hover:bg-orange-50 transition-all mb-6">
          + Adicionar Item
        </button>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={() => onSave(items.filter(it => it.productName !== ''))} className="flex-1">Lançar Pedido</Button>
        </div>
      </Card>
    </div>
  );
};

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

const OrderManagement: React.FC<OrderManagementProps> = ({ 
    companies, selectedCompany, products, onSelectCompany, onAddOrder, onDeleteOrder, onUpdateOrderSignature, isDoorSaleMode = false 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [sigOrderId, setSigOrderId] = useState<string | null>(null);
  const [viewSigUrl, setViewSigUrl] = useState<string | null>(null);

  const handleSaveOrder = (items: Omit<OrderItem, 'id'>[]) => {
    if (items.length === 0) return;
    onAddOrder({ 
      date: new Date().toISOString().split('T')[0], 
      items: items.map(it => ({ ...it, id: Math.random().toString() })), 
      status: 'confirmed',
      isDoorSale: isDoorSaleMode // Identifica se é venda na porta
    });
    setIsAdding(false);
  };

  // Filtra apenas empresas que têm doorSale marcado se estiver no modo porta
  const filteredCompanies = isDoorSaleMode ? companies.filter(c => c.doorSale) : companies;
  const sortedOrders = selectedCompany?.orders.filter(o => o.status === 'confirmed').sort((a,b) => b.date.localeCompare(a.date)) || [];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {isAdding && <AddOrderModal products={products} onSave={handleSaveOrder} onClose={() => setIsAdding(false)} />}
      {sigOrderId && <SignatureModal onSave={(sig) => { onUpdateOrderSignature?.(sigOrderId, sig); setSigOrderId(null); }} onClose={() => setSigOrderId(null)} />}
      {viewSigUrl && <ViewSignatureModal signature={viewSigUrl} onClose={() => setViewSigUrl(null)} />}

      {/* Cabeçalho Página Venda na Porta */}
      {isDoorSaleMode && (
        <div className="flex items-center gap-4 mb-2">
           <ShoppingBagIcon className="h-10 w-10 text-amber-800" />
           <div>
              <h1 className="text-4xl font-black text-amber-900 leading-none">Venda na Porta</h1>
              <p className="text-sm font-bold text-amber-600 mt-1">Gerencie pedidos específicos de venda na porta.</p>
           </div>
        </div>
      )}

      {/* Card de Seleção: Igual ao print */}
      <Card className="p-8 bg-[#e3ded8] border-none shadow-none rounded-[2rem]">
        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-amber-800 mb-3 ml-1">
              Selecione uma empresa para gerenciar
            </label>
            <div className="relative">
              <select
                value={selectedCompany?.id || ''}
                onChange={(e) => onSelectCompany(e.target.value)}
                className="w-full max-w-lg px-5 py-3.5 bg-white/60 border border-gray-300 rounded-2xl font-bold text-amber-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>-- Selecionar Empresa --</option>
                {filteredCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {selectedCompany && isDoorSaleMode && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-[#b84d16] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-orange-800 transition-all shadow-xl shadow-orange-900/10"
            >
              <PlusIcon className="h-5 w-5" /> Adicionar Pedido
            </button>
          )}
        </div>
      </Card>

      {/* Histórico de Pedidos Confirmados */}
      {selectedCompany && (
        <div className="space-y-8 mt-10">
          {sortedOrders.length > 0 ? (
            sortedOrders.map(order => (
              <Card key={order.id} className="p-8 bg-[#e3ded8] border-none shadow-none rounded-[2.5rem] relative group animate-fade-in-up">
                {/* Botão Deletar Topo Direito */}
                <button 
                  onClick={() => onDeleteOrder(order.id)} 
                  className="absolute top-6 right-8 text-red-300 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="h-6 w-6" />
                </button>

                <h3 className="text-xl font-black text-amber-900 mb-8">
                  Pedido de {new Date(order.date + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>

                <div className="flex flex-col md:flex-row gap-10 items-start">
                  {/* Lado Esquerdo: Lista de Produtos (Box Cinza Claro) */}
                  <div className="flex-1 w-full bg-[#d6cfc7]/60 rounded-3xl p-6 border border-white/20">
                    <div className="space-y-4">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center group/item">
                          <span className="font-bold text-amber-900 text-base">{it.productName}</span>
                          <span className="bg-[#e3ded8] text-amber-900 px-4 py-1.5 rounded-xl text-sm font-black border border-[#c4bbb0]">
                            {it.quantity} un.
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lado Direito: Seção de Assinatura - SOMENTE EM MODO VENDA NA PORTA */}
                  {isDoorSaleMode && (
                    <div className="w-full md:w-80">
                      <p className="text-[11px] font-black text-amber-700/60 uppercase tracking-widest mb-4">
                        ASSINATURA DO FUNCIONÁRIO
                      </p>
                      
                      {order.signature ? (
                        <div className="flex items-center gap-3 bg-[#cde4da] border border-[#a8cfbd] p-5 rounded-2xl shadow-sm">
                          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-[#a8cfbd]">
                            <CheckCircleIcon className="h-5 w-5 text-green-700" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-black text-green-800">Assinatura coletada com sucesso</p>
                          </div>
                          <button 
                            onClick={() => setViewSigUrl(order.signature!)}
                            className="p-2.5 bg-white/40 border border-green-200/50 rounded-xl text-green-700 hover:bg-white/80 transition-all"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setSigOrderId(order.id)}
                          className="w-full flex items-center justify-center gap-3 bg-white/40 border-2 border-dashed border-amber-300/40 p-6 rounded-2xl text-amber-800 font-black text-xs uppercase tracking-tighter hover:bg-white/60 transition-all group/sig"
                        >
                          <PlusIcon className="h-5 w-5 group-hover/sig:scale-125 transition-transform" /> Coletar Assinatura
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center p-24 bg-white/20 border-4 border-dashed border-[#e3ded8] rounded-[3rem]">
              <h3 className="text-lg font-black text-amber-400 uppercase tracking-widest">Nenhum pedido lançado</h3>
              <p className="text-sm text-amber-500 font-bold mt-2">Os pedidos confirmados aparecerão aqui.</p>
            </div>
          )}
        </div>
      )}

      {!selectedCompany && (
        <div className="text-center p-24 bg-[#e3ded8]/40 border-2 border-dashed border-[#c4bbb0] rounded-[3rem]">
          <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest">Aguardando seleção de cliente</h3>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
