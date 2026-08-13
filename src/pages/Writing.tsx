import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Seo } from "../lib/meta";
import { writingPosts } from "../data/writing";

function excerpt(body: string, n = 180): string {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length <= n ? flat : flat.slice(0, n).replace(/\s+\S*$/, "") + "…";
}

const Writing = () => (
  <>
    <Seo
      title="Writing — Sahil Singh Diwan"
      description="Field notes on production RAG, retrieval, agentic tooling, and LLMOps — cross-posted from LinkedIn."
    />
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Writing</h1>
          <p className="text-muted-foreground max-w-2xl">
            Field notes from building AI systems in production — cross-posted from LinkedIn.
          </p>
        </header>

        {writingPosts.length === 0 ? (
          <p className="text-muted-foreground">Nothing here yet — check back soon.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {writingPosts.map((p) => (
              <Card key={p.slug} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {p.pillar}
                    </Badge>
                    <time className="text-xs text-muted-foreground" dateTime={p.date}>
                      {p.date}
                    </time>
                  </div>
                  <CardTitle className="text-xl leading-tight">
                    <Link to={`/writing/${p.slug}`} className="hover:text-primary">
                      {p.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed mt-2">
                    {excerpt(p.body)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {p.hashtags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  </>
);

export default Writing;
