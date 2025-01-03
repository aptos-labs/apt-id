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

export const revalidate = 0; // Disable caching so we can use the latest data

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata) {
  // Resolve name
  const name = (await params).name;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aptid.xyz';

  // Extend rather than replace parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  // Always add .apt for ANS lookup
  const lookupName = `${name}.apt`;
  const address = await client.ans.getTargetAddress({ name: lookupName }).catch(() => undefined);
  if (address) {
    const bio = await getBio(address.toString());

    if (bio) {
      const title = `${name}'s Profile | Apt ID`;
      const description = bio?.bio || `Check out ${name}'s profile on Apt ID`;
      const imageUrl = bio?.avatar_url || `${baseUrl}/favicon.ico`;

      return {
        title,
        description,
        openGraph: {
          images: [imageUrl, ...previousImages],
          description,
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [{
            url: imageUrl,
            alt: `${name}'s profile picture`,
          }],
        },
      };
    }
    return {
      title: `${name}'s profile`,
      description: `Profile page for ${name}`,
      openGraph: {
        images: [...previousImages],
        description: `Profile page for ${name}`,
      },
      twitter: {
        card: 'summary',
        title: `${name}'s profile`,
        description: `Profile page for ${name}`,
        images: [`${baseUrl}/favicon.ico`],
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

  if (!address) {
    return <NotFound aptName={params.name} />;
  }
  const [bio, links] = await Promise.all([getBio(address).catch(() => undefined), getLinks(address).catch(() => [])]);

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
