import React, { useState } from 'react';
import { Employee } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { TrashIcon, UserPlusIcon, PlusIcon } from './Icons';

interface EmployeeManagementProps {
  employees: Employee[];
  onAddEmployee: (employee: Omit<Employee, 'id' | 'status'>) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onUpdateEmployeeStatus: (employeeId: string, status: Employee['status']) => void;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ 
  employees, 
  onAddEmployee, 
  onDeleteEmployee,
  onUpdateEmployeeStatus
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: '',
    admissionDate: '',
    salary: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: type === 'number' && value ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmployee.name && newEmployee.role && newEmployee.admissionDate) {
      onAddEmployee(newEmployee);
      setNewEmployee({ name: '', role: '', admissionDate: '', salary: 0 });
      setShowForm(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <h3 className="text-xl font-semibold text-amber-800">Equipe da Engenho do Pão</h3>
            <Button onClick={() => setShowForm(!showForm)} variant="primary" className="w-full sm:w-auto">
                {showForm ? 'Cancelar' : (
                    <>
                        <UserPlusIcon className="h-5 w-5 mr-2"/>
                        Novo Funcionário
                    </>
                )}
            </Button>
          </div>
          
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-orange-50/50 p-6 rounded-lg mb-6 border border-orange-200 animate-fade-in">
              <h4 className="text-lg font-medium text-amber-700 mb-4">Cadastrar Novo Funcionário</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input label="Nome Completo" name="name" value={newEmployee.name} onChange={handleChange} required />
                <Input label="Cargo" name="role" value={newEmployee.role} onChange={handleChange} required />
                <Input label="Data de Admissão" name="admissionDate" type="date" value={newEmployee.admissionDate} onChange={handleChange} required />
                <Input label="Salário (R$)" name="salary" type="number" step="0.01" min="0" value={newEmployee.salary || ''} onChange={handleChange} required />
              </div>
              <div className="mt-6 flex justify-end">
                <Button type="submit">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Adicionar
                </Button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b-2 border-orange-200">
                <tr>
                  <th className="p-4 text-sm font-semibold text-amber-700">Nome</th>
                  <th className="p-4 text-sm font-semibold text-amber-700">Cargo</th>
                  <th className="p-4 text-sm font-semibold text-amber-700">Data de Admissão</th>
                  <th className="p-4 text-sm font-semibold text-amber-700">Salário</th>
                  <th className="p-4 text-sm font-semibold text-amber-700">Status</th>
                  <th className="p-4 text-sm font-semibold text-amber-700 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(employee => (
                  <tr key={employee.id} className="border-b border-orange-100 hover:bg-orange-50/50">
                    <td className="p-4 font-medium text-gray-800">{employee.name}</td>
                    <td className="p-4 text-gray-600">{employee.role}</td>
                    <td className="p-4 text-gray-600">{new Date(employee.admissionDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                    <td className="p-4 text-gray-600">{employee.salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="p-4">
                      <select
                          value={employee.status}
                          onChange={(e) => onUpdateEmployeeStatus(employee.id, e.target.value as Employee['status'])}
                          className={`w-28 text-center appearance-none cursor-pointer rounded-full px-3 py-1 text-xs font-medium border ${employee.status === 'Ativo' ? 'bg-green-100 text-green-800 border-green-200 focus:ring-green-300' : 'bg-red-100 text-red-800 border-red-200 focus:ring-red-300'} focus:outline-none focus:ring-2 focus:ring-offset-1`}
                      >
                          <option value="Ativo">Ativo</option>
                          <option value="Inativo">Inativo</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => onDeleteEmployee(employee.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors" aria-label="Deletar funcionário">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {employees.length === 0 && <p className="text-center p-8 text-gray-500">Nenhum funcionário cadastrado.</p>}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeManagement;