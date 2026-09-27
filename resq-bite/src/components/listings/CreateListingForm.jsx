import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { createListing } from '../../services/api';
import { Package, Plus, MapPin, Tag } from 'lucide-react';
import { CATEGORIES } from '../../constants';

export default function CreateListingForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    category: 'veg',
    quantity_available: 1,
    base_price: '',
    min_price: '',
    original_price: '',
    pickup_end_time: ''
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createListing(formData);
      showToast('Surplus drop published successfully', 'success');
      setFormData({
        item_name: '',
        description: '',
        category: 'veg',
        quantity_available: 1,
        base_price: '',
        min_price: '',
        original_price: '',
        pickup_end_time: ''
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      showToast(error.message || 'Failed to create listing', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-stone-900">Create a Surplus Drop</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1">Item Name</label>
          <div className="relative">
            <Package className="w-5 h-5 absolute left-4 top-3.5 text-stone-400" />
            <input required name="item_name" value={formData.item_name} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-500 font-medium" placeholder="e.g., Dal Makhani Thali" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1">Description</label>
          <textarea required name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-500 font-medium" placeholder="Describe the items..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Category</label>
            <div className="relative">
                <Tag className="w-5 h-5 absolute left-4 top-3.5 text-stone-400" />
                <select name="category" value={formData.category} onChange={handleChange} className="w-full pl-12 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-500 font-medium appearance-none">
                    {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.emoji} {cat.label}</option>
                    ))}
                </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Quantity</label>
            <input required type="number" min="1" name="quantity_available" value={formData.quantity_available} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-500 font-medium" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Original Price (₹)</label>
            <input required type="number" step="1" min="0" name="original_price" value={formData.original_price} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-500 font-medium" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Discounted (₹)</label>
            <input required type="number" step="1" min="0" name="base_price" value={formData.base_price} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-500 font-medium" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Minimum Price (₹)</label>
            <input required type="number" step="1" min="0" name="min_price" value={formData.min_price} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-500 font-medium" placeholder="0" />
          </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Pickup Deadline</label>
            <input required type="datetime-local" name="pickup_end_time" value={formData.pickup_end_time} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-emerald-500 font-medium" />
        </div>

        <button disabled={loading} type="submit" className="w-full pt-2">
          <div className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors disabled:opacity-50">
            <Package className="w-5 h-5" />
            {loading ? 'Publishing...' : 'Publish Drop to Radar'}
          </div>
        </button>
      </form>
    </div>
  );
}
