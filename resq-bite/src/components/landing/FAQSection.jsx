import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'What is ResQ-Bite?',
    a: 'ResQ-Bite is India\'s first food rescue marketplace that connects restaurants with surplus food to students looking for affordable meals and NGOs that can distribute bulk donations. We help reduce food waste while making quality food accessible.'
  },
  {
    q: 'How much can I save on meals?',
    a: 'Students typically save 50-70% on restaurant meals. For example, a ₹300 biryani might be available for ₹120, or a ₹250 thali for just ₹80. The savings add up quickly — most active users save ₹2000+ per month!'
  },
  {
    q: 'Is the food safe to eat?',
    a: 'Absolutely! All food on ResQ-Bite is freshly prepared surplus food that hasn\'t been served yet. It\'s the same quality food the restaurant serves regularly — there\'s just extra that would otherwise go to waste. All our partner restaurants follow FSSAI guidelines.'
  },
  {
    q: 'How does the NGO donation system work?',
    a: 'When surplus food isn\'t claimed by students before the pickup deadline, it automatically becomes available for NGO partners to claim for free. NGOs can dispatch pickup vehicles and distribute the food to communities in need.'
  },
  {
    q: 'How can my restaurant join ResQ-Bite?',
    a: 'Simply sign up as a "Restaurant Partner" and start listing your surplus food items. You set the discounted price, quantity, and pickup deadline. It\'s free to join and you recover revenue from food that would have been wasted.'
  },
  {
    q: 'Is ResQ-Bite available in my city?',
    a: 'We\'re currently active across Delhi NCR, Mumbai, Bangalore, Hyderabad, and Pune with rapid expansion plans. Sign up to get notified when we launch in your city!'
  }
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section className="py-24 bg-white border-t border-stone-200">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HelpCircle className="w-7 h-7 text-emerald-500" />
          <h2 className="text-3xl md:text-4xl font-black text-stone-900">
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-center text-stone-500 font-medium mb-14">
          Everything you need to know about rescuing food with ResQ-Bite.
        </p>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`rounded-2xl border transition-all ${open === idx ? 'border-emerald-200 bg-emerald-50/50 shadow-sm' : 'border-stone-200 bg-stone-50 hover:border-stone-300'}`}
            >
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-bold text-stone-900 pr-4">{faq.q}</span>
                {open === idx ? (
                  <ChevronUp className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-stone-400 flex-shrink-0" />
                )}
              </button>
              {open === idx && (
                <div className="px-5 pb-5 text-stone-600 font-medium leading-relaxed animate-[fadeUp_0.2s_ease-out]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
