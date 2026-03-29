
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
        <div className="flex items-center justify-center min-h-screen bg-orange-50/30 p-4 font-sans">
            <Card className="w-full max-w-sm animate-fade-in shadow-xl rounded-2xl border-none overflow-hidden">
                <div className="p-8 sm:p-10 bg-white">
                    <div className="text-center mb-8">
                        <div className="h-16 w-16 bg-orange-50 rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                           <img src="https://picsum.photos/seed/engenhodopao/80" alt="Logo" className="h-full w-full object-cover"/>
                        </div>
                        <h1 className="text-xl font-black text-amber-900 uppercase tracking-tight">Engenho do Pão</h1>
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1 opacity-60">Gestão de Padaria</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input 
                            label="Usuário" 
                            name="username" 
                            placeholder="Seu usuário"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            autoComplete="username"
                            className="text-xs"
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
                            className="text-xs"
                        />
                        {error && (
                            <div className="bg-red-50 border border-red-100 p-2 rounded-lg">
                                <p className="text-[10px] text-red-600 font-bold text-center uppercase tracking-tighter">
                                    {error}
                                </p>
                            </div>
                        )}
                        <Button type="submit" className="w-full py-3 text-xs font-black uppercase tracking-widest">
                            Acessar Sistema
                        </Button>
                    </form>
                     <div className="text-center mt-8 pt-4 border-t border-orange-50">
                        <p className="text-[9px] font-black text-amber-200 uppercase tracking-widest">
                            Acesso restrito
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
