import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { NextRequest, NextResponse } from "next/server";
import { CONTRACT_ADDRESS } from "@/constants.ts";

type LinkTree = {
  __variant__: "SM";
  links: {
    data: {
      key: string;
      value: {
        __variant__: "UnorderedLink";
        url: string;
      };
    }[];
  };
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const client = new Aptos(new AptosConfig({ network: Network.DEVNET }));

    const links = await client
      .view<[LinkTree]>({
        payload: {
          function: `${CONTRACT_ADDRESS}::profile::view_links`,
          functionArguments: [address],
        },
      })
      .then(([data]) => {
        const links =
          data?.links?.data?.map((link) => ({
            id: link.key,
            title: link.key,
            url: link.value.url,
          })) ?? [];

        return links;
      });

    return NextResponse.json(links);
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}
