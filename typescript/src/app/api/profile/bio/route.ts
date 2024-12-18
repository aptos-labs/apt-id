import { NextRequest, NextResponse } from "next/server";
import { client, CONTRACT_ADDRESS } from "@/constants.ts";

type ImageBio = { __variant__: "Image"; avatar_url: string; bio: string; name: string };
type NFTBio = { __variant__: "NFT"; nft_url: { inner: string }; bio: string; name: string };

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const bio = await client
      .view<[{ vec: [ImageBio | NFTBio] }]>({
        payload: {
          function: `${CONTRACT_ADDRESS}::profile::view_bio`,
          functionArguments: [address],
        },
      })
      .then(([data]) => {
        const bio = data.vec[0];
        if (bio.__variant__ === "Image") {
          return {
            name: bio.name,
            bio: bio.bio,
            avatar_url: bio.avatar_url,
          };
        } else {
          return {
            name: bio.name,
            bio: bio.bio,
            avatar_url: bio.nft_url.inner,
          };
        }
      });

    return NextResponse.json(bio);
  } catch (error) {
    console.error("Error fetching bio:", error);
    return NextResponse.json({ error: "Failed to fetch bio" }, { status: 500 });
  }
}
