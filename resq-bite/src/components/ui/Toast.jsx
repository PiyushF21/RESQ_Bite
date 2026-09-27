import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function ToastNotification() {
  // Assuming useToast returns the toast state as well
  const { toast } = useToast();

  if (!toast || !toast.show) return null;

  const bgColors = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    ngo: 'bg-indigo-600',
    info: 'bg-stone-800'
  };

  const Icons = {
    success: CheckCircle2,
    error: AlertCircle,
    ngo: Info,
    info: Info
  };

  const bgColor = bgColors[toast.type] || bgColors.info;
  const Icon = Icons[toast.type] || Icons.info;

  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl text-white ${bgColor} animate-[slideIn_0.3s_ease-out]`}>
      <Icon className="w-6 h-6" />
      <span className="font-medium">{toast.message}</span>
    </div>
  );
}
