import type { LucideIcon } from "lucide-react";

export interface WritingReference {
  title: string;
  url: string; // verified to resolve before publish
  note?: string; // one line: what it is / why it's relevant
}

export interface WritingPost {
  slug: string;
  title: string;
  date: string; // ISO YYYY-MM-DD
  pillar: string;
  format: string;
  body: string; // clean post text (no hashtags inline) — also the LinkedIn version
  hashtags: string[];
  cardImage?: string; // e.g. /writing/<slug>.png
  linkedinUrl?: string; // filled once the LinkedIn post exists
  longform?: string; // markdown "director's cut" expansion (website only)
  references?: WritingReference[]; // verified prior-art / further-reading links
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  impact: string;
  category: string;
  slug: string;
  pinned?: boolean;
  demoUrl?: string;
  githubUrl?: string;
}

export interface ExperienceJob {
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
  tech: string[];
}

export interface Education {
  institution: string;
  degree: string;
  duration: string;
  location: string;
  period: string;
  tags: string[];
}

export interface Credential {
  type: string;
  name: string;
  issuer: string;
  detailLabel: string;
  detail: string;
  tags: string[];
}

export interface Contact {
  type: string;
  label: string;
  description: string;
  detailLabel: string;
  detail: string;
  href: string;
  tags: string[];
  icon: LucideIcon;
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  links: {
    github: string;
    linkedin: string;
    whatsapp: string;
  };
}

export type SkillsMap = Record<string, string[]>;
