export type Preference = "CASHBACK" | "MILES" | "POINTS" | "BEST";
export type Channel = "ONLINE" | "OFFLINE" | "ANY";
export type RewardCard = { id: string; name: string; bank: string; rewardType: "CASHBACK" | "MILES" | "POINTS"; earnRate: number; minimumSpend: number; monthlyCap?: number | null; annualFee: number; eligibleCategories: string[]; channel: Channel; exclusions: string[]; sourceUrl: string; lastUpdated: string | Date };
export type Offer = { id: string; merchant: string; title: string; discountPct?: number | null; cashbackPct?: number | null; validTo: string | Date; cardIds: string[]; minSpend?: number | null; sourceUrl: string };
export type Transaction = { amount: number; category: string; merchant?: string; channel: Exclude<Channel, "ANY">; preference: Preference; currentMonthlySpend?: number };
export type Recommendation = { card: RewardCard; value: number; reward: string; score: number; notes: string[]; eligible: boolean; monthlySpendGap: number; offer?: Offer };

const valuePerUnit = (type: RewardCard["rewardType"]) => type === "CASHBACK" ? 1 : type === "MILES" ? 0.018 : 0.01;
export function recommend(cards: RewardCard[], offers: Offer[], tx: Transaction): Recommendation[] {
  return cards.flatMap(card => {
    const notes: string[] = [];
    const monthlySpend = tx.currentMonthlySpend ?? 0;
    const monthlySpendGap = Math.max(0, card.minimumSpend - monthlySpend);
    if (card.minimumSpend > 0) notes.push(monthlySpendGap > 0 ? `Spend S$${monthlySpendGap.toFixed(2)} more this month to unlock the S$${card.minimumSpend} threshold.` : `Monthly threshold met: S$${card.minimumSpend}.`);
    const categoryEligible = card.eligibleCategories.includes("ALL") || card.eligibleCategories.includes(tx.category);
    const channelEligible = card.channel === "ANY" || card.channel === tx.channel;
    if (!categoryEligible) notes.push(`Not eligible for ${tx.category.toLowerCase()} purchases.`);
    if (!channelEligible) notes.push(`Only earns for ${card.channel.toLowerCase()} purchases.`);
    // Current monthly spend is used to check a card's minimum-spend threshold.
    // It is not necessarily spend in the capped reward category, so it must not
    // be treated as previously consumed reward-cap spend.
    const remainingCap = card.monthlyCap == null ? Infinity : card.monthlyCap;
    const eligibleAmount = Math.min(tx.amount, remainingCap);
    if (eligibleAmount <= 0) notes.push("Monthly reward cap is already used.");
    const offer = offers.find(o => o.cardIds.includes(card.id) && o.merchant.toLowerCase() === tx.merchant?.toLowerCase() && new Date(o.validTo) >= new Date());
    const eligible = categoryEligible && channelEligible && monthlySpendGap === 0 && eligibleAmount > 0;
    const baseValue = eligible ? eligibleAmount * card.earnRate / 100 : 0;
    const promoValue = offer ? tx.amount * ((offer.discountPct ?? 0) + (offer.cashbackPct ?? 0)) / 100 : 0;
    const value = baseValue + promoValue;
    const reward = card.rewardType === "MILES" ? `${Math.round(eligibleAmount * card.earnRate)} miles` : card.rewardType === "POINTS" ? `${Math.round(eligibleAmount * card.earnRate)} points` : `S$${baseValue.toFixed(2)} cashback`;
    if (card.monthlyCap != null) notes.push(`Reward cap: S$${card.monthlyCap}/month; S$${eligibleAmount.toFixed(2)} eligible now.`);
    if (offer) notes.unshift(`${offer.title} adds S$${promoValue.toFixed(2)} estimated value.`);
    const preferenceBoost = tx.preference === "BEST" || tx.preference === card.rewardType ? 1000 : 0;
    return [{ card, value, reward, offer, notes, eligible, monthlySpendGap, score: (eligible ? preferenceBoost + value * valuePerUnit(card.rewardType) : -1) }];
  }).sort((a, b) => b.score - a.score);
}
