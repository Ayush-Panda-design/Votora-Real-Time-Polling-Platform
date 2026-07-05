import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchPollById, publishPoll, deletePoll, updatePollInList, clearCurrentPoll } from '../pollSlice';
import usePollSocket from '../../../hooks/usePollSocket';
import { FiArrowLeft, FiBarChart2, FiShare2, FiEdit, FiTrash2, FiMonitor } from 'react-icons/fi';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import { timeUntilExpiry } from '../../../utils/formatters';
import { buildPollUrl, copyToClipboard } from '../../../utils/helpers';
import notify from '../../../utils/notify';
import SectionGuide from '../../../components/ui/SectionGuide';

const PollDetailPage = () => {
  const { id }     = useParams();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { currentPoll: poll, loading, error } = useSelector((s) => s.polls);

  useEffect(() => {
    dispatch(clearCurrentPoll());
    dispatch(fetchPollById(id));
  }, [id, dispatch]);

  usePollSocket(id, {
    onPollStatsUpdate: ({ pollId, ...stats }) => dispatch(updatePollInList({ pollId, ...stats })),
    onNewResponse: ({ totalResponses }) => dispatch(updatePollInList({ pollId: id, totalResponses })),
    onPollExpired: () => dispatch(updatePollInList({ pollId: id, status: 'expired' })),
    onPollPublished: () => dispatch(updatePollInList({ pollId: id, isPublished: true, status: 'published' })),
  });

  if (loading || (poll && poll._id !== id)) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (!poll) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-gray-400 mb-4">{error || 'Poll not found'}</p>
        <Link to="/dashboard" className="text-cyan-400 hover:text-cyan-300">Back to dashboard</Link>
      </div>
    );
  }

  const handleShare   = async () => { const ok = await copyToClipboard(buildPollUrl(poll.pollCode)); notify.success(ok ? 'Link copied!' : buildPollUrl(poll.pollCode)); };
  const handlePublish = async () => { const res = await dispatch(publishPoll(id)); if (publishPoll.fulfilled.match(res)) notify.success('Results published!'); };
  const handleDelete  = async () => { if (!confirm('Delete poll?')) return; await dispatch(deletePoll(id)); navigate('/dashboard'); };

  return (
    <div className="max-w-6xl mx-auto">
      <SectionGuide page="poll-detail" />
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all"><FiArrowLeft size={20} /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#f5f5f5]">{poll.title}</h1>
            <Badge status={poll.status} />
            {poll.isQuiz && <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider">Quiz</span>}
            {poll.isPublished && <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">Published</span>}
          </div>
          {poll.description && <p className="text-[#6b6b6b] text-sm mt-1">{poll.description}</p>}
        </div>
      </div>

      {/*  */}
      <div className="flex gap-3 flex-wrap mb-8">
        <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.06] text-[#a3a3a3] hover:text-white hover:bg-white/5 transition font-medium text-[13px]">
          <FiShare2 /> Share Link
        </button>
        <Link to={`/polls/${id}/analytics`}>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.06] text-[#a3a3a3] hover:text-white hover:bg-white/5 transition font-medium text-[13px]">
            <FiBarChart2 /> Analytics
          </button>
        </Link>
        <Link to={`/polls/${id}/edit`}>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.06] text-[#a3a3a3] hover:text-white hover:bg-white/5 transition font-medium text-[13px]">
            <FiEdit /> Edit
          </button>
        </Link>
        <Link to={`/polls/${id}/present`}>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.06] text-[#a3a3a3] hover:text-white hover:bg-white/5 transition font-medium text-[13px]">
            <FiMonitor /> Present
          </button>
        </Link>
        {!poll.isPublished && poll.totalResponses > 0 && (
          <button onClick={handlePublish} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3b82f6] text-white hover:bg-[#2563eb] transition font-medium text-[13px]">
            Publish Results
          </button>
        )}
        <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition font-medium text-[13px]">
          <FiTrash2 /> Delete
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Responses', value: poll.totalResponses || 0, color: 'text-[#3b82f6]' },
          { label: 'Questions',       value: poll.questions?.length || 0, color: 'text-cyan-400' },
          { label: 'Poll Code',       value: poll.pollCode, color: 'text-emerald-400' },
          { label: 'Time Left',       value: timeUntilExpiry(poll.expiresAt) || '∞', color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[#151515] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-[#6b6b6b] text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Questions preview */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">Questions</h2>
        <div className="space-y-4">
          {poll.questions?.map((q, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/[0.06]">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="font-medium text-[#f5f5f5]">{i + 1}. {q.question}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${q.required ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/30' : 'bg-[#1a1a1a] text-[#6b6b6b] border-white/[0.06]'}`}>
                  {q.required ? 'Required' : 'Optional'}
                </span>
              </div>
              <div className="space-y-1.5 pl-4">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2 text-sm text-[#a3a3a3]">
                    <div className="w-3.5 h-3.5 rounded-full border border-[#6b6b6b]" />
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PollDetailPage;
