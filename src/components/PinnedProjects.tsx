import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";
import { projects } from "../data/projects";

export function PinnedProjects() {
  const pinned = projects.filter((p) => p.pinned);
  if (pinned.length === 0) return null;

  return (
    <section aria-labelledby="pinned-heading" className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 id="pinned-heading" className="text-2xl font-bold tracking-tight">
          Featured
        </h2>
        <Badge variant="outline">Pinned</Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {pinned.map((p) => (
          <Card
            key={p.slug}
            className="h-full flex flex-col border-2 border-primary/40 relative overflow-hidden"
          >
            <div className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-primary text-primary-foreground">
              Featured
            </div>
            <CardHeader className="pb-4">
              <Badge variant="outline" className="text-xs w-fit mb-2">
                {p.category}
              </Badge>
              <CardTitle className="text-lg leading-tight mb-3">
                <Link to={`/projects/${p.slug}`} className="hover:text-primary">
                  {p.title}
                </Link>
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">{p.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                <div className="text-sm font-medium text-primary mb-1">Impact</div>
                <div className="text-sm">{p.impact}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.technologies.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
