import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../../constants';

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
  const prev = () => setCurrent((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-black text-center text-stone-900 mb-4">
          Loved by Thousands
        </h2>
        <p className="text-center text-stone-500 font-medium mb-14 max-w-xl mx-auto">
          Students, NGOs, and restaurants across India are part of the ResQ-Bite movement.
        </p>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col">
              <Quote className="w-8 h-8 text-emerald-200 mb-4" />
              <p className="text-stone-600 font-medium text-sm leading-relaxed flex-1 mb-4">
                "{t.text}"
              </p>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div>
                <div className="font-bold text-stone-900 text-sm">{t.name}</div>
                <div className="text-xs font-medium text-stone-500">{t.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
            <Quote className="w-10 h-10 text-emerald-200 mb-4" />
            <p className="text-stone-600 font-medium leading-relaxed mb-6">
              "{TESTIMONIALS[current].text}"
            </p>
            <div className="flex items-center gap-1 mb-4">
              {[...Array(TESTIMONIALS[current].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="font-bold text-stone-900">{TESTIMONIALS[current].name}</div>
            <div className="text-sm font-medium text-stone-500">{TESTIMONIALS[current].role}</div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={prev} className="p-2 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
              <ChevronLeft className="w-5 h-5 text-stone-600" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === current ? 'bg-emerald-500' : 'bg-stone-300'}`} />
              ))}
            </div>
            <button onClick={next} className="p-2 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
              <ChevronRight className="w-5 h-5 text-stone-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
