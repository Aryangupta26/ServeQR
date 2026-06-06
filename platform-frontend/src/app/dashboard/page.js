'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

export default function Dashboard() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('otp');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Menu Management State
  const [newCatName, setNewCatName] = useState('');
  const [newItem, setNewItem] = useState({ categoryId: '', name: '', description: '', price: '', imageUrl: '' });

  const fetchMenu = async () => {
    const token = localStorage.getItem('token');
    const restaurantId = localStorage.getItem('restaurantId');
    const res = await fetch(`http://localhost:5005/api/admin/restaurant/${restaurantId}/menu`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setMenu(await res.json());
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const restaurantId = localStorage.getItem('restaurantId');
    
    if (!token || !restaurantId) {
      router.push('/login');
      return;
    }

    const socket = io('http://localhost:5005');
    socket.emit('join_restaurant', restaurantId);

    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev]);
    });

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5005/api/admin/restaurant/${restaurantId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRestaurant(data);
          setPaymentMethod(data.settings?.paymentMethod || 'otp');
        }

        const ordersRes = await fetch(`http://localhost:5005/api/admin/restaurant/${restaurantId}/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (ordersRes.ok) setOrders(await ordersRes.json());
        
        await fetchMenu();
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => socket.disconnect();
  }, [router]);

  const saveSettings = async () => {
    const token = localStorage.getItem('token');
    const restaurantId = localStorage.getItem('restaurantId');
    try {
      await fetch(`http://localhost:5005/api/admin/restaurant/${restaurantId}/settings`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { paymentMethod } })
      });
      alert('Settings saved successfully!');
    } catch (err) { alert('Failed to save settings'); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if(!newCatName) return;
    const token = localStorage.getItem('token');
    const restaurantId = localStorage.getItem('restaurantId');
    await fetch(`http://localhost:5005/api/admin/restaurant/${restaurantId}/categories`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName })
    });
    setNewCatName('');
    fetchMenu();
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if(!newItem.categoryId || !newItem.name || !newItem.price) return;
    const token = localStorage.getItem('token');
    const restaurantId = localStorage.getItem('restaurantId');
    await fetch(`http://localhost:5005/api/admin/restaurant/${restaurantId}/menu-items`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newItem, price: Number(newItem.price) })
    });
    setNewItem({ categoryId: '', name: '', description: '', price: '', imageUrl: '' });
    fetchMenu();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">Loading...</div>;

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { label: "Total Orders", value: orders.length, color: "blue" },
              { label: "Revenue", value: `₹${orders.reduce((sum, o) => sum + o.totalAmount, 0)}`, color: "green" },
              { label: "URL Slug", value: `/${restaurant?.slug}`, color: "purple" }
            ].map((stat, i) => (
              <div key={i} className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/10 rounded-full filter blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500`}></div>
                <p className="text-gray-400 mb-2 font-medium">{stat.label}</p>
                <h3 className="text-4xl font-extrabold">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="glass p-8 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">⚙️ Checkout & Payment Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-sm text-gray-400 mb-4">Choose how your customers checkout. In India, UPI is often preferred, but simple OTP works best for counter-payments.</p>
                {['upi', 'otp', 'razorpay'].map(method => (
                  <label key={method} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === method ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10 hover:bg-white/5'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="w-5 h-5 text-blue-500 bg-black border-gray-600 focus:ring-blue-500" />
                    <div>
                      <h4 className="font-bold text-white capitalize">{method === 'upi' ? 'Direct UPI Payment' : method === 'otp' ? 'OTP Verification Only' : 'Razorpay Gateway'}</h4>
                    </div>
                  </label>
                ))}
              </div>

              <div className="bg-black/50 p-6 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
                <button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full font-medium transition-all shadow-lg shadow-blue-500/25">Save Settings</button>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'menu') {
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Category Form */}
            <div className="glass p-8 rounded-2xl border border-white/5 flex flex-col">
              <h3 className="text-xl font-bold mb-6">1. Add Category</h3>
              <p className="text-gray-400 mb-4 text-sm flex-1">Create categories like "Starters", "Main Course", or "Beverages" to organize your menu.</p>
              <form onSubmit={handleAddCategory} className="flex gap-4">
                <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Starters" required className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20">Add</button>
              </form>
            </div>

            {/* Add Item Form */}
            <div className="glass p-8 rounded-2xl border border-white/5 flex flex-col">
              <h3 className="text-xl font-bold mb-6">2. Add Menu Item</h3>
              {menu.length === 0 ? (
                <div className="flex-1 flex items-center justify-center border border-dashed border-white/20 rounded-xl bg-white/5 p-4">
                  <p className="text-gray-400 text-sm">Please create a category first before adding items.</p>
                </div>
              ) : (
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <select required value={newItem.categoryId} onChange={e => setNewItem({...newItem, categoryId: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="" className="bg-gray-900">Select Category...</option>
                      {menu.map(cat => <option key={cat._id} value={cat._id} className="bg-gray-900">{cat.name}</option>)}
                    </select>
                    <input type="number" required value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="Price (₹)" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <input type="text" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="Item Name (e.g. Paneer Tikka)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Short Description..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={newItem.imageUrl} onChange={e => setNewItem({...newItem, imageUrl: e.target.value})} placeholder="Image URL (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20">Save Item to Menu</button>
                </form>
              )}
            </div>
          </div>

          {/* Current Menu View */}
          <div className="glass p-8 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold mb-6">Current Menu</h3>
            {menu.length === 0 ? <p className="text-gray-400">No categories added yet.</p> : (
              <div className="space-y-8">
                {menu.map(cat => (
                  <div key={cat._id}>
                    <h4 className="font-bold text-lg text-blue-400 border-b border-white/10 pb-2 mb-4">{cat.name}</h4>
                    {cat.items.length === 0 ? <p className="text-sm text-gray-500">No items</p> : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cat.items.map(item => (
                          <div key={item._id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
                            {item.imageUrl ? <img src={item.imageUrl} className="w-16 h-16 rounded-lg object-cover" /> : <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center text-2xl">🍲</div>}
                            <div>
                              <h5 className="font-bold">{item.name}</h5>
                              <p className="text-blue-400 font-bold">₹{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'orders') {
      return (
        <div className="glass p-8 rounded-2xl border border-white/5">
          <h3 className="text-xl font-bold mb-6">Live Order Stream</h3>
          {orders.length === 0 ? <p className="text-gray-400">No orders yet.</p> : (
             <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Table</th>
                    <th className="pb-3 font-medium">Items</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-4 text-sm font-mono">{order._id.substring(0, 8)}</td>
                      <td className="py-4">{order.tableId?.tableNumber || 'Table 1'}</td>
                      <td className="py-4">{order.items?.length || 0} items</td>
                      <td className="py-4">₹{order.totalAmount}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'qr') {
      const qrUrl = `http://localhost:5173/${restaurant?.slug}`;
      const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&color=ffffff&bgcolor=09090b`;
      return (
        <div className="glass p-8 rounded-2xl border border-white/5 max-w-2xl mx-auto text-center mt-10">
          <h3 className="text-2xl font-extrabold mb-2 text-white">QR Code Generator</h3>
          <p className="text-gray-400 mb-8">Scan this code to visit your customer ordering app directly.</p>
          <div className="bg-black/50 p-8 rounded-3xl border border-white/10 inline-block mb-8 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
            <img src={qrImage} alt="QR Code" className="w-64 h-64 rounded-2xl mb-6 shadow-xl" />
            <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 font-medium hover:text-blue-300 break-all">{qrUrl}</a>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex">
      <aside className="w-64 glass border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Serve<span className="text-blue-500">QR</span></h2>
          <p className="text-xs text-gray-400 mt-1">{restaurant?.name || 'Restaurant Admin'}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {['dashboard', 'menu', 'orders', 'qr'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left block px-4 py-3 rounded-xl font-medium transition-all capitalize ${activeTab === tab ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'hover:bg-white/5 text-gray-300 border border-transparent'}`}>
              {tab === 'qr' ? 'QR Codes & Tables' : tab === 'orders' ? 'Live Orders' : tab}
            </button>
          ))}
          <button onClick={() => { localStorage.clear(); router.push('/login') }} className="w-full text-left block px-4 py-3 rounded-xl hover:bg-white/5 text-red-400 font-medium transition-colors mt-8">Logout</button>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full filter blur-[100px] -z-10"></div>
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold capitalize">{activeTab === 'qr' ? 'QR Codes & Tables' : activeTab}</h1>
          <div className="flex items-center gap-4">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
            <span className="text-sm font-medium">System Online</span>
          </div>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}
