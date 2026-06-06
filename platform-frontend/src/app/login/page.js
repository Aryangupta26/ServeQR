'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to login');

      localStorage.setItem('token', data.token);
      localStorage.setItem('restaurantId', data.restaurantId);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="glass p-10 rounded-3xl w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold mb-2">Welcome Back</h2>
          <p className="text-gray-400">Log in to your ServeQR dashboard</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-200 rounded-xl">{error}</div>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500" placeholder="admin@restaurant.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500" placeholder="••••••••" />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-500/25 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-gray-400">
          Want to onboard your restaurant? <a href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Start Free Trial</a>
        </p>
      </div>
    </div>
  );
}
