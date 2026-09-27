import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOrderHistory } from '../../services/api';
import Navbar from '../layout/Navbar';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Clock, History, PackageX } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../../constants';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getOrderHistory()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 font-sans pb-12">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-900 shadow-sm">
                <History className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-stone-900">Your Activity</h1>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm flex flex-col items-center">
            <PackageX className="w-12 h-12 text-stone-300 mb-4" />
            <h3 className="text-xl font-bold text-stone-900 mb-2">No History Yet</h3>
            <p className="text-stone-500">You haven't claimed any items. Start rescuing food to see your history!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center gap-5 hover:border-emerald-200 transition-colors">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-stone-900">{order.item_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'donated' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {order.status}
                        </span>
                    </div>
                    <p className="text-stone-500 text-sm mb-3">from {order.business_name}</p>
                    <div className="flex items-center gap-4 text-xs font-medium text-stone-400">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        {order.pickup_code && (
                            <span className="bg-stone-100 px-2 py-1 rounded-md text-stone-600 font-bold tracking-widest">
                                CODE: {order.pickup_code}
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-5">
                    <div className="text-sm font-bold text-stone-400 mb-1">Total Paid</div>
                    <div className="text-2xl font-black text-stone-900">{CURRENCY_SYMBOL}{parseFloat(order.total_price).toFixed(0)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
