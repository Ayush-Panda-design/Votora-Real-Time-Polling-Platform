import toast from 'react-hot-toast';
import NoticeToast from '../components/ui/NoticeToast';
import CenteredToast from '../components/ui/CenteredToast';

const DEFAULT_DURATION = {
  success: 4500,
  error: 6500,
  info: 5000,
  warning: 5500,
  blank: 4500,
};

const TOAST_OPTS = {
  position: 'top-center',
  style: { background: 'transparent', boxShadow: 'none', padding: 0 },
};

const show = (message, type = 'success', options = {}) => {
  const duration = options.duration ?? DEFAULT_DURATION[type] ?? 4500;

  return toast.custom(
    (t) => (
      <NoticeToast
        t={t}
        message={message}
        type={type}
        title={options.title}
        duration={duration}
        emoji={options.icon}
      />
    ),
    { ...TOAST_OPTS, duration, ...options }
  );
};

/** Prominent modal-style alert — use for critical confirmations only */
export const alert = (message, type = 'success') => {
  return toast.custom(
    (t) => <CenteredToast t={t} message={message} type={type === 'info' ? 'blank' : type} />,
    { duration: Infinity, position: 'top-center' }
  );
};

const notify = (message, options = {}) => {
  if (typeof message !== 'string') {
    return toast.custom(message, { ...TOAST_OPTS, ...options });
  }
  const type = options.type || 'blank';
  return show(message, type, options);
};

notify.success = (message, options) => show(message, 'success', options);
notify.error = (message, options) => show(message, 'error', options);
notify.info = (message, options) => show(message, 'info', options);
notify.warning = (message, options) => show(message, 'warning', options);
notify.alert = alert;
notify.dismiss = toast.dismiss;
notify.custom = (render, options) => toast.custom(render, { ...TOAST_OPTS, ...options });
notify.promise = toast.promise;

export default notify;
