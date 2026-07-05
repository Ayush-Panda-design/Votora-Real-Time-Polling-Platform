import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon,
  fullWidth = false,
  to,
}) => {
  const variants = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    danger:    'btn-danger',
    ghost:     'btn-ghost',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-2',
    md: '',
    lg: 'text-base px-7 py-3.5',
  };

  const classes = [
    variants[variant] || variants.primary,
    sizes[size] || '',
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={classes}
    >
      {content}
    </motion.button>
  );
};

export default Button;
