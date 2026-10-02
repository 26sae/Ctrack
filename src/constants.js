// Trucks data for live tracking

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const API_URL = API_BASE_URL;

export const TRUCKS = [
  { id: 1, label: 'Truck A', x: 30, y: 35, status: 'En route', eta: '~8 min' },
  { id: 2, label: 'Truck B', x: 65, y: 55, status: 'Collecting', eta: 'Nearby' },
  { id: 3, label: 'Truck C', x: 50, y: 75, status: 'En route', eta: '~22 min' },
];

// Report types available in the app
export const REPORT_TYPES = [
  { id: 'illegal', label: 'Illegal Dumping', icon: '🚯', desc: 'Unauthorized waste disposal in public areas' },
  { id: 'bin', label: 'Bin Damage', icon: '🗑️', desc: 'Broken, missing, or vandalized waste bins' },
  { id: 'missed', label: 'Missed Collection', icon: '📭', desc: 'Scheduled pickup was not completed' },
];

// Mock activities data
export const ACTIVITIES = [
  { id: 1, type: 'Illegal Dumping', icon: '🚯', loc: '14 Rizal Ave', status: 'resolved', time: '2h ago', reporter: 'Juan D.' },
  { id: 2, type: 'Missed Collection', icon: '📭', loc: '8 Mabini St', status: 'in-progress', time: '3h ago', reporter: 'Maria S.' },
  { id: 3, type: 'Bin Damage', icon: '🗑️', loc: 'Brgy Hall, Block 4', status: 'pending', time: '5h ago', reporter: 'Pedro R.' },
  { id: 4, type: 'Illegal Dumping', icon: '🚯', loc: 'Corner Luna & Mabini', status: 'resolved', time: 'Yesterday', reporter: 'Ana L.' },
  { id: 5, type: 'Missed Collection', icon: '📭', loc: '22 Del Pilar St', status: 'resolved', time: 'Yesterday', reporter: 'Carlo M.' },
  { id: 6, type: 'Bin Damage', icon: '🗑️', loc: 'Purok 3 Playground', status: 'pending', time: '2 days ago', reporter: 'Rosa T.' },
];

// Onboarding slides
export const SLIDES = [
  {
    title: 'Track Garbage Trucks Live',
    desc: 'See exactly where garbage trucks are in your neighborhood in real time so you never miss a pickup.',
    icon: '🚛',
  },
  {
    title: 'Report Issues Instantly',
    desc: 'Spot illegal dumping, a damaged bin, or a missed collection? Report it in seconds with location and details.',
    icon: '🚨',
  },
  {
    title: 'Stay in the Loop',
    desc: 'Track community reports, see what\'s been resolved, and stay updated on waste management activity near you.',
    icon: '📋',
  },
];

// Waste segregation guide
export const WASTE_TYPES = [
  {
    category: 'Biodegradable',
    icon: '🌿',
    items: ['Food scraps', 'Leaves & grass', 'Paper & cardboard', 'Plant materials'],
    color: '#4CAF50',
    bgColor: '#E8F5E9',
  },
  {
    category: 'Recyclable',
    icon: '♻️',
    items: ['Plastic bottles & containers', 'Glass bottles & jars', 'Metal cans & foil', 'Newspapers & magazines'],
    color: '#2196F3',
    bgColor: '#E3F2FD',
  },
  {
    category: 'Non-Biodegradable',
    icon: '⚫',
    items: ['Plastic bags', 'Styrofoam', 'Treated wood', 'Rubber products'],
    color: '#FF9800',
    bgColor: '#FFF3E0',
  },
  {
    category: 'Special Waste',
    icon: '⚠️',
    items: ['Electronics', 'Batteries', 'Chemicals', 'Medical waste'],
    color: '#F44336',
    bgColor: '#FFEBEE',
  },
];

// FAQ items
export const FAQS = [
  { q: 'How do I report an issue?', a: 'Tap the Report tab on the bottom nav, choose your issue type, fill in the location and details, then submit.' },
  { q: 'How accurate is the truck tracker?', a: 'The tracker shows approximate truck positions updated every few minutes based on the truck\'s last known location.' },
  { q: 'How long does it take to resolve a report?', a: 'Most reports are reviewed within 24–48 hours. You\'ll get a notification when the status changes.' },
  { q: 'Can I cancel or edit a report?', a: 'Currently you cannot edit a submitted report. Contact support if you need to make a correction.' },
  { q: 'What is the segregation guide for?', a: 'It helps you sort your waste correctly — biodegradable, recyclable, non-biodegradable, and special waste — before pickup.' },
];

// Profile menu items
export const PROFILE_MENU = [
  { icon: '👤', bg: '#e8f5ee', label: 'Edit Profile', sub: 'Update your name and info', to: 'edit-profile' },
  { icon: '🔔', bg: '#fff8ec', label: 'Notifications', sub: 'Manage alert preferences', to: 'notifications' },
  { icon: '📍', bg: '#e8f0ff', label: 'My Address', sub: 'Set your pickup location', to: 'my-address' },
  { icon: '📋', bg: '#edfaf3', label: 'My Reports', sub: 'View reports you submitted', to: 'my-reports' },
  { icon: '❓', bg: '#fdecea', label: 'Help & Support', sub: 'FAQs and contact us', to: 'help' },
  { icon: 'ℹ️', bg: '#f4f6f4', label: 'About CleanTrack', sub: 'Version 1.0.0', to: 'about' },
];

// Street lines for map visualization
export const MAP_STREETS = [
  [0, 30, 100, 30],
  [0, 55, 100, 55],
  [0, 78, 100, 78],
  [25, 0, 25, 100],
  [55, 0, 55, 100],
  [80, 0, 80, 100],
];

// Notification rows
export const NOTIFICATION_ROWS = [
  { key: 'pickup', label: 'Pickup Reminders', desc: 'Get notified before your scheduled pickup' },
  { key: 'reports', label: 'Report Updates', desc: 'Status changes on your submitted reports' },
  { key: 'resolved', label: 'Issue Resolved', desc: 'When a community report is resolved' },
  { key: 'nearby', label: 'Nearby Truck Alerts', desc: 'When a truck is near your location' },
  { key: 'weekly', label: 'Weekly Summary', desc: 'Weekly digest of neighborhood activity' },
];
