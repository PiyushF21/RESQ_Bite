import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ArrowRight, TrendingDown } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../../constants';

const categoryConfig = {
  'veg': { emoji: '🥬', label: 'Veg', color: 'bg-green-100 text-green-700' },
  'non-veg': { emoji: '🍗', label: 'Non-Veg', color: 'bg-red-100 text-red-700' },
  'vegan': { emoji: '🌱', label: 'Vegan', color: 'bg-emerald-100 text-emerald-700' },
  'dessert': { emoji: '🍮', label: 'Dessert', color: 'bg-amber-100 text-amber-700' },
  'beverage': { emoji: '☕', label: 'Beverage', color: 'bg-blue-100 text-blue-700' },
  'snack': { emoji: '🥟', label: 'Snack', color: 'bg-orange-100 text-orange-700' }
};

export default function FoodCard({ listing, onClaim, index = 0 }) {
  const [currentPrice, setCurrentPrice] = useState(parseFloat(listing.base_price));
  const [timeLeftStr, setTimeLeftStr] = useState('');
  
  const gradients = [
    'from-orange-400 to-rose-400',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-500',
    'from-blue-400 to-indigo-500',
    'from-purple-400 to-pink-500',
    'from-cyan-400 to-blue-500'
  ];
  const bgGradient = gradients[index % gradients.length];
  
  const originalPrice = listing.original_price || (parseFloat(listing.base_price) * 2.5);
  const minPrice = parseFloat(listing.min_price || listing.base_price);
  const cat = categoryConfig[listing.category] || categoryConfig['veg'];

  // Dynamic Decay Engine
  useEffect(() => {
    const calculateDynamicState = () => {
      const now = new Date();
      const end = new Date(listing.pickup_end_time);
      const start = new Date(listing.created_at || now);
      
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeftStr('Expired');
        setCurrentPrice(minPrice);
        return;
      }

      // Time left string
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeftStr(hours > 0 ? `${hours}h ${mins}m left` : `${mins}m ${secs}s left`);

      // Dynamic Price calculation
      const totalDuration = end - start;
      const elapsed = now - start;
      
      if (elapsed > 0 && totalDuration > 0) {
        const decayRatio = Math.min(elapsed / totalDuration, 1);
        const priceDiff = parseFloat(listing.base_price) - minPrice;
        const dynamic = parseFloat(listing.base_price) - (priceDiff * decayRatio);
        setCurrentPrice(Math.max(minPrice, dynamic));
      }
    };

    calculateDynamicState();
    const interval = setInterval(calculateDynamicState, 1000);
    return () => clearInterval(interval);
  }, [listing]);

  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full relative">
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        {listing.image_url ? (
          <img src={listing.image_url} alt={listing.item_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 bg-stone-200 group-hover:scale-105 transition-transform duration-700" />
        )}
        
        {/* Live Discount badge */}
        <div className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur text-white px-3 py-1 rounded-full font-bold text-sm shadow-sm flex items-center gap-1">
          <TrendingDown className="w-4 h-4" />
          {discount}% OFF
        </div>

        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 font-bold text-sm text-stone-900">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          {listing.quantity_available} left
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent text-white">
          <h3 className="font-bold text-xl truncate tracking-tight">{listing.item_name}</h3>
          <div className="flex items-center gap-1.5 text-stone-300 text-sm font-medium mt-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{listing.business_name}</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${cat.color}`}>
            {cat.emoji} {cat.label}
          </span>
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-bold text-stone-600 font-mono">{timeLeftStr}</span>
          </div>
        </div>

        <p className="text-stone-500 font-medium text-sm line-clamp-2 mb-4 flex-1">
          {listing.description}
        </p>

        <div className="flex items-center justify-between mb-4 bg-stone-50 p-3 rounded-2xl border border-stone-100">
          <div>
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              Live Price
            </div>
            <div className="text-stone-400 line-through text-sm font-medium">
              {CURRENCY_SYMBOL}{parseFloat(originalPrice).toFixed(0)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-700 transition-all duration-300">
              {CURRENCY_SYMBOL}{currentPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <button 
          onClick={() => onClaim(listing.id)}
          className="w-full py-3.5 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors active:scale-[0.98]"
        >
          Claim Now
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
