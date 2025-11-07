import Converter from "@/app/components/Converter";
import { fetchUsdRatesCached } from "@/lib/rates";

export default async function Home() {
  const usd = await fetchUsdRatesCached();
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <Converter initialRates={usd} />
    </div>
  );
}
