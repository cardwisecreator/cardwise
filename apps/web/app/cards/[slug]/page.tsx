import { notFound } from "next/navigation";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function CardPage({params}:{params:Promise<{slug:string}>}) {
 const card=await db.card.findUnique({where:{slug:(await params).slug}}); if(!card||card.status!=="PUBLISHED") notFound();
 return <main className="wrap section"><div className="eyebrow">{card.bank} · last reviewed {card.lastUpdated.toLocaleDateString("en-SG")}</div><h1>{card.name}</h1><div className="grid"><div className="card"><h3>{card.earnRate}{card.rewardType==="CASHBACK"?"%":"×"}</h3><p className="muted">Base advertised earn rate</p></div><div className="card"><h3>S${card.minimumSpend}</h3><p className="muted">Minimum monthly spend</p></div><div className="card"><h3>S${card.annualFee}</h3><p className="muted">Annual fee</p></div></div><section className="section"><div className="card"><h3>Eligibility & exclusions</h3><p>{card.eligibleCategories.join(", ")} · {card.channel.toLowerCase()} transactions</p><p className="muted">Excludes: {card.exclusions.join(", ")}.</p><a className="button green" href={card.sourceUrl} target="_blank">Read official terms ↗</a></div></section></main>;
}
