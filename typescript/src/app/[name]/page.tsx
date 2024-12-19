import { ResolvingMetadata } from "next";
import ProfileClient from "./ProfileClient";
import { client } from "@/constants.ts";
import { redirect } from "next/navigation";
import NotFound from "@/app/not-found.tsx";
import { getBio, getLinks } from "@/app/api/util.ts";

type Props = {
  params: Promise<{
    name: string;
  }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata) {
  // Resolve name
  const name = (await params).name;

  // Extend rather than replace parent metadata (TODO: Do we want this)
  const previousImages = (await parent).openGraph?.images || [];

  // Always add .apt for ANS lookup
  const lookupName = `${name}.apt`;
  const address = await client.ans.getTargetAddress({ name: lookupName }).catch(() => undefined);
  if (address) {
    const bio = await getBio(address.toString());

    if (bio) {
      return {
        title: `${name}'s profile`,
        openGraph: {
          images: [bio?.avatar_url, ...previousImages],
        },
      };
    }
    return {
      title: `${name}'s profile`,
      opengraph: {
        images: [...previousImages],
      },
    };
  }
}

  export async function generateStaticParams() {
    return [];
  }

  interface PageProps {
    params: Promise<{ name: string }>;
  }

  export default async function ProfilePage(props: PageProps) {
    const params = await props.params;
    if (!params?.name) {
      return <NotFound aptName={params.name} />;
    }

    // Redirect .apt URLs to base name
    if (params.name.endsWith(".apt")) {
      redirect(`/${params.name.slice(0, -4)}`);
    }

    // Always add .apt for ANS lookup
    const lookupName = `${params.name}.apt`;

    // Server-side data fetching
    const address = await client.ans.getTargetAddress({ name: lookupName }).catch(() => undefined);

    const bio = address ? await getBio(address).catch(() => undefined) : undefined;
    const links = address ? await getLinks(address).catch(() => undefined) : undefined;

    // Create a profile using the URL parameter as the ANS name
    const profile = {
      owner: address?.toStringLong() ?? "",
      ansName: lookupName,
      name: bio?.name ?? "",
      profilePicture: bio?.avatar_url ?? "",
      description: bio?.bio ?? "",
      title: bio?.name ?? "",
      links: links ?? [],
    };

    if (!profile.owner || bio?.name === undefined) {
      return <NotFound aptName={params.name} />;
    }

    return <ProfileClient profile={profile} />;
  }
