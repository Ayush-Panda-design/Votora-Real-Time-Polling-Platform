import toast from 'react-hot-toast';
import CenteredToast from '../components/ui/CenteredToast';

/**
 * Custom centered popup utility
 * @param {string} message 
 * @param {'success'|'error'|'info'|'warning'} type 
 */
export const popup = (message, type = 'success') => {
  toast.custom((t) => (
    <CenteredToast t={t} message={message} type={type} />
  ), {
    duration: Infinity, // Stay until OK is clicked
    position: 'top-center', // We'll center it with CSS or container style
  });
};

export default popup;
