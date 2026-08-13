import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Seo } from "../lib/meta";
import { findPostBySlug } from "../data/writing";
import NotFound from "./NotFound";

const SITE_URL = "https://sahildiwan.in";

// Markdown styling for the long-form "director's cut". Links always open in a new tab.
const markdownComponents: Components = {
  h2: (p) => <h2 className="text-xl font-semibold mt-8 mb-3" {...p} />,
  h3: (p) => <h3 className="text-lg font-semibold mt-6 mb-2" {...p} />,
  p: (p) => <p className="leading-relaxed" {...p} />,
  a: (p) => (
    <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...p} />
  ),
  ul: (p) => <ul className="list-disc pl-6 space-y-1" {...p} />,
  ol: (p) => <ol className="list-decimal pl-6 space-y-1" {...p} />,
  strong: (p) => <strong className="font-semibold" {...p} />,
  em: (p) => <em className="italic" {...p} />,
  code: (p) => <code className="rounded bg-muted px-1 py-0.5 text-sm" {...p} />,
  blockquote: (p) => (
    <blockquote className="border-l-2 border-border pl-4 italic text-muted-foreground" {...p} />
  ),
};

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

          {/* The short version — what went to LinkedIn */}
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

          {/* The long-form "director's cut" — website only */}
          {post.longform && (
            <section className="mt-12 pt-8 border-t border-border">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-6">
                The full write-up
              </h2>
              <div className="space-y-4 text-base leading-relaxed">
                <ReactMarkdown components={markdownComponents}>{post.longform}</ReactMarkdown>
              </div>
            </section>
          )}

          {post.references && post.references.length > 0 && (
            <section className="mt-10 pt-6 border-t border-border">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-4">
                Further reading
              </h2>
              <ul className="space-y-3 text-sm">
                {post.references.map((r) => (
                  <li key={r.url} className="flex gap-2">
                    <span className="mt-1 text-muted-foreground" aria-hidden>
                      ↗
                    </span>
                    <span>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {r.title}
                      </a>
                      {r.note && <span className="text-muted-foreground"> — {r.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
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
