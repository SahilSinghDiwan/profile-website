import type { WritingPost } from "../types";

// Each post is one JSON file the posting-engine drops into content/writing/.
// Vite bundles them at build time, so the post text ships in the page HTML.
const modules = import.meta.glob<WritingPost>("../content/writing/*.json", {
  eager: true,
  import: "default",
});

export const writingPosts: WritingPost[] = Object.values(modules).sort((a, b) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
);

export function findPostBySlug(slug: string): WritingPost | undefined {
  return writingPosts.find((p) => p.slug === slug);
}
