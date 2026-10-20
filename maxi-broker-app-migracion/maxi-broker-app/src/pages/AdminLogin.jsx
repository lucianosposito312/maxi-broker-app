import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Hardcoded credentials as requested
        if (email === 'mdg.gonzalez.damian@gmail.com' && password === 'maxibrokergonzalez') {
            navigate('/admin-dashboard');
        } else {
            alert('Credenciales incorrectas');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-forest-900">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                <h2 className="text-2xl font-serif text-center mb-6 text-forest-900">Acceso Privado</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-gold-500 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-gold-500 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-gold-500 text-white py-2 rounded font-medium hover:bg-gold-600 transition-colors">
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
