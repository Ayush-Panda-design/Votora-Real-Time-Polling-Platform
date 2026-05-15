export const HELP_CONTENT = {
  '/dashboard': {
    title: 'Dashboard Help',
    description: 'Manage your active polls and monitor participation in real-time.',
    items: [
      { title: 'Search & Filter', text: 'Use the search bar and status filters to find specific polls quickly.' },
      { title: 'Publishing', text: 'Click the eye icon to publish results so respondents can see them.' },
      { title: 'Duplication', text: 'Use the copy icon to clone a poll and its questions for a new session.' },
    ],
  },
  '/polls/create': {
    title: 'Create Poll Help',
    description: 'Design interactive polls with various question types and settings.',
    items: [
      { title: 'Questions', text: 'Each question needs text and at least 2 options. You can make them mandatory.' },
      { title: 'Settings', text: 'Toggle anonymous responses or require login depending on your audience.' },
      { title: 'Expiry', text: 'Set an optional expiry date to close the poll automatically.' },
    ],
  },
  '/analytics': {
    title: 'Analytics Help',
    description: 'Deep dive into the data collected from your respondents.',
    items: [
      { title: 'Live View', text: 'The charts update in real-time as votes come in. No refresh needed.' },
      { title: 'CSV Export', text: 'Download a structured report of all votes for offline analysis.' },
      { title: 'Presentation Mode', text: 'Use the Present button to show results to a live audience in full screen.' },
    ],
  },
  'default': {
    title: 'Votora Help',
    description: 'Welcome to Votora! Create and manage interactive polls easily.',
    items: [
      { title: 'Creating Polls', text: 'Go to the New Poll page to build your first questionnaire.' },
      { title: 'Sharing', text: 'Copy the share link from your dashboard to start collecting responses.' },
      { title: 'Real-time Results', text: 'Check the analytics page of any poll to see live vote tallies.' },
    ],
  }
};

