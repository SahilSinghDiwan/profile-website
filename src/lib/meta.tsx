export interface SeoProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: "website" | "article";
}

const DEFAULT_IMAGE = "/og-default.png";
const SITE_NAME = "Sahil Singh Diwan";

export function Seo({ title, description, url, image, type = "website" }: SeoProps) {
  const ogImage = image ?? DEFAULT_IMAGE;
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
