import { NextRequest, NextResponse } from "next/server"; import { signedIn } from "@/lib/session";
export function GET(request: NextRequest) { return NextResponse.json({ signedIn: signedIn(request) }); }
