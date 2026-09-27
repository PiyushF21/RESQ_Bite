import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function MissionSection() {
  return (
    <section id="mission" className="py-24 bg-stone-900 text-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
              India wastes 68 million tons of food every year. We're changing that.
            </h2>
            <p className="text-stone-400 font-medium text-lg mb-10 leading-relaxed">
              While 190 million Indians go hungry every day, our restaurants, canteens, and 
              cafés throw away perfectly good food. ResQ-Bite bridges this gap — connecting 
              surplus food with hungry students and communities who need it most. From IIT 
              canteens to Chandni Chowk dhabas, we're building India's largest food rescue network.
            </p>
            
            <ul className="space-y-4">
              {[
                'Over 50,000+ meals rescued across Indian campuses',
                'Active partnerships with 150+ NGOs including Robin Hood Army',
                'Prevented 120 tons of CO₂ emissions from food waste',
                'Present in Delhi, Mumbai, Bangalore, Hyderabad & Pune'
              ].map((stat, idx) => (
                <li key={idx} className="flex items-center gap-3 font-bold text-stone-200">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  {stat}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            {/* Decorative Card */}
            <div className="aspect-square max-w-md mx-auto rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-orange-500 p-1 opacity-80 blur-[2px] hover:blur-none transition-all duration-500">
              <div className="w-full h-full bg-stone-900 rounded-full flex flex-col items-center justify-center p-12 text-center border-4 border-stone-800">
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
                  Zero
                </span>
                <span className="text-xl font-bold text-stone-300">
                  Food Waste Mission 🇮🇳
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
