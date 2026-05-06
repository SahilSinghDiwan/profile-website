import type { LucideIcon } from "lucide-react";

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
