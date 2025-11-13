import React, { useState, useEffect } from 'react';
import { FinancialParams } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';

interface FinancialParametersProps {
  params: FinancialParams;
  companyName: string;
  onUpdate: (newParams: FinancialParams) => void;
}

const FinancialParameters: React.FC<FinancialParametersProps> = ({ params, companyName, onUpdate }) => {
  const [formData, setFormData] = useState<FinancialParams>(params);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData(params);
    setHasChanges(false);
  }, [params]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
    setHasChanges(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setHasChanges(false);
    // Optionally show a success message
    alert('Parâmetros salvos com sucesso!');
  };

  const handleCancel = () => {
    setFormData(params);
    setHasChanges(false);
  }

  return (
    <div className="mt-6">
      <Card>
        <form onSubmit={handleSubmit} className="p-8">
            <h3 className="text-xl font-semibold text-amber-800 mb-2">Parâmetros de {companyName}</h3>
            <p className="text-sm text-amber-600 mb-6">Defina as configurações financeiras para esta empresa.</p>
            <div className="space-y-6">
                <Input
                    label="Margem de Lucro Padrão (%)"
                    name="defaultMargin"
                    type="number"
                    value={formData.defaultMargin}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                />
                <Input
                    label="Taxa de Entrega Padrão (R$)"
                    name="defaultDeliveryFee"
                    type="number"
                    value={formData.defaultDeliveryFee}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                />
                <Input
                    label="Desconto Máximo Permitido (%)"
                    name="maxDiscount"
                    type="number"
                    value={formData.maxDiscount}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                />
            </div>
             <div className="mt-8 flex justify-end gap-4 border-t border-orange-100 pt-6">
                <Button type="button" variant="secondary" onClick={handleCancel} disabled={!hasChanges}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={!hasChanges}>
                    Salvar Alterações
                </Button>
            </div>
        </form>
      </Card>
    </div>
  );
};

export default FinancialParameters;