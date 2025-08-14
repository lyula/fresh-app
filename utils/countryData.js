// Dummy for flag emoji, can be improved
export function getFlagEmoji(countryCode) {
  if (!countryCode) return '🌐';
  // Convert country code to regional indicator symbols
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
}
