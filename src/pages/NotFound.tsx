import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "../components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-7xl font-bold tracking-tight text-primary mb-4">404</div>
        <h1 className="text-2xl font-semibold mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page <code className="font-mono text-sm">{location.pathname}</code> doesn't exist or has moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate("/")}>Take me home</Button>
          <Button variant="outline" onClick={() => navigate("/projects")}>
            Browse projects
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
