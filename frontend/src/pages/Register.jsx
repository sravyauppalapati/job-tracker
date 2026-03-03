import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎯</div>
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">START TRACKING YOUR JOB SEARCH</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input" type="text" name="name"
              placeholder="John Doe" value={form.name}
              onChange={handleChange} required
            />
          </div>
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
              placeholder="Min 6 characters" value={form.password}
              onChange={handleChange} required
            />
          </div>
          <button
            className="btn btn-primary" type="submit"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Get Started →'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
