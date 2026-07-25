import React, { useState, useEffect } from 'react';
import { 
  Leaf, ArrowRight, Star, Plus, Package, 
  Clock, DollarSign, MapPin, TrendingUp, Award, User, LogOut,
  CheckCircle2, AlertCircle, Info, Heart, Shield, Zap, Search, Smartphone, Globe,
  Truck, Clock4, Users
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const premiumStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .fade-up {
    animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }
  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }
  .animate-marquee {
    display: flex;
    width: 200%;
    animation: marquee 25s linear infinite;
  }
  .animate-marquee:hover {
    animation-play-state: paused;
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  .animate-toast {
    animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background-color: #d6d3d1; border-radius: 4px; }
  
  .leaflet-container { font-family: inherit; z-index: 10; }
  .leaflet-popup-content-wrapper { border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #e7e5e4; }
  .leaflet-popup-content { margin: 14px 18px; }
`;

const customMarkerIcon = new L.divIcon({
    html: `<div class="bg-stone-900 text-emerald-400 p-2 rounded-full shadow-xl border-2 border-white flex items-center justify-center transform transition-transform hover:scale-110">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
           </div>`,
    className: 'custom-map-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
});

// Toast Component extracted to prevent re-render bugs
const ToastNotification = ({ toast }) => {
  if (!toast.show) return null;
  const bgColor = toast.type === 'success' ? 'bg-emerald-500' : 
                  toast.type === 'error' ? 'bg-rose-500' : 
                  toast.type === 'ngo' ? 'bg-indigo-600' : 'bg-stone-800';
  const Icon = toast.type === 'success' ? CheckCircle2 : 
               toast.type === 'error' ? AlertCircle : Info;

  return (
    <div className="fixed bottom-6 right-6 z-[200] animate-toast">
      <div className={`${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-medium`}>
        <Icon className="w-6 h-6" />
        {toast.message}
      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 4000);
  };

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'student' });
  
  const [listings, setListings] = useState([]);
  const [newListing, setNewListing] = useState({
    item_name: '', description: '', quantity_available: '', base_price: '', min_price: '', pickup_end_time: ''
  });

  const [userStats, setUserStats] = useState({
    level: 1, total_money_saved: 0, total_co2_saved_kg: 0, items_rescued: 0
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        showToast('Account created! Please log in.', 'success');
        setAuthMode('login');
      } else showToast(data.error || 'Registration failed', 'error');
    } catch (err) { showToast('Network error connecting to backend.', 'error'); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setRole(data.user.role);
        showToast(`Welcome back, ${data.user.full_name}!`, 'success');
        setCurrentView('dashboard');
        setShowAuthModal(false);
      } else showToast(data.error || 'Login failed', 'error');
    } catch (err) { showToast('Network error connecting to backend.', 'error'); }
  };

  // DYNAMIC FETCHING BASED ON ROLE
  const fetchRadarData = async () => {
    try {
      // Students see Active, NGOs see Donations (Expired)
      let url = 'http://localhost:5000/api/listings/active';
      if (role === 'ngo') url = 'http://localhost:5000/api/listings/donations';
      
      const response = await fetch(url);
      const data = await response.json();
      setListings(data);
    } catch (err) { showToast('Failed to fetch radar data', 'error'); }
  };

  const fetchStats = async () => {
    if (!user || role === 'merchant') return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/stats`);
      const data = await response.json();
      setUserStats({
        level: data.level || 1,
        total_money_saved: parseFloat(data.total_money_saved) || 0,
        total_co2_saved_kg: parseFloat(data.total_co2_saved_kg) || 0,
        items_rescued: data.items_rescued || 0
      });
    } catch (err) { console.error('Failed to fetch stats'); }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newListing, merchant_id: user.id })
      });
      const data = await response.json();
      if (response.ok) {
        showToast('Food drop published to live radar!', 'success');
        setNewListing({ item_name: '', description: '', quantity_available: '', base_price: '', min_price: '', pickup_end_time: '' });
        fetchRadarData();
      } else {
        // Now displays the exact backend error reason
        showToast(data.error || 'Failed to create listing.', 'error');
      }
    } catch (err) { showToast('Network error while creating drop.', 'error'); }
  };

  // STUDENT BUYING 1 ITEM
  const handleClaimItem = async (id, itemName) => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/claim', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, listing_id: id })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(`Claimed ${itemName}! You saved $${data.moneySaved.toFixed(2)} & ${data.co2Saved}kg CO2!`, 'success');
        fetchRadarData(); 
        fetchStats(); 
      } else showToast(data.error || 'Too slow! Someone else claimed this.', 'error');
    } catch (err) { showToast('Network error while claiming item.', 'error'); }
  };

  // NGO CLAIMING ALL REMAINING ITEMS FOR FREE
  const handleBulkClaimDonation = async (id, itemName, qty) => {
    try {
      const response = await fetch('http://localhost:5000/api/donations/claim', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, listing_id: id })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(`Dispatched! Claimed ${qty} units of ${itemName}. ${data.co2Saved}kg CO2 prevented.`, 'ngo');
        fetchRadarData(); 
        fetchStats(); 
      } else showToast(data.error || 'Donation no longer available.', 'error');
    } catch (err) { showToast('Network error while dispatching truck.', 'error'); }
  };

  // PORTFOLIO DEMO: TIME TRAVEL
  const handleTimeTravel = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/demo/fast-forward', { method: 'POST' });
      if (response.ok) {
        showToast('Time Fast-Forwarded! Active drops have expired into donations.', 'ngo');
        fetchRadarData();
      }
    } catch (err) { showToast('Time travel failed.', 'error'); }
  };

  const handleCancelItem = (id) => {
    setListings(listings.filter(item => item.id !== id));
    showToast('Listing cancelled and removed from radar.', 'info');
  };

  const handleNavClick = (e, sectionName) => {
    e.preventDefault();
    const element = document.getElementById(sectionName.toLowerCase().replace(/\s/g, ''));
    if(element) element.scrollIntoView({behavior: "smooth"});
  };

  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchRadarData();
      fetchStats(); 
    }
  }, [currentView, user]);

  const handleLogout = () => {
    setUser(null);
    setRole('student');
    setCurrentView('landing');
    showToast('Successfully logged out.', 'info');
  };

  if (currentView === 'landing') {
    const marqueePartners = [ "Campus Crust", "Green Bowl Co.", "Bean & Brew", "University Dining", "Local Bakehouse", "Fresh Bites" ];
    return (
      <div className="min-h-screen bg-[#FAFAF9] font-sans text-stone-900 selection:bg-emerald-200 overflow-x-hidden relative flex flex-col">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none fixed" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}></div>
        <style>{premiumStyles}</style>
        
        <nav className="relative z-50 border-b border-stone-200/50 bg-white/80 backdrop-blur-md sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-sm">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight text-stone-900">ResQ-Bite</span>
              </div>
              <div className="hidden md:flex items-center gap-8 font-medium text-stone-600">
                <a href="#howitworks" onClick={(e) => handleNavClick(e, 'howitworks')} className="hover:text-emerald-600 transition-colors">How it Works</a>
                <a href="#mission" onClick={(e) => handleNavClick(e, 'mission')} className="hover:text-emerald-600 transition-colors">Our Mission</a>
                <a href="#partners" onClick={(e) => handleNavClick(e, 'partners')} className="hover:text-emerald-600 transition-colors">Partners</a>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="font-semibold text-stone-600 hover:text-stone-900 transition-colors px-4 py-2">
                  Log in
                </button>
                <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="bg-stone-900 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-stone-800 transition-all shadow-md hover:shadow-lg">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </nav>

        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 z-10 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <div className="fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-stone-200/50 text-sm font-bold text-stone-700 mb-8 shadow-sm backdrop-blur-md">
              <span className="flex h-2.5 w-2.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></span>
              Now live on 12+ University Campuses
            </div>
            <h1 className="fade-up delay-100 text-6xl md:text-8xl font-black tracking-tighter mb-8 text-stone-900 max-w-5xl mx-auto leading-[1.1]">
              Rescue amazing food. <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700">End commercial waste.</span>
            </h1>
            <p className="fade-up delay-200 text-xl md:text-2xl text-stone-700 mb-12 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-sm bg-white/40 p-4 rounded-2xl backdrop-blur-sm">Connect with local restaurants to claim perfectly good surplus food at massive discounts before it goes to waste.</p>
            <div className="fade-up delay-300 flex flex-col sm:flex-row justify-center items-center gap-5">
              <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-full font-black text-lg shadow-xl shadow-emerald-600/20 hover:-translate-y-1 flex items-center justify-center gap-2 group transition-all">
                Start Rescuing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        <section id="howitworks" className="py-24 bg-white relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-stone-900 mb-4">How ResQ-Bite Works</h2>
              <p className="text-xl text-stone-500 max-w-2xl mx-auto">Three simple steps to save money and the planet.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600 shadow-inner">
                  <Search className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-3">1. Find Food</h3>
                <p className="text-stone-500 font-medium">Browse the live radar for surplus meals from your favorite campus spots.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6 text-teal-600 shadow-inner">
                  <Smartphone className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-3">2. Claim Instantly</h3>
                <p className="text-stone-500 font-medium">Lock in your discounted meal through the app before someone else does.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-700 shadow-inner">
                  <MapPin className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-3">3. Pick It Up</h3>
                <p className="text-stone-500 font-medium">Show your confirmation at the restaurant and enjoy your rescued food!</p>
              </div>
            </div>
          </div>
        </section>

        <section id="mission" className="py-24 bg-stone-900 text-stone-50 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex bg-stone-800 p-3 rounded-xl mb-6">
                <Globe className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">We are on a mission to zero out food waste.</h2>
              <p className="text-lg text-stone-400 mb-8 leading-relaxed">
                Every day, perfectly good food gets thrown away because it wasn't sold in time. Meanwhile, students are on tight budgets. We built ResQ-Bite to connect the dots, creating a win-win for everyone while drastically reducing carbon emissions.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-stone-300 font-medium"><CheckCircle2 className="w-6 h-6 text-emerald-500" /> Over 10,000 meals rescued this month.</li>
                <li className="flex items-center gap-3 text-stone-300 font-medium"><CheckCircle2 className="w-6 h-6 text-emerald-500" /> Partnered with local NGOs for unsold food.</li>
                <li className="flex items-center gap-3 text-stone-300 font-medium"><CheckCircle2 className="w-6 h-6 text-emerald-500" /> 5,000kg of CO2 prevented from landfills.</li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl transform rotate-3 scale-105 opacity-50 blur-xl"></div>
              <img src="https://images.unsplash.com/photo-1593113565214-80af59adbed9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Food Rescue Mission" className="relative rounded-3xl shadow-2xl object-cover h-96 w-full" />
            </div>
          </div>
        </section>

        <section id="partners" className="py-10 border-t border-stone-200 bg-stone-50 relative z-10 overflow-hidden">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
              <p className="text-sm font-bold text-stone-500 uppercase tracking-widest">Trusted by 500+ Campus Partners</p>
           </div>
           <div className="flex whitespace-nowrap overflow-hidden">
             <div className="animate-marquee flex gap-12 items-center px-6">
               {[...marqueePartners, ...marqueePartners, ...marqueePartners].map((partner, i) => (
                  <span key={i} className="text-xl md:text-2xl font-bold text-stone-400 flex items-center gap-3">
                    <Star className="w-5 h-5 text-emerald-300" fill="currentColor" /> {partner}
                  </span>
               ))}
             </div>
           </div>
        </section>

        <footer className="bg-white border-t border-stone-200 py-12 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-stone-900 p-1.5 rounded-lg">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-stone-900">ResQ-Bite</span>
            </div>
            <p className="text-stone-500 font-medium text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} ResQ-Bite Marketplace. All rights reserved. <br/>
              Built to save food.
            </p>
            <div className="flex gap-6 text-stone-400">
              <a href="#" className="hover:text-stone-900 transition-colors"><Shield className="w-5 h-5" /></a>
              <a href="#" className="hover:text-stone-900 transition-colors"><Heart className="w-5 h-5" /></a>
              <a href="#" className="hover:text-stone-900 transition-colors"><Zap className="w-5 h-5" /></a>
            </div>
          </div>
        </footer>

        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-[fadeUp_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors">✕</button>
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex bg-emerald-100 p-3 rounded-full mb-4">
                    <Leaf className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-black text-stone-900">
                    {authMode === 'login' ? 'Welcome Back' : 'Join the Movement'}
                  </h2>
                  <p className="text-stone-500 mt-2">
                    {authMode === 'login' ? 'Log in to claim today\'s deals.' : 'Sign up to rescue food & save money.'}
                  </p>
                </div>
                
                <form className="space-y-4" onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1">Full Name</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl bg-stone-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" placeholder="Jane Doe" onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1">Email</label>
                    <input type="email" required className="w-full px-4 py-3 rounded-xl bg-stone-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" placeholder="jane@university.edu" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1">Password</label>
                    <input type="password" required className="w-full px-4 py-3 rounded-xl bg-stone-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none" placeholder="••••••••" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1">I am a...</label>
                      <select className="w-full px-4 py-3 rounded-xl bg-stone-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-medium" onChange={(e) => setFormData({...formData, role: e.target.value})}>
                        <option value="student">Student / Hungry Human</option>
                        <option value="merchant">Restaurant Partner</option>
                        <option value="ngo">Charity / NGO</option>
                      </select>
                    </div>
                  )}
                  <button type="submit" className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg mt-6">
                    {authMode === 'login' ? 'Log In' : 'Create Account'}
                  </button>
                </form>
                
                <div className="mt-6 text-center">
                  <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-stone-500 hover:text-emerald-600 font-medium transition-colors">
                    {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] font-sans text-stone-900 relative flex flex-col">
      <style>{premiumStyles}</style>
      
      {/* Theme adaptation for Navbar based on role */}
      <nav className={`border-b sticky top-0 z-40 shadow-sm transition-colors duration-300 ${role === 'ngo' ? 'bg-indigo-900 border-indigo-800' : 'bg-white border-stone-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => showToast('Dashboard home clicked!', 'info')}>
              <div className={`${role === 'ngo' ? 'bg-indigo-500' : 'bg-emerald-500'} p-1.5 rounded-lg shadow-sm transition-colors`}>
                {role === 'ngo' ? <Heart className="w-5 h-5 text-white" /> : <Leaf className="w-5 h-5 text-white" />}
              </div>
              <span className={`text-xl font-black tracking-tight ${role === 'ngo' ? 'text-white' : 'text-stone-900'}`}>ResQ-Bite</span>
              <span className={`ml-4 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider hidden sm:block border ${role === 'ngo' ? 'bg-indigo-800 text-indigo-200 border-indigo-700' : 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                {role} Portal
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`hidden sm:flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors ${role === 'ngo' ? 'text-indigo-200 hover:text-white' : 'text-stone-600 hover:text-stone-900'}`} onClick={() => showToast('Profile settings opening soon!', 'info')}>
                <User className={`w-4 h-4 rounded-full p-0.5 ${role === 'ngo' ? 'bg-indigo-800' : 'bg-stone-100'}`} />
                {user?.full_name}
              </div>
              <button onClick={handleLogout} className={`transition-colors p-2 rounded-lg ${role === 'ngo' ? 'text-indigo-300 hover:text-white hover:bg-rose-500' : 'text-stone-400 hover:text-rose-500 hover:bg-rose-50'}`} title="Log Out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        
        {/* =========================================
            VIEW 1: NGO DASHBOARD (BULK DONATIONS)
            ========================================= */}
        {role === 'ngo' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 space-y-6">
              {/* NGO Stats */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 relative z-10">Community Impact</h3>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 ring-4 ring-white shadow-sm">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-stone-900">{userStats.items_rescued}</div>
                    <div className="text-sm font-bold text-indigo-600">Meals Distributed</div>
                  </div>
                </div>
                <div className="space-y-5 relative z-10">
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-1.5">
                      <span className="text-stone-500">CO2 Prevented</span>
                      <span className="text-stone-900">{userStats.total_co2_saved_kg.toFixed(1)} kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NGO Map */}
              <div className="bg-white h-72 rounded-2xl border border-stone-200 relative overflow-hidden shadow-sm z-0">
                 <MapContainer center={[40.7128, -74.0060]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap' />
                  {Object.values(listings.reduce((acc, item) => {
                      if (!item.latitude || !item.longitude) return acc;
                      if (!acc[item.restaurant_id]) acc[item.restaurant_id] = { lat: item.latitude, lng: item.longitude, name: item.business_name, items: [] };
                      acc[item.restaurant_id].items.push(item);
                      return acc;
                    }, {})).map((loc, idx) => (
                    <Marker key={idx} position={[loc.lat, loc.lng]} icon={customMarkerIcon}>
                      <Popup className="rounded-xl"><h4 className="font-black text-stone-900 mb-2 pb-2 border-b">{loc.name}</h4><p className="text-sm font-bold text-indigo-600">{loc.items.length} bulk drops ready</p></Popup>
                    </Marker>
                  ))}
                </MapContainer>
                <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Bulk Pickups
                </div>
              </div>
            </div>

            <div className="lg:col-span-9">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                <div>
                  <h2 className="text-3xl font-black text-stone-900 tracking-tight">Donation Radar</h2>
                  <p className="text-stone-500 font-medium">Claim expired surplus in bulk for shelters and distribution.</p>
                </div>
                <div className="flex gap-3">
                  <button className="bg-stone-100 text-stone-600 px-4 py-2 rounded-xl text-sm font-bold border border-stone-200 shadow-sm hover:bg-stone-200 transition-all active:scale-95" onClick={fetchRadarData}>
                    Refresh
                  </button>
                </div>
              </div>

              {listings.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-stone-200 text-center flex flex-col items-center justify-center h-80">
                  <div className="bg-indigo-50 p-6 rounded-full mb-4 border border-indigo-100">
                    <Heart className="w-16 h-16 text-indigo-300" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">No donations available yet</h3>
                  <p className="text-stone-500 max-w-md mb-6">Food drops only appear here after their student pickup deadline expires.</p>
                  
                  {/* PORTFOLIO DEMO BUTTON */}
                  <button onClick={handleTimeTravel} className="px-6 py-3 bg-stone-900 text-white hover:bg-indigo-600 rounded-xl font-bold transition-colors shadow-md flex items-center gap-2 border border-stone-700">
                    <Clock4 className="w-5 h-5" /> [Demo] Fast-Forward Time
                  </button>
                  <p className="text-xs text-stone-400 mt-3 max-w-xs mx-auto">Clicking this advances the database clock, forcing active food to expire into your feed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((item, index) => {
                    const imgs = ["https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500"];
                    return (
                    <div key={item.id} className="bg-white rounded-3xl shadow-sm border border-indigo-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col hover:-translate-y-1">
                      <div className="h-40 bg-stone-100 relative overflow-hidden">
                         <img src={imgs[index%3]} alt={item.item_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 grayscale-[20%]" />
                         <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent"></div>
                         <div className="absolute top-3 right-3 bg-white/95 text-indigo-700 text-xs font-black px-3 py-1.5 rounded-lg shadow-sm border border-indigo-100 flex items-center gap-1.5">
                           <Truck className="w-3.5 h-3.5" /> Bulk: {item.quantity_available} Units
                         </div>
                         <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="font-black text-xl text-white leading-tight drop-shadow-md">{item.item_name}</h3>
                            <p className="text-sm font-medium text-stone-200 flex items-center gap-1 mt-1 drop-shadow-md">
                              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {item.business_name}
                            </p>
                         </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col bg-white">
                        <p className="text-sm text-stone-500 line-clamp-2 mb-5 leading-relaxed">{item.description}</p>
                        
                        <div className="mt-auto">
                          <div className="flex justify-between items-center bg-indigo-50 p-3.5 rounded-2xl border border-indigo-100 mb-4">
                            <div>
                              <p className="text-[10px] uppercase font-black text-indigo-400 tracking-wider mb-0.5">Donation Value</p>
                              <div className="text-xl font-black text-indigo-600">$0.00 <span className="text-xs font-bold text-stone-400 line-through ml-1">${(item.quantity_available * item.base_price).toFixed(2)}</span></div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleBulkClaimDonation(item.id, item.item_name, item.quantity_available)}
                            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2 group/btn"
                          >
                            <Truck className="w-4 h-4" /> Dispatch Truck
                          </button>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            VIEW 2: STUDENT DASHBOARD
            ========================================= */}
        {role === 'student' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 relative z-10">Your Impact</h3>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 ring-4 ring-white shadow-sm">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-stone-900">Level {userStats.level}</div>
                    <div className="text-sm font-bold text-emerald-600">
                      {userStats.level < 3 ? 'Novice Rescuer' : userStats.level < 5 ? 'Eco-Warrior' : 'Food Savior'}
                    </div>
                  </div>
                </div>
                <div className="space-y-5 relative z-10">
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-1.5">
                      <span className="text-stone-500">CO2 Prevented</span>
                      <span className="text-stone-900">{userStats.total_co2_saved_kg.toFixed(1)} kg</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden border border-stone-200">
                      <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full" style={{ width: `${Math.min(100, (userStats.total_co2_saved_kg / 25) * 100)}%`, transition: 'width 1s ease-out' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-1.5">
                      <span className="text-stone-500">Money Saved</span>
                      <span className="text-stone-900">${userStats.total_money_saved.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden border border-stone-200">
                      <div className="bg-gradient-to-r from-teal-400 to-teal-600 h-full rounded-full" style={{ width: `${Math.min(100, (userStats.total_money_saved / 100) * 100)}%`, transition: 'width 1s ease-out' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white h-72 rounded-2xl border border-stone-200 relative overflow-hidden shadow-sm z-0">
                 <MapContainer center={[40.7128, -74.0060]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap' />
                  {Object.values(listings.reduce((acc, item) => {
                      if (!item.latitude || !item.longitude) return acc;
                      if (!acc[item.restaurant_id]) acc[item.restaurant_id] = { lat: item.latitude, lng: item.longitude, name: item.business_name, items: [] };
                      acc[item.restaurant_id].items.push(item);
                      return acc;
                    }, {})).map((loc, idx) => (
                    <Marker key={idx} position={[loc.lat, loc.lng]} icon={customMarkerIcon}>
                      <Popup className="rounded-xl"><h4 className="font-black text-stone-900 mb-2 pb-2 border-b">{loc.name}</h4></Popup>
                    </Marker>
                  ))}
                </MapContainer>
                <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Live Drop Map
                </div>
              </div>
            </div>

            <div className="lg:col-span-9">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                <div>
                  <h2 className="text-3xl font-black text-stone-900 tracking-tight">Live Radar</h2>
                  <p className="text-stone-500 font-medium">Claim surplus drops before they expire.</p>
                </div>
                <button className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-200 shadow-sm hover:bg-emerald-200 transition-all active:scale-95" onClick={fetchRadarData}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Refresh Radar
                </button>
              </div>

              {listings.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-stone-200 text-center flex flex-col items-center justify-center h-80">
                  <div className="bg-stone-50 p-6 rounded-full mb-4 border border-stone-100"><Package className="w-16 h-16 text-stone-300" /></div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">No active drops right now</h3>
                  <p className="text-stone-500 max-w-md">Check back after lunch or dinner rush!</p>
                  <button onClick={fetchRadarData} className="mt-6 px-6 py-3 bg-stone-900 text-white hover:bg-emerald-600 rounded-xl font-bold transition-colors shadow-md">Check Again</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((item, index) => {
                    const imgs = ["https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500", "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500"];
                    return (
                    <div key={item.id} className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col hover:-translate-y-1">
                      <div className="h-48 bg-stone-100 relative overflow-hidden">
                         <img src={imgs[index%4]} alt={item.item_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent"></div>
                         <div className="absolute top-3 right-3 bg-white/95 text-stone-900 text-xs font-black px-3 py-1.5 rounded-lg shadow-sm border border-stone-100 flex items-center gap-1.5">
                           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {item.quantity_available} Left
                         </div>
                         <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="font-black text-xl text-white leading-tight drop-shadow-md">{item.item_name}</h3>
                            <p className="text-sm font-medium text-stone-200 flex items-center gap-1 mt-1 drop-shadow-md">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {item.business_name}
                            </p>
                         </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col bg-white">
                        <p className="text-sm text-stone-500 line-clamp-2 mb-5 leading-relaxed">{item.description}</p>
                        
                        <div className="mt-auto">
                          <div className="flex justify-between items-end bg-stone-50 p-3.5 rounded-2xl border border-stone-100 mb-4">
                            <div>
                              <p className="text-[10px] uppercase font-black text-stone-400 tracking-wider mb-0.5">Price</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-emerald-600">${Number(item.base_price).toFixed(2)}</span>
                                <span className="text-xs font-bold text-stone-400 line-through">${(Number(item.base_price) * 2.5).toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase font-black text-rose-400 tracking-wider mb-0.5">Status</p>
                              <span className="font-mono text-sm font-black text-stone-700 flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-stone-200 shadow-sm">
                                <Clock className="w-3.5 h-3.5 text-rose-500" /> Active
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleClaimItem(item.id, item.item_name)}
                            className="w-full bg-stone-900 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 hover:shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 group/btn"
                          >
                            Claim Now <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            VIEW 3: MERCHANT DASHBOARD
            ========================================= */}
        {role === 'merchant' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-black text-stone-900 mb-6 flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-emerald-500" /> Store Overview
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Recovered</div>
                    <div className="text-3xl font-black text-emerald-600">$340</div>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Items Sold</div>
                    <div className="text-3xl font-black text-stone-900">42</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 flex flex-col h-[calc(100%-14rem)]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-stone-900 flex items-center text-lg">
                      Live Inventory 
                      <span className="ml-3 bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-md border border-emerald-200 shadow-sm">{listings.length} Active</span>
                    </h3>
                    <button onClick={fetchRadarData} className="text-xs text-stone-400 hover:text-emerald-600 font-bold transition-colors bg-stone-100 px-3 py-1.5 rounded-lg">Refresh</button>
                </div>
                
                <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                  {listings.map(item => (
                     <div key={item.id} className="flex justify-between items-center p-3 hover:bg-stone-50 rounded-xl transition-colors border border-stone-100 group">
                       <div>
                         <p className="font-bold text-sm text-stone-900 line-clamp-1">{item.item_name}</p>
                         <p className="text-xs font-medium text-stone-500 mt-0.5">{item.quantity_available} units left • <span className="text-emerald-600 font-bold">${item.base_price}</span></p>
                       </div>
                       <button onClick={() => handleCancelItem(item.id)} className="text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all">Cancel</button>
                     </div>
                  ))}
                  {listings.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50">
                       <Package className="w-8 h-8 text-stone-300 mb-2" />
                       <p className="text-sm font-bold text-stone-500">No active drops.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-stone-200">
                <div className="mb-10 pb-6 border-b border-stone-100">
                  <h2 className="text-3xl font-black text-stone-900 flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-xl"><Plus className="w-6 h-6 text-emerald-600" /></div>
                    Create a Surplus Drop
                  </h2>
                  <p className="text-stone-500 mt-2 text-lg font-medium">List end-of-day food to be rescued instantly.</p>
                </div>
                
                <form onSubmit={handleCreateListing} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-black text-stone-800 mb-2 uppercase tracking-wide">Item Name / Bundle</label>
                      <input type="text" required className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium text-lg" value={newListing.item_name} onChange={e => setNewListing({...newListing, item_name: e.target.value})} />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-black text-stone-800 mb-2 uppercase tracking-wide">Description & Details</label>
                      <textarea required className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 transition-all outline-none font-medium resize-none text-lg" rows="3" value={newListing.description} onChange={e => setNewListing({...newListing, description: e.target.value})} />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-stone-800 mb-2 uppercase tracking-wide">Quantity Available</label>
                      <div className="relative">
                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input type="number" required min="1" className="w-full pl-12 pr-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-none font-black text-lg" value={newListing.quantity_available} onChange={e => setNewListing({...newListing, quantity_available: e.target.value})} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-stone-800 mb-2 uppercase tracking-wide">Pickup Deadline</label>
                      <input type="datetime-local" required className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-none font-black text-stone-700 text-lg" value={newListing.pickup_end_time} onChange={e => setNewListing({...newListing, pickup_end_time: e.target.value})} />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-stone-800 mb-2 uppercase tracking-wide">Starting Price</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                        <input type="number" step="0.01" required className="w-full pl-12 pr-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 outline-none font-black text-xl text-emerald-700" value={newListing.base_price} onChange={e => setNewListing({...newListing, base_price: e.target.value})} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-stone-800 mb-2 uppercase tracking-wide">Absolute Min Price</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input type="number" step="0.01" required className="w-full pl-12 pr-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-stone-500 outline-none font-black text-xl text-stone-600" value={newListing.min_price} onChange={e => setNewListing({...newListing, min_price: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 mt-4 border-t border-stone-100 flex justify-end">
                    <button type="submit" className="w-full md:w-auto bg-stone-900 text-white font-black text-lg px-10 py-5 rounded-2xl hover:bg-emerald-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                      <Package className="w-6 h-6" /> Publish Drop to Radar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <ToastNotification toast={toast} />
    </div>
  );
}