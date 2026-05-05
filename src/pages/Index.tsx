import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Github, Mail, Linkedin, Moon, Sun, Menu, X } from 'lucide-react';
import { projects } from '../data/projects';
import { skills } from '../data/skills';
import { experience } from '../data/experience';
import { education } from '../data/education';
import { credentials } from '../data/credentials';
import { contacts } from '../data/contacts';
import { Seo } from '../lib/meta';
import { ResumeDownload } from '../components/ResumeDownload';

const SKILL_PREVIEW_COUNT = 8;
const EXPERIENCE_BULLET_PREVIEW_COUNT = 2;

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const isExpanded = (key: string) => Boolean(expanded[key]);
  const toggleExpanded = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <Seo
        title="Sahil Singh Diwan — AI / GenAI Engineer"
        description="5+ years building RAG pipelines, scalable microservices, and production-grade GenAI systems."
      />
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-300`}>
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="font-semibold text-lg tracking-tight">Sahil Singh Diwan</div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <button onClick={() => scrollToSection('about')} className="hover:text-primary transition-colors">About</button>
                <button onClick={() => scrollToSection('skills')} className="hover:text-primary transition-colors">Skills</button>
                <button onClick={() => scrollToSection('projects')} className="hover:text-primary transition-colors">Projects</button>
                <button onClick={() => scrollToSection('experience')} className="hover:text-primary transition-colors">Experience</button>
                <button onClick={() => scrollToSection('education')} className="hover:text-primary transition-colors">Education</button>
                <button onClick={() => scrollToSection('contact')} className="hover:text-primary transition-colors">Contact</button>
                <ResumeDownload />
                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden py-4 border-t">
                <div className="flex flex-col gap-3">
                  <button onClick={() => scrollToSection('about')} className="text-left py-2 hover:text-primary transition-colors">About</button>
                  <button onClick={() => scrollToSection('skills')} className="text-left py-2 hover:text-primary transition-colors">Skills</button>
                  <button onClick={() => scrollToSection('projects')} className="text-left py-2 hover:text-primary transition-colors">Projects</button>
                  <button onClick={() => scrollToSection('experience')} className="text-left py-2 hover:text-primary transition-colors">Experience</button>
                  <button onClick={() => scrollToSection('education')} className="text-left py-2 hover:text-primary transition-colors">Education</button>
                  <button onClick={() => scrollToSection('contact')} className="text-left py-2 hover:text-primary transition-colors">Contact</button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-40 pb-24 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
                Sahil Diwan
                <br />
                <span className="text-3xl sm:text-4xl lg:text-5xl">AI / Gen AI Engineer</span>
              </h1>

              <p className="text-xl sm:text-2xl text-primary font-medium tracking-tight mb-8">
                Architecting end-to-end AI solutions
              </p>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10">
                5+ years building RAG pipelines, scalable microservices, and production-grade GenAI systems with vector databases, Kafka, Airflow, and Kubernetes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" onClick={() => scrollToSection('projects')} className="w-full sm:w-auto">
                  View My Work
                </Button>
                <Button variant="outline" size="lg" onClick={() => scrollToSection('contact')} className="w-full sm:w-auto">
                  Get In Touch
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="scroll-mt-24 py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">About Me</h2>
              <div className="w-16 h-0.5 bg-primary mx-auto"></div>
            </div>

            <div className="max-w-3xl mx-auto">
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
                Dynamic AI / GenAI Engineer with 5 years of software development and AI experience, specializing in architecting and deploying end-to-end AI solutions. I've scaled GenAI products from POC to production, built advanced RAG pipelines, and deployed containerized microservices for high-availability, low-latency enterprise applications.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10">
                I work fluently with vector databases (FAISS, Milvus, ChromaDB), distributed messaging (Kafka), and orchestration tools (Kubernetes, Airflow). My focus: clean, maintainable code that translates technical solutions into measurable business value — reduced MTTR, better recall, fewer hallucinations.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <div className="text-3xl font-bold tracking-tight text-primary mb-2 tabular-nums">5+</div>
                  <div className="text-muted-foreground">Years Experience</div>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold tracking-tight text-primary mb-2 tabular-nums">10+</div>
                  <div className="text-muted-foreground">Corporate Projects</div>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold tracking-tight text-primary mb-2 tabular-nums">99.9%</div>
                  <div className="text-muted-foreground">Uptime Achieved</div>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold tracking-tight text-primary mb-2 tabular-nums">40–60%</div>
                  <div className="text-muted-foreground">MTTR Reduction</div>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold tracking-tight text-primary mb-2 tabular-nums">200+</div>
                  <div className="text-muted-foreground">SREs Supported</div>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold tracking-tight text-primary mb-2 tabular-nums">90%</div>
                  <div className="text-muted-foreground">RCA Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="scroll-mt-24 py-20 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Skills & Technologies</h2>
              <div className="w-16 h-0.5 bg-primary mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {Object.entries(skills).map(([category, skillList]) => {
                const key = `skill-${category}`;
                const open = isExpanded(key);
                const visibleSkills = open
                  ? skillList
                  : skillList.slice(0, SKILL_PREVIEW_COUNT);
                const hiddenCount = skillList.length - SKILL_PREVIEW_COUNT;
                const hasMore = hiddenCount > 0;
                return (
                  <Card key={category} className="h-full flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {skillList.length} skills
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight mb-3">{category}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-wrap gap-2">
                        {visibleSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      {hasMore && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(key)}
                          className="mt-3 self-start text-xs font-medium text-primary hover:underline"
                          aria-expanded={open}
                        >
                          {open ? 'Show less' : `+${hiddenCount} more`}
                        </button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="scroll-mt-24 py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Featured Projects</h2>
              <div className="w-16 h-0.5 bg-primary mx-auto"></div>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Selected projects demonstrating end-to-end ownership and measurable business impact. Source links omitted as these are proprietary client deployments.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <Card key={index} className="h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {project.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight mb-3">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {project.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                      <div className="text-sm font-medium text-primary mb-1">Impact</div>
                      <div className="text-sm">{project.impact}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="scroll-mt-24 py-20 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Work Experience</h2>
              <div className="w-16 h-0.5 bg-primary mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {experience.map((job, idx) => {
                const key = `exp-${idx}`;
                const open = isExpanded(key);
                const visibleBullets = open
                  ? job.bullets
                  : job.bullets.slice(0, EXPERIENCE_BULLET_PREVIEW_COUNT);
                const hiddenCount = job.bullets.length - EXPERIENCE_BULLET_PREVIEW_COUNT;
                const hasMore = hiddenCount > 0;
                return (
                  <Card key={idx} className="h-full flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{job.period}</Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight mb-3">{job.role}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {job.company} · {job.location}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                        <div className="text-sm font-medium text-primary mb-2">Highlights</div>
                        <ul className="text-sm space-y-1.5">
                          {visibleBullets.map((b, bi) => (
                            <li key={bi}>• {b}</li>
                          ))}
                        </ul>
                        {hasMore && (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(key)}
                            className="mt-3 text-xs font-medium text-primary hover:underline"
                            aria-expanded={open}
                          >
                            {open ? 'Show less' : `Show ${hiddenCount} more highlight${hiddenCount === 1 ? '' : 's'}`}
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {job.tech.map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Education & Certifications Section */}
        <section id="education" className="scroll-mt-24 py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Education & Certifications</h2>
              <div className="w-16 h-0.5 bg-primary mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {education.map((edu, idx) => (
                <Card key={`edu-${idx}`} className="h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">{edu.period}</Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight mb-3">{edu.degree}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {edu.institution}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                      <div className="text-sm font-medium text-primary mb-1">{edu.duration}</div>
                      <div className="text-sm">{edu.location}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {edu.tags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {credentials.map((c, idx) => (
                <Card key={`cred-${idx}`} className="h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">{c.type}</Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight mb-3">{c.name}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {c.issuer}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                      <div className="text-sm font-medium text-primary mb-1">{c.detailLabel}</div>
                      <div className="text-sm">{c.detail}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {c.tags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="scroll-mt-24 py-20 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Get In Touch</h2>
              <div className="w-16 h-0.5 bg-primary mx-auto"></div>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                I'm always interested in new opportunities and exciting projects. Let's discuss how we can work together.
              </p>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-14">
              {contacts.map((c, idx) => {
                const Icon = c.icon;
                return (
                  <a
                    key={idx}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${c.label} — ${c.detail}`}
                    title={c.detail}
                    className="group flex flex-col items-center text-center"
                  >
                    <div className="flex flex-shrink-0 items-center justify-center w-16 h-16 aspect-square rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="mt-3 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
                      <div className="text-sm font-medium text-primary">
                        {c.label}
                      </div>
                      <div className="text-xs text-muted-foreground break-all">
                        {c.detail}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-muted-foreground mb-4 sm:mb-0">
                © 2026 Sahil Singh Diwan. All rights reserved.
              </div>
              <div className="flex gap-4">
                <a href="https://github.com/SahilSinghDiwan" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/diwan-sahil/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="mailto:diwan.sahilsingh@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
    );
  };

export default Index;
