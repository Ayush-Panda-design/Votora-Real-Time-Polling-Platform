import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiRefreshCw, FiMonitor, FiShare2, FiDownload, FiClock, FiFileText } from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';
import api from '../../../services/api';
import usePollSocket, { emitStartTimer } from '../../../hooks/usePollSocket';
import { CHART_COLORS, buildPollUrl, copyToClipboard } from '../../../utils/helpers';
import Spinner from '../../../components/ui/Spinner';
import Modal from '../../../components/ui/Modal';
import SectionGuide from '../../../components/ui/SectionGuide';
import notify from '../../../utils/notify';

const AnalyticsPage = () => {
  const { id } = useParams();
  const [data, setData]         = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [participants, setParticipants] = useState(0);
  const [selectedResponse, setSelectedResponse] = useState(null);

  // Timer states
  const [activeTimerEnd, setActiveTimerEnd] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const refreshResponses = useCallback(async () => {
    try {
      const responsesRes = await api.get(`/responses/${id}`);
      setResponses(responsesRes.data.responses);
    } catch { /* ignore */ }
  }, [id]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const analyticsRes = await api.get(`/analytics/${id}`);
      setData(analyticsRes.data);

      try {
        const responsesRes = await api.get(`/responses/${id}`);
        setResponses(responsesRes.data.responses ?? []);
      } catch {
        setResponses([]);
      }

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
    } catch {
      setError('Failed to load analytics');
      notify.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [id]);

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
    notify.success('Data exported as CSV!');
  };

  const handleExportPDF = () => {
    if (!data || !data.stats) return;
    const { poll, stats } = data;
    const win = window.open('', '_blank');
    if (!win) {
      notify.error('Allow pop-ups to export PDF');
      return;
    }
    const rows = (stats.questionStats || []).map((qs, i) => {
      const opts = Object.entries(qs.optionCounts || {})
        .map(([opt, count]) => `<li>${opt}: ${count} (${qs.optionPercentages?.[opt] ?? 0}%)</li>`)
        .join('');
      return `<section><h3>Q${i + 1}: ${qs.questionText}</h3><ul>${opts}</ul></section>`;
    }).join('');
    win.document.write(`<!DOCTYPE html><html><head><title>${poll.title} — Results</title>
      <style>body{font-family:system-ui,sans-serif;padding:2rem;max-width:800px;margin:0 auto}
      h1{margin-bottom:0.25rem}h3{margin:1.5rem 0 0.5rem}ul{margin:0;padding-left:1.25rem}</style></head>
      <body><h1>${poll.title}</h1><p>Poll code: ${poll.pollCode} · ${stats.totalResponses} responses</p>${rows}
      <script>window.onload=()=>{window.print();}</script></body></html>`);
    win.document.close();
    notify.success('Print dialog opened — save as PDF');
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  usePollSocket(id, {
    onAnalyticsUpdate: (updated) => {
      setData((prev) => (prev ? { ...prev, stats: updated } : prev));
    },
    onNewResponse: ({ totalResponses }) => {
      setData((prev) => (prev ? { ...prev, stats: { ...prev.stats, totalResponses } } : prev));
      refreshResponses();
    },
    onParticipantCount: ({ count }) => setParticipants(count),
    onTimerStarted: ({ endTime }) => {
      const end = new Date(endTime);
      if (end > new Date()) setActiveTimerEnd(end);
    },
    onPollExpired: () => notify.warning('Poll has expired', { icon: '⏰' }),
  }, { analytics: true });

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
    emitStartTimer(id);
    notify.success('Timer started!');
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-votora-muted mb-4">{error || 'No analytics data available.'}</p>
        <button type="button" onClick={fetchAnalytics} className="btn-primary">
          Try again
        </button>
        <Link to="/dashboard" className="block mt-4 text-cyan-400 hover:text-cyan-300 text-sm">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const { poll, stats } = data;

  return (
    <div className="max-w-6xl mx-auto">
      <SectionGuide page="analytics" />
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
            <FiDownload /> CSV
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.06] text-[#a3a3a3] hover:text-white hover:bg-white/5 transition font-medium text-[13px] flex-1 md:flex-none justify-center">
            <FiFileText /> PDF
          </button>
          <Link to={`/polls/${id}/present`} className="flex-1 md:flex-none">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.06] text-[#a3a3a3] hover:text-white hover:bg-white/5 transition font-medium text-[13px]">
              <FiMonitor /> Present
            </button>
          </Link>
          <button onClick={async () => { const ok = await copyToClipboard(buildPollUrl(poll.pollCode)); notify.success(ok ? 'Link copied!' : 'Failed'); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.06] text-[#a3a3a3] hover:text-white hover:bg-white/5 transition font-medium text-[13px] flex-1 md:flex-none justify-center">
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
          { label: 'Peak Hour', value: stats?.peakActivity?.count ?? '—', color: 'text-amber-400', icon: '⚡',
            sub: stats?.peakActivity?.time ? new Date(stats.peakActivity.time).toLocaleString() : null },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-[#151515] border border-white/[0.06] rounded-2xl p-5 shadow-lg">
            <p className="text-[#6b6b6b] text-sm font-medium">{s.icon} {s.label}</p>
            <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
            {s.sub && <p className="text-xs text-[#6b6b6b] mt-1 truncate">{s.sub}</p>}
          </motion.div>
        ))}
      </div>

      {stats?.responseTimeline?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">Response activity over time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.responseTimeline} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" tick={{ fill: '#6b6b6b', fontSize: 11 }} tickFormatter={(v) => v.slice(5, 16)} />
              <YAxis tick={{ fill: '#6b6b6b', fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#fff' }} />
              <Line type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

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
                <button
                  key={res._id || idx}
                  type="button"
                  onClick={() => setSelectedResponse(res)}
                  className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex items-center justify-between text-left w-full hover:border-cyan-500/30 transition-colors cursor-pointer"
                >
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
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedResponse}
        onClose={() => setSelectedResponse(null)}
        title={selectedResponse?.respondent?.name || 'Anonymous respondent'}
      >
        {selectedResponse && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <p className="text-xs text-votora-muted">
              Submitted {new Date(selectedResponse.submittedAt).toLocaleString()}
              {selectedResponse.ipAddress && ` · IP ${selectedResponse.ipAddress}`}
            </p>
            {selectedResponse.answers.map((ans, ai) => (
              <div key={ai} className="p-3 rounded-xl bg-white/5 border border-white/[0.06]">
                <p className="text-xs text-cyan-400 font-medium mb-1">Q{ans.questionIndex + 1}</p>
                <p className="text-sm text-white mb-1">{ans.questionText || poll?.questions?.[ans.questionIndex]?.question}</p>
                <p className="text-sm text-votora-muted">
                  {ans.selectedOption || <span className="italic">Skipped</span>}
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AnalyticsPage;

