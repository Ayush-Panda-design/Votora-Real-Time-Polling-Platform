import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import api from '../../../services/api';
import { CHART_COLORS } from '../../../utils/helpers';
import Spinner from '../../../components/ui/Spinner';
import Logo from '../../../components/ui/Logo';

const PublicResultsPage = () => {
  const { pollCode } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/polls/public/results/${pollCode}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Results not available');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pollCode]);

  if (loading)
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="card text-center max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Results Not Available
          </h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );

  const { poll, analytics } = data;

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      <div className="global-bg">
        <div className="global-bg-glow" />
        <div className="global-bg-grid" />
      </div>

      {/* Header */}
      <header className="border-b border-surface-border py-4 px-6 relative z-10">
        <div className="max-w-3xl mx-auto flex items-center">
          <Logo />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* Title */}
          <div className="text-center mb-10">
            <span className="inline-block text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              ★ Results Published
            </span>

            <h1 className="text-3xl font-bold text-white mb-2">
              {poll.title}
            </h1>

            {poll.description && (
              <p className="text-gray-400 mb-3">{poll.description}</p>
            )}

            <p className="text-sm text-gray-500">
              {analytics?.totalResponses ?? 0} total responses
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {analytics?.questionStats?.map((qs, i) => {
              const chartData = Object.entries(qs.optionCounts || {}).map(
                ([name, value]) => ({ name, value })
              );

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card"
                >
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Question {i + 1}
                  </p>

                  <h3 className="text-lg font-semibold text-white mb-4">
                    {qs.questionText}
                  </h3>

                  {/* Chart */}
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} margin={{ left: -10 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#1a1a1a',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 10,
                          color: '#fff',
                        }}
                      />

                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((_, ci) => (
                          <Cell
                            key={ci}
                            fill={CHART_COLORS[ci % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Breakdown */}
                  <div className="mt-4 space-y-2">
                    {Object.entries(qs.optionCounts || {}).map(
                      ([opt, count], oi) => (
                        <div key={oi} className="flex items-center gap-3">
                          <span className="text-sm text-gray-300 w-28 truncate">
                            {opt}
                          </span>

                          <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${qs.optionPercentages?.[opt] ?? 0}%`,
                                background:
                                  CHART_COLORS[oi % CHART_COLORS.length],
                              }}
                            />
                          </div>

                          <span className="text-sm text-white w-10 text-right">
                            {qs.optionPercentages?.[opt] ?? 0}%
                          </span>

                          <span className="text-xs text-gray-500 w-6 text-right">
                            {count}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PublicResultsPage;