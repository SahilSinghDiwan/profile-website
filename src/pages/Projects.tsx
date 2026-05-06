import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { PinnedProjects } from "../components/PinnedProjects";
import { GitHubProjects } from "../components/GitHubProjects";
import { TechFilter } from "../components/TechFilter";
import { useFilteredProjects } from "../hooks/useFilteredProjects";
import { Seo } from "../lib/meta";
import { projects } from "../data/projects";

const Projects = () => {
  const nonPinned = projects.filter((p) => !p.pinned);
  const { selected, setSelected, filter } = useFilteredProjects();
  const availableTechs = Array.from(
    new Set(projects.flatMap((p) => p.technologies))
  ).sort();
  const visibleProjects = filter(nonPinned);

  return (
    <>
      <Seo
        title="Projects — Sahil Singh Diwan"
        description="Selected AI / GenAI engineering projects: RAG pipelines, retrieval systems, multimodal generation, and production microservices."
      />
      <div className="min-h-screen bg-background text-foreground">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <header className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Projects</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A selection of AI / GenAI engineering work — from POC to production.
            </p>
          </header>

          <PinnedProjects />

          <section aria-labelledby="all-projects">
            <h2 id="all-projects" className="text-2xl font-bold tracking-tight mb-6">
              All projects
            </h2>
            <div className="mb-6">
              <TechFilter
                availableTechs={availableTechs}
                selected={selected}
                onChange={setSelected}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {visibleProjects.map((p) => (
                <Card key={p.slug} className="h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <Badge variant="outline" className="text-xs w-fit mb-2">
                      {p.category}
                    </Badge>
                    <CardTitle className="text-lg leading-tight mb-3">
                      <Link to={`/projects/${p.slug}`} className="hover:text-primary">
                        {p.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {p.description}
                    </CardDescription>
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

          <section aria-labelledby="github-projects" className="mt-16">
            <h2 id="github-projects" className="text-2xl font-bold tracking-tight mb-6">
              More from GitHub
            </h2>
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <GitHubProjects />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Projects;
