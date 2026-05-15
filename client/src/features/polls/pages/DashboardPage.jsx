import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  fetchPolls,
  deletePoll,
  publishPoll,
  duplicatePoll,
} from '../pollSlice';

import {
  FiPlus,
  FiSearch,
  FiShare2,
  FiTrash2,
  FiEdit,
  FiEye,
  FiCopy,
  FiBarChart2,
  FiTrendingUp,
  FiActivity,
  FiClock,
  FiGrid,
  FiArrowUpRight,
  FiZap,
} from 'react-icons/fi';

import { motion, AnimatePresence } from 'framer-motion';

import toast from 'react-hot-toast';

import Badge from '../../../components/ui/Badge';
import Tooltip from '../../../components/ui/Tooltip';
import { SkeletonList } from '../../../components/loaders/SkeletonCard';

import {
  formatDate,
  timeUntilExpiry,
} from '../../../utils/formatters';

import {
  buildPollUrl,
  copyToClipboard,
} from '../../../utils/helpers';

const DashboardPage = () => {
  const dispatch = useDispatch();

  const { polls, loading } = useSelector((s) => s.polls);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchPolls());
  }, [dispatch]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Delete this poll permanently?'
    );

    if (!confirmDelete) return;

    await dispatch(deletePoll(id));

    toast.success('Poll deleted');
  };

  const handlePublish = async (id) => {
    const res = await dispatch(publishPoll(id));

    if (publishPoll.fulfilled.match(res)) {
      toast.success('Results published');
    } else {
      toast.error('Failed to publish');
    }
  };

  const handleDuplicate = async (id) => {
    const res = await dispatch(duplicatePoll(id));

    if (duplicatePoll.fulfilled.match(res)) {
      toast.success('Poll duplicated');
    } else {
      toast.error('Failed to duplicate');
    }
  };

  const handleShare = async (pollCode) => {
    const url = buildPollUrl(pollCode);

    const copied = await copyToClipboard(url);

    toast.success(copied ? 'Share link copied' : url);
  };

  const filteredPolls = useMemo(() => {
    return polls.filter((poll) => {
      const matchesSearch = poll.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'active'
          ? poll.status === 'active'
          : filter === 'expired'
          ? poll.status === 'expired'
          : filter === 'published'
          ? poll.isPublished
          : true;

      return matchesSearch && matchesFilter;
    });
  }, [polls, searchTerm, filter]);

  const stats = [
    {
      label: 'Total Polls',
      value: polls.length,
      icon: <FiGrid />,
      color: 'from-cyan-500/20 to-cyan-500/5',
      iconColor: 'text-cyan-400',
    },
    {
      label: 'Active Polls',
      value: polls.filter((p) => p.status === 'active').length,
      icon: <FiActivity />,
      color: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Responses',
      value: polls.reduce(
        (sum, poll) => sum + (poll.totalResponses || 0),
        0
      ),
      icon: <FiTrendingUp />,
      color: 'from-blue-500/20 to-blue-500/5',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Published',
      value: polls.filter((p) => p.isPublished).length,
      icon: <FiEye />,
      color: 'from-amber-500/20 to-amber-500/5',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-[32px] border border-white/[0.06] bg-[#151515] p-7 md:p-10 mb-8">
        <div className="absolute top-0 right-0 w-[320px] h-[320px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-[#1c1c1c] mb-5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

              <span className="text-[11px] uppercase tracking-[0.2em] text-[#808080] font-semibold">
                Poll Analytics Workspace
              </span>
            </div>

            <h1 className="text-[38px] sm:text-[48px] font-bold tracking-[-0.04em] leading-none text-[#f5f5f5]">
              Manage your
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                realtime polls
              </span>
            </h1>

            <p className="text-[#6d6d6d] text-[15px] leading-relaxed max-w-2xl mt-5">
              Create, publish, duplicate, monitor, and analyze
              audience engagement with a modern realtime polling
              dashboard built for scale.
            </p>

      
          
          </div>

          {/* RIGHT */}
          <div className="w-full xl:w-auto">
            <Tooltip
              text="Create a new poll"
              position="bottom"
            >
              <Link
                to="/polls/create"
                className="group flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 text-white font-semibold shadow-[0_20px_60px_rgba(6,182,212,0.25)]"
              >
                <FiPlus className="text-[18px]" />

                <span>Create Poll</span>

                <FiArrowUpRight className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -3 }}
            className={`relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br ${stat.color} p-6`}
          >
            <div className="flex items-start justify-between mb-10">
              <div>
                <p className="text-[12px] uppercase tracking-[0.18em] text-[#737373] font-semibold mb-2">
                  {stat.label}
                </p>

                <h3 className="text-4xl font-bold text-[#f5f5f5] tracking-tight">
                  {stat.value}
                </h3>
              </div>

              <div
                className={`w-12 h-12 rounded-2xl bg-[#1b1b1b] border border-white/[0.06] flex items-center justify-center ${stat.iconColor}`}
              >
                {stat.icon}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[13px] text-[#7b7b7b]">
              <FiTrendingUp />

              <span>Live dashboard metrics</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="rounded-[28px] border border-white/[0.06] bg-[#151515] p-5 mb-8">
        <div className="flex flex-col xl:flex-row xl:items-center gap-5">
          {/* SEARCH */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5f5f5f]" />

            <input
              type="text"
              placeholder="Search polls by title..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full h-[54px] pl-12 pr-5 rounded-2xl bg-[#1a1a1a] border border-white/[0.06] text-[#f5f5f5] placeholder:text-[#5b5b5b] outline-none focus:border-cyan-500/40 transition-all"
            />
          </div>

          {/* FILTERS */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              'all',
              'active',
              'expired',
              'published',
            ].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-5 h-[50px] rounded-2xl text-[13px] font-semibold capitalize transition-all whitespace-nowrap border ${
                  filter === item
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    : 'bg-[#1a1a1a] border-white/[0.06] text-[#707070] hover:text-white hover:border-white/[0.14]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <SkeletonList count={4} />
      ) : filteredPolls.length === 0 ? (
        <div className="rounded-[32px] border border-white/[0.06] bg-[#151515] py-24 px-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-3xl mx-auto mb-6">
            <FiZap />
          </div>

          <h2 className="text-3xl font-bold text-[#f5f5f5] mb-3">
            No polls found
          </h2>

          <p className="text-[#6d6d6d] text-[15px] max-w-md mx-auto leading-relaxed mb-8">
            Create your first realtime poll and start
            collecting audience engagement instantly.
          </p>

          <Link
            to="/polls/create"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition text-white font-semibold"
          >
            <FiPlus />

            <span>Create Poll</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <AnimatePresence>
            {filteredPolls.map((poll, index) => {
              const expired =
                poll.expiresAt &&
                new Date(poll.expiresAt) < new Date();

              return (
                <motion.div
                  key={poll._id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: index * 0.04 }}
                  className="group relative overflow-hidden rounded-[30px] border border-white/[0.06] bg-[#151515] hover:border-white/[0.12] transition-all"
                >
                  <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-b from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="p-6">
                    <div className="flex flex-col 2xl:flex-row 2xl:items-center gap-6">
                      {/* LEFT */}
                      <div className="flex-1 min-w-0">
                        {/* TITLE */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <h3 className="text-[22px] font-bold tracking-tight text-[#f5f5f5]">
                            {poll.title}
                          </h3>

                          <Badge
                            status={
                              expired
                                ? 'expired'
                                : poll.status
                            }
                          />

                          {poll.isQuiz && (
                            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-semibold uppercase tracking-wider">
                              Quiz
                            </span>
                          )}

                          {poll.isPublished && (
                            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold uppercase tracking-wider">
                              Published
                            </span>
                          )}
                        </div>

                        {/* META */}
                        <div className="flex flex-wrap items-center gap-5 text-[13px] text-[#707070]">
                          <div className="flex items-center gap-2">
                            <FiGrid />

                            <span>
                              {poll.questions?.length || 0}{' '}
                              Questions
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-emerald-400">
                            <FiTrendingUp />

                            <span>
                              {poll.totalResponses || 0}{' '}
                              Responses
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <FiClock />

                            <span>
                              {formatDate(poll.createdAt)}
                            </span>
                          </div>

                          {poll.expiresAt && (
                            <div
                              className={`flex items-center gap-2 ${
                                timeUntilExpiry(
                                  poll.expiresAt
                                ) === 'Expired'
                                  ? 'text-red-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              <FiClock />

                              <span>
                                {timeUntilExpiry(
                                  poll.expiresAt
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="w-full 2xl:w-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                          <Tooltip
                            text="Copy share link"
                            position="top"
                          >
                            <button
                              onClick={() =>
                                handleShare(poll.pollCode)
                              }
                              className="h-[52px] px-4 rounded-2xl border border-white/[0.06] bg-[#1b1b1b] hover:bg-[#222] transition-all flex items-center justify-center gap-2 text-[#b3b3b3] hover:text-white"
                            >
                              <FiShare2 />

                              <span className="text-[13px] font-medium">
                                Share
                              </span>
                            </button>
                          </Tooltip>

                          <Tooltip
                            text="Duplicate poll"
                            position="top"
                          >
                            <button
                              onClick={() =>
                                handleDuplicate(poll._id)
                              }
                              className="h-[52px] px-4 rounded-2xl border border-white/[0.06] bg-[#1b1b1b] hover:bg-[#222] transition-all flex items-center justify-center gap-2 text-[#b3b3b3] hover:text-white"
                            >
                              <FiCopy />

                              <span className="text-[13px] font-medium">
                                Clone
                              </span>
                            </button>
                          </Tooltip>

                          <Tooltip
                            text="View analytics"
                            position="top"
                          >
                            <Link
                              to={`/polls/${poll._id}/analytics`}
                              className="h-[52px] px-4 rounded-2xl border border-white/[0.06] bg-[#1b1b1b] hover:bg-[#222] transition-all flex items-center justify-center gap-2 text-[#b3b3b3] hover:text-white"
                            >
                              <FiBarChart2 />

                              <span className="text-[13px] font-medium">
                                Analytics
                              </span>
                            </Link>
                          </Tooltip>

                          <Tooltip
                            text="Edit poll"
                            position="top"
                          >
                            <Link
                              to={`/polls/${poll._id}/edit`}
                              className="h-[52px] px-4 rounded-2xl border border-white/[0.06] bg-[#1b1b1b] hover:bg-[#222] transition-all flex items-center justify-center gap-2 text-[#b3b3b3] hover:text-white"
                            >
                              <FiEdit />

                              <span className="text-[13px] font-medium">
                                Edit
                              </span>
                            </Link>
                          </Tooltip>

                          {!poll.isPublished &&
                            poll.totalResponses > 0 && (
                              <Tooltip
                                text="Publish results"
                                position="top"
                              >
                                <button
                                  onClick={() =>
                                    handlePublish(poll._id)
                                  }
                                  className="h-[52px] px-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 text-amber-400"
                                >
                                  <FiEye />

                                  <span className="text-[13px] font-medium">
                                    Publish
                                  </span>
                                </button>
                              </Tooltip>
                            )}

                          <Tooltip
                            text="Delete poll"
                            position="top"
                          >
                            <button
                              onClick={() =>
                                handleDelete(poll._id)
                              }
                              className="h-[52px] px-4 rounded-2xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 text-red-400"
                            >
                              <FiTrash2 />

                              <span className="text-[13px] font-medium">
                                Delete
                              </span>
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;