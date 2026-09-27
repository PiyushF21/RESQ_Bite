import React from 'react';
import { INDIAN_PARTNERS } from '../../constants';
import { Star } from 'lucide-react';

export default function PartnersMarquee() {
  return (
    <section id="partners" className="py-16 bg-stone-50 border-t border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Trusted by 500+ Partners Across India</h3>
      </div>
      
      <div className="relative flex overflow-x-hidden group">
        <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap group-hover:[animation-play-state:paused]">
          {[...INDIAN_PARTNERS, ...INDIAN_PARTNERS, ...INDIAN_PARTNERS].map((partner, idx) => (
            <div key={idx} className="flex items-center gap-2 mx-8">
              <Star className="w-5 h-5 text-emerald-500" />
              <span className="text-xl font-black text-stone-300">{partner}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
