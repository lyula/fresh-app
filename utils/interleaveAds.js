// Utility to interleave ads into a posts array at regular intervals (every 4th after the 3rd)
export function interleaveAds(posts, ads) {
  if (!ads || !ads.length) return posts;
  const result = [];
  let adIdx = 0;
  for (let i = 0; i < posts.length; i++) {
    result.push(posts[i]);
    // Insert ad every 4th post after the 3rd
    if ((i + 1) % 4 === 0 && i > 2) {
      result.push({ ...ads[adIdx % ads.length], _isAd: true });
      adIdx++;
    }
  }
  return result;
}

export default interleaveAds;
