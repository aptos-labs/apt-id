import { Profile } from "../types";

export const MOCK_PROFILES: { [key: string]: Profile } = {
  "greg.apt": {
    owner: "0x123...789",
    ansName: "greg.apt",
    profilePicture: "/greg.png",
    description: "Aptos Labs",
    title: "Founding Engineer",
    links: [
      {
        id: "1",
        title: "Telegram",
        url: "https://t.me/gregnazario",
      },
      {
        id: "2",
        title: "Discord",
        url: "https://discord.com/users/gregnazario",
      },
      {
        id: "3",
        title: "Aptos Documentation",
        url: "https://aptos.dev",
      },
      {
        id: "4",
        title: "Personal Website",
        url: "https://gregnazario.com",
      },
    ],
  },
};
