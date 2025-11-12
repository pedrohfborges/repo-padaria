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
        <div className="flex items-center justify-center min-h-screen bg-orange-50 p-4">
            <Card className="w-full max-w-md animate-fade-in">
                <div className="p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <img src="https://picsum.photos/seed/engenhodopao/60" alt="Logo Engenho do Pão" className="h-16 w-16 rounded-full mx-auto mb-4"/>
                        <h1 className="text-2xl font-bold text-amber-800">Engenho do Pão</h1>
                        <p className="text-amber-600 mt-1">Acesso ao Sistema de Gestão</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input 
                            label="Usuário" 
                            name="username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            autoComplete="username"
                        />
                        <Input 
                            label="Senha" 
                            name="password" 
                            type="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            autoComplete="current-password"
                        />
                        {error && (
                            <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">
                                {error}
                            </p>
                        )}
                        <Button type="submit" className="w-full">
                            Entrar
                        </Button>
                    </form>
                     <div className="text-center mt-6">
                        <p className="text-xs text-amber-500">
                            Use <strong>admin</strong> / <strong>admin</strong> para acessar.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
