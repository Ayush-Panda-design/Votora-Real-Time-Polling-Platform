import { Link } from 'react-router-dom';

const Logo = ({ onClick }) => {
  const content = (
    <>
      <div className="relative w-9 h-9 rounded-xl bg-[#1a1a1a] border border-white/[0.08] flex items-center justify-center shrink-0">
        <span className="text-[16px] font-black text-[#f5f5f5] tracking-[-3px]">
          V
        </span>
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#06b6d4]" />
      </div>
      <h1 className="text-[17px] font-bold tracking-[-0.03em] text-white">
        Vo<span className="bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent">tora</span>
      </h1>
    </>
  );

  if (onClick) {
    return (
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={onClick}>
        {content}
      </div>
    );
  }

  return (
    <Link to="/" className="flex items-center gap-2.5 cursor-pointer">
      {content}
    </Link>
  );
};

export default Logo;
