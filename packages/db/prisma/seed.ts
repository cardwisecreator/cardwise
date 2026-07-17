import { Channel, PrismaClient, PublishStatus, RewardType } from "@prisma/client";

const db = new PrismaClient();
const official = "https://www.uob.com.sg/personal/cards/cashback/one-card.page";

async function main() {
  const uobData = { name: "UOB One Card", bank: "UOB", rewardType: RewardType.CASHBACK, earnRate: 5, annualFee: 196.2, minimumSpend: 500, monthlyCap: 100, eligibleCategories: ["DINING", "GROCERIES", "TRANSPORT", "ONLINE"], channel: Channel.ANY, exclusions: ["Wallet top-ups", "Cash advances"], sourceUrl: official, lastUpdated: new Date(), status: PublishStatus.PUBLISHED };
  const hsbcData = { name: "HSBC Revolution", bank: "HSBC", rewardType: RewardType.POINTS, earnRate: 10, annualFee: 0, minimumSpend: 0, monthlyCap: 1000, eligibleCategories: ["DINING", "ONLINE", "SHOPPING"], channel: Channel.ANY, exclusions: ["Wallet top-ups", "Education"], sourceUrl: "https://www.hsbc.com.sg/credit-cards/products/revolution/", lastUpdated: new Date(), status: PublishStatus.PUBLISHED };
  const citiData = { name: "Citi Rewards Card", bank: "Citibank", rewardType: RewardType.MILES, earnRate: 4, annualFee: 194.4, minimumSpend: 0, monthlyCap: 1000, eligibleCategories: ["ONLINE", "SHOPPING"], channel: Channel.ONLINE, exclusions: ["Travel", "Wallet top-ups"], sourceUrl: "https://www.citibank.com.sg/credit-cards/citi-rewards-card/", lastUpdated: new Date(), status: PublishStatus.PUBLISHED };

  const uob = await db.card.upsert({ where: { slug: "uob-one" }, update: uobData, create: { slug: "uob-one", ...uobData } });
  await db.card.upsert({ where: { slug: "hsbc-revolution" }, update: hsbcData, create: { slug: "hsbc-revolution", ...hsbcData } });
  await db.card.upsert({ where: { slug: "citi-rewards" }, update: citiData, create: { slug: "citi-rewards", ...citiData } });
  await db.offer.upsert({ where: { slug: "uob-wine-connection" }, update: { merchant: "Wine Connection", title: "Complimentary Truffle Parmesan Fries", description: "With S$120 minimum dine-in spend. Example seeded from official issuer page; verify before publishing.", minSpend: 120, validFrom: new Date("2026-01-01"), validTo: new Date("2026-04-30"), sourceUrl: "https://www.uob.com.sg/personal/cards/rewards/ladys-card/dining-and-entertainment-promotions.page", status: PublishStatus.PUBLISHED, cardIds: [uob.id] }, create: { slug: "uob-wine-connection", merchant: "Wine Connection", title: "Complimentary Truffle Parmesan Fries", description: "With S$120 minimum dine-in spend. Example seeded from official issuer page; verify before publishing.", minSpend: 120, validFrom: new Date("2026-01-01"), validTo: new Date("2026-04-30"), sourceUrl: "https://www.uob.com.sg/personal/cards/rewards/ladys-card/dining-and-entertainment-promotions.page", status: PublishStatus.PUBLISHED, cardIds: [uob.id] } });
  await db.article.upsert({ where: { slug: "best-cashback-cards-singapore" }, update: {}, create: { slug: "best-cashback-cards-singapore", title: "Cashback cards in Singapore", excerpt: "Compare cashback mechanics, spend tiers and monthly caps.", body: "Start with the merchant category. Then check your card's required spend, exclusions and cap before you pay.", status: PublishStatus.PUBLISHED } });
}

main().finally(() => db.$disconnect());
