import { GithubIcon, TwitterIcon } from "lucide-react";
import { ExternalLinkIcon, PaperPlaneIcon } from "@radix-ui/react-icons";

export function PrimarySocialIcon({ platform, className = "w-4 h-4" }: { platform: string; className?: string }) {
  switch (platform) {
    case "x":
      return <TwitterIcon className={className} />;
    case "telegram":
      return <PaperPlaneIcon className={className} />;
    case "github":
      return <GithubIcon className={className} />;
    default:
      return <ExternalLinkIcon className={className} />;
  }
}
