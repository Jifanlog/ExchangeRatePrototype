import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { refreshUsdRatesNow } from "@/lib/rates-server";

export async function POST() {
  try {
    const secret = process.env.RATES_REFRESH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server missing RATES_REFRESH_SECRET" }, { status: 500 });
    }
    // Validate simple bearer token from header
    const hdrs = await headers();
    const auth = hdrs.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await refreshUsdRatesNow();
    return NextResponse.json({ ok: true, count: Object.keys(data).length });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Unknown error" },
      { status: 500 }
    );
  }
}


