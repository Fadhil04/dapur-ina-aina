import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui';
import { Toast } from '../../components/ui/Toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.username.trim() || !form.password.trim()) {
      setError('Username dan password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.data.token, data.data.user);
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa username dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <LogIn size={32} className="text-on-primary" />
            </div>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Dapur Ina Aina</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">Masuk ke sistem kasir</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-label-lg text-label-lg text-on-surface block mb-2">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              autoComplete="username"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-body-md font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all bg-surface-container-low"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label className="font-label-lg text-label-lg text-on-surface block mb-2">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-body-md font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all pr-10 bg-surface-container-low"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container text-body-sm font-body-sm px-4 py-3 rounded-xl border border-error">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Demo: <span className="font-label-lg">admin</span> / <span className="font-label-lg">admin123</span>
          </p>
        </div>
      </div>

      {error && <Toast title="Error" message={error} type="error" onClose={() => setError(null)} duration={5000} />}
    </div>
  );
}
