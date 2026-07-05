import { Outlet } from 'react-router-dom';
import { PremiumBackground } from '../components/ui/PremiumUI';

const PublicLayout = () => (
  <div className="min-h-screen bg-surface relative overflow-hidden text-white">
    <PremiumBackground />
    <main className="relative z-10 min-h-screen flex flex-col">
      <Outlet />
    </main>
  </div>
);

export default PublicLayout;
