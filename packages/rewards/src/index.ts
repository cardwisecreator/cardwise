export type Preference = "CASHBACK" | "MILES" | "POINTS" | "BEST";
export type Channel = "ONLINE" | "OFFLINE" | "ANY";
export type RewardCard = { id: string; name: string; bank: string; rewardType: "CASHBACK" | "MILES" | "POINTS"; earnRate: number; minimumSpend: number; monthlyCap?: number | null; annualFee: number; eligibleCategories: string[]; channel: Channel; exclusions: string[]; sourceUrl: string; lastUpdated: string | Date };
export type Offer = { id: string; merchant: string; title: string; discountPct?: number | null; cashbackPct?: number | null; validTo: string | Date; cardIds: string[]; minSpend?: number | null; sourceUrl: string };
export type Transaction = { amount: number; category: string; merchant?: string; channel: Exclude<Channel, "ANY">; preference: Preference; currentMonthlySpend?: number };
export type Recommendation = { card: RewardCard; value: number; reward: string; score: number; notes: string[]; offer?: Offer };

const valuePerUnit = (type: RewardCard["rewardType"]) => type === "CASHBACK" ? 1 : type === "MILES" ? 0.018 : 0.01;
export function recommend(cards: RewardCard[], offers: Offer[], tx: Transaction): Recommendation[] {
  return cards.flatMap(card => {
    const notes: string[] = [];
    if (card.minimumSpend > 0) notes.push(`Requires S$${card.minimumSpend} monthly qualifying spend.`);
    if (!card.eligibleCategories.includes("ALL") && !card.eligibleCategories.includes(tx.category)) return [];
    if (card.channel !== "ANY" && card.channel !== tx.channel) return [];
    const remainingCap = card.monthlyCap == null ? Infinity : Math.max(0, card.monthlyCap - (tx.currentMonthlySpend ?? 0));
    const eligibleAmount = Math.min(tx.amount, remainingCap);
    if (eligibleAmount <= 0) return [];
    const offer = offers.find(o => o.cardIds.includes(card.id) && o.merchant.toLowerCase() === tx.merchant?.toLowerCase() && new Date(o.validTo) >= new Date());
    const baseValue = eligibleAmount * card.earnRate / 100;
    const promoValue = offer ? tx.amount * ((offer.discountPct ?? 0) + (offer.cashbackPct ?? 0)) / 100 : 0;
    const value = baseValue + promoValue;
    const reward = card.rewardType === "MILES" ? `${Math.round(eligibleAmount * card.earnRate)} miles` : card.rewardType === "POINTS" ? `${Math.round(eligibleAmount * card.earnRate)} points` : `S$${baseValue.toFixed(2)} cashback`;
    if (card.monthlyCap != null) notes.push(`Reward cap: S$${card.monthlyCap}/month; S$${eligibleAmount.toFixed(2)} eligible now.`);
    if (offer) notes.unshift(`${offer.title} adds S$${promoValue.toFixed(2)} estimated value.`);
    const preferenceBoost = tx.preference === "BEST" || tx.preference === card.rewardType ? 1000 : 0;
    return [{ card, value, reward, offer, notes, score: preferenceBoost + value * valuePerUnit(card.rewardType) }];
  }).sort((a, b) => b.score - a.score);
}
