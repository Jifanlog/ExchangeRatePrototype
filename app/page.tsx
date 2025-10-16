import Image from "next/image";
import Converter from "@/app/components/Converter";
import { fetchUsdRatesCached } from "@/lib/rates";

export default async function Home() {
  const usd = await fetchUsdRatesCached();
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div className="w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">USD base rates</h2>
          <div className="overflow-auto max-h-[520px] rounded border">
            <table className="w-full text-sm">
              <thead className="bg-black/[.04] dark:bg-white/[.06]">
                <tr>
                  <th className="text-left px-3 py-2">Code</th>
                  <th className="text-right px-3 py-2">USD → Code</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(usd).sort().map((code) => {
                  const value = (usd as any)[code];
                  return (
                    <tr key={code} className="border-t">
                      <td className="px-3 py-2">{code}</td>
                      <td className="px-3 py-2 text-right">{typeof value === "number" ? value.toFixed(6) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Converter />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
