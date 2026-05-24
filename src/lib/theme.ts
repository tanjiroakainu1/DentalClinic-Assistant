/** Candy + galaxy stat card gradients */
export const STAT = {
  galaxy: 'bg-gradient-to-br from-galaxy-600 via-galaxy-800 to-galaxy-950 shadow-glow-lg border border-galaxy-400/20',
  candy: 'bg-gradient-to-br from-candy-400 via-candy-600 to-galaxy-700 shadow-glow border border-candy-300/30',
  nebula: 'bg-gradient-to-br from-cosmic-500 via-galaxy-600 to-indigo-900 shadow-glow-lg border border-cosmic-400/20',
  bubblegum: 'bg-gradient-to-br from-fuchsia-400 via-pink-500 to-purple-800 shadow-candy border border-fuchsia-300/25',
  stardust: 'bg-gradient-to-br from-violet-400 via-purple-500 to-galaxy-900 shadow-glow border border-violet-300/20',
  cosmic: 'bg-gradient-to-br from-indigo-500 via-purple-600 to-galaxy-950 shadow-glow-lg border border-indigo-400/20',
  sunset: 'bg-gradient-to-br from-pink-500 via-fuchsia-600 to-galaxy-900 shadow-glow border border-pink-400/25',
} as const;

export type StatVariant = keyof typeof STAT;

/** Recharts chart colors — candy purple palette */
export const CHART_COLORS = {
  primary: '#c026d3',
  secondary: '#8b5cf6',
  tertiary: '#e879f9',
  grid: 'rgba(196, 181, 253, 0.15)',
  pie: ['#e879f9', '#c026d3', '#8b5cf6', '#6366f1', '#f0abfc'],
  palette: ['#e879f9', '#c026d3', '#8b5cf6', '#6366f1', '#f0abfc'],
};
