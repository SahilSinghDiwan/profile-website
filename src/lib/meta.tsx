import writingImages from "virtual:public-writing-images";

export interface SeoProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: "website" | "article";
}

const SITE_URL = "https://sahildiwan.in";
export const DEFAULT_IMAGE = "/og-default.png";
const SITE_NAME = "Sahil Singh Diwan";

/**
 * Pick the share image: the requested one if it is an absolute URL or a file that
 * exists in public/, otherwise the default. Returns an absolute URL (crawlers need one).
 */
export function resolveImage(image?: string, available: readonly string[] = writingImages): string {
  let chosen = DEFAULT_IMAGE;
  if (image) {
    if (/^https?:\/\//.test(image)) chosen = image;
    else if (image === DEFAULT_IMAGE || available.includes(image)) chosen = image;
  }
  return chosen.startsWith("/") ? `${SITE_URL}${chosen}` : chosen;
}

export function Seo({ title, description, url, image, type = "website" }: SeoProps) {
  const ogImage = resolveImage(image);
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      {url && <meta property="og:url" content={url} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
}
