'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', slug: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5005/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to register');

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
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden py-12">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="glass p-10 rounded-3xl w-full max-w-xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold mb-2">Join ServeQR</h2>
          <p className="text-gray-400">Transform your restaurant's ordering experience</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-200 rounded-xl">{error}</div>}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Restaurant Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500" placeholder="McDonald's" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">URL Slug</label>
              <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500" placeholder="mcdonalds" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500" placeholder="admin@restaurant.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500" placeholder="••••••••" />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 px-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-xl shadow-white/10 text-lg mt-4 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Restaurant Account'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-gray-400">
          Already have an account? <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in here</a>
        </p>
      </div>
    </div>
  );
}
