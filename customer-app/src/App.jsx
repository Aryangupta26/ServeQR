import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Phone, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function App() {
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuCategories, setMenuCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [checkoutStep, setCheckoutStep] = useState('menu'); // menu, checkout, success
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`http://localhost:5005/api/customer/restaurant/${slug}`);
        if (!res.ok) throw new Error('Restaurant not found');
        const data = await res.json();
        setRestaurant(data.restaurant);
        setMenuCategories(data.menu);
        if (data.menu.length > 0) setActiveCategory(data.menu[0].name);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchMenu();
  }, [slug]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item._id);
      if (existing) {
        return prev.map(i => i.id === item._id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: item._id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckout = async () => {
    if (!phone) return alert('Please enter your phone number');
    
    try {
      const res = await fetch(`http://localhost:5005/api/customer/restaurant/${slug}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: null, // Hardcoded for now, normally from URL like /:slug/table/:id
          items: cart.map(i => ({ menuItem: i.id, name: i.name, quantity: i.qty, price: i.price })),
          totalAmount: total,
          customerPhone: phone
        })
      });
      if (res.ok) {
        setCheckoutStep('success');
        setCart([]);
      } else {
        alert('Failed to place order');
      }
    } catch (err) {
      alert('Error placing order');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!restaurant) return <div className="min-h-screen flex items-center justify-center">Restaurant not found</div>;

  const paymentMethod = restaurant.settings?.paymentMethod || 'otp';

  if (checkoutStep === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-green-50">
        <CheckCircle2 className="w-24 h-24 text-green-500 mb-6 animate-bounce" />
        <h2 className="text-3xl font-extrabold text-green-900 mb-2">Order Confirmed!</h2>
        <p className="text-green-700 mb-8">The kitchen is preparing your food.</p>
        <button onClick={() => setCheckoutStep('menu')} className="w-full max-w-sm bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200">
          Back to Menu
        </button>
      </div>
    );
  }

  if (checkoutStep === 'checkout') {
    return (
      <div className="min-h-screen pb-24 bg-gray-50 flex flex-col">
        <div className="bg-white p-4 sticky top-0 shadow-sm z-10">
          <button onClick={() => setCheckoutStep('menu')} className="font-medium text-blue-600 flex items-center gap-1">
            <ChevronRight className="rotate-180 w-5 h-5" /> Back
          </button>
          <h1 className="text-2xl font-bold mt-2">Checkout</h1>
        </div>

        <div className="p-4 flex-1">
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
            <h3 className="font-bold mb-4 text-gray-500 text-sm uppercase tracking-wider">Order Summary</h3>
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between mb-2 font-medium">
                <span>{item.qty}x {item.name}</span>
                <span>₹{item.price * item.qty}</span>
              </div>
            ))}
            <div className="border-t border-dashed mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>Total to Pay</span>
              <span>₹{total}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
            <h3 className="font-bold mb-4 text-gray-500 text-sm uppercase tracking-wider">Verification</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+91 98765 43210" />
            </div>
            {paymentMethod === 'otp' && (
              <p className="text-xs text-gray-500 mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-yellow-800">
                You will pay at the counter. We just need to verify your number.
              </p>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <button onClick={handleCheckout} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 flex justify-center items-center gap-2">
            {paymentMethod === 'upi' ? `Pay ₹${total} via UPI` : 'Verify & Place Order'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const currentCategory = menuCategories.find(c => c.name === activeCategory);

  return (
    <div className="min-h-screen pb-24" style={{ '--tw-bg-opacity': 1, backgroundColor: restaurant.themeColor }}>
      {/* Header */}
      <div className="relative h-48 bg-gray-900 rounded-b-3xl overflow-hidden shadow-xl">
        <img src={restaurant.logoUrl || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000"} className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-3xl font-extrabold tracking-tight">{restaurant.name}</h1>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-4 overflow-x-auto p-4 no-scrollbar">
        {menuCategories.map((cat, i) => (
          <button key={i} onClick={() => setActiveCategory(cat.name)} className={`whitespace-nowrap px-5 py-2 rounded-full font-bold transition-all shadow-sm ${activeCategory === cat.name ? 'bg-black text-white' : 'bg-white text-gray-600 border'}`}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-4">
        {currentCategory?.items?.map((item, i) => (
          <div key={i} className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 flex gap-4">
            {item.imageUrl && <img src={item.imageUrl} className="w-28 h-28 object-cover rounded-2xl shadow-sm" />}
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
              <div className="mt-auto flex justify-between items-end pt-2">
                <span className="font-extrabold text-lg">₹{item.price}</span>
                <button onClick={() => addToCart(item)} className="bg-blue-50 text-blue-600 font-bold px-4 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
        {(!currentCategory || !currentCategory.items || currentCategory.items.length === 0) && (
          <p className="text-center text-gray-500 py-10">No items in this category yet.</p>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-0 w-full px-4 z-50">
          <button onClick={() => setCheckoutStep('checkout')} className="w-full bg-black text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center transform hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                {cart.reduce((sum, item) => sum + item.qty, 0)}
              </div>
              <span className="font-bold">View Cart</span>
            </div>
            <span className="font-extrabold text-lg">₹{total}</span>
          </button>
        </div>
      )}
    </div>
  );
}
