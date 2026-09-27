import React, { useState, useEffect, useRef } from 'react';
import { Leaf, Users, CloudOff, Store } from 'lucide-react';
import { getGlobalStats } from '../../services/api';

function AnimatedCounter({ target, duration = 2000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || target === 0) return;

    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [isVisible, target, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

export default function LiveImpactCounter() {
  const [stats, setStats] = useState({
    meals_rescued: 50000,
    co2_saved_kg: 120000,
    partners: 500,
    users: 25000
  });

  useEffect(() => {
    getGlobalStats()
      .then(data => {
        setStats({
          meals_rescued: data.meals_rescued || 50000,
          co2_saved_kg: data.co2_saved_kg || 120000,
          partners: data.partners || 500,
          users: data.users || 25000
        });
      })
      .catch(() => {});
  }, []);

  const counters = [
    { icon: Leaf, value: stats.meals_rescued, label: 'Meals Rescued', suffix: '+', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: CloudOff, value: Math.round(stats.co2_saved_kg), label: 'Kg CO₂ Prevented', suffix: '', color: 'text-teal-500', bg: 'bg-teal-50' },
    { icon: Store, value: stats.partners, label: 'Restaurant Partners', suffix: '+', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: Users, value: stats.users, label: 'Active Rescuers', suffix: '+', color: 'text-indigo-500', bg: 'bg-indigo-50' }
  ];

  return (
    <section className="py-20 bg-white border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-black text-center text-stone-900 mb-4">
          Our Impact So Far
        </h2>
        <p className="text-center text-stone-500 font-medium mb-14 max-w-xl mx-auto">
          Every meal rescued is a step towards zero food waste. Here's how the ResQ-Bite community is making a difference across India.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {counters.map((item, idx) => (
            <div key={idx} className="bg-stone-50 rounded-3xl p-8 border border-stone-200 text-center hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <div className="text-3xl md:text-4xl font-black text-stone-900 mb-2">
                <AnimatedCounter target={item.value} suffix={item.suffix} />
              </div>
              <div className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
