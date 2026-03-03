import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { jobsApi, STATUS_CONFIG } from '../api';

const STATUS_COLORS = {
  applied: '#60a5fa',
  interview: '#f5a623',
  offer: '#4ade80',
  rejected: '#f87171',
  no_response: '#6b6b82',
  withdrawn: '#a78bfa',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--text)'
    }}>
      <div style={{ fontWeight: 700 }}>{payload[0].name}</div>
      <div style={{ color: 'var(--text-muted)' }}>{payload[0].value} applications</div>
    </div>
  );
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi.getStats().then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const pieData = (stats?.byStatus || []).map(s => ({
    name: STATUS_CONFIG[s.status]?.label || s.status,
    value: Number(s.count),
    color: STATUS_COLORS[s.status] || '#888',
  }));

  const barData = (stats?.monthly || []).map(m => ({
    month: new Date(m.month + '-01').toLocaleString('en', { month: 'short' }),
    Applications: Number(m.count),
  }));

  const total = stats?.total || 0;
  const interviews = stats?.byStatus?.find(s => s.status === 'interview')?.count || 0;
  const offers = stats?.byStatus?.find(s => s.status === 'offer')?.count || 0;
  const rejected = stats?.byStatus?.find(s => s.status === 'rejected')?.count || 0;

  const responseRate = total > 0 ? Math.round(((Number(interviews) + Number(offers)) / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((Number(offers) / total) * 100) : 0;
  const rejectionRate = total > 0 ? Math.round((Number(rejected) / total) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">VISUALIZE YOUR JOB SEARCH PIPELINE</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        {[
          { label: 'Response Rate', value: `${responseRate}%`, desc: 'Interview + Offer / Total', color: 'blue' },
          { label: 'Offer Rate', value: `${offerRate}%`, desc: 'Offers / Total', color: 'green' },
          { label: 'Rejection Rate', value: `${rejectionRate}%`, desc: 'Rejections / Total', color: 'red' },
          { label: 'Total Applications', value: total, desc: 'All time', color: 'orange' },
        ].map(m => (
          <div key={m.label} className={`stat-card ${m.color}`}>
            <div className="stat-value">{m.value}</div>
            <div className="stat-label">{m.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', marginTop: 6 }}>
              {m.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="analytics-grid">
        {/* Pie Chart - Status Distribution */}
        <div className="chart-card">
          <div className="chart-title">◉ Status Distribution</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90}
                    paddingAngle={3} dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 8 }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: d.color, display: 'inline-block', flexShrink: 0
                    }} />
                    <span style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                    <span style={{ fontWeight: 700 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No data yet
            </div>
          )}
        </div>

        {/* Bar Chart - Monthly Activity */}
        <div className="chart-card">
          <div className="chart-title">▣ Monthly Applications</div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                <XAxis
                  dataKey="month" tick={{ fill: '#6b6b82', fontSize: 11, fontFamily: 'Space Mono' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b6b82', fontSize: 11, fontFamily: 'Space Mono' }}
                  axisLine={false} tickLine={false} allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 8, fontSize: 12
                  }}
                  itemStyle={{ color: 'var(--text)' }}
                  cursor={{ fill: '#f5a62311' }}
                />
                <Bar dataKey="Applications" fill="#f5a623" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No data for last 6 months
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown Table */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Detailed Breakdown</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Status', 'Count', 'Percentage', 'Progress'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '8px 12px',
                  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.5,
                  textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 400
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = Number(stats?.byStatus?.find(s => s.status === key)?.count || 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <tr key={key} style={{ borderBottom: '1px solid var(--border-dim)' }}>
                  <td style={{ padding: '12px 12px' }}>
                    <span className={`badge badge-${key}`}>{cfg.label}</span>
                  </td>
                  <td style={{ padding: '12px 12px', fontWeight: 700, fontSize: 16 }}>{count}</td>
                  <td style={{ padding: '12px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{pct}%</td>
                  <td style={{ padding: '12px 12px', minWidth: 160 }}>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{
                        background: STATUS_COLORS[key], height: '100%',
                        width: `${pct}%`, borderRadius: 4,
                        transition: 'width 0.8s ease'
                      }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
