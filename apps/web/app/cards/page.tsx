import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Cards() {
  const [cards, issuers] = await Promise.all([
    db.card.findMany({ where: { status: "PUBLISHED" }, orderBy: { updatedAt: "desc" } }),
    db.issuer.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return <main className="wrap section">
    <div className="eyebrow">Singapore market directory</div>
    <h1>All major Singapore card issuers.</h1>
    <p className="muted">Start with any bank, then use the calculator once its reward rules are reviewed.</p>

    <section className="section">
      <div className="eyebrow">Issuer coverage</div>
      <h2>{issuers.length} banks and card issuers tracked</h2>
      <div className="grid">{issuers.map(issuer => {
        const count = cards.filter(card => card.bank === issuer.name || (issuer.name === "Citi" && card.bank === "Citibank")).length;
        return <a key={issuer.id} className="card" href={issuer.sourceUrl} target="_blank" rel="noreferrer">
          <div className="tag">Official source</div>
          <h3>{issuer.name}</h3>
          <p className="muted">{count ? `${count} reviewed card${count > 1 ? "s" : ""} available for calculation.` : "Issuer indexed - card rules pending review."}</p>
          <span className="stat">Visit issuer -&gt;</span>
        </a>;
      })}</div>
    </section>

    <section className="section">
      <div className="eyebrow">Recommendation-ready</div>
      <h2>Reviewed card rules ({cards.length})</h2>
      <p className="muted">Only these cards enter calculator results, so unverified reward rates never affect a recommendation.</p>
      <div className="grid">{cards.map(card => <Link key={card.id} className="card" href={`/cards/${card.slug}`}>
        <div className="tag">{card.bank}</div>
        <h3>{card.name}</h3>
        <p className="muted">{card.earnRate}{card.rewardType === "CASHBACK" ? "%" : "x"} {card.rewardType.toLowerCase()} earn rate</p>
        <div className="stats"><span className="stat">Min spend S${card.minimumSpend}</span>{card.monthlyCap && <span className="stat">Cap S${card.monthlyCap}</span>}</div>
      </Link>)}</div>
    </section>
  </main>;
}
