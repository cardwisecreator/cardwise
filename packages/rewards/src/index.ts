export type Preference = "CASHBACK" | "MILES" | "POINTS" | "BEST";
export type Channel = "ONLINE" | "OFFLINE" | "ANY";

export type RewardRule = {
  label: string;
  rewardType: "CASHBACK" | "MILES" | "POINTS";
  earnRate: number;
  categories: string[];
  channel?: Channel;
  minimumSpend?: number;
  maximumSpend?: number;
  monthlyCap?: number | null;
  requiresCardholderChoice?: boolean;
  notes?: string[];
};

export type RewardCard = { id: string; name: string; bank: string; rewardType: "CASHBACK" | "MILES" | "POINTS"; earnRate: number; minimumSpend: number; monthlyCap?: number | null; annualFee: number; eligibleCategories: string[]; channel: Channel; exclusions: string[]; sourceUrl: string; lastUpdated: string | Date; rewardRules?: RewardRule[] | null };
export type Offer = { id: string; merchant: string; title: string; discountPct?: number | null; cashbackPct?: number | null; validTo: string | Date; cardIds: string[]; minSpend?: number | null; sourceUrl: string };
export type Transaction = { amount: number; category: string; merchant?: string; channel: Exclude<Channel, "ANY">; preference: Preference; currentMonthlySpend?: number };
export type Recommendation = { card: RewardCard; value: number; reward: string; score: number; notes: string[]; eligible: boolean; monthlySpendGap: number; offer?: Offer; appliedRule?: string };

const valuePerUnit = (type: RewardCard["rewardType"]) => type === "CASHBACK" ? 1 : type === "MILES" ? 0.018 : 0.01;
const categoryMatches = (categories: string[], category: string) => categories.includes("ALL") || categories.includes(category);
const channelMatches = (ruleChannel: Channel | undefined, channel: Transaction["channel"]) => !ruleChannel || ruleChannel === "ANY" || ruleChannel === channel;

function selectRule(card: RewardCard, tx: Transaction) {
  const spend = tx.currentMonthlySpend ?? 0;
  const rules = card.rewardRules?.length ? card.rewardRules : [{ label: "Standard earn rate", rewardType: card.rewardType, earnRate: card.earnRate, categories: card.eligibleCategories, channel: card.channel, minimumSpend: card.minimumSpend, monthlyCap: card.monthlyCap }];
  return rules
    .filter(rule => categoryMatches(rule.categories, tx.category) && channelMatches(rule.channel, tx.channel) && spend >= (rule.minimumSpend ?? 0) && (rule.maximumSpend == null || spend <= rule.maximumSpend))
    .sort((a, b) => b.earnRate - a.earnRate)[0];
}

export function recommend(cards: RewardCard[], offers: Offer[], tx: Transaction): Recommendation[] {
  return cards.map(card => {
    const notes: string[] = [];
    const monthlySpend = tx.currentMonthlySpend ?? 0;
    const applicableRule = selectRule(card, tx);
    const minimumSpend = applicableRule?.minimumSpend ?? card.minimumSpend;
    const monthlySpendGap = Math.max(0, minimumSpend - monthlySpend);
    const categoryEligible = card.rewardRules?.length ? Boolean(applicableRule) : categoryMatches(card.eligibleCategories, tx.category);
    const channelEligible = card.rewardRules?.length ? Boolean(applicableRule) : channelMatches(card.channel, tx.channel);

    if (minimumSpend > 0) notes.push(monthlySpendGap > 0 ? `Spend S$${monthlySpendGap.toFixed(2)} more this month to unlock the S$${minimumSpend} threshold.` : `Monthly threshold met: S$${minimumSpend}.`);
    if (!categoryEligible) notes.push(`No verified ${tx.category.toLowerCase()} rule applies to this purchase.`);
    if (!channelEligible) notes.push(`No verified ${tx.channel.toLowerCase()} rule applies to this purchase.`);

    const rule = applicableRule ?? { label: "Standard earn rate", rewardType: card.rewardType, earnRate: card.earnRate, monthlyCap: card.monthlyCap, requiresCardholderChoice: false };
    const remainingCap = rule.monthlyCap == null ? Infinity : rule.monthlyCap;
    const eligibleAmount = Math.min(tx.amount, remainingCap);
    const eligible = categoryEligible && channelEligible && monthlySpendGap === 0 && eligibleAmount > 0;
    const offer = offers.find(o => o.cardIds.includes(card.id) && o.merchant.toLowerCase() === tx.merchant?.toLowerCase() && new Date(o.validTo) >= new Date());
    const baseValue = eligible ? eligibleAmount * rule.earnRate / 100 : 0;
    const promoValue = offer ? tx.amount * ((offer.discountPct ?? 0) + (offer.cashbackPct ?? 0)) / 100 : 0;
    const value = baseValue + promoValue;
    const reward = rule.rewardType === "MILES" ? `${Math.round(eligibleAmount * rule.earnRate)} miles` : rule.rewardType === "POINTS" ? `${Math.round(eligibleAmount * rule.earnRate)} points` : `S$${baseValue.toFixed(2)} cashback`;

    notes.unshift(`Applied rule: ${rule.label}.`);
    if (rule.requiresCardholderChoice) notes.push("This rate applies only if you selected this category in your card settings.");
    if (rule.monthlyCap != null) notes.push(`Reward cap: S$${rule.monthlyCap}/month; S$${eligibleAmount.toFixed(2)} eligible for this transaction.`);
    rule.notes?.forEach(note => notes.push(note));
    if (offer) notes.unshift(`${offer.title} adds S$${promoValue.toFixed(2)} estimated value.`);
    const preferenceBoost = tx.preference === "BEST" || tx.preference === rule.rewardType ? 1000 : 0;
    return { card, value, reward, offer, notes, eligible, monthlySpendGap, appliedRule: rule.label, score: eligible ? preferenceBoost + value * valuePerUnit(rule.rewardType) : -1 };
  }).sort((a, b) => b.score - a.score);
}
