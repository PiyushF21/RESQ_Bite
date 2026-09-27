import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getActiveListings, getStats, claimItem } from '../../services/api';
import { getLevelTitle, getLevelEmoji, CATEGORIES, SORT_OPTIONS, CURRENCY_SYMBOL } from '../../constants';
import Navbar from '../layout/Navbar';
import GoogleMapView from '../map/GoogleMapView';
import FoodCard from '../listings/FoodCard';
import EmptyState from '../ui/EmptyState';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Package, RefreshCw, Zap, Search, Filter, Flame, Target, Trophy, Map, Info } from 'lucide-react';

export default function StudentDashboard() {
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({ search: '', category: 'all', sort: 'ending_soon' });
  const [activeTab, setActiveTab] = useState('radar');
  const [showHelper, setShowHelper] = useState(true);
  
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [listingsData, statsData] = await Promise.all([
        getActiveListings(searchParams),
        getStats()
      ]);
      setListings(listingsData);
      setStats(statsData);
    } catch (error) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchParams, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClaim = async (id) => {
    try {
      const res = await claimItem(id);
      showToast(`Item claimed! Pickup code: ${res.pickupCode}`, 'success');
      fetchData();
    } catch (error) {
      showToast(error.message || 'Failed to claim item', 'error');
    }
  };

  const handleSearchChange = (e) => {
    setSearchParams(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] font-sans pb-12 selection:bg-emerald-500/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {showHelper && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-8 flex items-start gap-4">
            <Info className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-emerald-900 mb-1">Welcome to your ResQ-Bite Dashboard! 🌱</h4>
              <p className="text-emerald-800/80 text-sm leading-relaxed">
                Here you can find high-quality surplus food from local restaurants at heavily discounted prices. 
                The closer the food gets to its pickup deadline, the lower the price drops. Keep an eye on the 
                <strong> "Live Price"</strong> to score the best deals, and check the <strong>Impact Map</strong> to see your environmental contribution!
              </p>
            </div>
            <button onClick={() => setShowHelper(false)} className="text-emerald-400 hover:text-emerald-600 font-bold text-sm">Dismiss</button>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Impact Dashboard */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
              <h2 className="text-lg font-black text-stone-800 mb-6 flex items-center gap-2">
                Your Impact
              </h2>
              
              {stats ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="w-12 h-12 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                      {getLevelEmoji(stats.items_rescued)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Rank</div>
                      <div className="font-bold text-stone-800">{getLevelTitle(stats.items_rescued)}</div>
                    </div>
                  </div>

                  {stats.streak_days > 0 && (
                     <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl font-bold text-emerald-800">
                        <Flame className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                        <div>
                          <div>{stats.streak_days} Day Streak!</div>
                          <div className="text-xs text-emerald-600/80">Keep rescuing to maintain it</div>
                        </div>
                     </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                      <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Meals</div>
                      <div className="text-xl font-black text-stone-800">{stats.items_rescued}</div>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                      <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Saved</div>
                      <div className="text-xl font-black text-emerald-700">{CURRENCY_SYMBOL}{stats.money_saved}</div>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                      <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Diverted</div>
                      <div className="text-xl font-black text-stone-800">{(stats.items_rescued * 0.8).toFixed(1)}kg</div>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                      <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">CO₂ Avoided</div>
                      <div className="text-xl font-black text-emerald-700">{stats.co2_saved_kg}kg</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="h-16 bg-stone-100 rounded-2xl"></div>
                  <div className="h-24 bg-stone-100 rounded-2xl"></div>
                </div>
              )}
            </div>

            {/* Daily Mission Card */}
            <div className="bg-stone-800 rounded-3xl p-6 shadow-sm border border-stone-700 text-stone-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-xs uppercase tracking-widest text-emerald-400">Daily Mission</span>
                </div>
                <span className="bg-stone-700 px-2 py-1 rounded-md text-xs font-bold text-stone-300">#1042</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Weekend Savior Challenge</h3>
              <p className="text-stone-400 text-sm font-medium mb-5 leading-relaxed">Rescue 3 meals from different restaurants before 8:30 PM today.</p>
              
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-xs font-bold text-stone-400">
                  <span>Progress (1/3)</span>
                  <span>33%</span>
                </div>
                <div className="w-full h-2 bg-stone-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-1/3"></div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold bg-stone-900/50 p-3 rounded-xl border border-stone-700 text-stone-200">
                <Trophy className="w-4 h-4 text-emerald-400" />
                Reward: +150 ResQ XP
              </div>
            </div>

          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-9">
            
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-stone-200 mb-6 flex gap-2 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('radar')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'radar' ? 'bg-stone-900 text-white' : 'hover:bg-stone-50 text-stone-600'}`}
              >
                <Zap className="w-4 h-4" /> Live Radar
              </button>
              <button 
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'map' ? 'bg-stone-900 text-white' : 'hover:bg-stone-50 text-stone-600'}`}
              >
                <Map className="w-4 h-4" /> Impact Map
              </button>
            </div>

            {activeTab === 'radar' ? (
              <>
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-200 mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-4 top-3.5 text-stone-400" />
                        <input 
                            type="text" 
                            name="search"
                            value={searchParams.search}
                            onChange={handleSearchChange}
                            placeholder="Search biryani, pizza, or restaurants..."
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-600 font-medium text-stone-700"
                        />
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="relative">
                            <select 
                                name="category"
                                value={searchParams.category}
                                onChange={handleSearchChange}
                                className="pl-4 pr-10 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-600 font-medium text-stone-700 appearance-none min-w-[140px]"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                                ))}
                            </select>
                            <Filter className="w-4 h-4 absolute right-4 top-4 text-stone-400 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select 
                                name="sort"
                                value={searchParams.sort}
                                onChange={handleSearchChange}
                                className="pl-4 pr-10 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-600 font-medium text-stone-700 appearance-none min-w-[160px]"
                            >
                                {SORT_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                            <Filter className="w-4 h-4 absolute right-4 top-4 text-stone-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-black text-stone-800 flex items-center gap-3">
                    Active Drops
                  </h1>
                  <button 
                    onClick={fetchData} 
                    disabled={loading}
                    aria-label="Refresh listings"
                    className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-900 hover:border-stone-300 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loading ? (
                  <LoadingSpinner size="lg" message="Scanning area for surplus food..." />
                ) : listings.length === 0 ? (
                  <EmptyState 
                    icon={Package}
                    title="No Drops Found"
                    description="Try adjusting your filters or check back soon! Restaurants usually post surplus meals after lunch and dinner rushes."
                    action={fetchData}
                    actionLabel="Refresh Radar"
                  />
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {listings.map((listing, index) => (
                      <FoodCard 
                        key={listing.id} 
                        listing={listing} 
                        onClaim={handleClaim} 
                        index={index} 
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-200 h-[600px]">
                <GoogleMapView listings={listings} variant="student" label="Live Impact Map" />
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
