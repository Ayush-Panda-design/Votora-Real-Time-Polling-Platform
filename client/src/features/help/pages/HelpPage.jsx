import { motion } from 'framer-motion';
import { 
  FiZap, FiPlusCircle, FiShare2, FiBarChart2, 
  FiLock, FiClock, FiCheckCircle, FiUserCheck, FiTarget, 
  FiTrendingUp, FiLayers, FiAward
} from 'react-icons/fi';

const HelpPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const guides = [
    {
      id: 'creation',
      title: 'How to Make a Poll',
      icon: <FiPlusCircle />,
      color: 'text-cyan-400',
      description: 'Creating a poll is quick and easy. Just follow these steps:',
      details: [
        'Step 1: Give your poll a clear name and a short description.',
        'Step 2: Add your questions. You can make them mandatory so nobody skips them.',
        'Step 3: Choose your Time System (see "Controlling Time" below).',
        'Step 4: Decide if you want it to be a Quiz or a simple opinion poll.',
      ]
    },
    {
      id: 'timing',
      title: 'Controlling the Time',
      icon: <FiClock />,
      color: 'text-purple-400',
      description: 'You have total control over when your poll starts and ends.',
      details: [
        'Auto-Close: Pick a fixed date and time for the poll to shut down by itself.',
        'Manual Timer: Set a duration (e.g. 5 minutes). You start it manually when you are ready.',
        'Live Clock: Everyone sees the same red timer ticking down at the top of their screen.',
        'Auto-Save: If time runs out while someone is typing, their progress is sent automatically.',
      ]
    },
    {
      id: 'management',
      title: 'Manage Your Polls',
      icon: <FiLayers />,
      color: 'text-indigo-400',
      description: 'Your dashboard is your control center for everything.',
      details: [
        'Search & Filter: Find any poll by its name or status (Active, Finished, Published).',
        'Clone Tool: Like a poll you made? Click "Clone" to make an exact copy instantly.',
        'Editing: Fix typos or change settings on your drafts before you share them.',
        'Publishing: Results are private by default. Toggle "Publish" to let others see the final charts.',
      ]
    },
    {
      id: 'quiz',
      title: 'Running a Quiz',
      icon: <FiAward />,
      color: 'text-amber-400',
      description: 'Turn your questions into a test with scores and right answers.',
      details: [
        'Pick the "Correct Answer" for each question during creation.',
        'Scorecard: Respondents see their score (e.g. 8/10) right after they finish.',
        'Identity: Quizzes require people to sign in so we can track their scores correctly.',
      ]
    },
    {
      id: 'anticheat',
      title: 'Anti-Cheat Protection',
      icon: <FiLock />,
      color: 'text-rose-400',
      description: 'Keep your quizzes fair and honest.',
      details: [
        'Smart Tracking: If someone leaves the tab to search for answers, their quiz ends immediately.',
        'Instant Submission: Their work is automatically sent "as is" the moment they try to cheat.',
        'Disqualification: They will see a notification telling them they were auto-submitted.',
      ]
    },
    {
      id: 'analytics',
      title: 'Viewing Live Results',
      icon: <FiTrendingUp />,
      color: 'text-emerald-400',
      description: 'Watch the opinions roll in as they happen.',
      details: [
        'Live Charts: Watch the bars grow and shrink in real-time as people vote.',
        'Participant Counter: See how many people are looking at the poll right now.',
        'Detailed Breakdown: See exactly which options are the most popular.',
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold mb-6">
          <FiZap className="animate-pulse" /> HELP CENTER
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight text-center">
          Everything you need to <span className="text-cyan-500">master Votora</span>.
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed text-center">
          Votora is a powerful, real-time polling tool designed to be simple for you and fun for your audience.
        </p>
      </motion.div>

      {/**/}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20"
      >
        {guides.map((guide) => (
          <motion.div 
            key={guide.id}
            variants={itemVariants}
            className="group p-8 rounded-3xl bg-[#151515] border border-white/[0.06] hover:border-cyan-500/30 transition-all duration-500"
          >
            <div className={`text-3xl mb-6 ${guide.color} bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
              {guide.icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{guide.title}</h3>
            <p className="text-gray-400 mb-8 font-medium">{guide.description}</p>
            
            <ul className="space-y-4">
              {guide.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <FiCheckCircle className="mt-1 flex-shrink-0 text-cyan-500" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* Uniqueness Section */}
      <div className="bg-cyan-500/5 rounded-[40px] p-10 md:p-20 border border-cyan-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -mr-32 -mt-32" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-3xl font-bold text-white mb-6">Why use Votora?</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We built Votora to bridge the gap between simple polls and complex live testing.
            </p>
          </div>
          
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="text-cyan-400 text-xl font-bold flex items-center gap-2">
                <FiZap /> Real-Time Sync
              </div>
              <p className="text-gray-500 text-sm">When someone votes, everyone sees the results update instantly. No page refreshing required.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-emerald-400 text-xl font-bold flex items-center gap-2">
                <FiUserCheck /> Zero Friction
              </div>
              <p className="text-gray-500 text-sm">People can vote anonymously without creating an account, unless you are running a secure Quiz.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-purple-400 text-xl font-bold flex items-center gap-2">
                <FiTarget /> Cross-Device Experience
              </div>
              <p className="text-gray-500 text-sm">Our polls look stunning on phones, tablets, and desktops, making it easy to vote from anywhere.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-pink-400 text-xl font-bold flex items-center gap-2">
                <FiShare2 /> One-Click Share
              </div>
              <p className="text-gray-500 text-sm">Copy a short link and share it on social media, in meetings, or via email to start collecting votes.</p>
            </div>
          </div>
        </div>
      </div>

      {/*  */}
      <div className="mt-20 text-center text-gray-600 text-sm flex flex-col items-center gap-4">
        <p>© 2026 Votora Polling Platform • All rights reserved</p>
        <div className="flex gap-6 uppercase tracking-widest font-black text-[10px]">
          <span className="text-cyan-500/50 hover:text-cyan-400 cursor-pointer transition">Privacy Policy</span>
          <span className="text-cyan-500/50 hover:text-cyan-400 cursor-pointer transition">Terms of Service</span>
          <span className="text-cyan-500/50 hover:text-cyan-400 cursor-pointer transition">API Docs</span>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
