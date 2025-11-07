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

// Additional cross-rate helpers can be added here if we reintroduce the
// comprehensive matrix view or need cached pair computations.
