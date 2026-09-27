import React from 'react';
import { Search, Smartphone, MapPin, Clock, Truck, Heart } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-black text-center text-stone-900 mb-16">How ResQ-Bite Works</h2>
        
        <div className="grid lg:grid-cols-2 gap-16">
          {/* For Students Path */}
          <div className="bg-stone-50 rounded-3xl p-10 border border-stone-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
            <h3 className="text-2xl font-black text-stone-900 mb-8 flex items-center gap-3">
              <span className="text-emerald-500">For Students</span>
            </h3>
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-emerald-500">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-stone-900 mb-2">1. Find Food</h4>
                  <p className="text-stone-500 font-medium">Browse the live radar for heavily discounted surplus meals nearby.</p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-emerald-500">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-stone-900 mb-2">2. Claim Instantly</h4>
                  <p className="text-stone-500 font-medium">Lock in your meal with a tap before someone else gets it.</p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-emerald-500">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-stone-900 mb-2">3. Pick It Up</h4>
                  <p className="text-stone-500 font-medium">Show your confirmation at the restaurant and enjoy your food!</p>
                </div>
              </div>
            </div>
          </div>

          {/* For NGOs Path */}
          <div className="bg-stone-50 rounded-3xl p-10 border border-stone-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl" />
            <h3 className="text-2xl font-black text-stone-900 mb-8 flex items-center gap-3">
              <span className="text-indigo-600">For NGOs</span>
            </h3>
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-stone-900 mb-2">1. Food Expires</h4>
                  <p className="text-stone-500 font-medium">Unclaimed surplus food is automatically routed to NGOs for free.</p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-stone-900 mb-2">2. Dispatch Truck</h4>
                  <p className="text-stone-500 font-medium">Claim bulk donations instantly and schedule a pickup.</p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-stone-900 mb-2">3. Feed Communities</h4>
                  <p className="text-stone-500 font-medium">Distribute high-quality rescued food to local shelters.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
