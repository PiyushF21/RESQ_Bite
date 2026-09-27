import React from 'react';
import { Truck, MapPin, ArrowRight } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../../constants';

export default function DonationCard({ listing, onClaim, index = 0 }) {
  const gradients = [
    'from-indigo-400 to-purple-500',
    'from-blue-400 to-cyan-500',
    'from-violet-400 to-fuchsia-500',
    'from-slate-400 to-indigo-500'
  ];
  
  const bgGradient = gradients[index % gradients.length];
  const originalPrice = listing.original_price || (parseFloat(listing.base_price || 0) * 2.5);
  const originalValue = (parseFloat(originalPrice) * parseInt(listing.quantity_available || 1)).toFixed(0);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full ring-1 ring-stone-50">
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        {listing.image_url ? (
          <img src={listing.image_url} alt={listing.item_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 bg-stone-200 group-hover:scale-105 transition-transform duration-700" />
        )}
        
        <div className="absolute top-4 right-4 bg-stone-900/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 font-bold text-sm text-white">
          <Truck className="w-4 h-4 text-emerald-400" />
          Bulk: {listing.quantity_available} Units
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
        <p className="text-stone-500 font-medium text-sm line-clamp-2 mb-4 flex-1">
          {listing.description}
        </p>

        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-0.5">Est. Value</span>
            <span className="text-stone-400 line-through text-sm font-medium">{CURRENCY_SYMBOL}{originalValue}</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-0.5">Cost to NGO</span>
            <span className="text-2xl font-black text-emerald-700">{CURRENCY_SYMBOL}0</span>
          </div>
        </div>

        <button 
          onClick={() => onClaim(listing.id)}
          className="w-full py-3.5 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors"
        >
          <Truck className="w-5 h-5" />
          Dispatch Truck
        </button>
      </div>
    </div>
  );
}
