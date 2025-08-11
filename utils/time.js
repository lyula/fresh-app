// Returns a duration string like '1min ago', '2mins ago', '1h ago', '2days ago', '2months ago', '1y ago', '10yrs ago'
export function formatDurationAgo(date) {
  const now = new Date();
  const d = new Date(date);
  let diff = Math.floor((now - d) / 1000); // seconds
  if (diff < 60) return `${diff <= 1 ? '1min' : diff + 'mins'} ago`;
  diff = Math.floor(diff / 60); // minutes
  if (diff < 60) return `${diff === 1 ? '1min' : diff + 'mins'} ago`;
  diff = Math.floor(diff / 60); // hours
  if (diff < 24) return `${diff === 1 ? '1h' : diff + 'h'} ago`;
  diff = Math.floor(diff / 24); // days
  if (diff < 30) return `${diff === 1 ? '1day' : diff + 'days'} ago`;
  diff = Math.floor(diff / 30); // months
  if (diff < 12) return `${diff === 1 ? '1month' : diff + 'months'} ago`;
  diff = Math.floor(diff / 12); // years
  return `${diff === 1 ? '1y' : diff + 'yrs'} ago`;
}
