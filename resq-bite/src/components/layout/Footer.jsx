import React from 'react';
import { Shield, Heart, Zap, Leaf } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-stone-200 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-stone-900">ResQ-Bite</span>
          </div>
          
          <div className="text-stone-500 font-medium">
            &copy; {currentYear} ResQ-Bite. Built to save food.
          </div>
          
          <div className="flex items-center gap-4 text-stone-400">
            <a href="#" aria-label="Privacy" className="hover:text-emerald-500 transition-colors">
              <Shield className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Community" className="hover:text-emerald-500 transition-colors">
              <Heart className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Impact" className="hover:text-emerald-500 transition-colors">
              <Zap className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
