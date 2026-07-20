import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
const secret = process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET || "change-me-in-vercel";
export const sessionToken = (email: string) => `${email}.${createHmac("sha256", secret).update(email).digest("hex")}`;
export function signedIn(request: NextRequest) {
  const token = request.cookies.get("perklah_session")?.value;
  if (!token) return false;
  // Email addresses routinely contain dots. Split on the final delimiter so
  // `jane.doe@example.com.<signature>` remains a valid session token.
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;
  const email = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = createHmac("sha256", secret).update(email).digest("hex");
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
