import { NextRequest, NextResponse } from "next/server";
import { getLinks } from "@/app/api/util.ts";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  // TODO: add caching

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const links = await getLinks(address);

    if (!links) {
      return NextResponse.json({ error: "No profile found" }, { status: 404 });
    }

    return NextResponse.json(links);
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}
