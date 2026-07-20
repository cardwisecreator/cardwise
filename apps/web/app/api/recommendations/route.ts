import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { recommend, type RewardRule } from "@perklah/rewards";
import { signedIn } from "@/lib/session";

const input = z.object({
  amount: z.number().positive().max(100000),
  merchant: z.string().max(100).optional(),
  category: z.string().min(2).max(30),
  channel: z.enum(["ONLINE", "OFFLINE"]),
  preference: z.enum(["CASHBACK", "MILES", "POINTS", "BEST"]),
  currentMonthlySpend: z.number().nonnegative().optional(),
});

export async function POST(req: NextRequest) {
  if (!signedIn(req)) return NextResponse.json({ error: "Sign up to use the calculator." }, { status: 401 });

  const parsed = input.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid purchase details" }, { status: 400 });

  try {
    const [cards, underReview] = await Promise.all([
      db.card.findMany({ where: { status: "PUBLISHED" } }),
      db.card.findMany({ where: { status: "REVIEW" }, select: { id: true, name: true, bank: true, imageUrl: true, sourceUrl: true, lastUpdated: true } }),
    ]);
    // A promotion should enrich a recommendation, never prevent the core calculator from working.
    const offers = await db.offer.findMany({ where: { status: "PUBLISHED" } }).catch((error) => {
      console.error("Unable to load merchant offers", error);
      return [];
    });
    return NextResponse.json({
      recommendations: recommend(cards.map(card => ({ ...card, rewardRules: Array.isArray(card.rewardRules) ? card.rewardRules as unknown as RewardRule[] : [] })), offers, parsed.data),
      underReview,
      disclaimer: "Estimate only. Verify current issuer terms and MCC eligibility.",
    });
  } catch (error) {
    console.error("Unable to calculate recommendations", error);
    return NextResponse.json({ error: "Unable to calculate benefits right now. Please try again shortly." }, { status: 500 });
  }
}
