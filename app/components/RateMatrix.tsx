"use client";

import { useEffect, useMemo, useState } from "react";
import { computeAllCrossRates, UsdRates } from "@/lib/rates-client";

type UsdResponse = { base: "USD"; rates: UsdRates };

type RateMatrixProps = {
  initialRates?: UsdRates;
};

export default function RateMatrix({ initialRates }: RateMatrixProps) {
  const [usdRates, setUsdRates] = useState<UsdRates | null>(initialRates ?? null);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(!initialRates);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRates = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      if (!usdRates) {
        setIsLoading(true);
      }
    }
    
    try {
      const response = await fetch("/api/rates");
      const data: UsdResponse = await response.json();
      setUsdRates(data.rates as UsdRates);
    } catch (error) {
      setUsdRates(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialRates) {
      fetchRates();
    }
  // We intentionally exclude fetchRates from deps to avoid re-creating the function each render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRates]);

  const allCrossRates = useMemo(() => {
    if (!usdRates) return null;
    try {
      return computeAllCrossRates(usdRates);
    } catch {
      return null;
    }
  }, [usdRates]);

  const currencies = useMemo(() => {
    if (usdRates) return Object.keys(usdRates).sort();
    return [];
  }, [usdRates]);

  const filteredCurrencies = selectedCurrencies.length > 0 ? selectedCurrencies : currencies;

  const toggleCurrency = (currency: string) => {
    setSelectedCurrencies(prev => 
      prev.includes(currency) 
        ? prev.filter(c => c !== currency)
        : [...prev, currency]
    );
  };

  const selectAll = () => setSelectedCurrencies([]);
  const selectNone = () => setSelectedCurrencies([]);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading exchange rates...</p>
        </div>
      </div>
    );
  }

  if (!usdRates || !allCrossRates) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load exchange rates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Comprehensive Exchange Rate Matrix</h2>
        <p className="text-gray-600 mb-4">
          All possible currency pair exchange rates computed using <code className="bg-gray-100 px-2 py-1 rounded">computeAllCrossRates()</code>
        </p>
        
         <div className="flex flex-wrap gap-2 mb-4">
           <button
             onClick={selectAll}
             className="px-3 py-1 text-sm text-black bg-blue-100 hover:bg-blue-200 rounded border"
           >
             Show All ({currencies.length})
           </button>
           <button
             onClick={selectNone}
             className="px-3 py-1 text-sm text-black bg-gray-100 hover:bg-gray-200 rounded border"
           >
             Clear Selection
           </button>
           <button
             onClick={() => fetchRates(true)}
             disabled={isRefreshing}
             className="px-3 py-1 text-sm text-black bg-green-100 hover:bg-green-200 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isRefreshing ? (
               <>
                 <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900 mr-1"></span>
                 Refreshing...
               </>
             ) : (
               "🔄 Refresh Rates"
             )}
           </button>
         </div>

        <div className="flex flex-wrap gap-2">
          {currencies.map(currency => (
            <button
              key={currency}
              onClick={() => toggleCurrency(currency)}
              className={`px-3 py-1 text-sm text-black rounded border ${
                selectedCurrencies.length === 0 || selectedCurrencies.includes(currency)
                  ? 'bg-green-100 hover:bg-green-200 border-green-300'
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
              }`}
            >
              {currency}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-auto max-h-[600px] border rounded-lg">
        <table className="w-full text-sm">
           <thead className="bg-gray-50 sticky top-0">
             <tr>
               <th className="text-left px-3 py-2 font-semibold border-r text-black">From/To</th>
               {filteredCurrencies.map(currency => (
                 <th key={currency} className="text-center px-2 py-2 font-semibold border-r min-w-[80px] text-black">
                   {currency}
                 </th>
               ))}
             </tr>
           </thead>
          <tbody>
            {filteredCurrencies.map(fromCurrency => (
               <tr key={fromCurrency} className="border-t hover:bg-gray-50 hover:text-black">
                 <td className="px-3 py-2 font-semibold bg-gray-50 border-r text-black">
                   {fromCurrency}
                 </td>
                {filteredCurrencies.map(toCurrency => {
                  const rateKey = `${fromCurrency}_${toCurrency}`;
                  const rate = allCrossRates[rateKey];
                  
                  return (
                    <td key={toCurrency} className="text-right px-2 py-2 border-r">
                      {rate !== undefined ? (
                        <span className={`
                          ${fromCurrency === toCurrency ? 'font-bold text-blue-600' : ''}
                          ${rate === 1 ? 'text-green-600' : ''}
                        `}>
                          {rate.toFixed(6)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Legend:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li><span className="text-blue-600 font-bold">Blue bold</span> = Same currency (rate = 1)</li>
          <li><span className="text-green-600">Green</span> = Direct USD rate (when converting from USD)</li>
          <li>All rates are computed using the formula: <code>Rate(A→B) = Rate(USD→B) / Rate(USD→A)</code></li>
          <li>Total combinations: <strong>{filteredCurrencies.length} × {filteredCurrencies.length} = {filteredCurrencies.length * filteredCurrencies.length}</strong></li>
        </ul>
      </div>
    </div>
  );
}
