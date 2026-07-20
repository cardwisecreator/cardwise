import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse("Unauthorized", { status: 401 });
  const issuers = await db.issuer.findMany({ where: { active: true } });
  await db.importJob.createMany({ data: issuers.map(issuer => ({ sourceName: `${issuer.name} card catalogue`, sourceUrl: issuer.sourceUrl, status: "REVIEW" })) });
  await db.issuer.updateMany({ where: { id: { in: issuers.map(issuer => issuer.id) } }, data: { lastSyncedAt: new Date() } });
  return NextResponse.json({ queued: issuers.length, message: "Queued issuer catalogues for human review; no reward rule was published automatically." });
}
