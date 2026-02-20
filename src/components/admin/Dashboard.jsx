import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── CSS ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

  .db-root {
    --bg:        #f0f4ff;
    --surface:   #ffffff;
    --border:    #e4e9f7;
    --text:      #1a1d2e;
    --muted:     #7b82a0;
    --primary:   #6366f1;
    --primary-l: #e0e1ff;
    --green:     #10b981;
    --green-l:   #d1fae5;
    --amber:     #f59e0b;
    --amber-l:   #fef3c7;
    --rose:      #f43f5e;
    --rose-l:    #ffe4e8;
    --blue:      #3b82f6;
    --blue-l:    #dbeafe;
    font-family: 'Outfit', sans-serif;
    color: var(--text);
    background: var(--bg);
    min-height: 100vh;
    padding: 32px 28px;
  }
  .db-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .db-header {
    display: flex; align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 32px; flex-wrap: wrap; gap: 12px;
  }
  .db-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(22px, 3vw, 32px);
    font-weight: 800; color: var(--text); line-height: 1;
  }
  .db-subtitle { font-size: 13px; color: var(--muted); margin-top: 6px; }

  .db-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 20px;
    background: var(--primary-l); color: var(--primary);
    font-size: 12px; font-weight: 600;
  }
  .db-badge-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--primary); animation: pulse 1.8s infinite;
  }

  .db-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px; margin-bottom: 28px;
  }

  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 18px; padding: 20px 18px 16px;
    position: relative; overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    animation: slideUp 0.5s both;
    cursor: default;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(99,102,241,0.13);
  }
  .stat-icon {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 19px; margin-bottom: 14px;
  }
  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 26px; font-weight: 800; line-height: 1; margin-bottom: 4px;
  }
  .stat-label { font-size: 12px; color: var(--muted); font-weight: 400; }

  /* Charts row */
  .db-charts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px; margin-bottom: 28px;
  }
  @media (max-width: 860px) { .db-charts { grid-template-columns: 1fr; } }

  .chart-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 18px; padding: 22px;
    animation: slideUp 0.5s 0.1s both;
  }
  .chart-title {
    font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 18px;
    display: flex; align-items: center; gap: 8px;
  }

  /* Skeleton */
  .skeleton {
    background: linear-gradient(90deg,#e8ecf8 25%,#f4f6fd 50%,#e8ecf8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.3s infinite; border-radius: 8px;
  }

  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
`;

/* ── Constants ── */
const CARD_CONFIG = [
  { key: 'users',       label: 'Total Users',      icon: '👥', iconBg: '#ede9ff', color: '#6366f1' },
  { key: 'courses',     label: 'Total Courses',    icon: '📚', iconBg: '#fef3c7', color: '#f59e0b' },
  { key: 'enrollments', label: 'Enrollments',      icon: '📝', iconBg: '#d1fae5', color: '#10b981' },
  { key: 'videos',      label: 'Total Videos',     icon: '🎬', iconBg: '#dbeafe', color: '#3b82f6' },
  { key: 'notes',       label: 'Notes',            icon: '📄', iconBg: '#ffe4e8', color: '#f43f5e' },
  { key: 'sliders',     label: 'Sliders',          icon: '🖼️', iconBg: '#f3e8ff', color: '#8b5cf6' },
];

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#8b5cf6'];

const fmt = (n) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M'
  : n >= 1_000   ? (n / 1_000).toFixed(1) + 'K'
  : String(n ?? 0);

/* ── Skeleton ── */
const Sk = ({ w = '100%', h = 18, style = {} }) => (
  <div className="skeleton" style={{ width: w, height: h, ...style }} />
);

/* ── Custom Pie Label ── */
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Outfit' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e4e9f7', borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 13 }}>
      <div style={{ fontWeight: 700, color: '#1a1d2e', marginBottom: 2 }}>{payload[0].name}</div>
      <div style={{ color: payload[0].color || '#6366f1', fontWeight: 600 }}>{payload[0].value}</div>
    </div>
  );
};

/* ── Main Dashboard ── */
const Dashboard = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [ts,      setTs]      = useState('');

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      // Support both { success, data: {...} } and flat shapes
      setData(json.data ?? json);
      setTs(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* ── Derived chart data ── */
  const chartData = CARD_CONFIG.map(({ key, label, color }) => ({
    name:  label,
    value: data?.[key] ?? 0,
    color,
  }));

  const pieData  = chartData.filter(d => d.value > 0);
  const barData  = chartData;

  return (
    <div className="db-root">
      <style>{css}</style>

      {/* ── Header ── */}
      <div className="db-header">
        <div>
          <div className="db-title">Overview</div>
          <div className="db-subtitle">
            {ts ? `Last refreshed at ${ts}` : 'Fetching latest data…'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {error && (
            <span style={{ fontSize: 12, color: '#f43f5e', background: '#ffe4e8', padding: '5px 12px', borderRadius: 10 }}>
              ⚠ {error}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            style={{
              padding: '8px 18px', borderRadius: 10,
              background: '#6366f1', color: '#fff', border: 'none',
              font: '600 13px Outfit, sans-serif', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
            }}
          >
            {loading ? '⏳' : '↻'} Refresh
          </button>
          <div className="db-badge">
            <div className="db-badge-dot" /> Live
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="db-stats">
        {CARD_CONFIG.map(({ key, label, icon, iconBg, color }, i) => (
          <div className="stat-card" key={key} style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
            {loading ? (
              <>
                <Sk h={26} w="55%" style={{ marginBottom: 8 }} />
                <Sk h={12} w="70%" />
              </>
            ) : (
              <>
                <div className="stat-value" style={{ color }}>{fmt(data?.[key] ?? 0)}</div>
                <div className="stat-label">{label}</div>
              </>
            )}
            {/* decorative circle */}
            <div style={{ position: 'absolute', top: -28, right: -28, width: 90, height: 90, borderRadius: '50%', background: color, opacity: 0.07, pointerEvents: 'none' }} />
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="db-charts">

        {/* Bar Chart */}
        <div className="chart-card">
          <div className="chart-title">📊 Platform Overview — Bar Chart</div>
          {loading ? (
            <Sk h={220} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e9f7" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#7b82a0', fontFamily: 'Outfit' }}
                  axisLine={false} tickLine={false}
                  interval={0}
                  tickFormatter={v => v.split(' ').pop()} // show last word only (e.g. "Users")
                />
                <YAxis tick={{ fontSize: 10, fill: '#7b82a0', fontFamily: 'Outfit' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0f4ff' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <div className="chart-title">🥧 Distribution — Pie Chart</div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Sk w={220} h={220} style={{ borderRadius: '50%' }} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, color: '#7b82a0', fontFamily: 'Outfit' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Summary Footer ── */}
      {data && !loading && (
        <div style={{
          background: '#fff', border: '1px solid #e4e9f7',
          borderRadius: 18, padding: '18px 22px',
          display: 'flex', gap: 32, flexWrap: 'wrap',
          animation: 'slideUp 0.5s 0.3s both',
        }}>
          {CARD_CONFIG.map(({ key, label, color, icon }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#7b82a0' }}>{icon} {label}:</span>
              <span style={{ fontSize: 13, fontWeight: 700, color }}>{data[key] ?? 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;