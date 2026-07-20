import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Cards() {
  const [cards, issuers] = await Promise.all([
    db.card.findMany({ where: { status: "PUBLISHED" }, orderBy: { updatedAt: "desc" } }),
    db.issuer.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  return <main className="wrap section"><div className="eyebrow">Singapore market directory</div><h1>Every major issuer, one place.</h1><p className="muted">Cards enter calculator results only after their rewards, caps and exclusions are reviewed.</p><h2>Reviewed card rules</h2><div className="grid">{cards.map(card => <Link key={card.id} className="card" href={`/cards/${card.slug}`}><div className="tag">{card.bank}</div><h3>{card.name}</h3><p className="muted">{card.earnRate}{card.rewardType === "CASHBACK" ? "%" : "×"} {card.rewardType.toLowerCase()} earn rate</p><div className="stats"><span className="stat">Min spend S${card.minimumSpend}</span>{card.monthlyCap && <span className="stat">Cap S${card.monthlyCap}</span>}</div></Link>)}</div><section className="section"><div className="eyebrow">Issuer coverage</div><h2>{issuers.length} banks and card issuers tracked</h2><div className="grid">{issuers.map(issuer => { const count = cards.filter(card => card.bank === issuer.name || (issuer.name === "Citi" && card.bank === "Citibank")).length; return <a key={issuer.id} className="card" href={issuer.sourceUrl} target="_blank" rel="noreferrer"><div className="tag">Official source</div><h3>{issuer.name}</h3><p className="muted">{count ? `${count} reviewed card${count > 1 ? "s" : ""} available for calculation.` : "Issuer indexed — card rules pending review."}</p><span className="stat">Visit issuer ↗</span></a> })}</div></section></main>;
}
