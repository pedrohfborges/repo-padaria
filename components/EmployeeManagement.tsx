
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-amber-900 uppercase tracking-tight">Equipe Engenho do Pão</h3>
        <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : (
                <>
                    <UserPlusIcon className="h-5 w-5 mr-2"/>
                    Novo Funcionário
                </>
            )}
        </Button>
      </div>

      {showForm && (
        <Card className="border border-orange-100 shadow-xl rounded-2xl animate-fade-in">
          <form onSubmit={handleSubmit} className="p-8">
            <h4 className="text-lg font-bold text-amber-800 mb-6">Cadastrar Novo Funcionário</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Nome Completo" name="name" value={newEmployee.name} onChange={handleChange} required />
              <Input label="Cargo" name="role" value={newEmployee.role} onChange={handleChange} required />
              <Input label="Data de Admissão" name="admissionDate" type="date" value={newEmployee.admissionDate} onChange={handleChange} required />
              <Input label="Salário (R$)" name="salary" type="number" step="0.01" min="0" value={newEmployee.salary || ''} onChange={handleChange} required />
            </div>
            <div className="mt-8 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Adicionar Funcionário
                </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="rounded-2xl overflow-hidden border border-orange-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-orange-50 border-b border-orange-100">
              <tr>
                <th className="p-5 text-xs font-bold text-amber-800 uppercase tracking-widest">Nome</th>
                <th className="p-5 text-xs font-bold text-amber-800 uppercase tracking-widest">Cargo</th>
                <th className="p-5 text-xs font-bold text-amber-800 uppercase tracking-widest">Admissão</th>
                <th className="p-5 text-xs font-bold text-amber-800 uppercase tracking-widest">Salário</th>
                <th className="p-5 text-xs font-bold text-amber-800 uppercase tracking-widest text-center">Status</th>
                <th className="p-5 text-xs font-bold text-amber-800 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {employees.map(employee => (
                <tr key={employee.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="p-5 font-bold text-amber-900">{employee.name}</td>
                  <td className="p-5 text-amber-700 text-sm">{employee.role}</td>
                  <td className="p-5 text-amber-700 text-sm">{new Date(employee.admissionDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                  <td className="p-5 text-amber-700 text-sm font-semibold">{employee.salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="p-5 text-center">
                    <select
                        value={employee.status}
                        onChange={(e) => onUpdateEmployeeStatus(employee.id, e.target.value as Employee['status'])}
                        className={`w-24 text-center appearance-none cursor-pointer rounded-full px-3 py-1 text-[10px] font-black uppercase border ${employee.status === 'Ativo' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'} focus:outline-none`}
                    >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                    </select>
                  </td>
                  <td className="p-5 text-right">
                    <button onClick={() => onDeleteEmployee(employee.id)} className="text-red-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all" aria-label="Deletar funcionário">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employees.length === 0 && (
            <div className="text-center p-12 bg-white">
               <p className="text-sm font-bold text-amber-400 uppercase tracking-widest">Nenhum funcionário cadastrado.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EmployeeManagement;
