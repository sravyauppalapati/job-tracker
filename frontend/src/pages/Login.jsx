import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎯</div>
          <div className="logo-text" style={{ justifyContent: 'center', display: 'flex', gap: 1 }}>
            Job<span className="logo-dot">Tracker</span>
          </div>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">SIGN IN TO YOUR COMMAND CENTER</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input" type="email" name="email"
              placeholder="you@example.com" value={form.email}
              onChange={handleChange} required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input" type="password" name="password"
              placeholder="••••••••" value={form.password}
              onChange={handleChange} required
            />
          </div>
          <button
            className="btn btn-primary" type="submit"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
