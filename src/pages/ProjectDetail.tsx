import { useParams, Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { DemoEmbed } from "../components/DemoEmbed";
import { ProjectAISummary } from "../components/ProjectAISummary";
import { Seo } from "../lib/meta";
import { findProjectBySlug } from "../data/projects";
import NotFound from "./NotFound";

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? findProjectBySlug(slug) : undefined;

  if (!project) return <NotFound />;

  return (
    <>
      <Seo
        title={`${project.title} — Sahil Singh Diwan`}
        description={project.description}
        type="article"
      />
      <div className="min-h-screen bg-background text-foreground">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <Link to="/projects" className="text-sm text-muted-foreground hover:text-primary">
            ← All projects
          </Link>

          <header className="mt-6 mb-10">
            <Badge variant="outline" className="text-xs mb-3">
              {project.category}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight mb-4">{project.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{project.description}</p>
          </header>

          <section className="mb-10 p-4 bg-primary/10 rounded-lg">
            <div className="text-sm font-medium text-primary mb-1">Impact</div>
            <div>{project.impact}</div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-3">AI summary</h2>
            <ProjectAISummary slug={project.slug} />
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-3">Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          </section>

          {project.demoUrl && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-3">Live demo</h2>
              <DemoEmbed demoUrl={project.demoUrl} title={project.title} />
            </section>
          )}

          <div className="flex gap-3">
            {project.githubUrl && (
              <Button asChild variant="outline">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </Button>
            )}
            <Button asChild>
              <Link to="/projects">Back to projects</Link>
            </Button>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProjectDetail;
