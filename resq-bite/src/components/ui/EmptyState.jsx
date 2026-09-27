import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center text-center bg-white p-12 rounded-3xl shadow-sm border border-stone-200">
      {Icon && (
        <div className="w-20 h-20 bg-stone-50 text-stone-400 rounded-full flex items-center justify-center mb-6">
          <Icon className="w-10 h-10" />
        </div>
      )}
      <h3 className="text-xl font-black text-stone-900 mb-2">{title}</h3>
      <p className="text-stone-500 font-medium max-w-sm mb-8">{description}</p>
      {action && (
        <button
          onClick={action}
          className="px-6 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
