import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-surface relative overflow-hidden text-white">

      {/*  */}
      <div className="global-bg">
        <div className="global-bg-glow" />
        <div className="global-bg-grid" />
      </div>

      {/* Content layer */}
      <main className="relative z-10 min-h-screen flex flex-col">
        <Outlet />
      </main>

    </div>
  );
};

export default PublicLayout;