import { Mail, Linkedin, MessageCircle } from "lucide-react";
import type { Contact } from "../types";

export const contacts: Contact[] = [
  {
    type: "Direct",
    label: "Email",
    description: "Best for project inquiries, collaboration, and detailed discussions.",
    detailLabel: "Reach me at",
    detail: "diwan.sahilsingh@gmail.com",
    href: "mailto:diwan.sahilsingh@gmail.com",
    tags: ["Async", "Detailed"],
    icon: Mail,
  },
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
    type: "Instant",
    label: "WhatsApp",
    description: "Quickest way to reach me for short questions or scheduling a call.",
    detailLabel: "Message",
    detail: "+91 800-7192-680",
    href: "https://wa.me/918007192680?text=Hello,%20I'd%20like%20to%20connect%20regarding%20your%20portfolio.",
    tags: ["Real-time", "Quick"],
    icon: MessageCircle,
  },
];
