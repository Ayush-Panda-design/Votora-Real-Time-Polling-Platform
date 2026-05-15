import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-sm font-medium text-[#f5f5f5]">{label}</label>}
    <input 
      ref={ref} 
      className={`
        w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white
        placeholder-[#555] focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/10 transition-all duration-200
        ${error ? 'border-red-500 focus:border-red-500' : ''} 
        ${className}
      `} 
      {...props} 
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
