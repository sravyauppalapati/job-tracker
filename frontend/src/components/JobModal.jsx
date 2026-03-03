import { useState, useEffect } from 'react';
import { jobsApi } from '../api';

const EMPTY_FORM = {
  company: '', position: '', location: '', job_url: '',
  salary_range: '', status: 'applied', applied_date: new Date().toISOString().split('T')[0],
  interview_date: '', priority: 'medium',
};

export default function JobModal({ job, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (job) {
      setForm({
        company: job.company || '',
        position: job.position || '',
        location: job.location || '',
        job_url: job.job_url || '',
        salary_range: job.salary_range || '',
        status: job.status || 'applied',
        applied_date: job.applied_date ? job.applied_date.split('T')[0] : '',
        interview_date: job.interview_date ? job.interview_date.split('T')[0] : '',
        priority: job.priority || 'medium',
      });
    }
  }, [job]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, interview_date: form.interview_date || null };
      if (job) {
        await jobsApi.update(job.id, payload);
      } else {
        await jobsApi.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{job ? 'Edit Application' : 'Add Application'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Company *</label>
              <input className="form-input" name="company" value={form.company}
                onChange={handleChange} placeholder="Google" required />
            </div>
            <div className="form-group">
              <label className="form-label">Position *</label>
              <input className="form-input" name="position" value={form.position}
                onChange={handleChange} placeholder="Software Engineer" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" name="location" value={form.location}
                onChange={handleChange} placeholder="Remote / NYC" />
            </div>
            <div className="form-group">
              <label className="form-label">Salary Range</label>
              <input className="form-input" name="salary_range" value={form.salary_range}
                onChange={handleChange} placeholder="$100k - $130k" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job URL</label>
            <input className="form-input" name="job_url" value={form.job_url}
              onChange={handleChange} placeholder="https://jobs.example.com/..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="no_response">No Response</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Applied Date *</label>
              <input className="form-input" type="date" name="applied_date"
                value={form.applied_date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Interview Date</label>
              <input className="form-input" type="date" name="interview_date"
                value={form.interview_date} onChange={handleChange} />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : job ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
