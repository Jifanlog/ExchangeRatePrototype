// Client-safe utilities (no Redis dependencies)

export type UsdRates = Record<string, number> & { USD: 1 };

export function computeCrossRate(
  from: string,
  to: string,
  usdRates: UsdRates
): number {
  if (from === to) return 1;
  const usdToTo = usdRates[to];
  const usdToFrom = usdRates[from];
  if (!usdToTo || !usdToFrom) {
    throw new Error(`Missing USD rates for ${from} or ${to}`);
  }
  // A->B = (USD->B) / (USD->A)
  return usdToTo / usdToFrom;
}

export function computeAllCrossRates(usdRates: UsdRates): Record<string, number> {
  const result: Record<string, number> = {};
  const codes = Object.keys(usdRates);
  for (const base of codes) {
    for (const quote of codes) {
      const key = `${base}_${quote}`;
      result[key] = computeCrossRate(base, quote, usdRates);
    }
  }
  console.log('Total cross rates computed: ' + Object.keys(result).length);
  return result;
}
