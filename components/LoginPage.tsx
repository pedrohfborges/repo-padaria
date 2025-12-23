
import React, { useState } from 'react';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';

interface LoginPageProps {
    onLogin: (user: string, pass: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(username, password);
        if (!success) {
            setError('Usuário ou senha inválidos. Tente novamente.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-orange-50 p-4 font-sans">
            <Card className="w-full max-w-md animate-fade-in shadow-2xl rounded-3xl border-none">
                <div className="p-10 sm:p-12">
                    <div className="text-center mb-10">
                        <div className="h-20 w-20 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                           <img src="https://picsum.photos/seed/engenhodopao/80" alt="Logo Engenho do Pão" className="h-full w-full object-cover"/>
                        </div>
                        <h1 className="text-3xl font-black text-amber-900 tracking-tighter">Engenho do Pão</h1>
                        <p className="text-amber-600 font-bold text-sm uppercase tracking-widest mt-1">Gestão de Padaria</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input 
                            label="Usuário" 
                            name="username" 
                            placeholder="Seu usuário"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            autoComplete="username"
                        />
                        <Input 
                            label="Senha" 
                            name="password" 
                            type="password"
                            placeholder="Sua senha secreta"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            autoComplete="current-password"
                        />
                        {error && (
                            <div className="bg-red-50 border border-red-100 p-3 rounded-xl">
                                <p className="text-xs text-red-600 font-bold text-center">
                                    {error}
                                </p>
                            </div>
                        )}
                        <Button type="submit" className="w-full py-4 text-base">
                            Acessar Sistema
                        </Button>
                    </form>
                     <div className="text-center mt-10 pt-6 border-t border-orange-50">
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                            Acesso restrito a colaboradores
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
