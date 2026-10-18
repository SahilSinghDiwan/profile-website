import { Linkedin, Youtube } from "lucide-react";
import { XLogo } from "../components/icons/XLogo";
import type { Contact } from "../types";

export const contacts: Contact[] = [
  {
    type: "Network",
    label: "LinkedIn",
    description: "Connect for career opportunities, professional networking, and updates.",
    detailLabel: "Profile",
    detail: "linkedin.com/in/diwan-sahil",
    href: "https://www.linkedin.com/in/diwan-sahil",
    tags: ["Professional", "Networking"],
    icon: Linkedin,
  },
  {
    type: "Video",
    label: "YouTube",
    description: "Latent Workshop: videos on the mechanisms behind what I'm building.",
    detailLabel: "Channel",
    detail: "youtube.com/@latentworkshop",
    href: "https://www.youtube.com/@latentworkshop",
    tags: ["Long-form", "Shorts"],
    icon: Youtube,
  },
  {
    type: "Social",
    label: "X",
    description: "Latent Workshop on X: short takes cut from each week's video.",
    detailLabel: "Profile",
    detail: "x.com/latent_workshop",
    href: "https://x.com/latent_workshop",
    tags: ["Daily", "Short-form"],
    icon: XLogo,
  },
];
