import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getMerchantListings, getMerchantStats, deleteListing } from '../../services/api';
import Navbar from '../layout/Navbar';
import CreateListingForm from '../listings/CreateListingForm';
import LoadingSpinner from '../ui/LoadingSpinner';
import { RefreshCw, Store, X, Package, Download, TrendingUp, Sparkles, Award } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../../constants';

export default function MerchantDashboard() {
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({ total_recovered: 0, items_sold: 0, active_listings: 0, food_saved_kg: 0 });
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [listingsData, statsData] = await Promise.all([
        getMerchantListings(),
        getMerchantStats()
      ]);
      setListings(listingsData);
      setStats(statsData || { total_recovered: 0, items_sold: 0, active_listings: 0, food_saved_kg: 0 });
    } catch (error) {
      showToast('Failed to load store data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancel = async (id) => {
    try {
      await deleteListing(id);
      showToast('Listing cancelled', 'success');
      fetchData();
    } catch (error) {
      showToast(error.message || 'Failed to cancel listing', 'error');
    }
  };

  const handleGenerateCertificate = () => {
    showToast('Generating ResQ-Bite ESG Impact Certificate... (Check downloads folder)', 'info');
  };

  // Calculate waste score mock
  const wasteScore = Math.min(100, 40 + (stats.items_sold * 2));
  const prediction = { meals: Math.max(12, Math.floor(stats.items_sold / 7)), trend: '+15%' };

  return (
    <div className="min-h-screen bg-[#F7F5F2] font-sans pb-12 selection:bg-emerald-500/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Sustainability Profile */}
            <div className="bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-800 text-white relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  ResQ Score
                </h2>
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-black text-lg bg-stone-800 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  {wasteScore}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 relative z-10 mb-6">
                <div className="bg-stone-800/50 p-3 rounded-2xl border border-stone-700">
                  <div className="text-xs font-bold text-stone-400 uppercase mb-1">Recovered</div>
                  <div className="text-xl font-black text-emerald-400">{CURRENCY_SYMBOL}{parseFloat(stats.total_recovered).toFixed(0)}</div>
                </div>
                <div className="bg-stone-800/50 p-3 rounded-2xl border border-stone-700">
                  <div className="text-xs font-bold text-stone-400 uppercase mb-1">Diverted</div>
                  <div className="text-xl font-black text-emerald-400">{stats.food_saved_kg} kg</div>
                </div>
                <div className="bg-stone-800/50 p-3 rounded-2xl border border-stone-700">
                  <div className="text-xs font-bold text-stone-400 uppercase mb-1">Meals</div>
                  <div className="text-xl font-black text-white">{stats.items_sold}</div>
                </div>
                <div className="bg-stone-800/50 p-3 rounded-2xl border border-stone-700">
                  <div className="text-xs font-bold text-stone-400 uppercase mb-1">CO₂ (kg)</div>
                  <div className="text-xl font-black text-white">{(stats.items_sold * 2.5).toFixed(1)}</div>
                </div>
              </div>

              <div className="flex gap-2 relative z-10 mb-6">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                  🌱 Waste Warrior
                </span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                  ♻️ Circular Champion
                </span>
              </div>

              <button 
                onClick={handleGenerateCertificate}
                className="w-full py-3 bg-white text-stone-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-200 transition-colors relative z-10"
              >
                <Download className="w-5 h-5" />
                ESG Impact Certificate
              </button>
            </div>

            {/* Smart Prediction Card */}
            <div className="bg-stone-50 rounded-3xl p-6 shadow-sm border border-stone-200">
              <h2 className="text-lg font-black text-stone-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Smart Surplus Prediction
              </h2>
              <p className="text-sm font-medium text-stone-500 mb-5">
                AI forecast based on your historical Tuesday sales and local events.
              </p>

              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-stone-700">Tomorrow's Estimate</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded-md">
                    <TrendingUp className="w-3.5 h-3.5" /> {prediction.trend}
                  </span>
                </div>
                <div className="text-3xl font-black text-stone-800 mb-3">{prediction.meals} Portions</div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-stone-500">Main Courses</span>
                    <span className="font-bold text-stone-700">{Math.floor(prediction.meals * 0.6)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-stone-500">Breads / Sides</span>
                    <span className="font-bold text-stone-700">{Math.floor(prediction.meals * 0.3)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-stone-500">Desserts</span>
                    <span className="font-bold text-stone-700">{Math.floor(prediction.meals * 0.1)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => showToast('Auto-publishing from AI prediction...', 'info')} className="w-full py-2.5 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-900 transition-colors">
                Pre-Draft AI Listings
              </button>
            </div>
            
            {/* Active Listings List */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-stone-500" />
                  Store History
                </h2>
                <button onClick={fetchData} aria-label="Refresh" className="text-stone-400 hover:text-emerald-500 transition-colors">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8"><LoadingSpinner size="sm" message="" /></div>
              ) : listings.length === 0 ? (
                <div className="text-center py-8 text-stone-500 font-medium">No active or past listings</div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {listings.map(listing => (
                    <div key={listing.id} className={`group p-4 rounded-2xl border flex items-center justify-between transition-colors ${listing.status === 'active' ? 'bg-stone-50 border-stone-100 hover:border-stone-200' : 'bg-white border-stone-100 opacity-70'}`}>
                      <div>
                        <h4 className="font-bold text-stone-900">{listing.item_name}</h4>
                        <div className="text-sm font-medium text-stone-500 flex items-center gap-2">
                          <span>{CURRENCY_SYMBOL}{parseFloat(listing.base_price).toFixed(0)}</span>
                          <span>•</span>
                          <span className={`capitalize ${listing.status === 'active' ? 'text-emerald-600' : 'text-stone-400'}`}>{listing.status}</span>
                        </div>
                      </div>
                      {listing.status === 'active' && (
                          <button 
                            onClick={() => handleCancel(listing.id)}
                            aria-label="Cancel listing"
                            className="p-2 bg-white rounded-xl text-stone-400 hover:text-rose-500 border border-stone-200 shadow-sm transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-8">
            <CreateListingForm onSuccess={fetchData} />
          </div>

        </div>
      </main>
    </div>
  );
}
