import { useParams, Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Seo } from "../lib/meta";
import { findPostBySlug } from "../data/writing";
import NotFound from "./NotFound";

const SITE_URL = "https://sahildiwan.in";

const WritingDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? findPostBySlug(slug) : undefined;

  if (!post) return <NotFound />;

  const paragraphs = post.body
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <Seo
        title={`${post.title} — Sahil Singh Diwan`}
        description={post.body.replace(/\s+/g, " ").trim().slice(0, 160)}
        type="article"
        url={`${SITE_URL}/writing/${post.slug}`}
        image={post.cardImage}
      />
      <div className="min-h-screen bg-background text-foreground">
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <Link to="/writing" className="text-sm text-muted-foreground hover:text-primary">
            ← All writing
          </Link>

          <header className="mt-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {post.pillar}
              </Badge>
              <time className="text-xs text-muted-foreground" dateTime={post.date}>
                {post.date}
              </time>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{post.title}</h1>
          </header>

          {post.cardImage && (
            <img
              src={post.cardImage}
              alt={post.title}
              className="w-full rounded-lg border border-border mb-8"
              loading="lazy"
            />
          )}

          <article className="space-y-4 text-base leading-relaxed">
            {paragraphs.map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </article>

          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {post.hashtags.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {post.linkedinUrl && (
            <div className="mt-10">
              <Button asChild variant="outline">
                <a href={post.linkedinUrl} target="_blank" rel="noopener noreferrer">
                  Discuss on LinkedIn →
                </a>
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default WritingDetail;
