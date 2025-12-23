
import React, { useState } from 'react';
import { Product } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { TrashIcon, TagIcon, PencilIcon, PlusIcon, XMarkIcon } from './Icons';

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
    <div className="fixed inset-0 bg-amber-900/10 z-50 flex items-center justify-center p-4 backdrop-blur-[2px] animate-fade-in" role="dialog" aria-modal="true">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-amber-900/5 relative overflow-hidden border border-white">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-amber-200 hover:text-amber-500 transition-colors p-1" 
          aria-label="Fechar"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        
        <form onSubmit={handleSubmit} className="p-10">
          <header className="mb-8">
            <h3 className="text-xl font-medium text-amber-900 tracking-tight">
              {isEditing ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            <div className="h-0.5 w-8 bg-orange-400 mt-2 rounded-full"></div>
          </header>

          <div className="space-y-8">
            <Input 
              label="Nome do Produto" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder="Ex: Pão de Sal" 
            />
            <Input 
              label="Categoria" 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              required 
              placeholder="Ex: Padaria" 
            />
          </div>

          <div className="mt-12 flex items-center gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-6 py-3.5 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
            >
              Cancelar
            </button>
            <Button type="submit" className="flex-1 shadow-lg shadow-orange-500/20 py-3.5 rounded-2xl">
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

  const handleSave = (productData: Omit<Product, 'id'> | Product) => {
    if ('id' in productData && productData.id) {
        onUpdate(productData as Product);
    } else {
        onAdd(productData as Omit<Product, 'id'>);
    }
    setModalProduct(null);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
       <div className="flex justify-between items-center px-2">
        <h2 className="text-lg font-medium text-amber-900/60">Catálogo de Itens</h2>
        <Button onClick={() => setModalProduct({})} className="rounded-2xl">
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] border border-orange-50/50 overflow-hidden shadow-sm">
      {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-orange-50">
                  <th className="p-6 text-[11px] font-bold text-amber-800/40 uppercase tracking-[0.2em]">Produto</th>
                  <th className="p-6 text-[11px] font-bold text-amber-800/40 uppercase tracking-[0.2em]">Categoria</th>
                  <th className="p-6 text-[11px] font-bold text-amber-800/40 uppercase tracking-[0.2em] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50/30">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-orange-50/20 transition-colors group">
                    <td className="p-6 font-semibold text-amber-900">{product.name}</td>
                    <td className="p-6">
                      <span className="text-amber-700/60 text-sm bg-amber-50/50 px-3 py-1 rounded-full border border-amber-100/50">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                       <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setModalProduct(product)} className="text-amber-400 hover:text-amber-600 p-2.5 rounded-xl hover:bg-white transition-all shadow-sm border border-transparent hover:border-orange-100" aria-label="Editar Produto">
                              <PencilIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => onDelete(product.id)} className="text-red-200 hover:text-red-400 p-2.5 rounded-xl hover:bg-white transition-all shadow-sm border border-transparent hover:border-red-50" aria-label="Deletar Produto">
                              <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      ) : (
         <div className="text-center py-32 bg-white">
            <TagIcon className="mx-auto h-12 w-12 text-amber-50" />
            <h3 className="mt-6 text-sm font-medium text-amber-300 uppercase tracking-widest">Nenhum produto listado</h3>
         </div>
      )}
      </div>

      {modalProduct && <ProductModal product={modalProduct} onSave={handleSave} onClose={() => setModalProduct(null)} />}
    </div>
  );
};

export default ProductManagement;
