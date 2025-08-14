import { useEffect, useState } from 'react';

export function useBadgePricing() {
  const [pricing, setPricing] = useState(null);
  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL || process.env.API_BASE || ''}/badge-pricing`)
      .then(res => res.json())
      .then(setPricing)
      .catch(() => setPricing(null));
  }, []);
  return pricing;
}
