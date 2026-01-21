import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accountId = cookieStore.get("accountId")?.value;

    if (!accountId) {
      // No account ID in session, redirect to home
      return NextResponse.redirect(new URL("/", req.url));
    }

    const origin = req.nextUrl.origin;
    const accountLink = await stripe.accountLinks.create({
      type: "account_onboarding",
      account: accountId,
      refresh_url: `${origin}/api/onboard-user/refresh`,
      return_url: `${origin}/success`,
    });

    return NextResponse.redirect(accountLink.url);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
