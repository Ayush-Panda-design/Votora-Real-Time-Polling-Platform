import { forwardRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = forwardRef(({
  label,
  error,
  hint,
  className = '',
  inputClassName = '',
  rightElement,
  ...props
}, ref) => (
  <div className={`flex flex-col gap-1.5 w-full ${className}`}>
    {label && (
      <label className="text-[13px] font-medium text-votora-subtle">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        ref={ref}
        className={`premium-input ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' : ''} ${rightElement ? 'pr-11' : ''} ${inputClassName}`}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
    {error && <p className="text-xs text-red-400">{error}</p>}
    {hint && !error && <p className="text-xs text-votora-muted">{hint}</p>}
  </div>
));

Input.displayName = 'Input';

export const PasswordInput = forwardRef(({ label, error, ...props }, ref) => {
  const [show, setShow] = useState(false);

  return (
    <Input
      ref={ref}
      label={label}
      error={error}
      type={show ? 'text' : 'password'}
      rightElement={(
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-votora-muted hover:text-white transition-colors p-1"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      )}
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

export default Input;
