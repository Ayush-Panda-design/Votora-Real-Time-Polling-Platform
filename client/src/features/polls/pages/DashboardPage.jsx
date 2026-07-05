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
  FiZap,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import notify from '../../../utils/notify';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Tooltip from '../../../components/ui/Tooltip';
import { SkeletonList } from '../../../components/loaders/SkeletonCard';
import {
  PageHero,
  StatCard,
  FilterBar,
  EmptyState,
  ConfirmDialog,
} from '../../../components/ui/PremiumUI';
import { formatDate, timeUntilExpiry } from '../../../utils/formatters';
import { buildPollUrl, copyToClipboard } from '../../../utils/helpers';
import SectionGuide from '../../../components/ui/SectionGuide';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'published', label: 'Published' },
];

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { polls, loading } = useSelector((s) => s.polls);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchPolls());
  }, [dispatch]);

  const filteredPolls = useMemo(() => polls.filter((poll) => {
    const matchesSearch = poll.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'all' ? true
        : filter === 'active' ? poll.status === 'active'
          : filter === 'expired' ? poll.status === 'expired'
            : filter === 'published' ? poll.isPublished
              : true;
    return matchesSearch && matchesFilter;
  }), [polls, searchTerm, filter]);

  const stats = useMemo(() => ({
    total: polls.length,
    active: polls.filter((p) => p.status === 'active').length,
    responses: polls.reduce((sum, p) => sum + (p.totalResponses || 0), 0),
    published: polls.filter((p) => p.isPublished).length,
  }), [polls]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await dispatch(deletePoll(deleteTarget));
    setDeleting(false);
    setDeleteTarget(null);
    notify.success('Poll deleted');
  };

  const handlePublish = async (id) => {
    const res = await dispatch(publishPoll(id));
    notify[ publishPoll.fulfilled.match(res) ? 'success' : 'error' ](
      publishPoll.fulfilled.match(res) ? 'Results published' : 'Failed to publish'
    );
  };

  const handleDuplicate = async (id) => {
    const res = await dispatch(duplicatePoll(id));
    notify[ duplicatePoll.fulfilled.match(res) ? 'success' : 'error' ](
      duplicatePoll.fulfilled.match(res) ? 'Poll duplicated' : 'Failed to duplicate'
    );
  };

  const handleShare = async (pollCode) => {
    const url = buildPollUrl(pollCode);
    const copied = await copyToClipboard(url);
    notify.success(copied ? 'Link copied' : url);
  };

  return (
    <div>
      <SectionGuide page="dashboard" />
      <PageHero
        live
        eyebrow="Poll workspace"
        title="Manage your"
        highlight="real-time polls"
        subtitle="Create, share, and analyze audience engagement — updates sync live across every screen."
        action={(
          <Button to="/polls/create" icon={<FiPlus size={16} />}>
            Create poll
          </Button>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total polls" value={stats.total} icon={<FiGrid size={18} />} accent="cyan" hint="All polls in your workspace" />
        <StatCard label="Active" value={stats.active} icon={<FiActivity size={18} />} accent="emerald" hint="Currently accepting responses" />
        <StatCard label="Responses" value={stats.responses} icon={<FiTrendingUp size={18} />} accent="blue" hint="Total votes collected" />
        <StatCard label="Published" value={stats.published} icon={<FiEye size={18} />} accent="amber" hint="Results shared publicly" />
      </div>

      <FilterBar
        search={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        searchPlaceholder="Search polls by title…"
        filters={FILTER_OPTIONS}
        filter={filter}
        onFilterChange={setFilter}
      />

      {loading ? (
        <SkeletonList count={4} />
      ) : filteredPolls.length === 0 ? (
        <EmptyState
          icon={<FiZap />}
          title={searchTerm || filter !== 'all' ? 'No matching polls' : 'No polls yet'}
          description={
            searchTerm || filter !== 'all'
              ? 'Try adjusting your search or filter to find what you need.'
              : 'Create your first live poll and start collecting responses instantly.'
          }
          actionLabel={!searchTerm && filter === 'all' ? 'Create your first poll' : undefined}
          actionTo={!searchTerm && filter === 'all' ? '/polls/create' : undefined}
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredPolls.map((poll, index) => {
              const expired = poll.expiresAt && new Date(poll.expiresAt) < new Date();

              return (
                <motion.article
                  key={poll._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: index * 0.03 }}
                  className="group relative overflow-hidden rounded-3xl border border-white/[0.07] premium-glass hover:border-white/[0.12] transition-colors"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col 2xl:flex-row 2xl:items-center gap-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Link
                            to={`/polls/${poll._id}`}
                            className="text-lg sm:text-xl font-bold text-white tracking-tight hover:text-cyan-300 transition-colors truncate max-w-full"
                          >
                            {poll.title}
                          </Link>
                          <Badge status={expired ? 'expired' : poll.status} />
                          {poll.isQuiz && <Badge status="quiz" />}
                          {poll.isPublished && <Badge status="published" />}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-votora-muted">
                          <span className="inline-flex items-center gap-1.5">
                            <FiGrid size={13} /> {poll.questions?.length || 0} questions
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-emerald-400">
                            <FiTrendingUp size={13} /> {poll.totalResponses || 0} responses
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <FiClock size={13} /> {formatDate(poll.createdAt)}
                          </span>
                          {poll.expiresAt && (
                            <span className={`inline-flex items-center gap-1.5 ${
                              timeUntilExpiry(poll.expiresAt) === 'Expired' ? 'text-red-400' : 'text-amber-400'
                            }`}>
                              <FiClock size={13} /> {timeUntilExpiry(poll.expiresAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full 2xl:w-auto 2xl:min-w-[520px]">
                        <Tooltip text="Copy share link" position="top">
                          <button type="button" onClick={() => handleShare(poll.pollCode)} className="action-btn">
                            <FiShare2 size={14} /> Share
                          </button>
                        </Tooltip>
                        <Tooltip text="Duplicate poll" position="top">
                          <button type="button" onClick={() => handleDuplicate(poll._id)} className="action-btn">
                            <FiCopy size={14} /> Clone
                          </button>
                        </Tooltip>
                        <Tooltip text="View analytics" position="top">
                          <Link to={`/polls/${poll._id}/analytics`} className="action-btn">
                            <FiBarChart2 size={14} /> Analytics
                          </Link>
                        </Tooltip>
                        <Tooltip text="Edit poll" position="top">
                          <Link to={`/polls/${poll._id}/edit`} className="action-btn">
                            <FiEdit size={14} /> Edit
                          </Link>
                        </Tooltip>
                        {!poll.isPublished && poll.totalResponses > 0 && (
                          <Tooltip text="Publish results" position="top">
                            <button type="button" onClick={() => handlePublish(poll._id)} className="action-btn-warning">
                              <FiEye size={14} /> Publish
                            </button>
                          </Tooltip>
                        )}
                        <Tooltip text="Delete poll" position="top">
                          <button type="button" onClick={() => setDeleteTarget(poll._id)} className="action-btn-danger">
                            <FiTrash2 size={14} /> Delete
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete poll?"
        message="This action is permanent. All responses and analytics for this poll will be removed."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default DashboardPage;
