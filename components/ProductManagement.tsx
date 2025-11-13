import React, { useState } from 'react';
import { Product } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { TrashIcon, TagIcon, PencilIcon, PlusIcon, XMarkIcon } from './Icons';

// Modal Component
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
    if (!formData.name || !formData.category) {
        alert("Nome e categoria são obrigatórios.");
        return;
    }
    const finalData = { ...product, ...formData };
    onSave(finalData);
  };

  const isEditing = 'id' in product && product.id;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
      <Card className="w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar">
          <XMarkIcon className="h-6 w-6" />
        </button>
        <form onSubmit={handleSubmit} className="p-8">
          <h3 className="text-xl font-semibold text-amber-800 mb-6">{isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}</h3>
          <div className="space-y-4">
            <Input label="Nome do Produto" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Categoria" name="category" value={formData.category} onChange={handleChange} required />
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Adicionar Produto'}</Button>
          </div>
        </form>
      </Card>
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
    <div className="space-y-8">
       <div className="flex justify-end">
        <Button onClick={() => setModalProduct({})}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      {products.length > 0 ? (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b-2 border-orange-200">
                <tr>
                  <th className="p-4 text-sm font-semibold text-amber-700">Nome do Produto</th>
                  <th className="p-4 text-sm font-semibold text-amber-700">Categoria</th>
                  <th className="p-4 text-sm font-semibold text-amber-700 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-orange-100 hover:bg-orange-50/50">
                    <td className="p-4 font-medium text-gray-800">{product.name}</td>
                    <td className="p-4 text-gray-600">{product.category}</td>
                    <td className="p-4 text-right">
                       <div className="flex gap-2 justify-end">
                          <button onClick={() => setModalProduct(product)} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors" aria-label="Editar Produto">
                              <PencilIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => onDelete(product.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors" aria-label="Deletar Produto">
                              <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
         <Card className="text-center p-12">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum produto cadastrado</h3>
            <p className="mt-1 text-sm text-gray-500">Comece adicionando seu primeiro produto ao catálogo.</p>
         </Card>
      )}

      {modalProduct && <ProductModal product={modalProduct} onSave={handleSave} onClose={() => setModalProduct(null)} />}
    </div>
  );
};

export default ProductManagement;