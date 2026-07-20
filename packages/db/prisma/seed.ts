import { Channel, PrismaClient, PublishStatus, RewardType } from "@prisma/client";

const db = new PrismaClient();
const official = "https://www.uob.com.sg/personal/cards/cashback/one-card.page";

async function main() {
  const issuers = [
    ["hsbc", "HSBC", "https://www.hsbc.com.sg/credit-cards/"], ["maybank", "Maybank", "https://www.maybank2u.com.sg/en/personal/cards/credit/index.page"], ["dcs-card-centre", "DCS Card Centre", "https://www.dcsc.com/cards"], ["uob", "UOB", "https://www.uob.com.sg/personal/cards/index.page"], ["ocbc", "OCBC", "https://www.ocbc.com/personal-banking/cards/credit-card.page"], ["american-express", "American Express", "https://www.americanexpress.com/en-sg/credit-cards/"], ["dbs", "DBS", "https://www.dbs.com.sg/personal/cards/default.page"], ["bank-of-china", "Bank of China", "https://www.bankofchina.com/sg/bocinfo/bi1/"], ["trust-bank", "Trust Bank", "https://www.trustbank.sg/cards"], ["state-bank-of-india", "State Bank of India", "https://sg.statebank/home/cards"], ["citi", "Citi", "https://www.citibank.com.sg/credit-cards"], ["standard-chartered", "Standard Chartered", "https://www.sc.com/sg/credit-cards/"], ["cimb", "CIMB", "https://www.cimb.com.sg/en/personal/banking-with-us/cards/credit-cards.html"], ["posb", "POSB", "https://www.dbs.com.sg/personal/cards/default.page"],
  ] as const;
  await Promise.all(issuers.map(([slug,name,sourceUrl]) => db.issuer.upsert({ where: { slug }, update: { name, sourceUrl, active: true }, create: { slug, name, sourceUrl } })));
  const uobData = { name: "UOB One Card", bank: "UOB", rewardType: RewardType.CASHBACK, earnRate: 5, annualFee: 196.2, minimumSpend: 500, monthlyCap: 100, eligibleCategories: ["DINING", "GROCERIES", "TRANSPORT", "ONLINE"], channel: Channel.ANY, exclusions: ["Wallet top-ups", "Cash advances"], sourceUrl: official, lastUpdated: new Date(), status: PublishStatus.PUBLISHED };
  const hsbcData = { name: "HSBC Revolution", bank: "HSBC", rewardType: RewardType.POINTS, earnRate: 10, annualFee: 0, minimumSpend: 0, monthlyCap: 1000, eligibleCategories: ["DINING", "ONLINE", "SHOPPING"], channel: Channel.ANY, exclusions: ["Wallet top-ups", "Education"], sourceUrl: "https://www.hsbc.com.sg/credit-cards/products/revolution/", lastUpdated: new Date(), status: PublishStatus.PUBLISHED };
  const citiData = { name: "Citi Rewards Card", bank: "Citibank", rewardType: RewardType.MILES, earnRate: 4, annualFee: 194.4, minimumSpend: 0, monthlyCap: 1000, eligibleCategories: ["ONLINE", "SHOPPING"], channel: Channel.ONLINE, exclusions: ["Travel", "Wallet top-ups"], sourceUrl: "https://www.citibank.com.sg/credit-cards/citi-rewards-card/", lastUpdated: new Date(), status: PublishStatus.PUBLISHED };

  const uob = await db.card.upsert({ where: { slug: "uob-one" }, update: uobData, create: { slug: "uob-one", ...uobData } });
  await db.card.upsert({ where: { slug: "hsbc-revolution" }, update: hsbcData, create: { slug: "hsbc-revolution", ...hsbcData } });
  await db.card.upsert({ where: { slug: "citi-rewards" }, update: citiData, create: { slug: "citi-rewards", ...citiData } });
  // Catalogue coverage is visible in the product, but it is deliberately not
  // published into recommendations until rates, caps and exclusions are reviewed.
  const catalogueCards = [
    ["maybank-family-and-friends", "Maybank Family & Friends Card", "Maybank", "https://www.maybank2u.com.sg/en/personal/cards/credit/index.page"],
    ["dcs-cashback", "DCS CashBack Card", "DCS Card Centre", "https://www.dcsc.com/cards"],
    ["ocbc-365", "OCBC 365 Credit Card", "OCBC", "https://www.ocbc.com/personal-banking/cards/credit-card.page"],
    ["amex-true-cashback", "American Express True Cashback Card", "American Express", "https://www.americanexpress.com/en-sg/credit-cards/"],
    ["dbs-live-fresh", "DBS Live Fresh Card", "DBS", "https://www.dbs.com.sg/personal/cards/default.page"],
    ["boc-family", "Bank of China Family Card", "Bank of China", "https://www.bankofchina.com/sg/bocinfo/bi1/"],
    ["trust-link", "Trust Link Credit Card", "Trust Bank", "https://www.trustbank.sg/cards"],
    ["sbi-platinum", "SBI Platinum Card", "State Bank of India", "https://sg.statebank/home/cards"],
    ["citi-cash-back-plus", "Citi Cash Back+ Card", "Citibank", "https://www.citibank.com.sg/credit-cards"],
    ["sc-simply-cash", "Standard Chartered Simply Cash Card", "Standard Chartered", "https://www.sc.com/sg/credit-cards/"],
    ["cimb-world", "CIMB World Mastercard", "CIMB", "https://www.cimb.com.sg/en/personal/banking-with-us/cards/credit-cards.html"],
    ["posb-everyday", "POSB Everyday Card", "POSB", "https://www.dbs.com.sg/personal/cards/default.page"],
  ] as const;
  await Promise.all(catalogueCards.map(([slug, name, bank, sourceUrl]) => db.card.upsert({
    where: { slug },
    update: { name, bank, sourceUrl, status: PublishStatus.REVIEW, lastUpdated: new Date() },
    create: { slug, name, bank, sourceUrl, rewardType: RewardType.POINTS, earnRate: 0, annualFee: 0, minimumSpend: 0, eligibleCategories: ["ALL"], channel: Channel.ANY, exclusions: [], status: PublishStatus.REVIEW },
  })));
  await db.offer.upsert({ where: { slug: "uob-wine-connection" }, update: { merchant: "Wine Connection", title: "Complimentary Truffle Parmesan Fries", description: "With S$120 minimum dine-in spend. Example seeded from official issuer page; verify before publishing.", minSpend: 120, validFrom: new Date("2026-01-01"), validTo: new Date("2026-04-30"), sourceUrl: "https://www.uob.com.sg/personal/cards/rewards/ladys-card/dining-and-entertainment-promotions.page", status: PublishStatus.PUBLISHED, cardIds: [uob.id] }, create: { slug: "uob-wine-connection", merchant: "Wine Connection", title: "Complimentary Truffle Parmesan Fries", description: "With S$120 minimum dine-in spend. Example seeded from official issuer page; verify before publishing.", minSpend: 120, validFrom: new Date("2026-01-01"), validTo: new Date("2026-04-30"), sourceUrl: "https://www.uob.com.sg/personal/cards/rewards/ladys-card/dining-and-entertainment-promotions.page", status: PublishStatus.PUBLISHED, cardIds: [uob.id] } });
  await db.article.upsert({ where: { slug: "best-cashback-cards-singapore" }, update: {}, create: { slug: "best-cashback-cards-singapore", title: "Cashback cards in Singapore", excerpt: "Compare cashback mechanics, spend tiers and monthly caps.", body: "Start with the merchant category. Then check your card's required spend, exclusions and cap before you pay.", status: PublishStatus.PUBLISHED } });
}

main().finally(() => db.$disconnect());
