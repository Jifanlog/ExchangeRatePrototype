"use client";

import { useEffect, useMemo, useState } from "react";
import { computeCrossRate } from "@/lib/rates-client";

type UsdResponse = { base: "USD"; rates: Record<string, number> };

export default function Converter() {
  const [usdRates, setUsdRates] = useState<Record<string, number> | null>(null);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [amount, setAmount] = useState(1);

  useEffect(() => {
    fetch("/api/rates")
      .then((r) => r.json())
      .then((data: UsdResponse) => setUsdRates(data.rates))
      .catch(() => setUsdRates(null));
  }, []);

  const cross = useMemo(() => {
    if (!usdRates) return null;
    try {
      return computeCrossRate(from as any, to as any, usdRates as any);
    } catch {
      return null;
    }
  }, [usdRates, from, to]);

  const converted = cross != null ? amount * cross : null;
  const options = useMemo(() => {
    if (usdRates) return Object.keys(usdRates).sort();
    return ["USD", "EUR", "DKK", "GBP", "JPY"]; // minimal fallback
  }, [usdRates]);

  return (
    <div className="w-full max-w-xl rounded-lg border p-4 flex flex-col gap-3">
      <div className="text-lg font-medium">Cross-currency converter</div>
      <div className="flex gap-2 items-center">
        <input
          type="number"
          className="border rounded px-2 py-1 w-28"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min={0}
          step={0.01}
        />
        <select
          className="border rounded px-2 py-1 bg-white text-black dark:bg-white dark:text-black"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        >
          {options.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-label="Swap currencies"
          className="border rounded px-2 py-1 text-sm hover:bg-black/[.05] dark:hover:bg-white/[.08]"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
        >
          ⇄
        </button>
        <span className="opacity-70">to</span>
        <select
          className="border rounded px-2 py-1 bg-white text-black dark:bg-white dark:text-black"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        >
          {options.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>
      <div className="text-sm opacity-80">
        {cross == null ? "Loading…" : `1 ${from} = ${cross.toFixed(6)} ${to}`}
      </div>
      <div className="text-base font-semibold">
        {converted == null
          ? ""
          : `${amount} ${from} = ${converted.toFixed(4)} ${to}`}
      </div>
    </div>
  );
}


