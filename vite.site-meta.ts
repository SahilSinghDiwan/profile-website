import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

export const SITE_URL = "https://sahildiwan.in";
const VIRTUAL_ID = "virtual:public-writing-images";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

const STATIC_ROUTES = ["/", "/projects", "/writing", "/privacy"];

function listDir(dir: string, ext: RegExp): string[] {
  try {
    return fs.readdirSync(dir).filter((f) => ext.test(f));
  } catch {
    return [];
  }
}

/** Slugs of src/data/projects.ts entries (read as text; the file is plain data). */
function projectSlugs(root: string): string[] {
  const file = path.join(root, "src/data/projects.ts");
  if (!fs.existsSync(file)) return [];
  return [...fs.readFileSync(file, "utf8").matchAll(/^\s*slug:\s*["']([^"']+)["']/gm)].map((m) => m[1]);
}

function writingPosts(root: string): { slug: string; date?: string }[] {
  const dir = path.join(root, "src/content/writing");
  return listDir(dir, /\.json$/).flatMap((f) => {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      return p.slug ? [{ slug: String(p.slug), date: p.date ? String(p.date) : undefined }] : [];
    } catch {
      return [];
    }
  });
}

export function buildSitemap(root: string): string {
  const entries: { loc: string; lastmod?: string }[] = [
    ...STATIC_ROUTES.map((r) => ({ loc: r })),
    ...projectSlugs(root).map((s) => ({ loc: `/projects/${s}` })),
    ...writingPosts(root).map((p) => ({ loc: `/writing/${p.slug}`, lastmod: p.date })),
  ];
  const urls = entries
    .map((e) => `  <url><loc>${SITE_URL}${e.loc === "/" ? "/" : e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}</url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * 1. virtual:public-writing-images — list of /writing/*.png files that exist in public/,
 *    so card images that are missing fall back to the default OG image.
 * 2. sitemap.xml generated at build time from the routes, projects and writing posts.
 */
export function siteMeta(): Plugin {
  let root = process.cwd();
  return {
    name: "site-meta",
    configResolved(cfg) {
      root = cfg.root;
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      const files = listDir(path.join(root, "public/writing"), /\.(png|jpe?g|webp)$/i).map((f) => `/writing/${f}`);
      return `export default ${JSON.stringify(files)};`;
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: buildSitemap(root) });
    },
  };
}
