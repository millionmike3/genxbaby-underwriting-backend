export function pricingForTier(tier: string) {
  const pricing = {
    "A+": 5.25,
    "A": 5.75,
    "B": 6.25,
    "C": 7.0,
    "D": 8.5,
    "HIGH_RISK": 10.0
  };

  return pricing[tier];
}
