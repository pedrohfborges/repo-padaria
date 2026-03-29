
import React, { useState } from 'react';
import { Product } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { TrashIcon, TagIcon, PencilIcon, PlusIcon, XMarkIcon, MagnifyingGlassIcon } from './Icons';

// Modal Component - Minimalist Version
const ProductModal = ({ product, onSave, onClose }: { product: Partial<Product> | null, onSave: (product: Omit<Product, 'id'> | Product) => void, onClose: () => void }) => {
  if (!product) return null;

  const [formData, setFormData] = useState({
    name: product.name || '',
    category: product.category || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return;
    const finalData = { ...product, ...formData };
    onSave(finalData as Product);
  };

  const isEditing = 'id' in product && product.id;

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1" aria-label="Fechar">
          <XMarkIcon className="h-5 w-5" />
        </button>
        
        <form onSubmit={handleSubmit} className="p-8 max-h-[90vh] overflow-y-auto">
          <header className="mb-6">
            <h3 className="text-xl font-bold text-amber-900">
              {isEditing ? 'Editar Produto' : 'Cadastro'}
            </h3>
          </header>

          <div className="space-y-4">
            <Input 
              label="Nome do Produto" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
            <Input 
              label="Categoria" 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit">
              {isEditing ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ProductManagementProps {
  products: Product[];
  onAdd: (product: Omit<Product, 'id'>) => void;
  onUpdate: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ products, onAdd, onUpdate, onDelete }) => {
  const [modalProduct, setModalProduct] = useState<Partial<Product> | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSave = (productData: Omit<Product, 'id'> | Product) => {
    if ('id' in productData && productData.id) {
        onUpdate(productData as Product);
    } else {
        onAdd(productData as Omit<Product, 'id'>);
    }
    setModalProduct(null);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-amber-900/40 uppercase tracking-widest">Catálogo de Itens</h2>
        
        <div className="flex items-center gap-2">
          {isSearchOpen && (
            <div className="relative animate-in slide-in-from-right-2 fade-in duration-200">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400" />
              <input 
                type="text"
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2.5 bg-white border border-orange-100 rounded-lg text-xs font-bold text-amber-900 outline-none focus:ring-1 focus:ring-orange-500 transition-all w-32 sm:w-64"
                autoFocus
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-amber-400 hover:text-amber-600"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
          
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2.5 rounded-lg border transition-all ${
              isSearchOpen 
                ? 'bg-amber-900 text-white border-amber-900 shadow-inner' 
                : 'bg-white text-amber-900 border-orange-100 hover:bg-orange-50 shadow-sm'
            }`}
            title="Pesquisar"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
          </button>
          
          <Button onClick={() => setModalProduct({})}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Cadastro
          </Button>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="bg-white p-3 rounded-xl flex items-center justify-between hover:shadow-sm transition-all cursor-pointer group border border-orange-50/50"
                onClick={() => setModalProduct(product)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 border border-orange-100">
                    <TagIcon className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-amber-900 text-sm truncate">{product.name}</h3>
                    <p className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">{product.category}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} 
                    className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                    title="Excluir Produto"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-orange-100">
              <p className="text-xs font-bold text-amber-900/40 uppercase tracking-widest">Nenhum produto encontrado para "{searchQuery}"</p>
            </div>
          )}
        </div>
      ) : (
         <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-orange-200">
            <TagIcon className="mx-auto h-10 w-10 text-orange-100" />
            <p className="mt-2 text-xs font-bold text-orange-200 uppercase tracking-widest">Nenhum produto listado</p>
         </div>
      )}

      {modalProduct && <ProductModal product={modalProduct} onSave={handleSave} onClose={() => setModalProduct(null)} />}
    </div>
  );
};

export default ProductManagement;
