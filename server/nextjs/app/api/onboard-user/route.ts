import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const account = await stripe.accounts.create({
      type: "standard",
    });

    // Store the account ID in a cookie for the refresh flow
    const cookieStore = await cookies();
    cookieStore.set("accountId", account.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
    });

    const origin = req.headers.get("origin") || req.nextUrl.origin;
    const accountLink = await stripe.accountLinks.create({
      type: "account_onboarding",
      account: account.id,
      refresh_url: `${origin}/api/onboard-user/refresh`,
      return_url: `${origin}/success`,
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
