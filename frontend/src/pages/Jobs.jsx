import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi, STATUS_CONFIG, getInitials, formatDate, getDaysUntil } from '../api';
import JobModal from '../components/JobModal';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', search: '', priority: '' });
  const navigate = useNavigate();

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.priority) params.priority = filters.priority;
      const { data } = await jobsApi.getAll(params);
      setJobs(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this application?')) return;
    await jobsApi.remove(id);
    loadJobs();
  };

  const handleEdit = (e, job) => {
    e.stopPropagation();
    setEditJob(job);
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">{jobs.length} TOTAL TRACKED</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditJob(null); setShowModal(true); }}>
          + Add Application
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="🔍  Search company or role..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
        />
        <select
          className="filter-select"
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          <option value="all">All Statuses</option>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
          <option value="no_response">No Response</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
        <select
          className="filter-select"
          value={filters.priority}
          onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
        >
          <option value="">All Priorities</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">⚪ Low</option>
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No applications found</div>
          <div className="empty-text">
            {filters.search || filters.status !== 'all' ? 'Try adjusting your filters.' : 'Add your first application!'}
          </div>
          {!filters.search && filters.status === 'all' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Add Application
            </button>
          )}
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => {
            const daysUntil = job.status === 'interview' && job.interview_date
              ? getDaysUntil(job.interview_date) : null;

            return (
              <div
                key={job.id}
                className={`job-card ${job.status}`}
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="job-company-logo">{getInitials(job.company)}</div>

                <div className="job-main">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="job-company">{job.company}</div>
                    <span className={`priority-badge priority-${job.priority}`}>
                      {job.priority === 'high' ? '▲' : job.priority === 'medium' ? '●' : '▼'} {job.priority}
                    </span>
                  </div>
                  <div className="job-position">{job.position}</div>
                  <div className="job-meta">
                    {job.location && <span className="job-meta-item">📍 {job.location}</span>}
                    {job.salary_range && <span className="job-meta-item">💰 {job.salary_range}</span>}
                    <span className="job-meta-item">📅 {formatDate(job.applied_date)}</span>
                  </div>
                </div>

                <div className="job-right">
                  <span className={`badge badge-${job.status}`}>
                    {STATUS_CONFIG[job.status]?.label}
                  </span>

                  {/* Countdown feature for interviews */}
                  {daysUntil !== null && daysUntil >= 0 && (
                    <span className={`countdown-chip ${daysUntil <= 2 ? 'urgent' : ''}`}>
                      🗓 {daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? 'TOMORROW' : `${daysUntil}d`}
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={e => handleEdit(e, job)}
                      title="Edit"
                    >✎</button>
                    <button
                      className="btn btn-danger btn-sm btn-icon"
                      onClick={e => handleDelete(e, job.id)}
                      title="Delete"
                    >🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <JobModal
          job={editJob}
          onClose={() => { setShowModal(false); setEditJob(null); }}
          onSaved={loadJobs}
        />
      )}
    </div>
  );
}
