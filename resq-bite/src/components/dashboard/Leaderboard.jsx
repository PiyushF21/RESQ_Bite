import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../../services/api';
import Navbar from '../layout/Navbar';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Trophy, Flame } from 'lucide-react';
import { getLevelEmoji, CURRENCY_SYMBOL } from '../../constants';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setLeaders)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 font-sans pb-12">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="flex flex-col items-center mb-10 mt-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg mb-4">
                <Trophy className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-stone-900 mb-2">Wall of Fame</h1>
            <p className="text-stone-500 font-medium">Top food rescuers making the biggest impact.</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-400 uppercase tracking-wider">
                <div className="col-span-1 text-center">Rank</div>
                <div className="col-span-4">Rescuer</div>
                <div className="col-span-2 text-center">Rescued</div>
                <div className="col-span-2 text-center">CO₂ Saved</div>
                <div className="col-span-3 text-right">Streak</div>
            </div>
            
            <div className="divide-y divide-stone-100">
                {leaders.map((leader, i) => (
                    <div key={leader.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 items-center hover:bg-stone-50 transition-colors">
                        <div className="md:col-span-1 flex items-center md:justify-center">
                            {i === 0 ? <span className="text-2xl">🥇</span> : 
                             i === 1 ? <span className="text-2xl">🥈</span> : 
                             i === 2 ? <span className="text-2xl">🥉</span> : 
                             <span className="text-lg font-black text-stone-400">#{leader.rank}</span>}
                        </div>
                        
                        <div className="md:col-span-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-xl">
                                {getLevelEmoji(leader.items_rescued)}
                            </div>
                            <div>
                                <div className="font-bold text-stone-900">{leader.name}</div>
                                <div className="text-xs font-medium text-stone-400 capitalize">{leader.role}</div>
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                            <span className="md:hidden text-xs font-bold text-stone-400">Meals</span>
                            <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                {leader.items_rescued}
                            </span>
                        </div>

                        <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                            <span className="md:hidden text-xs font-bold text-stone-400">CO₂</span>
                            <span className="font-bold text-stone-600">{leader.co2_saved_kg} kg</span>
                        </div>

                        <div className="md:col-span-3 flex justify-between md:justify-end items-center">
                            <span className="md:hidden text-xs font-bold text-stone-400">Streak</span>
                            {leader.streak_days > 0 ? (
                                <span className="flex items-center gap-1 text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full">
                                    <Flame className="w-4 h-4 fill-orange-500" />
                                    {leader.streak_days}
                                </span>
                            ) : (
                                <span className="text-stone-300 font-medium">-</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
