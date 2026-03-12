// frontend/src/pages/UploadPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';

export default function UploadPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [photo, setPhoto] = useState<File | null>(null);
  const [mealType, setMealType] = useState('');
  const [remark, setRemark] = useState('');
  const [takenAt, setTakenAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo || !mealType) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('meal_type', mealType);
      if (remark) formData.append('remark', remark);
      if (takenAt) formData.append('taken_at', takenAt);

      await client.post('/meals', formData);
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Upload failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Meal Photo</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm mb-1">Photo *</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setPhoto(e.target.files?.[0] ?? null)}
            className="w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Meal Type *</label>
          <select
            value={mealType}
            onChange={e => setMealType(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select type</option>
            <option value="1">Breakfast</option>
            <option value="2">Lunch</option>
            <option value="3">Dinner</option>
            <option value="4">Snack</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Remark</label>
          <input
            type="text"
            value={remark}
            onChange={e => setRemark(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Optional"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-1">Taken At</label>
          <input
            type="datetime-local"
            value={takenAt}
            onChange={e => setTakenAt(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !photo || !mealType}
          className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}