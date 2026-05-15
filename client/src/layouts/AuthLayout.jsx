import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => (
  <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
    {/*  */}
    <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 w-full max-w-md"
    >
      <Outlet />
    </motion.div>
  </div>
);

export default AuthLayout;
