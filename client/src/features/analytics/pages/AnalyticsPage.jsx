import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUsers, FiRefreshCw, FiMonitor, FiShare2, FiDownload, FiClock } from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../../../services/api';
import { connectSocket, getSocket } from '../../../socket/socket';
import { SOCKET_EVENTS } from '../../../utils/constants';
import { CHART_COLORS, buildPollUrl, copyToClipboard } from '../../../utils/helpers';
import Spinner from '../../../components/ui/Spinner';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';

const AnalyticsPage = () => {
  const { id } = useParams();
  const [data, setData]         = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [participants, setParticipants] = useState(0);

  // Timer states
  const [activeTimerEnd, setActiveTimerEnd] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, responsesRes] = await Promise.all([
        api.get(`/analytics/${id}`),
        api.get(`/responses/${id}`)
      ]);
      setData(analyticsRes.data);
      setResponses(responsesRes.data.responses);

      if (analyticsRes.data.poll) {
        const p = analyticsRes.data.poll;
        if (p.timeLimitSystem === 'timer' && p.timerEndTime) {
          const end = new Date(p.timerEndTime);
          if (end > new Date()) setActiveTimerEnd(end);
        } else if (p.timeLimitSystem === 'expiry' && p.expiresAt) {
          const end = new Date(p.expiresAt);
          if (end > new Date()) setActiveTimerEnd(end);
        }
      }
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data || !data.stats) return;
    
    const { poll, stats } = data;
    let csv = "Question,Option,Vote Count,Percentage\n";
    
    stats.questionStats.forEach((qs) => {
      Object.entries(qs.optionCounts || {}).forEach(([opt, count]) => {
        const pct = qs.optionPercentages?.[opt] ?? 0;
        csv += `"${qs.questionText}","${opt}",${count},${pct}%\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `poll_results_${poll.pollCode}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data exported as CSV!');
  };

  useEffect(() => {
    fetchAnalytics();

    const socket = connectSocket();
    socket.emit(SOCKET_EVENTS.JOIN_POLL, id);
    socket.emit('subscribe_analytics', id);

    socket.on(SOCKET_EVENTS.ANALYTICS_UPDATE, (updated) => {
      setData((prev) => prev ? { ...prev, stats: updated } : prev);
    });

    socket.on(SOCKET_EVENTS.NEW_RESPONSE, ({ totalResponses }) => {
      setData((prev) => prev ? { ...prev, stats: { ...prev.stats, totalResponses } } : prev);
    });

    socket.on(SOCKET_EVENTS.PARTICIPANT_COUNT, ({ count }) => setParticipants(count));

    socket.on(SOCKET_EVENTS.TIMER_STARTED, ({ endTime }) => {
      const end = new Date(endTime);
      if (end > new Date()) setActiveTimerEnd(end);
    });

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_POLL, id);
      socket.off(SOCKET_EVENTS.ANALYTICS_UPDATE);
      socket.off(SOCKET_EVENTS.NEW_RESPONSE);
      socket.off(SOCKET_EVENTS.PARTICIPANT_COUNT);
      socket.off(SOCKET_EVENTS.TIMER_STARTED);
    };
  }, [id]);

  useEffect(() => {
    if (!activeTimerEnd) return;
    const interval = setInterval(() => {
      const remaining = Math.floor((activeTimerEnd - new Date()) / 1000);
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(null);
        setActiveTimerEnd(null);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimerEnd]);

  const startTimer = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit(SOCKET_EVENTS.START_TIMER, { pollId: id });
      toast.success('Timer started!');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!data)   return <div className="text-center py-20 text-gray-400">No analytics data available.</div>;

  const { poll, stats } = data;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
          <Link to="/dashboard" className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all flex-shrink-0">
            <FiArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[#f5f5f5] truncate">{poll?.title}</h1>
            <p className="text-[#6b6b6b] text-sm mt-0.5">Analytics Dashboard</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          {timeLeft !== null && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono font-bold text-[13px] animate-pulse">
              ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
          {!timeLeft && poll?.timeLimitSystem === 'timer' && (
            <button onClick={startTimer} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition font-medium text-[13px] z-50">
              <FiClock /> Start Timer
            </button>
          )}

          <button onClick={fetchAnalytics} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.06] text-[#a3a3a3] hover:text-white hover:bg-white/5 transition font-medium text-[13px] flex-1 md:flex-none justify-center">
            <FiRefreshCw /> Refresh
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.06] text-[#a3a3a3] hover:text-white hover:bg-white/5 transition font-medium text-[13px] flex-1 md:flex-none justify-center">
            <FiDownload /> Export
          </button>
          <Link to={`/polls/${id}/present`} className="flex-1 md:flex-none">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.06] text-[#a3a3a3] hover:text-white hover:bg-white/5 transition font-medium text-[13px]">
              <FiMonitor /> Present
            </button>
          </Link>
          <button onClick={async () => { const ok = await copyToClipboard(buildPollUrl(poll.pollCode)); toast.success(ok ? 'Link copied!' : 'Failed'); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.06] text-[#a3a3a3] hover:text-white hover:bg-white/5 transition font-medium text-[13px] flex-1 md:flex-none justify-center">
            <FiShare2 /> Share
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Responses', value: stats?.totalResponses ?? 0,          color: 'text-cyan-500', icon: '📊' },
          { label: 'Live Participants', value: participants,                         color: 'text-emerald-400', icon: '🟢' },
          { label: 'Questions',        value: stats?.questionStats?.length ?? 0,   color: 'text-cyan-400', icon: '❓' },
          { label: 'Poll Code',        value: poll?.pollCode ?? '—',              color: 'text-amber-400', icon: '🔑' },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-[#151515] border border-white/[0.06] rounded-2xl p-5 shadow-lg">
            <p className="text-[#6b6b6b] text-sm font-medium">{s.icon} {s.label}</p>
            <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Per-question charts */}
      {stats?.questionStats?.length === 0 && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-16 text-center text-gray-400">
          <p className="text-xl font-bold mb-2 text-[#f5f5f5]">No responses yet</p>
          <p className="text-sm">Share the poll link and watch results appear in real-time.</p>
          <div className="mt-4 text-cyan-500 font-black text-lg tracking-wider">{buildPollUrl(poll?.pollCode)}</div>
        </div>
      )}

      <div className="space-y-6">
        {stats?.questionStats?.map((qs, i) => {
          const chartData = Object.entries(qs.optionCounts || {}).map(([name, value]) => ({ name, value }));
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-6 flex-wrap gap-2">
                <div>
                  <p className="text-xs text-[#6b6b6b] font-semibold uppercase tracking-wide mb-1">Question {i + 1}</p>
                  <h3 className="text-lg font-semibold text-[#f5f5f5]">{qs.questionText}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#6b6b6b]">
                  <span className="text-emerald-400 font-medium">{qs.totalAnswered} answered</span>
                  <span>{qs.skipped} skipped</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar chart */}
                <div>
                  <p className="text-xs text-[#6b6b6b] uppercase tracking-wide mb-3">Vote Count</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: '#6b6b6b', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#6b6b6b', fontSize: 12 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#fff' }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((_, ci) => <Cell key={ci} fill={CHART_COLORS[ci % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie chart */}
                <div>
                  <p className="text-xs text-[#6b6b6b] uppercase tracking-wide mb-3">Distribution</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {chartData.map((_, ci) => <Cell key={ci} fill={CHART_COLORS[ci % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Option breakdown */}
              <div className="mt-6 space-y-2">
                {Object.entries(qs.optionCounts || {}).map(([opt, count], oi) => {
                  const pct = qs.optionPercentages?.[opt] ?? 0;
                  return (
                    <div key={oi} className="flex items-center gap-3">
                      <span className="text-sm text-[#f5f5f5] w-32 truncate">{opt}</span>
                      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 + oi * 0.05 }}
                          className="h-full rounded-full"
                          style={{ background: CHART_COLORS[oi % CHART_COLORS.length] }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-[#f5f5f5] w-10 text-right">{pct}%</span>
                      <span className="text-xs text-[#6b6b6b] w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Respondents Section */}
      <div className="mt-12 mb-6">
        <h2 className="text-xl font-bold text-[#f5f5f5] mb-4">Respondents</h2>
        {responses.length === 0 ? (
          <p className="text-[#6b6b6b]">No responses yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {responses.map((res, idx) => {
              let score = 0;
              if (poll?.isQuiz) {
                res.answers.forEach(ans => {
                  const q = poll.questions[ans.questionIndex];
                  if (q && q.correctOption !== null && q.correctOption !== undefined) {
                    const selectedIdx = q.options.indexOf(ans.selectedOption);
                    if (selectedIdx === q.correctOption) score++;
                  }
                });
              }
              return (
                <div key={idx} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                      {res.respondent?.name ? res.respondent.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-[#f5f5f5]">{res.respondent?.name || 'Anonymous'}</p>
                      <p className="text-xs text-[#6b6b6b]">{new Date(res.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {poll?.isQuiz && (
                    <div className="text-right">
                      <p className="text-sm text-[#6b6b6b]">Score</p>
                      <p className="font-bold text-cyan-500">{score} / {poll.questions.length}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;

