import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FiArrowLeft, FiArrowRight, FiX, FiUsers } from 'react-icons/fi';
import api from '../../../services/api';
import { connectSocket } from '../../../socket/socket';
import { SOCKET_EVENTS } from '../../../utils/constants';
import { CHART_COLORS, buildPollUrl } from '../../../utils/helpers';
import Spinner from '../../../components/ui/Spinner';
import Logo from '../../../components/ui/Logo';

const PresentationPage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [poll, setPoll]           = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [current, setCurrent]     = useState(0);
  const [participants, setParticipants] = useState(0);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pollRes, analyticsRes] = await Promise.all([
          api.get(`/polls/${id}`),
          api.get(`/analytics/${id}`),
        ]);
        setPoll(pollRes.data.poll);
        setAnalytics(analyticsRes.data.stats);
      } catch (e) {
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();

    const socket = connectSocket();
    socket.emit(SOCKET_EVENTS.JOIN_POLL, id);
    socket.on(SOCKET_EVENTS.ANALYTICS_UPDATE, (updated) => setAnalytics(updated));
    socket.on(SOCKET_EVENTS.NEW_RESPONSE, () => {});
    socket.on(SOCKET_EVENTS.PARTICIPANT_COUNT, ({ count }) => setParticipants(count));

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_POLL, id);
      socket.off(SOCKET_EVENTS.ANALYTICS_UPDATE);
      socket.off(SOCKET_EVENTS.NEW_RESPONSE);
      socket.off(SOCKET_EVENTS.PARTICIPANT_COUNT);
    };
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Spinner size="lg" /></div>;

  const questions = poll?.questions || [];
  const qs        = analytics?.questionStats?.[current];
  const chartData = qs ? Object.entries(qs.optionCounts || {}).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col overflow-hidden relative">
      <div className="global-bg">
        <div className="global-bg-glow" />
        <div className="global-bg-grid" />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <Logo onClick={() => navigate('/')} />
          <span className="text-[#6b6b6b] text-sm ml-2 border-l border-white/10 pl-4 hidden md:inline">Presentation Mode</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-emerald-400 text-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            {participants} live
          </span>
          <span className="text-[#6b6b6b] text-sm">{current + 1} / {questions.length}</span>
          <button onClick={() => navigate(`/polls/${id}/analytics`)} className="text-[#a3a3a3] hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all">
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Main slide */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-4xl"
          >
            <p className="text-[#3b82f6] text-sm font-semibold uppercase tracking-widest mb-4 text-center">
              Question {current + 1} of {questions.length}
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#f5f5f5] text-center mb-12 leading-tight">
              {questions[current]?.question}
            </h2>

            {chartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ left: -10 }}>
                    <XAxis dataKey="name" tick={{ fill: '#6b6b6b', fontSize: 14 }} />
                    <YAxis tick={{ fill: '#6b6b6b', fontSize: 14 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: '#fff', fontSize: 14 }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((_, ci) => <Cell key={ci} fill={CHART_COLORS[ci % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  {chartData.map((item, ci) => {
                    const total = chartData.reduce((s, d) => s + d.value, 0);
                    const pct   = total > 0 ? Math.round((item.value / total) * 100) : 0;
                    return (
                      <div key={ci} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[ci % CHART_COLORS.length] }} />
                        <span className="text-[#f5f5f5] flex-1 truncate">{item.name}</span>
                        <span className="text-white font-bold">{pct}%</span>
                        <span className="text-[#6b6b6b] text-sm">({item.value})</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">⏳</div>
                <p className="text-[#a3a3a3] text-xl">Waiting for responses...</p>
                <p className="text-[#6b6b6b] mt-2 font-mono">{buildPollUrl(poll?.pollCode)}</p>
              </div>
            )}

            <div className="text-center mt-8 text-[#6b6b6b]">
              {qs?.totalAnswered ?? 0} response{(qs?.totalAnswered ?? 0) !== 1 ? 's' : ''}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-6 py-6 border-t border-white/10 relative z-10">
        <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white font-medium">
          <FiArrowLeft /> Previous
        </button>

        <div className="flex gap-2">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-[#3b82f6] scale-125' : 'bg-white/20 hover:bg-white/40'}`} />
          ))}
        </div>

        <button onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white font-medium">
          Next <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default PresentationPage;
