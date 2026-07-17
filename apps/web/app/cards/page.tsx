import Link from "next/link";
import { db } from "@/lib/db";
export const dynamic="force-dynamic";
export default async function Cards(){const cards=await db.card.findMany({where:{status:"PUBLISHED"},orderBy:{updatedAt:"desc"}});return <main className="wrap section"><div className="eyebrow">Market directory</div><h1>Cards worth knowing.</h1><div className="grid">{cards.map(c=><Link key={c.id} className="card" href={`/cards/${c.slug}`}><div className="tag">{c.bank}</div><h3>{c.name}</h3><p className="muted">{c.earnRate}{c.rewardType==="CASHBACK"?"%":"×"} {c.rewardType.toLowerCase()} earn rate</p><div className="stats"><span className="stat">Min spend S${c.minimumSpend}</span>{c.monthlyCap&&<span className="stat">Cap S${c.monthlyCap}</span>}</div></Link>)}</div></main>}
