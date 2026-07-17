import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
const secret = process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET || "change-me-in-vercel";
export const sessionToken = (email: string) => `${email}.${createHmac("sha256", secret).update(email).digest("hex")}`;
export function signedIn(request: NextRequest) { const token = request.cookies.get("perklah_session")?.value; if (!token) return false; const [email, signature] = token.split("."); const expected = createHmac("sha256", secret).update(email).digest("hex"); return Boolean(signature && timingSafeEqual(Buffer.from(signature), Buffer.from(expected))); }
