import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsApi, STATUS_CONFIG, getInitials, getDaysUntil, formatDate } from '../api';
import JobModal from '../components/JobModal';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const { data } = await jobsApi.getStats();
      setStats(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getStatusCount = (status) =>
    stats?.byStatus?.find(s => s.status === status)?.count || 0;

  const statCards = [
    { label: 'Total Applied', value: stats?.total || 0, icon: '📋', cls: 'blue' },
    { label: 'Interviews', value: getStatusCount('interview'), icon: '🎙️', cls: 'orange' },
    { label: 'Offers', value: getStatusCount('offer'), icon: '🎉', cls: 'green' },
    { label: 'Rejected', value: getStatusCount('rejected'), icon: '✗', cls: 'red' },
    { label: 'No Response', value: getStatusCount('no_response'), icon: '◌', cls: 'purple' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">HERE'S YOUR JOB SEARCH OVERVIEW</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Application
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid">
            {statCards.map(s => (
              <div key={s.label} className={`stat-card ${s.cls}`}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            {/* Recent Applications */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Applications</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/jobs')}>
                  View all →
                </button>
              </div>
              <RecentJobs navigate={navigate} />
            </div>

            {/* Upcoming Interviews — Unique Feature #1 */}
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                🗓️ Upcoming Interviews
              </h2>
              {stats?.upcomingInterviews?.length > 0 ? (
                <div className="interviews-list">
                  {stats.upcomingInterviews.map(item => {
                    const d = new Date(item.interview_date);
                    const days = getDaysUntil(item.interview_date);
                    return (
                      <div
                        key={item.id}
                        className="interview-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/jobs/${item.id}`)}
                      >
                        <div className="interview-date-block">
                          <div className="interview-day">{d.getDate()}</div>
                          <div className="interview-mon">
                            {d.toLocaleString('en', { month: 'short' }).toUpperCase()}
                          </div>
                        </div>
                        <div className="interview-info">
                          <div className="interview-co">{item.company}</div>
                          <div className="interview-pos">{item.position}</div>
                        </div>
                        <div>
                          <span className={`countdown-chip ${days <= 2 ? 'urgent' : ''}`}>
                            {days === 0 ? 'TODAY' : days === 1 ? 'TOMORROW' : `${days}d`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 24px' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  <div style={{ fontSize: 13 }}>No upcoming interviews</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {showModal && (
        <JobModal onClose={() => setShowModal(false)} onSaved={loadStats} />
      )}
    </div>
  );
}

function RecentJobs({ navigate }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi.getAll().then(({ data }) => setJobs(data.slice(0, 6))).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!jobs.length) return (
    <div className="empty-state" style={{ padding: '32px 20px' }}>
      <div className="empty-icon">📋</div>
      <div className="empty-title">No applications yet</div>
      <div className="empty-text">Add your first job application to get started!</div>
    </div>
  );

  return (
    <div className="jobs-grid">
      {jobs.map(job => (
        <div
          key={job.id}
          className={`job-card ${job.status}`}
          onClick={() => navigate(`/jobs/${job.id}`)}
        >
          <div className="job-company-logo">{getInitials(job.company)}</div>
          <div className="job-main">
            <div className="job-company">{job.company}</div>
            <div className="job-position">{job.position}</div>
            {job.location && (
              <div className="job-meta">
                <span className="job-meta-item">📍 {job.location}</span>
                {job.salary_range && <span className="job-meta-item">💰 {job.salary_range}</span>}
              </div>
            )}
          </div>
          <div className="job-right">
            <span className={`badge badge-${job.status}`}>
              {STATUS_CONFIG[job.status]?.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
