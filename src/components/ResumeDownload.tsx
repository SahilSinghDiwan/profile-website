import { Download } from "lucide-react";
import { Button } from "./ui/button";

interface ResumeDownloadProps {
  href?: string;
  fileName?: string;
}

export function ResumeDownload({
  href = "/Sahil_Diwan_Resume.pdf",
  fileName = "Sahil_Diwan_Resume.pdf",
}: ResumeDownloadProps) {
  const onClick = () => {
    window.dispatchEvent(new CustomEvent("resume_downloaded", { detail: { href, fileName } }));
  };
  return (
    <Button asChild variant="outline" size="sm" className="gap-1.5">
      <a href={href} download={fileName} onClick={onClick} aria-label="Download resume">
        Resume <Download className="h-3.5 w-3.5" />
      </a>
    </Button>
  );
}
