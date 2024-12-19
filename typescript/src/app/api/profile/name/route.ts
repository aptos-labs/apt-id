import { NextRequest, NextResponse } from "next/server";
import { client } from "@/constants.ts";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const address = await client.ans.getTargetAddress({ name }).catch(() => undefined);

    if (!address) {
      return NextResponse.json({ error: "Address not found for name" }, { status: 404 });
    }

    return NextResponse.json(address.toStringLong());
  } catch (error) {
    console.error("Error fetching bio:", error);
    return NextResponse.json({ error: "Failed to fetch bio" }, { status: 500 });
  }
}
