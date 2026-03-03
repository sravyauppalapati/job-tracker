import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsApi, STATUS_CONFIG, PRIORITY_CONFIG, formatDate, getDaysUntil } from '../api';
import JobModal from '../components/JobModal';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const noteRef = useRef(null);

  useEffect(() => { loadJob(); }, [id]);

  const loadJob = async () => {
    try {
      const { data } = await jobsApi.getOne(id);
      setJob(data);
      setNotes(data.notes || []);
    } catch { navigate('/jobs'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this application?')) return;
    await jobsApi.remove(id);
    navigate('/jobs');
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    setAddingNote(true);
    try {
      const { data } = await jobsApi.addNote(id, noteInput.trim());
      setNotes(n => [data, ...n]);
      setNoteInput('');
    } catch (e) { console.error(e); }
    finally { setAddingNote(false); }
  };

  const handleDeleteNote = async (noteId) => {
    await jobsApi.deleteNote(id, noteId);
    setNotes(n => n.filter(note => note.id !== noteId));
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!job) return null;

  const daysUntil = job.status === 'interview' && job.interview_date
    ? getDaysUntil(job.interview_date) : null;

  const statusCfg = STATUS_CONFIG[job.status];
  const priorityCfg = PRIORITY_CONFIG[job.priority];

  return (
    <div>
      {/* Back */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate('/jobs')}
        style={{ marginBottom: 24 }}
      >
        ← Back to Applications
      </button>

      <div className="detail-grid">
        {/* Main */}
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="detail-header">
              <div className="detail-logo">
                {job.company?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div className="detail-company">{job.company}</div>
                <div className="detail-position">{job.position}</div>
                <div className="detail-badges">
                  <span className={`badge badge-${job.status}`}>{statusCfg?.label}</span>
                  <span className="badge" style={{
                    background: '#ffffff11',
                    color: priorityCfg?.color
                  }}>
                    {job.priority} priority
                  </span>
                  {daysUntil !== null && daysUntil >= 0 && (
                    <span className={`countdown-chip ${daysUntil <= 2 ? 'urgent' : ''}`}>
                      🗓 Interview {daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? 'TOMORROW' : `in ${daysUntil} days`}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(true)}>
                  ✎ Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  🗑 Delete
                </button>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <div className="info-key">Location</div>
                <div className="info-val">{job.location || '—'}</div>
              </div>
              <div className="info-item">
                <div className="info-key">Salary Range</div>
                <div className="info-val">{job.salary_range || '—'}</div>
              </div>
              <div className="info-item">
                <div className="info-key">Applied Date</div>
                <div className="info-val">{formatDate(job.applied_date)}</div>
              </div>
              <div className="info-item">
                <div className="info-key">Interview Date</div>
                <div className="info-val">
                  {job.interview_date ? formatDate(job.interview_date) : '—'}
                </div>
              </div>
              {job.job_url && (
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="info-key">Job URL</div>
                  <div className="info-val">
                    <a
                      href={job.job_url} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}
                    >
                      {job.job_url} ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes — Unique Feature #3 */}
          <div className="card">
            <div className="notes-title">
              📝 Activity Log
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>
                {notes.length} notes
              </span>
            </div>

            <div className="note-input-row">
              <input
                ref={noteRef}
                className="form-input"
                placeholder="Log a note, update, or feedback..."
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddNote}
                disabled={addingNote || !noteInput.trim()}
              >
                {addingNote ? '...' : '+ Log'}
              </button>
            </div>

            {notes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: 13 }}>
                No notes yet. Log your first update above!
              </div>
            ) : (
              <div className="note-list">
                {notes.map(note => (
                  <div key={note.id} className="note-item">
                    <div style={{ color: 'var(--accent)', fontSize: 16, marginTop: 2 }}>◈</div>
                    <div style={{ flex: 1 }}>
                      <div className="note-content">{note.content}</div>
                      <div className="note-time">
                        {new Date(note.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <button
                      className="note-del"
                      onClick={() => handleDeleteNote(note.id)}
                      title="Delete note"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Quick Status Update */}
        <div>
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Quick Status Update</div>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={async () => {
                  await jobsApi.update(id, { ...job, status: key });
                  loadJob();
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 12px', borderRadius: 'var(--radius)',
                  border: `1px solid ${job.status === key ? cfg.color + '55' : 'var(--border-dim)'}`,
                  background: job.status === key ? cfg.bg : 'transparent',
                  color: job.status === key ? cfg.color : 'var(--text-muted)',
                  cursor: 'pointer', marginBottom: 8,
                  fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 500,
                  transition: 'all 0.15s', textAlign: 'left',
                }}
              >
                <span style={{ color: cfg.color }}>●</span>
                {cfg.label}
                {job.status === key && <span style={{ marginLeft: 'auto', fontSize: 11 }}>✓</span>}
              </button>
            ))}
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Timeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <TimelineItem icon="📋" label="Applied" date={job.applied_date} />
              {job.interview_date && (
                <TimelineItem icon="🎙️" label="Interview" date={job.interview_date} />
              )}
              {job.status === 'offer' && (
                <TimelineItem icon="🎉" label="Offer Received" date={job.updated_at} />
              )}
              {job.status === 'rejected' && (
                <TimelineItem icon="✗" label="Rejected" date={job.updated_at} />
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <JobModal
          job={job}
          onClose={() => setShowModal(false)}
          onSaved={loadJob}
        />
      )}
    </div>
  );
}

function TimelineItem({ icon, label, date }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
          {formatDate(date)}
        </div>
      </div>
    </div>
  );
}
