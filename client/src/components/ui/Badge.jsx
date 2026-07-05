const Badge = ({ status, children }) => {
  const map = {
    active:    'badge-active',
    expired:   'badge-expired',
    draft:     'badge-draft',
    published: 'badge-published',
    quiz:      'badge-quiz',
  };

  const labels = {
    active: 'Active',
    expired: 'Expired',
    draft: 'Draft',
    published: 'Published',
    quiz: 'Quiz',
  };

  if (children) {
    return <span className={map[status] || 'badge bg-white/5 text-votora-subtle border-white/10'}>{children}</span>;
  }

  return (
    <span className={map[status] || 'badge bg-white/5 text-votora-subtle border-white/10'}>
      {labels[status] || status}
    </span>
  );
};

export default Badge;
