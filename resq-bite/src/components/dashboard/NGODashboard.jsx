import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getDonations, getStats, claimDonation, fastForward } from '../../services/api';
import Navbar from '../layout/Navbar';
import GoogleMapView from '../map/GoogleMapView';
import DonationCard from '../listings/DonationCard';
import EmptyState from '../ui/EmptyState';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Heart, RefreshCw, Users, Truck, Clock, Info } from 'lucide-react';

export default function NGODashboard() {
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [listingsData, statsData] = await Promise.all([
        getDonations(),
        getStats()
      ]);
      setListings(listingsData);
      setStats(statsData);
    } catch (error) {
      showToast('Failed to load NGO dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClaim = async (id) => {
    try {
      const res = await claimDonation(id);
      showToast(`Bulk donation claimed! Pickup code: ${res.pickupCode}`, 'ngo');
      fetchData();
    } catch (error) {
      showToast(error.message || 'Failed to claim donation', 'error');
    }
  };

  const handleTimeTravel = async () => {
    try {
      await fastForward();
      showToast('Time fast-forwarded: Expired items converted to donations', 'info');
      fetchData();
    } catch (error) {
      showToast('Fast forward failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] font-sans pb-12 selection:bg-emerald-500/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-8 flex items-start gap-4">
            <Info className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-emerald-900 mb-1">Welcome to the NGO Dispatch Center! 🚛</h4>
              <p className="text-emerald-800/80 text-sm leading-relaxed">
                As an NGO partner, you have exclusive access to <strong>Bulk Surplus Drops</strong> (10+ items) and fully expired restaurant food. 
                Everything here is routed automatically to you at <strong>zero cost</strong>. Use the Impact Map to find bulk drops near your distribution centers and dispatch a truck to claim them.
              </p>
            </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-800 text-white">
              <h2 className="text-lg font-black mb-6 flex items-center gap-2 text-stone-100">
                <Heart className="w-5 h-5 text-emerald-400" />
                Community Impact
              </h2>
              
              {stats ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-stone-300">Meals Distributed</span>
                    </div>
                    <div className="text-3xl font-black text-white">{stats.items_rescued * 2}</div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-stone-300">CO₂ Prevented</span>
                      <span className="font-bold text-emerald-400">{stats.co2_saved_kg}kg</span>
                    </div>
                    <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min((stats.co2_saved_kg / 500) * 100, 100)}%` }} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-300 flex items-center gap-2">
                      <Users className="w-4 h-4" /> People Fed
                    </span>
                    <span className="text-xl font-black text-stone-100">{(stats.items_rescued * 1.5).toFixed(0)}</span>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-stone-800 rounded-lg"></div>
                  <div className="h-12 bg-stone-800 rounded-lg"></div>
                  <div className="h-8 bg-stone-800 rounded-lg"></div>
                </div>
              )}
            </div>

            <GoogleMapView listings={listings} variant="ngo" label="Bulk Pickups" />
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-9">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl font-black text-stone-800 flex items-center gap-3">
                Donation Radar
                <Truck className="w-6 h-6 text-emerald-600" />
              </h1>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleTimeTravel}
                  className="px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  [Demo] Fast-Forward Time
                </button>
                <button 
                  onClick={fetchData} 
                  disabled={loading}
                  aria-label="Refresh donations"
                  className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-stone-900 hover:border-stone-300 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner size="lg" message="Locating available donations..." />
            ) : listings.length === 0 ? (
              <EmptyState 
                icon={Heart}
                title="No Donations Available"
                description="Use the Fast-Forward Demo button above to simulate items expiring and converting into free bulk donations."
                action={handleTimeTravel}
                actionLabel="[Demo] Fast-Forward Time"
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing, index) => (
                  <DonationCard 
                    key={listing.id} 
                    listing={listing} 
                    onClaim={handleClaim} 
                    index={index} 
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
