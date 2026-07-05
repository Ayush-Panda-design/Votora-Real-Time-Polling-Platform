import notify, { alert } from './notify';

/** @deprecated Use notify.success / notify.error instead */
export const popup = (message, type = 'success') => alert(message, type);

export default popup;
