import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiBarChart2, FiActivity, FiSearch, FiRefreshCw,
  FiX, FiMapPin, FiMonitor, FiGlobe, FiMail, FiBriefcase,
  FiCalendar, FiClock, FiShield, FiTrash2, FiChevronRight,
  FiTrendingUp, FiZap, FiLayers, FiEye, FiChevronLeft,
  FiCheck, FiAlertTriangle,
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import api from '../../../services/api';
import notify from '../../../utils/notify';
import Spinner from '../../../components/ui/Spinner';
import { getImageUrl } from '../../../utils/helpers';

/* ─────────── Design tokens ─────────── */
const C = {
  bg: '#0a0a0a',
  surface: '#121212',
  card: '#1a1a1a',
  card2: '#1e1e1e',
  border: 'rgba(255,255,255,0.06)',
  accent: '#06b6d4',
  accentLo: 'rgba(6,182,212,0.10)',
  accentMd: 'rgba(6,182,212,0.22)',
  muted: '#5a5a5a',
  subtle: '#9a9a9a',
  text: '#e5e5e5',
  danger: '#ef4444',
  emerald: '#10b981',
  amber: '#f59e0b',
  purple: '#8b5cf6',
};

/* ─────────── Helpers ─────────── */
const fmt = (d) => d ? new Date(d).toLocaleString() : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';
const fmtRelative = (d) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const UA_ICON = (ua = '') => {
  const u = ua.toLowerCase();
  if (u.includes('mobile') || u.includes('android') || u.includes('iphone')) return '📱';
  if (u.includes('tablet') || u.includes('ipad')) return '📟';
  return '🖥️';
};

const parseUA = (ua = '') => {
  if (!ua) return 'Unknown device';
  const mobile = /mobile|android|iphone/i.test(ua);
  const browser =
    ua.includes('Chrome') ? 'Chrome' :
    ua.includes('Firefox') ? 'Firefox' :
    ua.includes('Safari') ? 'Safari' :
    ua.includes('Edge') ? 'Edge' : 'Browser';
  const os =
    ua.includes('Windows') ? 'Windows' :
    ua.includes('Mac') ? 'macOS' :
    ua.includes('Linux') ? 'Linux' :
    ua.includes('Android') ? 'Android' :
    ua.includes('iPhone') || ua.includes('iOS') ? 'iOS' : 'Unknown OS';
  return `${browser} · ${mobile ? 'Mobile · ' : ''}${os}`;
};

const ACTIVITY_COLOR = {
  page_visit: C.accent,
  login: C.emerald,
  logout: C.subtle,
  poll_created: C.purple,
  poll_responded: C.amber,
  poll_viewed: C.accent,
  session_start: C.emerald,
  session_end: C.subtle,
};

const ACTIVITY_LABEL = {
  page_visit: 'Page Visit',
  login: 'Login',
  logout: 'Logout',
  poll_created: 'Poll Created',
  poll_responded: 'Poll Responded',
  poll_viewed: 'Poll Viewed',
  session_start: 'Session Started',
  session_end: 'Session Ended',
};

/* ─────────── Sub-components ─────────── */
const Pill = ({ label, color = C.accent }) => (
  <span style={{
    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
    background: `${color}18`, color, border: `1px solid ${color}33`,
    textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
  }}>
    {label}
  </span>
);

const StatBox = ({ label, value, icon, color = C.accent, sub }) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.01 }}
    transition={{ duration: 0.15 }}
    style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 18,
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 8,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.10em', fontWeight: 700 }}>{label}</span>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {icon}
      </div>
    </div>
    <span style={{ fontSize: 32, fontWeight: 800, color: C.text, letterSpacing: '-1px', lineHeight: 1 }}>{value ?? '—'}</span>
    {sub && <span style={{ fontSize: 11, color: C.muted }}>{sub}</span>}
  </motion.div>
);

const Avatar = ({ user, size = 40 }) => {
  const initials = user?.name?.[0]?.toUpperCase() || '?';
  return user?.avatar ? (
    <img
      src={getImageUrl(user.avatar)}
      alt={user.name}
      style={{ width: size, height: size, borderRadius: size / 4, objectFit: 'cover', flexShrink: 0 }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: size / 4, background: C.accentLo,
      border: `1px solid ${C.accentMd}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: C.accent, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

/* ─────────── User Detail Slide-over ─────────── */
const UserDetailPanel = ({ userId, onClose }) => {
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState([]);
  const [actPage, setActPage] = useState(1);
  const [actTotal, setActTotal] = useState(0);
  const [actLoading, setActLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setData(res.data.data);
    } catch { notify.error('Failed to load user detail'); }
    finally { setLoading(false); }
  }, [userId]);

  const loadActivity = useCallback(async (page = 1) => {
    setActLoading(true);
    try {
      const res = await api.get(`/admin/users/${userId}/activity?page=${page}&limit=20`);
      setActivity(res.data.activity);
      setActTotal(res.data.total);
      setActPage(page);
    } catch { notify.error('Failed to load activity'); }
    finally { setActLoading(false); }
  }, [userId]);

  useEffect(() => { load(); loadActivity(); }, [load, loadActivity]);

  const handleDelete = async () => {
    if (!confirm(`Delete user "${data?.user?.name}"? This is irreversible.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${userId}`);
      notify.success('User deleted');
      onClose(true);
    } catch (e) {
      notify.error(e.response?.data?.message || 'Delete failed');
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => onClose(false)}
        />
        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          style={{
            position: 'relative', marginLeft: 'auto', width: '100%', maxWidth: 580,
            background: C.surface, borderLeft: `1px solid ${C.border}`,
            display: 'flex', flexDirection: 'column', overflowY: 'auto', zIndex: 1,
          }}
        >
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>User Detail</span>
            <button onClick={() => onClose(false)} style={{ background: 'none', border: 'none', color: C.subtle, cursor: 'pointer', display: 'flex' }}><FiX size={20} /></button>
          </div>

          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Spinner size="lg" />
            </div>
          ) : !data ? null : (
            <>
              {/* Profile hero */}
              <div style={{ padding: '24px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <Avatar user={data.user} size={56} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{data.user.name}</span>
                    <Pill label={data.user.role} color={data.user.role === 'admin' ? C.amber : C.accent} />
                    {!data.user.isEmailVerified && <Pill label="Unverified" color={C.danger} />}
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 12, color: C.subtle, display: 'flex', alignItems: 'center', gap: 5 }}><FiMail size={11} /> {data.user.email}</span>
                    {data.user.occupation && <span style={{ fontSize: 12, color: C.subtle, display: 'flex', alignItems: 'center', gap: 5 }}><FiBriefcase size={11} /> {data.user.occupation}</span>}
                    <span style={{ fontSize: 12, color: C.subtle, display: 'flex', alignItems: 'center', gap: 5 }}><FiCalendar size={11} /> Joined {fmtDate(data.user.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: C.danger, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                >
                  <FiTrash2 size={13} /> {deleting ? '…' : 'Delete'}
                </button>
              </div>

              {/* Quick stats */}
              <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {[
                  { label: 'Polls', value: data.polls.length },
                  { label: 'Responses', value: data.responses.length },
                  { label: 'Logins', value: data.user.totalLogins || 0 },
                  { label: 'Activities', value: data.activityCount },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: 'center', background: C.card, borderRadius: 12, padding: '12px 8px', border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.accent }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                {[
                  { id: 'profile', label: 'Profile & Info' },
                  { id: 'logins', label: `Logins (${data.user.loginHistory?.length || 0})` },
                  { id: 'activity', label: `Activity (${data.activityCount})` },
                  { id: 'polls', label: `Polls (${data.polls.length})` },
                ].map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    flex: 1, padding: '12px 4px', background: 'none', border: 'none',
                    borderBottom: tab === t.id ? `2px solid ${C.accent}` : '2px solid transparent',
                    color: tab === t.id ? C.accent : C.muted, cursor: 'pointer',
                    fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                    transition: 'all .2s', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                {/* PROFILE TAB */}
                {tab === 'profile' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Email', value: data.user.email },
                      { label: 'Auth Method', value: data.user.authProvider === 'google' ? 'Google OAuth' : 'Email & Password' },
                      { label: 'Last Login', value: fmt(data.user.lastLoginAt) },
                      { label: 'Last Session', value: fmtRelative(data.user.lastSessionAt) },
                      { label: 'Total Logins', value: data.user.totalLogins || 0 },
                      { label: 'Registration IP', value: data.user.registrationIP || '—' },
                      {
                        label: 'Registration Location',
                        value: data.user.registrationLocation?.city
                          ? `${data.user.registrationLocation.city}, ${data.user.registrationLocation.country}`
                          : '—'
                      },
                      { label: 'Email Verified', value: data.user.isEmailVerified ? '✅ Yes' : '❌ No' },
                      { label: 'Onboarding', value: data.user.onboardingCompleted ? '✅ Done' : '⏳ Pending' },
                    ].map((row) => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: C.card, borderRadius: 10, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.subtle, textAlign: 'right', maxWidth: '55%', wordBreak: 'break-all' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* LOGINS TAB */}
                {tab === 'logins' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.user.loginHistory?.length === 0 && (
                      <p style={{ color: C.muted, textAlign: 'center', marginTop: 32 }}>No login history yet.</p>
                    )}
                    {[...(data.user.loginHistory || [])].reverse().map((entry, i) => (
                      <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>{UA_ICON(entry.userAgent)}</span>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{parseUA(entry.userAgent)}</div>
                              <div style={{ fontSize: 11, color: C.muted }}>{fmt(entry.loginAt)}</div>
                            </div>
                          </div>
                          <Pill label={entry.authProvider === 'google' ? 'Google' : 'Email'} color={entry.authProvider === 'google' ? C.amber : C.accent} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          <div style={{ background: C.surface, borderRadius: 8, padding: '8px 10px' }}>
                            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>IP Address</div>
                            <div style={{ fontSize: 12, color: C.text, fontWeight: 600, fontFamily: 'monospace', marginTop: 2 }}>{entry.ip || '—'}</div>
                          </div>
                          <div style={{ background: C.surface, borderRadius: 8, padding: '8px 10px' }}>
                            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Location</div>
                            <div style={{ fontSize: 12, color: C.text, fontWeight: 600, marginTop: 2 }}>
                              {entry.location?.city ? `${entry.location.city}, ${entry.location.country}` : '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ACTIVITY TAB */}
                {tab === 'activity' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {actLoading && <div style={{ textAlign: 'center', padding: 20 }}><Spinner /></div>}
                    {!actLoading && activity.length === 0 && (
                      <p style={{ color: C.muted, textAlign: 'center', marginTop: 32 }}>No activity recorded yet.</p>
                    )}
                    {activity.map((evt, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: C.card, borderRadius: 10, border: `1px solid ${C.border}` }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACTIVITY_COLOR[evt.type] || C.accent, marginTop: 5, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{ACTIVITY_LABEL[evt.type] || evt.type}</span>
                            <span style={{ fontSize: 10, color: C.muted, whiteSpace: 'nowrap' }}>{fmtRelative(evt.createdAt)}</span>
                          </div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                            {evt.page && <span>{evt.page} · </span>}
                            {evt.ip && <span style={{ fontFamily: 'monospace' }}>{evt.ip} · </span>}
                            {evt.location?.city && <span><FiMapPin size={9} style={{ verticalAlign: 'middle' }} /> {evt.location.city}, {evt.location.country}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Pagination */}
                    {actTotal > 20 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <button disabled={actPage <= 1} onClick={() => loadActivity(actPage - 1)}
                          style={{ padding: '7px 14px', borderRadius: 9, background: C.card, border: `1px solid ${C.border}`, color: actPage <= 1 ? C.muted : C.text, cursor: actPage <= 1 ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                          <FiChevronLeft size={14} />
                        </button>
                        <span style={{ fontSize: 11, color: C.muted }}>Page {actPage} of {Math.ceil(actTotal / 20)}</span>
                        <button disabled={actPage >= Math.ceil(actTotal / 20)} onClick={() => loadActivity(actPage + 1)}
                          style={{ padding: '7px 14px', borderRadius: 9, background: C.card, border: `1px solid ${C.border}`, color: actPage >= Math.ceil(actTotal / 20) ? C.muted : C.text, cursor: actPage >= Math.ceil(actTotal / 20) ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                          <FiChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* POLLS TAB */}
                {tab === 'polls' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.polls.length === 0 && (
                      <p style={{ color: C.muted, textAlign: 'center', marginTop: 32 }}>No polls created yet.</p>
                    )}
                    {data.polls.map((poll) => (
                      <div key={poll._id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, truncate: true }}>{poll.title}</div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{fmtDate(poll.createdAt)} · {poll.totalResponses} responses</div>
                        </div>
                        <Pill label={poll.status} color={poll.status === 'active' ? C.emerald : C.muted} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* ─────────── Main Admin Dashboard ─────────── */
const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersMeta, setUsersMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [platformActivity, setPlatformActivity] = useState([]);
  const [platformMeta, setPlatformMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const searchTimeout = useRef(null);

  const loadOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const res = await api.get('/admin/overview');
      setOverview(res.data.data);
    } catch { notify.error('Failed to load admin stats'); }
    finally { setLoadingOverview(false); }
  }, []);

  const loadUsers = useCallback(async (page = 1, q = search) => {
    setLoadingUsers(true);
    try {
      const res = await api.get(`/admin/users?page=${page}&limit=20&search=${encodeURIComponent(q)}`);
      setUsers(res.data.users);
      setUsersMeta({ total: res.data.total, page: res.data.page, pages: res.data.pages });
    } catch { notify.error('Failed to load users'); }
    finally { setLoadingUsers(false); }
  }, [search]);

  const loadPlatformActivity = useCallback(async (page = 1) => {
    setLoadingActivity(true);
    try {
      const res = await api.get(`/admin/activity?page=${page}&limit=30`);
      setPlatformActivity(res.data.activity);
      setPlatformMeta({ total: res.data.total, page: res.data.page, pages: res.data.pages });
    } catch { notify.error('Failed to load activity'); }
    finally { setLoadingActivity(false); }
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);
  useEffect(() => { if (tab === 'users') loadUsers(1, ''); }, [tab, loadUsers]);
  useEffect(() => { if (tab === 'activity') loadPlatformActivity(1); }, [tab, loadPlatformActivity]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => loadUsers(1, val), 400);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Inter', 'Sora', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        ::selection { background: rgba(6,182,212,0.25); }
        .admin-tr:hover { background: rgba(255,255,255,0.02) !important; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <FiShield size={18} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>Admin Panel</h1>
              <p style={{ margin: 0, fontSize: 12, color: C.muted, marginTop: 2 }}>Full platform control & analytics</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.border}`, marginBottom: 32 }}>
          {[
            { id: 'overview', label: 'Overview', icon: <FiBarChart2 size={14} /> },
            { id: 'users', label: 'All Users', icon: <FiUsers size={14} /> },
            { id: 'activity', label: 'Activity Feed', icon: <FiActivity size={14} /> },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'none', border: 'none',
              borderBottom: tab === t.id ? `2px solid ${C.accent}` : '2px solid transparent',
              color: tab === t.id ? C.accent : C.muted, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13, fontWeight: 700, transition: 'all .2s', marginBottom: -1,
            }}>
              {t.icon} {t.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingBottom: 8 }}>
            <button onClick={loadOverview} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, color: C.subtle, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
              <FiRefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {/* ══════════════ OVERVIEW TAB ══════════════ */}
        {tab === 'overview' && (
          <div>
            {loadingOverview ? (
              <div style={{ textAlign: 'center', padding: 80 }}><Spinner size="lg" /></div>
            ) : !overview ? null : (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
                  <StatBox label="Total Users" value={overview.totalUsers} icon={<FiUsers size={16} />} color={C.accent} sub="Registered accounts" />
                  <StatBox label="Total Polls" value={overview.totalPolls} icon={<FiBarChart2 size={16} />} color={C.purple} sub="All time" />
                  <StatBox label="Total Responses" value={overview.totalResponses} icon={<FiTrendingUp size={16} />} color={C.emerald} sub="Across all polls" />
                  <StatBox label="Active (24h)" value={overview.activeUsers24h} icon={<FiZap size={16} />} color={C.amber} sub="Users active today" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                  {/* Signups chart */}
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: '22px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16 }}>📈 Signups (last 14 days)</div>
                    {overview.signupsByDay?.length === 0 ? (
                      <p style={{ color: C.muted, textAlign: 'center', padding: 20 }}>No signups yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={overview.signupsByDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                          <YAxis tick={{ fill: C.muted, fontSize: 10 }} allowDecimals={false} />
                          <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: '#fff', fontSize: 12 }} />
                          <Line type="monotone" dataKey="count" stroke={C.accent} strokeWidth={2} dot={{ fill: C.accent, r: 3 }} name="Signups" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Recent signups */}
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: '22px', overflowY: 'auto', maxHeight: 280 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>🆕 Recent Signups</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {overview.recentUsers?.map((u) => (
                        <button key={u._id} onClick={() => { setSelectedUserId(u._id); setTab('users'); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                          <Avatar user={u} size={32} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                            <div style={{ fontSize: 10, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                          </div>
                          <span style={{ fontSize: 10, color: C.muted, whiteSpace: 'nowrap' }}>{fmtRelative(u.createdAt)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent activity feed */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: '22px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>⚡ Recent Platform Activity</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {overview.recentActivity?.length === 0 && (
                      <p style={{ color: C.muted, textAlign: 'center', padding: 20 }}>No activity recorded yet.</p>
                    )}
                    {overview.recentActivity?.map((evt, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACTIVITY_COLOR[evt.type] || C.accent, flexShrink: 0 }} />
                        <Avatar user={evt.userId} size={28} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{evt.userId?.name || 'Unknown'} </span>
                          <span style={{ fontSize: 12, color: C.subtle }}>{ACTIVITY_LABEL[evt.type] || evt.type}</span>
                          {evt.page && <span style={{ fontSize: 11, color: C.muted }}> · {evt.page}</span>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                          {evt.location?.city && (
                            <span style={{ fontSize: 10, color: C.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <FiMapPin size={9} /> {evt.location.city}
                            </span>
                          )}
                          <span style={{ fontSize: 10, color: C.muted }}>{fmtRelative(evt.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ══════════════ USERS TAB ══════════════ */}
        {tab === 'users' && (
          <div>
            {/* Search */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted }} size={15} />
                <input
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search users by name or email…"
                  style={{ width: '100%', height: 44, paddingLeft: 42, paddingRight: 16, borderRadius: 12, background: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = C.accentMd}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
              <div style={{ fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>{usersMeta.total} total users</div>
            </div>

            {loadingUsers ? (
              <div style={{ textAlign: 'center', padding: 60 }}><Spinner size="lg" /></div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Table */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: C.surface }}>
                        {['User', 'Email', 'Role', 'Joined', 'Last Login', 'Logins', 'Polls', 'Location', 'IP', ''].map((h) => (
                          <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const lastLogin = u.loginHistory?.[u.loginHistory.length - 1];
                        return (
                          <tr key={u._id} className="admin-tr" style={{ borderBottom: `1px solid ${C.border}`, transition: 'background .15s', cursor: 'pointer' }} onClick={() => setSelectedUserId(u._id)}>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Avatar user={u} size={34} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap' }}>{u.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', fontSize: 12, color: C.subtle, maxWidth: 180 }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{u.email}</span>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <Pill label={u.role} color={u.role === 'admin' ? C.amber : C.accent} />
                            </td>
                            <td style={{ padding: '12px 14px', fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{fmtDate(u.createdAt)}</td>
                            <td style={{ padding: '12px 14px', fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{fmtRelative(u.lastLoginAt)}</td>
                            <td style={{ padding: '12px 14px', fontSize: 12, color: C.subtle, textAlign: 'center' }}>{u.totalLogins || 0}</td>
                            <td style={{ padding: '12px 14px', fontSize: 12, color: C.subtle, textAlign: 'center' }}>{u.pollsCreated || 0}</td>
                            <td style={{ padding: '12px 14px', fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>
                              {lastLogin?.location?.city
                                ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={10} /> {lastLogin.location.city}, {lastLogin.location.countryCode}</span>
                                : u.registrationLocation?.city
                                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={10} /> {u.registrationLocation.city}, {u.registrationLocation.countryCode}</span>
                                  : '—'}
                            </td>
                            <td style={{ padding: '12px 14px', fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>
                              {lastLogin?.ip || u.registrationIP || '—'}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <button onClick={(e) => { e.stopPropagation(); setSelectedUserId(u._id); }}
                                style={{ padding: '6px 12px', borderRadius: 8, background: C.accentLo, border: `1px solid ${C.accentMd}`, color: C.accent, cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
                                <FiEye size={11} /> View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={10} style={{ textAlign: 'center', padding: 40, color: C.muted, fontSize: 13 }}>No users found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {usersMeta.pages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                    <button disabled={usersMeta.page <= 1} onClick={() => loadUsers(usersMeta.page - 1)}
                      style={{ padding: '8px 16px', borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, color: usersMeta.page <= 1 ? C.muted : C.text, cursor: usersMeta.page <= 1 ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiChevronLeft size={14} /> Previous
                    </button>
                    <span style={{ fontSize: 12, color: C.muted }}>Page {usersMeta.page} of {usersMeta.pages}</span>
                    <button disabled={usersMeta.page >= usersMeta.pages} onClick={() => loadUsers(usersMeta.page + 1)}
                      style={{ padding: '8px 16px', borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, color: usersMeta.page >= usersMeta.pages ? C.muted : C.text, cursor: usersMeta.page >= usersMeta.pages ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                      Next <FiChevronRight size={14} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* ══════════════ ACTIVITY TAB ══════════════ */}
        {tab === 'activity' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: C.muted }}>{platformMeta.total} total events</div>
            </div>

            {loadingActivity ? (
              <div style={{ textAlign: 'center', padding: 60 }}><Spinner size="lg" /></div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden' }}>
                  {platformActivity.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>No activity recorded yet.</div>
                  )}
                  {platformActivity.map((evt, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
                      borderBottom: i < platformActivity.length - 1 ? `1px solid ${C.border}` : 'none',
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: ACTIVITY_COLOR[evt.type] || C.accent, flexShrink: 0 }} />
                      <Avatar user={evt.userId} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13 }}>
                          <span style={{ fontWeight: 700, color: C.text }}>{evt.userId?.name || 'Unknown'}</span>
                          <span style={{ color: C.subtle }}> — {ACTIVITY_LABEL[evt.type] || evt.type}</span>
                          {evt.page && <span style={{ color: C.muted }}> · {evt.page}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
                          <span style={{ fontSize: 11, color: C.muted }}>{evt.userId?.email}</span>
                          {evt.ip && <span style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>{evt.ip}</span>}
                          {evt.location?.city && (
                            <span style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <FiMapPin size={9} /> {evt.location.city}, {evt.location.country}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <Pill label={evt.type.replace('_', ' ')} color={ACTIVITY_COLOR[evt.type] || C.accent} />
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{fmtRelative(evt.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {platformMeta.pages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                    <button disabled={platformMeta.page <= 1} onClick={() => loadPlatformActivity(platformMeta.page - 1)}
                      style={{ padding: '8px 16px', borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, color: C.text, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiChevronLeft size={14} /> Previous
                    </button>
                    <span style={{ fontSize: 12, color: C.muted }}>Page {platformMeta.page} of {platformMeta.pages}</span>
                    <button disabled={platformMeta.page >= platformMeta.pages} onClick={() => loadPlatformActivity(platformMeta.page + 1)}
                      style={{ padding: '8px 16px', borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, color: C.text, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                      Next <FiChevronRight size={14} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* User Detail Slide-over */}
      {selectedUserId && (
        <UserDetailPanel
          userId={selectedUserId}
          onClose={(reload) => {
            setSelectedUserId(null);
            if (reload) loadUsers(usersMeta.page);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
