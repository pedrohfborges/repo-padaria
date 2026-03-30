
import React, { useState } from 'react';
import { Company, Order, OrderItem, Product, CompanyProductSetting } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { TrashIcon, XMarkIcon, PlusIcon, CheckCircleIcon, EyeIcon, ShoppingBagIcon } from './Icons';

// Modal para Visualizar Assinatura
const ViewSignatureModal = ({ sellerSignature, sellerTime, buyerSignature, buyerTime, onClose }: { sellerSignature?: string, sellerTime?: string, buyerSignature?: string, buyerTime?: string, onClose: () => void }) => (
  <div className="fixed inset-0 bg-amber-900/20 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]" onClick={onClose}>
    <Card className="w-full max-w-md bg-white p-6 relative rounded-xl shadow-xl" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-4 right-4 text-amber-400 hover:text-amber-600">
        <XMarkIcon className="h-5 w-5" />
      </button>
      <h3 className="text-[10px] font-black text-amber-900 mb-4 uppercase tracking-widest">Assinaturas Coletadas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sellerSignature && (
          <div className="space-y-2">
            <h4 className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Vendedor</h4>
            <div className="bg-orange-50/30 border border-orange-100 rounded-lg p-2 flex flex-col items-center justify-center min-h-[120px]">
              <img src={sellerSignature} alt="Assinatura Vendedor" className="max-h-24" />
              <p className="text-[7px] text-amber-400 mt-2 font-bold">{sellerTime ? new Date(sellerTime).toLocaleString('pt-BR') : '-'}</p>
            </div>
          </div>
        )}
        
        {buyerSignature && (
          <div className="space-y-2">
            <h4 className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Comprador</h4>
            <div className="bg-orange-50/30 border border-orange-100 rounded-lg p-2 flex flex-col items-center justify-center min-h-[120px]">
              <img src={buyerSignature} alt="Assinatura Comprador" className="max-h-24" />
              <p className="text-[7px] text-amber-400 mt-2 font-bold">{buyerTime ? new Date(buyerTime).toLocaleString('pt-BR') : '-'}</p>
            </div>
          </div>
        )}
      </div>
      
      <Button onClick={onClose} className="w-full mt-6 text-[10px] py-2">Fechar</Button>
    </Card>
  </div>
);

// Modal de Coleta de Assinatura
const SignatureModal = ({ title, onSave, onClose }: { title: string, onSave: (signature: string) => void, onClose: () => void }) => {
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
      ctx.lineWidth = 2; 
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
    <div className="fixed inset-0 bg-amber-900/20 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]">
      <Card className="w-full max-w-sm bg-white p-4 shadow-xl rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">{title}</h3>
          <button onClick={onClose}><XMarkIcon className="h-5 w-5 text-amber-400" /></button>
        </div>
        <div className="border border-orange-100 rounded-lg bg-orange-50/30 mb-4 overflow-hidden">
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={200} 
            className="w-full h-40 cursor-crosshair touch-none bg-white" 
            onMouseDown={startDrawing} 
            onMouseMove={draw} 
            onMouseUp={() => setIsDrawing(false)} 
            onTouchStart={startDrawing} 
            onTouchMove={draw} 
            onTouchEnd={() => setIsDrawing(false)} 
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { const c = canvasRef.current; c?.getContext('2d')?.clearRect(0,0,c.width,c.height); }} variant="secondary" className="flex-1 text-[10px] py-2">Limpar</Button>
          <Button onClick={save} className="flex-1 text-[10px] py-2">Confirmar</Button>
        </div>
      </Card>
    </div>
  );
};

// Modal para Novo Pedido
const AddOrderModal = ({ products, companySettings, preferredOrder, onSave, onClose, isDoorSaleMode }: { 
  products: Product[], 
  companySettings: CompanyProductSetting[], 
  preferredOrder?: { 
    [day: number]: { 
      morning?: { productName: string, quantity: number }[], 
      afternoon?: { productName: string, quantity: number }[] 
    } 
  }, 
  onSave: (items: Omit<OrderItem, 'id'>[]) => void, 
  onClose: () => void, 
  isDoorSaleMode?: boolean 
}) => {
  const [items, setItems] = useState<Omit<OrderItem, 'id' | 'price'>[]>([{ productName: '', quantity: 1 }]);

  const handleLoadPreferred = (period: 'morning' | 'afternoon') => {
    if (preferredOrder) {
      const today = new Date().getDay();
      const dayConfig = preferredOrder[today];
      const periodItems = dayConfig?.[period];
      
      if (periodItems && periodItems.length > 0) {
        setItems(periodItems.map(it => ({ productName: it.productName, quantity: it.quantity })));
      }
    }
  };

  // Filtra apenas produtos que o cliente compra e tem preço > 0
  const validProducts = products.filter(p => {
    const setting = companySettings.find(s => s.productId === p.id);
    return setting?.buys && setting?.price > 0;
  });

  const handleAddItem = () => setItems([...items, { productName: '', quantity: 1 }]);
  const handleRemoveItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const handleItemChange = (idx: number, field: string, value: any) => {
    const updated = [...items];
    if (field === 'quantity') {
      const val = Number(value);
      (updated[idx] as any)[field] = isNaN(val) || val < 1 ? 1 : val;
    } else {
      (updated[idx] as any)[field] = value;
    }
    setItems(updated);
  };

  const handleSave = () => {
    const itemsWithPrices = items.map(item => {
      const product = products.find(p => p.name === item.productName);
      const setting = companySettings.find(s => s.productId === product?.id);
      return {
        ...item,
        price: setting?.price || 0
      };
    });
    onSave(itemsWithPrices.filter(it => it.productName !== ''));
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => {
      const product = products.find(p => p.name === item.productName);
      const setting = companySettings.find(s => s.productId === product?.id);
      return acc + (item.quantity * (setting?.price || 0));
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-amber-900/20 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]">
      <Card className="w-full max-w-sm bg-white p-4 shadow-xl rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Novo Lançamento</h3>
          <button onClick={onClose}><XMarkIcon className="h-5 w-5 text-amber-400" /></button>
        </div>
        
        {validProducts.length === 0 ? (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-center mb-4">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Cliente não tem valor de produto cadastrado</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 mb-3">
            {items.map((item, idx) => {
              const product = products.find(p => p.name === item.productName);
              const setting = companySettings.find(s => s.productId === product?.id);
              const price = setting?.price || 0;

              return (
                <div key={idx} className="flex gap-2 items-end bg-orange-50/20 p-2 rounded-lg border border-orange-100/30">
                  <div className="flex-1">
                    <label className="text-[8px] font-bold text-amber-500 uppercase ml-1 tracking-tighter">Produto</label>
                    <select 
                      value={item.productName} 
                      onChange={e => handleItemChange(idx, 'productName', e.target.value)}
                      className="w-full bg-white border border-orange-100 rounded-md px-2 py-1 text-xs font-bold text-amber-900 outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="">Selecione...</option>
                      {validProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="w-16">
                    <label className="text-[8px] font-bold text-amber-500 uppercase ml-1 tracking-tighter">Qtd</label>
                    <input 
                      type="number" 
                      value={isNaN(item.quantity) ? '' : item.quantity} 
                      onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full bg-white border border-orange-100 rounded-md px-2 py-1 text-xs font-black text-center outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  {!isDoorSaleMode && (
                    <div className="w-16 text-right">
                      <label className="text-[8px] font-bold text-amber-500 uppercase tracking-tighter block">Total</label>
                      <span className="text-[10px] font-black text-amber-900">
                        {(item.quantity * price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  )}
                  <button type="button" onClick={() => handleRemoveItem(idx)} className="p-1 text-red-300 hover:text-red-500">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {validProducts.length > 0 && (
          <>
            <div className="flex gap-1 mb-4">
              <button onClick={handleAddItem} className="flex-1 py-1.5 border border-dashed border-orange-200 rounded-lg text-[8px] font-black text-orange-500 uppercase hover:bg-orange-50 transition-all tracking-widest">
                + Item
              </button>
              {preferredOrder && preferredOrder[new Date().getDay()]?.morning && (
                <button onClick={() => handleLoadPreferred('morning')} className="flex-1 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-[8px] font-black text-orange-600 uppercase hover:bg-orange-100 transition-all tracking-widest">
                  Pref. Manhã
                </button>
              )}
              {preferredOrder && preferredOrder[new Date().getDay()]?.afternoon && (
                <button onClick={() => handleLoadPreferred('afternoon')} className="flex-1 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-[8px] font-black text-orange-600 uppercase hover:bg-orange-100 transition-all tracking-widest">
                  Pref. Tarde
                </button>
              )}
            </div>

            {!isDoorSaleMode && (
              <div className="mb-4 p-2 bg-amber-50 rounded-lg border border-amber-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Total do Pedido</span>
                <span className="text-sm font-black text-orange-600">
                  {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            )}
          </>
        )}

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1 text-[10px] py-2">Cancelar</Button>
          {validProducts.length > 0 && (
            <Button onClick={handleSave} className="flex-1 text-[10px] py-2">Lançar</Button>
          )}
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
  onUpdateOrderSignature?: (orderId: string, signature: string, type: 'seller' | 'buyer') => void;
  isDoorSaleMode?: boolean;
  isManualLaunchMode?: boolean;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ 
    companies, selectedCompany, products, onSelectCompany, onAddOrder, onDeleteOrder, onUpdateOrderSignature, isDoorSaleMode = false, isManualLaunchMode = false 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [sigCollection, setSigCollection] = useState<{ orderId: string, type: 'seller' | 'buyer' } | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCompanySelect = (id: string) => {
    const company = companies.find(c => c.id === id);
    if (company) {
      const hasValidProducts = company.productSettings?.some(s => s.buys && s.price > 0);
      if (!hasValidProducts) {
        setErrorMsg("Este cliente não possui produtos com valores cadastrados para venda.");
        onSelectCompany('');
        return;
      }
    }
    setErrorMsg(null);
    onSelectCompany(id);
  };

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
  
  const sortedOrders = selectedCompany?.orders.filter(o => {
    if (o.status !== 'confirmed') return false;
    if (isDoorSaleMode) return o.isDoorSale === true;
    if (isManualLaunchMode) return !o.isDoorSale;
    return true; // Histórico geral mostra tudo
  }).sort((a,b) => b.date.localeCompare(a.date)) || [];

  return (
    <div className="space-y-4 animate-fade-in max-w-4xl mx-auto pb-12">
      {isAdding && (
        <AddOrderModal 
          products={products} 
          companySettings={selectedCompany?.productSettings || []}
          preferredOrder={selectedCompany?.preferredOrder}
          onSave={handleSaveOrder} 
          onClose={() => setIsAdding(false)} 
          isDoorSaleMode={isDoorSaleMode}
        />
      )}
      {sigCollection && (
        <SignatureModal 
          title={sigCollection.type === 'seller' ? 'Assinatura do Vendedor' : 'Assinatura do Comprador'}
          onSave={(sig) => { 
            onUpdateOrderSignature?.(sigCollection.orderId, sig, sigCollection.type); 
            setSigCollection(null); 
          }} 
          onClose={() => setSigCollection(null)} 
        />
      )}
      {viewingOrder && (
        <ViewSignatureModal 
          sellerSignature={viewingOrder.sellerSignature} 
          sellerTime={viewingOrder.sellerSignatureTime}
          buyerSignature={viewingOrder.buyerSignature}
          buyerTime={viewingOrder.buyerSignatureTime}
          onClose={() => setViewingOrder(null)} 
        />
      )}

      {/* Cabeçalho Página Venda na Porta ou Lançamento Manual */}
      {(isDoorSaleMode || isManualLaunchMode) && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {isDoorSaleMode ? <ShoppingBagIcon className="h-5 w-5 text-amber-800" /> : <PlusIcon className="h-5 w-5 text-amber-800" />}
            <div>
                <h1 className="text-sm font-black text-amber-900 leading-none uppercase tracking-tight">
                  {isDoorSaleMode ? 'Venda na Porta' : 'Pedido Manual'}
                </h1>
                <p className="text-[9px] font-bold text-amber-500 mt-0.5 uppercase tracking-widest">
                  {isDoorSaleMode ? 'Gestão de pedidos específicos de venda na porta.' : 'Lançamento imediato de pedidos no sistema.'}
                </p>
            </div>
          </div>

          {selectedCompany && (
            <Button onClick={() => setIsAdding(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Lançar Pedido
            </Button>
          )}
        </div>
      )}

      {/* Card de Seleção: Branco e Laranja */}
      <Card className="p-3 bg-white border border-orange-100 shadow-sm rounded-xl">
        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3">
          <div className="flex-1 w-full">
            <label className="block text-[9px] font-black text-amber-500 mb-1 ml-1 uppercase tracking-widest">
              Cliente
            </label>
            <div className="relative">
              <select
                value={selectedCompany?.id || ''}
                onChange={(e) => handleCompanySelect(e.target.value)}
                className="w-full max-w-md px-3 py-1.5 bg-orange-50/30 border border-orange-100 rounded-lg font-bold text-amber-900 text-xs outline-none focus:ring-1 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>-- Selecionar Empresa --</option>
                {filteredCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errorMsg && (
              <p className="mt-1 text-[9px] font-black text-red-500 uppercase tracking-widest animate-shake">
                {errorMsg}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Histórico de Pedidos Confirmados */}
      {selectedCompany && (
        <div className="space-y-2 mt-4">
          {sortedOrders.length > 0 ? (
            sortedOrders.map(order => (
              <Card key={order.id} className="p-3 bg-white border border-orange-50 shadow-sm rounded-xl relative group animate-fade-in-up">
                {/* Botão Deletar Topo Direito */}
                <button 
                  onClick={() => onDeleteOrder(order.id)} 
                  className="absolute top-2 right-2 text-amber-200 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>

                <h3 className="text-[10px] font-black text-amber-900 mb-2 uppercase tracking-widest">
                  {new Date(order.date + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </h3>

                <div className="flex flex-col md:flex-row gap-3 items-start">
                  {/* Lado Esquerdo: Lista de Produtos (Box Branco/Laranja) */}
                  <div className="flex-1 w-full bg-orange-50/10 rounded-lg p-2 border border-orange-100/20">
                    <div className="space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="font-bold text-amber-900 text-[10px] uppercase tracking-tight">{it.productName}</span>
                            {!isDoorSaleMode && (
                              <span className="text-[8px] text-amber-500 font-medium">
                                {it.quantity} x {(it.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                            )}
                            {isDoorSaleMode && (
                              <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest">
                                Quantidade: {it.quantity}
                              </span>
                            )}
                          </div>
                          {!isDoorSaleMode && (
                            <span className="bg-white text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 text-[9px] font-black">
                              {(it.quantity * (it.price || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {!isDoorSaleMode && (
                      <div className="mt-2 pt-2 border-t border-orange-100 flex justify-between items-center">
                        <span className="text-[9px] font-black text-amber-900 uppercase tracking-widest">Total do Pedido</span>
                        <span className="text-xs font-black text-orange-600">
                          {order.items.reduce((acc, it) => acc + (it.quantity * (it.price || 0)), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Lado Direito: Seção de Assinatura - SOMENTE EM MODO VENDA NA PORTA */}
                  {isDoorSaleMode && (
                    <div className="w-full md:w-64 space-y-2">
                      <div className="flex flex-col gap-2">
                        {/* Assinatura Vendedor */}
                        <div className="flex items-center justify-between bg-orange-50/20 p-2 rounded-lg border border-orange-100/30">
                          <div className="flex flex-col">
                            <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Vendedor</span>
                            {order.sellerSignature ? (
                              <div className="flex items-center gap-1">
                                <CheckCircleIcon className="h-3 w-3 text-green-600" />
                                <span className="text-[7px] text-green-700 font-bold">{new Date(order.sellerSignatureTime!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            ) : (
                              <span className="text-[7px] text-amber-300 font-bold">Pendente</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {!order.sellerSignature ? (
                              <button 
                                onClick={() => setSigCollection({ orderId: order.id, type: 'seller' })}
                                className="p-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition-all"
                                title="Assinar como Vendedor"
                              >
                                <PlusIcon className="h-3 w-3" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => setViewingOrder(order)}
                                className="p-1.5 bg-white border border-green-100 rounded text-green-700 hover:bg-green-50 transition-all"
                              >
                                <EyeIcon className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Assinatura Comprador */}
                        <div className="flex items-center justify-between bg-orange-50/20 p-2 rounded-lg border border-orange-100/30">
                          <div className="flex flex-col">
                            <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Comprador</span>
                            {order.buyerSignature ? (
                              <div className="flex items-center gap-1">
                                <CheckCircleIcon className="h-3 w-3 text-green-600" />
                                <span className="text-[7px] text-green-700 font-bold">{new Date(order.buyerSignatureTime!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            ) : (
                              <span className="text-[7px] text-amber-300 font-bold">Pendente</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {!order.buyerSignature ? (
                              <button 
                                onClick={() => setSigCollection({ orderId: order.id, type: 'buyer' })}
                                className="p-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition-all"
                                title="Assinar como Comprador"
                              >
                                <PlusIcon className="h-3 w-3" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => setViewingOrder(order)}
                                className="p-1.5 bg-white border border-green-100 rounded text-green-700 hover:bg-green-50 transition-all"
                              >
                                <EyeIcon className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center p-8 bg-white border border-dashed border-orange-100 rounded-xl">
              <h3 className="text-[10px] font-black text-orange-300 uppercase tracking-widest">Nenhum pedido lançado</h3>
            </div>
          )}
        </div>
      )}

      {!selectedCompany && (
        <div className="text-center p-16 bg-white border-2 border-dashed border-orange-100 rounded-2xl">
          <h3 className="text-xs font-black text-orange-300 uppercase tracking-widest">Aguardando seleção de cliente</h3>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
