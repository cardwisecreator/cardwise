import type { Card, Offer } from "@prisma/client";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const [cards, offers, jobs] = await Promise.all([
    db.card.findMany({ orderBy: { updatedAt: "desc" } }),
    db.offer.findMany({ orderBy: { updatedAt: "desc" } }),
    db.importJob.findMany({ where: { status: "REVIEW" } }),
  ]);

  return <main className="wrap section"><div className="eyebrow">Admin console</div><h1>Data review</h1><p className="notice">MVP access is environment-password protected at API level. Add Auth.js/SSO before giving team access.</p><div className="layout section"><aside className="sidebar card"><b>Review queue</b><p className="muted">{jobs.length} imported updates waiting</p><b>Cards</b><p className="muted">{cards.length} records</p><b>Offers</b><p className="muted">{offers.length} records</p></aside><div><h2>Cards</h2><table className="adminTable"><tbody>{cards.map((card: Card) => <tr key={card.id}><td>{card.bank} · {card.name}</td><td>{card.status}</td><td>{card.updatedAt.toLocaleDateString("en-SG")}</td></tr>)}</tbody></table><h2>Merchant offers</h2><table className="adminTable"><tbody>{offers.map((offer: Offer) => <tr key={offer.id}><td>{offer.merchant}</td><td>{offer.title}</td><td>{offer.validTo.toLocaleDateString("en-SG")}</td></tr>)}</tbody></table></div></div></main>;
}
