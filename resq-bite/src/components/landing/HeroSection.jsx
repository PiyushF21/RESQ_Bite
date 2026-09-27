import React from 'react';

export default function HeroSection({ onGetStarted, onNGOPartner }) {
  return (
    <div className="pt-32 pb-24 px-6 relative overflow-hidden bg-stone-50">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl -z-10 rounded-full" />
      <div className="absolute top-40 right-0 w-72 h-72 bg-gradient-to-bl from-orange-400/10 to-transparent blur-3xl -z-10 rounded-full" />
      
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm mb-8 animate-[fadeUp_0.5s_ease-out]">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-stone-700">🇮🇳 Now live across 50+ Indian campuses</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-stone-900 tracking-tight leading-tight mb-6 animate-[fadeUp_0.7s_ease-out]">
          Rescue amazing food.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
            Save money. Save the planet.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-stone-500 font-medium max-w-2xl mb-10 animate-[fadeUp_0.9s_ease-out]">
          India's smartest food rescue platform — connecting restaurants with students for 
          discounted surplus meals, and with NGOs for free bulk donations. From dal makhani to dosa, 
          rescue delicious food at up to 70% off.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-[fadeUp_1.1s_ease-out]">
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 justify-center"
          >
            <span>🍛</span> Start Rescuing
          </button>
          <button 
            onClick={onNGOPartner}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 justify-center"
          >
            <span>💚</span> Partner as NGO
          </button>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 animate-[fadeUp_1.3s_ease-out]">
          {[
            { icon: '🍽️', label: '50,000+ Meals Rescued' },
            { icon: '🌿', label: '120 Tons CO₂ Saved' },
            { icon: '🏪', label: '500+ Restaurant Partners' }
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur border border-stone-200 rounded-full text-sm font-bold text-stone-600">
              <span>{badge.icon}</span>
              {badge.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
