import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, User, LogOut, Heart, Trophy, History, LayoutDashboard } from 'lucide-react';

export default function Navbar({ onAuthClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const isNGO = user?.role === 'ngo';
  const navBg = isNGO ? 'bg-indigo-900 border-indigo-800 text-white' : 'bg-white/80 border-stone-200 text-stone-900';
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`sticky top-0 z-40 backdrop-blur-md border-b ${navBg}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight">ResQ-Bite</span>
          {user && (
            <span className={`ml-2 px-3 py-1 text-xs font-bold uppercase rounded-full hidden sm:inline-block ${isNGO ? 'bg-indigo-800 text-indigo-100' : 'bg-stone-100 text-stone-600'}`}>
              {user.role}
            </span>
          )}
        </div>

        {!user ? (
          <>
            <div className="hidden md:flex items-center gap-8 font-bold text-sm">
              <a href="/#how-it-works" className="hover:text-emerald-500 transition-colors">How it Works</a>
              <a href="/#mission" className="hover:text-emerald-500 transition-colors">Our Mission</a>
              <a href="/#partners" className="hover:text-emerald-500 transition-colors">Partners</a>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onAuthClick('login')}
                className="font-bold text-sm hover:text-emerald-500 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => onAuthClick('register')}
                className="px-5 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            
            <button 
              onClick={() => navigate('/leaderboard')}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${location.pathname === '/leaderboard' ? 'bg-amber-100 text-amber-700' : isNGO ? 'hover:bg-indigo-800 text-indigo-100' : 'hover:bg-stone-100 text-stone-600'}`}
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className={`flex items-center gap-2 font-medium p-2 rounded-xl transition-colors ${isNGO ? 'hover:bg-indigo-800' : 'hover:bg-stone-100'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isNGO ? 'bg-indigo-700' : 'bg-stone-200'}`}>
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline font-bold">{user.full_name || 'User'}</span>
              </button>

              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                  <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border overflow-hidden z-50 animate-[fadeUp_0.1s_ease-out] ${isNGO ? 'bg-indigo-900 border-indigo-700 text-white' : 'bg-white border-stone-200 text-stone-900'}`}>
                    <div className={`p-4 border-b ${isNGO ? 'border-indigo-800' : 'border-stone-100'}`}>
                      <p className="font-bold truncate">{user.full_name}</p>
                      <p className={`text-sm truncate ${isNGO ? 'text-indigo-300' : 'text-stone-500'}`}>{user.email}</p>
                    </div>
                    <div className="p-2">
                      <button onClick={() => { navigate(`/dashboard/${user.role}`); setShowDropdown(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${isNGO ? 'hover:bg-indigo-800' : 'hover:bg-stone-100'}`}>
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </button>
                      
                      {(user.role === 'student' || user.role === 'ngo') && (
                        <button onClick={() => { navigate('/history'); setShowDropdown(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${isNGO ? 'hover:bg-indigo-800' : 'hover:bg-stone-100'}`}>
                          <History className="w-4 h-4" /> Activity History
                        </button>
                      )}

                      <button onClick={() => { navigate('/leaderboard'); setShowDropdown(false); }} className={`sm:hidden w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${isNGO ? 'hover:bg-indigo-800' : 'hover:bg-stone-100'}`}>
                        <Trophy className="w-4 h-4" /> Leaderboard
                      </button>
                    </div>
                    <div className={`p-2 border-t ${isNGO ? 'border-indigo-800' : 'border-stone-100'}`}>
                      <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${isNGO ? 'hover:bg-indigo-800 text-rose-300' : 'hover:bg-stone-100 text-rose-600'}`}>
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        )}
      </div>
    </nav>
  );
}
