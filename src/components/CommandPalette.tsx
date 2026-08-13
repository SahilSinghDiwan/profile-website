import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useNavigate, useLocation } from "react-router-dom";
import { Download, Moon, Sun, Mail, Navigation } from "lucide-react";
import { useCmdK } from "../hooks/useCmdK";

interface CommandAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  keywords: string[];
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useCmdK();

  const isDarkMode = document.documentElement.classList.contains("dark");

  const commands: CommandAction[] = [
    {
      id: "home",
      title: "Go to Home",
      icon: <Navigation className="w-4 h-4" />,
      keywords: ["home", "landing", "index"],
      action: () => {
        navigate("/");
        setOpen(false);
      },
    },
    {
      id: "projects",
      title: "Go to Projects",
      icon: <Navigation className="w-4 h-4" />,
      keywords: ["projects", "portfolio", "work"],
      action: () => {
        navigate("/projects");
        setOpen(false);
      },
    },
    {
      id: "writing",
      title: "Go to Writing",
      icon: <Navigation className="w-4 h-4" />,
      keywords: ["writing", "posts", "blog", "notes", "linkedin"],
      action: () => {
        navigate("/writing");
        setOpen(false);
      },
    },
    {
      id: "about",
      title: "Scroll to About",
      icon: <Navigation className="w-4 h-4" />,
      keywords: ["about", "bio", "info"],
      action: () => {
        if (location.pathname !== "/") {
          navigate("/");
        }
        setTimeout(() => {
          const elem = document.getElementById("about");
          elem?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        setOpen(false);
      },
    },
    {
      id: "skills",
      title: "Scroll to Skills",
      icon: <Navigation className="w-4 h-4" />,
      keywords: ["skills", "tech", "technologies"],
      action: () => {
        if (location.pathname !== "/") {
          navigate("/");
        }
        setTimeout(() => {
          const elem = document.getElementById("skills");
          elem?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        setOpen(false);
      },
    },
    {
      id: "experience",
      title: "Scroll to Experience",
      icon: <Navigation className="w-4 h-4" />,
      keywords: ["experience", "work", "jobs", "career"],
      action: () => {
        if (location.pathname !== "/") {
          navigate("/");
        }
        setTimeout(() => {
          const elem = document.getElementById("experience");
          elem?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        setOpen(false);
      },
    },
    {
      id: "education",
      title: "Scroll to Education",
      icon: <Navigation className="w-4 h-4" />,
      keywords: ["education", "degree", "school", "university"],
      action: () => {
        if (location.pathname !== "/") {
          navigate("/");
        }
        setTimeout(() => {
          const elem = document.getElementById("education");
          elem?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        setOpen(false);
      },
    },
    {
      id: "contact",
      title: "Scroll to Contact",
      icon: <Navigation className="w-4 h-4" />,
      keywords: ["contact", "touch", "reach out"],
      action: () => {
        if (location.pathname !== "/") {
          navigate("/");
        }
        setTimeout(() => {
          const elem = document.getElementById("contact");
          elem?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        setOpen(false);
      },
    },
    {
      id: "theme",
      title: `Toggle theme (${isDarkMode ? "Light" : "Dark"})`,
      icon: isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      keywords: ["theme", "dark", "light", "mode"],
      action: () => {
        theme.toggleTheme();
        setOpen(false);
      },
    },
    {
      id: "resume",
      title: "Download Resume",
      icon: <Download className="w-4 h-4" />,
      keywords: ["resume", "cv", "download", "pdf"],
      action: () => {
        const link = document.createElement("a");
        link.href = "/Sahil_Diwan_Resume.pdf";
        link.download = "Sahil_Diwan_Resume.pdf";
        link.click();
        setOpen(false);
      },
    },
    {
      id: "email",
      title: "Copy Email",
      icon: <Mail className="w-4 h-4" />,
      keywords: ["email", "copy", "mail", "contact"],
      action: async () => {
        try {
          await navigator.clipboard.writeText("diwan.sahilsingh@gmail.com");
          setOpen(false);
        } catch {
          // Fallback: just close the palette
          setOpen(false);
        }
      },
    },
  ];

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />
      )}
      {open && (
        <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform">
          <Command className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center border-b border-gray-200 px-3 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">⌘</span>
              <Command.Input
                className="flex-1 rounded-lg border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Search commands..."
              />
            </div>
            <Command.List className="max-h-96 overflow-y-auto">
              <Command.Empty className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No commands found.
              </Command.Empty>
              <Command.Group>
                {commands.map((cmd) => (
                  <Command.Item
                    key={cmd.id}
                    value={cmd.title}
                    onSelect={cmd.action}
                    className="cursor-pointer px-4 py-2 text-sm data-[selected]:bg-blue-500 data-[selected]:text-white dark:data-[selected]:bg-blue-600"
                  >
                    <div className="flex items-center gap-2">
                      {cmd.icon}
                      <span>{cmd.title}</span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      )}
    </>
  );
}
