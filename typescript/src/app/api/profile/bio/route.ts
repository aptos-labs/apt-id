import { NextRequest, NextResponse } from "next/server";
import { getBio } from "@/app/api/util.ts";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }
  console.log(`FETCHING ${address}`);
  try {
    const bio = await getBio(address);

    if (!bio) {
      return NextResponse.json({ error: "No profile found" }, { status: 404 });
    }

    return NextResponse.json(bio);
  } catch (error) {
    console.error("Error fetching bio:", error);
    return NextResponse.json({ error: "Failed to fetch bio" }, { status: 500 });
  }
}
