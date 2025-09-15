import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Github, ExternalLink, Mail, Linkedin, Moon, Sun, Menu, X } from 'lucide-react';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Research-backed project data using effective title formulas
  const projects = [
    {
      title: "Built Scalable E-commerce Platform using React & Node.js",
      description: "Reduced load time by 40% through strategic refactoring and implemented secure payment processing",
      technologies: ["React", "TypeScript", "Node.js", "Stripe API", "PostgreSQL"],
      impact: "40% faster load times, $2M+ monthly transactions processed",
      liveDemo: "#",
      github: "#",
      category: "Full-Stack Development"
    },
    {
      title: "Developed Real-Time Analytics Dashboard (Python & D3.js)",
      description: "Improved data visualization performance by 60% with interactive charts and WebSocket integration",
      technologies: ["Python", "D3.js", "WebSockets", "Redis", "Docker"],
      impact: "60% performance improvement, real-time data processing",
      liveDemo: "#",
      github: "#",
      category: "Data Visualization"
    },
    {
      title: "Engineered Authentication System Rebuild (React & Supabase)",
      description: "Enhanced security while reducing authentication time by 25% using modern JWT implementation",
      technologies: ["React", "TypeScript", "Supabase", "JWT", "Tailwind CSS"],
      impact: "25% faster auth, 99.9% uptime, enhanced security",
      liveDemo: "#",
      github: "#",
      category: "Security & Auth"
    }
  ];

  // Research shows skills should be positioned early for scanning priority
  const skills = {
    "Frontend": ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Vue.js"],
    "Backend": ["Node.js", "Python", "PostgreSQL", "MongoDB", "Express.js", "GraphQL"],
    "Tools & Cloud": ["Git", "Docker", "AWS", "Vercel", "Supabase", "CI/CD", "Jest"]
  };

  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-300`}>
        {/* Navigation - Research shows clear nav is scanned first */}
        <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="font-bold text-xl">Sahil Singh Diwan</div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <button onClick={() => scrollToSection('about')} className="hover:text-primary transition-colors">About</button>
                <button onClick={() => scrollToSection('projects')} className="hover:text-primary transition-colors">Projects</button>
                <button onClick={() => scrollToSection('skills')} className="hover:text-primary transition-colors">Skills</button>
                <button onClick={() => scrollToSection('experience')} className="hover:text-primary transition-colors">Experience</button>
                <button onClick={() => scrollToSection('contact')} className="hover:text-primary transition-colors">Contact</button>
                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden flex items-center space-x-2">
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
                <div className="flex flex-col space-y-2">
                  <button onClick={() => scrollToSection('about')} className="text-left py-2 hover:text-primary transition-colors">About</button>
                  <button onClick={() => scrollToSection('projects')} className="text-left py-2 hover:text-primary transition-colors">Projects</button>
                  <button onClick={() => scrollToSection('skills')} className="text-left py-2 hover:text-primary transition-colors">Skills</button>
                  <button onClick={() => scrollToSection('experience')} className="text-left py-2 hover:text-primary transition-colors">Experience</button>
                  <button onClick={() => scrollToSection('contact')} className="text-left py-2 hover:text-primary transition-colors">Contact</button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section - Optimized for 15-second scan */}
        <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              {/* Clear, keyword-rich H1 - Research shows this is scanned first */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                AI Engineer 
                <span className="block text-primary text-2xl">Specializing in Python</span>
              </h1>
              
              {/* Concise personal brand statement - Research shows this is critical */}
              <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                I build responsive and scalable web applications with a focus on clean code, user experience, and measurable business impact.
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

        {/* About Section - Brief and scannable */}
        <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">About Me</h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg leading-relaxed mb-6">
                With 5+ years of experience in full-stack development, I specialize in building modern web applications that solve real business problems. My expertise spans from responsive frontend interfaces to scalable backend architectures.
              </p>
              <p className="text-lg leading-relaxed mb-8">
                I'm passionate about writing clean, maintainable code and delivering measurable results. Whether it's reducing load times by 40% or processing millions in transactions, I focus on creating solutions that drive business value.
              </p>
              
              {/* Quick stats for immediate impact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <div className="text-3xl font-bold text-primary mb-2">5+</div>
                  <div className="text-muted-foreground">Years Experience</div>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="text-muted-foreground">Projects Completed</div>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                  <div className="text-muted-foreground">Uptime Achieved</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section - Positioned early per research findings */}
        <section id="skills" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Skills & Technologies</h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(skills).map(([category, skillList]) => (
                <Card key={category} className="p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {skillList.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section - Using research-backed title formulas */}
        <section id="projects" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Projects</h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Here are some of my recent projects that demonstrate problem-solving skills and technical expertise with measurable results.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {project.category}
                      </Badge>
                    </div>
                    {/* Research-backed title format: Action-Result-Technology */}
                    <CardTitle className="text-lg leading-tight mb-3 group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="mb-4">
                      {/* Quantifiable impact - Research shows this is crucial */}
                      <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                        <div className="text-sm font-medium text-primary mb-1">Impact</div>
                        <div className="text-sm">{project.impact}</div>
                      </div>
                      
                      {/* Technology stack */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Links to live demo and source code */}
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={project.liveDemo} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={project.github} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          Code
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Work Experience</h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">Senior Full-Stack Developer</h3>
                    <p className="text-primary font-medium">TechCorp Solutions</p>
                  </div>
                  <Badge variant="outline">2022 - Present</Badge>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Led development of e-commerce platform serving 100K+ users, reducing load times by 40%</li>
                  <li>• Implemented secure payment processing system handling $2M+ monthly transactions</li>
                  <li>• Mentored 3 junior developers and established code review best practices</li>
                </ul>
              </Card>

              <Card className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">Full-Stack Developer</h3>
                    <p className="text-primary font-medium">StartupXYZ</p>
                  </div>
                  <Badge variant="outline">2020 - 2022</Badge>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Built real-time analytics dashboard improving data visualization performance by 60%</li>
                  <li>• Developed authentication system reducing login time by 25%</li>
                  <li>• Collaborated with design team to implement responsive UI components</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Get In Touch</h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                I'm always interested in new opportunities and exciting projects. Let's discuss how we can work together.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Email</h3>
                  <a href="mailto:alex@example.com" className="text-muted-foreground hover:text-primary transition-colors">
                    alex@example.com
                  </a>
                </Card>
                
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <Linkedin className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">LinkedIn</h3>
                  <a href="https://linkedin.com/in/alexjohnson" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    /in/alexjohnson
                  </a>
                </Card>
              </div>

              <div className="text-center">
                <Button size="lg" asChild>
                  <a href="mailto:alex@example.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-muted-foreground mb-4 sm:mb-0">
                © 2025 Sahil Singh Diwan. All rights reserved.
              </div>
              <div className="flex space-x-4">
                <a href="https://github.com/alexjohnson" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com/in/alexjohnson" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="mailto:alex@example.com" className="text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  };

export default Index;