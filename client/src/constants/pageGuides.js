import {
  FiSearch, FiShare2, FiCopy, FiEye, FiPlusCircle, FiClock,
  FiShield, FiBarChart2, FiMonitor, FiUser, FiLock, FiZap,
  FiChevronUp, FiChevronDown, FiAward, FiGrid, FiEdit, FiTarget,
  FiDownload, FiRefreshCw, FiCheckCircle, FiLayers, FiTrendingUp,
} from 'react-icons/fi';

/** @typedef {{ id: string, icon: import('react').ComponentType, accent: string, title: string, summary: string, steps: string[], tip?: string }} GuideCard */

/** @type {Record<string, { label: string, title: string, subtitle: string, cards: GuideCard[] }>} */
export const PAGE_GUIDES = {
  dashboard: {
    label: 'Dashboard',
    title: 'Master your poll workspace',
    subtitle: 'Everything you need to find, share, and manage polls — no guessing required.',
    cards: [
      {
        id: 'find',
        icon: FiSearch,
        accent: 'cyan',
        title: 'Find polls instantly',
        summary: 'Search and filter so you never scroll through a long list.',
        steps: [
          'Type any part of a poll title in the search bar — matches update live.',
          'Use filters: All, Active (accepting votes), Expired, or Published (results public).',
          'Click a poll title to open its detail page with share link and actions.',
        ],
        tip: 'Combine search + filter to narrow down large workspaces in seconds.',
      },
      {
        id: 'share',
        icon: FiShare2,
        accent: 'emerald',
        title: 'Share and collect responses',
        summary: 'One link is all your audience needs.',
        steps: [
          'Click the Share icon on any poll card to copy the public link.',
          'Send the link via chat, email, or QR — voters need no account (unless you require login).',
          'Watch the response count on each card update in real time.',
        ],
        tip: 'Share only after reviewing settings — quiz mode and timers affect the voter experience.',
      },
      {
        id: 'manage',
        icon: FiLayers,
        accent: 'blue',
        title: 'Manage poll lifecycle',
        summary: 'Edit, duplicate, publish, or delete without starting over.',
        steps: [
          'Edit — fix typos or change questions before sharing widely.',
          'Clone — duplicate a poll with all questions for a new session.',
          'Publish (eye icon) — make results visible on the public results page.',
          'Delete — permanently remove a poll (cannot be undone).',
        ],
      },
      {
        id: 'stats',
        icon: FiBarChart2,
        accent: 'amber',
        title: 'Jump to analytics',
        summary: 'See live charts and export data from any poll.',
        steps: [
          'Open a poll and click Analytics, or use the chart icon on the dashboard card.',
          'Charts update automatically as votes arrive — no refresh needed.',
          'Use Present mode for full-screen sharing in meetings.',
        ],
      },
    ],
  },

  create: {
    label: 'Create poll',
    title: 'Build your poll step by step',
    subtitle: 'Follow the three steps below — each section explains what to configure and why.',
    cards: [
      {
        id: 'step1',
        icon: FiZap,
        accent: 'cyan',
        title: 'Step 1 — Poll details',
        summary: 'Name your poll and choose how time limits work.',
        steps: [
          'Give a clear title — voters see this at the top of the poll.',
          'Add an optional description for context (e.g. meeting name, class).',
          'Time system: None (open until you close), Auto expiry (fixed date/time), or Manual timer (you start it from Analytics).',
        ],
        tip: 'Manual timer keeps voters in a waiting room until you click Start Timer in Analytics.',
      },
      {
        id: 'step2',
        icon: FiPlusCircle,
        accent: 'purple',
        title: 'Step 2 — Questions',
        summary: 'Add questions, options, and mark correct answers for quizzes.',
        steps: [
          'Each question needs text and at least 2 options.',
          'Toggle Mandatory / Optional per question — mandatory ones block submission if skipped.',
          'Use ↑ ↓ arrows to reorder questions before publishing.',
          'Quiz mode: click the correct option to mark the right answer.',
        ],
      },
      {
        id: 'step3',
        icon: FiShield,
        accent: 'rose',
        title: 'Step 3 — Security & access',
        summary: 'Control who can vote and how fair your quiz stays.',
        steps: [
          'Anonymous — voters don\'t need to sign in (not available for quizzes).',
          'Require login — only authenticated users can respond.',
          'Access PIN — optional code voters must enter before seeing questions.',
          'Anti-cheat — auto-submits the quiz if someone leaves the tab (quiz mode only).',
        ],
        tip: 'Higher security score = more restrictions enabled. Balance openness vs. control.',
      },
    ],
  },

  edit: {
    label: 'Edit poll',
    title: 'Update an existing poll',
    subtitle: 'Change settings before or after sharing — know what you can still edit.',
    cards: [
      {
        id: 'edit-basics',
        icon: FiEdit,
        accent: 'cyan',
        title: 'What you can change',
        summary: 'Title, description, questions, options, and time settings.',
        steps: [
          'Edit question text and add/remove options with the + and trash icons.',
          'Reorder questions using the up/down arrows next to each question.',
          'Switch time system between None, Auto expiry, and Manual timer.',
        ],
        tip: 'If responses already exist, changing options may affect how past answers display in analytics.',
      },
      {
        id: 'edit-settings',
        icon: FiShield,
        accent: 'amber',
        title: 'Settings toggles',
        summary: 'Anonymous, quiz mode, anti-cheat, and login requirements.',
        steps: [
          'Turning on Quiz mode lets you mark correct answers per question.',
          'Anti-cheat only applies when quiz mode is on.',
          'Require login prevents anonymous votes — useful for internal surveys.',
        ],
      },
    ],
  },

  'poll-detail': {
    label: 'Poll detail',
    title: 'Your poll command center',
    subtitle: 'Share, monitor, and act on this poll from one screen.',
    cards: [
      {
        id: 'detail-share',
        icon: FiShare2,
        accent: 'cyan',
        title: 'Share the poll link',
        summary: 'Copy the public URL and send it to your audience.',
        steps: [
          'Click Share to copy the link — format: /poll/YOUR-CODE.',
          'Voters open the link on any device; no app install needed.',
          'Poll code is shown on this page if you need to reference it manually.',
        ],
      },
      {
        id: 'detail-actions',
        icon: FiTarget,
        accent: 'emerald',
        title: 'Key actions',
        summary: 'Analytics, presentation, edit, publish, and delete.',
        steps: [
          'Analytics — live charts, CSV/PDF export, respondent list.',
          'Present — fullscreen slides for meetings or classrooms.',
          'Publish — release results publicly after collection ends.',
          'Edit — change questions before too many responses come in.',
        ],
      },
    ],
  },

  analytics: {
    label: 'Analytics',
    title: 'Read and export your results',
    subtitle: 'Live data, trends, and exports — all explained here.',
    cards: [
      {
        id: 'live',
        icon: FiRefreshCw,
        accent: 'cyan',
        title: 'Live updates',
        summary: 'Charts and counts refresh automatically via WebSockets.',
        steps: [
          'No need to refresh — new votes appear on bar and pie charts instantly.',
          'Live Participants shows how many people are on the poll page right now.',
          'Click Refresh only if you suspect a connection issue.',
        ],
      },
      {
        id: 'timer',
        icon: FiClock,
        accent: 'purple',
        title: 'Manual timer control',
        summary: 'For polls using the manual timer system.',
        steps: [
          'Click Start Timer when your audience is ready — everyone in the waiting room proceeds together.',
          'The countdown appears here and on every voter\'s screen.',
          'When time hits zero, new submissions are blocked automatically.',
        ],
      },
      {
        id: 'export',
        icon: FiDownload,
        accent: 'emerald',
        title: 'Export & drill-down',
        summary: 'Download reports and inspect individual responses.',
        steps: [
          'CSV — spreadsheet-friendly breakdown per question and option.',
          'PDF — opens print dialog; save as PDF from your browser.',
          'Click any respondent card to see their full answer set.',
          'Activity chart shows response volume over time; Peak Hour highlights busiest period.',
        ],
      },
      {
        id: 'present',
        icon: FiMonitor,
        accent: 'blue',
        title: 'Presentation mode',
        summary: 'Share results on a projector or video call.',
        steps: [
          'Click Present to open fullscreen slide view.',
          'Use arrow keys to move between questions.',
          'Ideal for live town halls, classrooms, and team meetings.',
        ],
      },
    ],
  },

  presentation: {
    label: 'Presentation',
    title: 'Present results fullscreen',
    subtitle: 'Keyboard shortcuts and tips for live audiences.',
    cards: [
      {
        id: 'present-nav',
        icon: FiMonitor,
        accent: 'cyan',
        title: 'Navigate slides',
        summary: 'Move between questions smoothly during a live session.',
        steps: [
          'Use ← → arrow keys or on-screen buttons to change slides.',
          'Each slide shows one question with live bar chart data.',
          'Press Esc or click X to exit back to analytics.',
        ],
        tip: 'Open Present on the display screen; keep Analytics on your laptop for controls.',
      },
    ],
  },

  profile: {
    label: 'Profile',
    title: 'Manage your account',
    subtitle: 'Update identity, security, and view your activity.',
    cards: [
      {
        id: 'profile-edit',
        icon: FiUser,
        accent: 'cyan',
        title: 'Edit profile',
        summary: 'Name, occupation, avatar, and interests.',
        steps: [
          'Click Edit profile to change your display name and occupation.',
          'Upload an avatar — shown on polls and respondent lists.',
          'Interests help personalize your onboarding experience.',
        ],
      },
      {
        id: 'profile-security',
        icon: FiLock,
        accent: 'rose',
        title: 'Password & security',
        summary: 'Keep your account secure.',
        steps: [
          'Change password from the security section (local accounts only).',
          'Google sign-in users manage passwords through Google.',
          'Sign out from the sidebar when using a shared device.',
        ],
      },
    ],
  },

  'public-poll': {
    label: 'Voting',
    title: 'How to complete this poll',
    subtitle: 'Quick tips so you can vote confidently on the first try.',
    cards: [
      {
        id: 'vote-basics',
        icon: FiCheckCircle,
        accent: 'cyan',
        title: 'Answering questions',
        summary: 'Select options and submit when done.',
        steps: [
          'Tap or click one option per question (required questions are marked).',
          'Scroll through all questions before hitting Submit.',
          'If there\'s a timer, watch the countdown — answers auto-submit when time runs out.',
        ],
      },
      {
        id: 'vote-quiz',
        icon: FiAward,
        accent: 'amber',
        title: 'Quiz mode rules',
        summary: 'Stay on this tab during a quiz.',
        steps: [
          'You must be signed in to take a quiz.',
          'Do not switch tabs — anti-cheat may auto-submit your answers.',
          'Your score appears immediately after submission.',
        ],
      },
      {
        id: 'vote-access',
        icon: FiLock,
        accent: 'purple',
        title: 'Access PIN or login',
        summary: 'Some polls require extra verification.',
        steps: [
          'Enter the PIN if prompted — ask the poll creator if you don\'t have it.',
          'Sign in when required; you\'ll return to this poll after login.',
        ],
      },
    ],
  },

  help: {
    label: 'Help center',
    title: 'Full Votora guide',
    subtitle: 'Expand any topic below for step-by-step instructions.',
    cards: [
      {
        id: 'help-create',
        icon: FiPlusCircle,
        accent: 'cyan',
        title: 'How to make a poll',
        summary: 'From blank page to shareable link in minutes.',
        steps: [
          'Dashboard → Create poll → fill Details, Questions, Security.',
          'Add at least 2 options per question; mark mandatory ones.',
          'Save and copy the share link from the poll detail page.',
        ],
      },
      {
        id: 'help-time',
        icon: FiClock,
        accent: 'purple',
        title: 'Controlling time',
        summary: 'Auto-close, manual timer, and live countdown.',
        steps: [
          'Auto expiry — poll closes at a fixed date/time.',
          'Manual timer — you start it; voters wait until then.',
          'Expired polls reject new votes; in-progress answers may auto-submit.',
        ],
      },
      {
        id: 'help-quiz',
        icon: FiAward,
        accent: 'amber',
        title: 'Running a quiz',
        summary: 'Scores, correct answers, and fairness.',
        steps: [
          'Enable Quiz mode when creating; mark the correct option per question.',
          'Require login so scores tie to respondents.',
          'Optional anti-cheat auto-submits if someone leaves the tab.',
        ],
      },
      {
        id: 'help-analytics',
        icon: FiTrendingUp,
        accent: 'emerald',
        title: 'Viewing live results',
        summary: 'Charts, exports, and presentation.',
        steps: [
          'Open Analytics from any poll — charts update in real time.',
          'Export CSV or PDF; click respondents for answer details.',
          'Use Present mode for meetings and Publish to share results publicly.',
        ],
      },
    ],
  },
};
