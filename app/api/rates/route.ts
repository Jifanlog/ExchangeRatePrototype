import { NextResponse } from "next/server";
import { fetchUsdRatesCached } from "@/lib/rates-server";

export async function GET() {
  try {
    const usd = await fetchUsdRatesCached();
    return NextResponse.json({ base: "USD", rates: usd });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Unknown error" },
      { status: 500 }
    );
  }
}


