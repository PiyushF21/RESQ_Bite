import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Leaf, X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const user = await login(formData.email, formData.password);
        showToast('Logged in successfully', 'success');
        navigate(`/dashboard/${user.role}`);
      } else {
        const user = await register(formData);
        showToast('Account created successfully', 'success');
        navigate(`/dashboard/${user.role}`);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-label="Authentication modal">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-[fadeUp_0.3s_ease-out] relative">
        <button onClick={onClose} aria-label="Close" className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white mb-6">
            <Leaf className="w-7 h-7" />
          </div>
          
          <h2 className="text-2xl font-black text-stone-900 mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Join ResQ-Bite'}
          </h2>
          <p className="text-stone-500 font-medium mb-8">
            {mode === 'login' ? 'Enter your details to sign in.' : 'Create an account to start rescuing food.'}
          </p>

          {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Full Name</label>
                  <input required name="full_name" type="text" value={formData.full_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-500 font-medium" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Account Type</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-500 font-medium">
                    <option value="student">Student</option>
                    <option value="merchant">Restaurant Partner</option>
                    <option value="ngo">Charity & NGO</option>
                  </select>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Email</label>
              <input required name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-500 font-medium" placeholder="you@example.com" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Password</label>
              <input required name="password" type="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-500 font-medium" placeholder="••••••••" />
            </div>

            <button disabled={loading} type="submit" className="w-full mt-4 py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex justify-center">
              {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center text-stone-500 font-medium">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-emerald-600 font-bold hover:underline">
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
