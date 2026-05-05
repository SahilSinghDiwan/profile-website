import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export interface TechFilterProps {
  availableTechs: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function TechFilter({
  availableTechs,
  selected,
  onChange,
}: TechFilterProps) {
  const handleChipClick = (tech: string) => {
    if (selected.includes(tech)) {
      onChange(selected.filter((t) => t !== tech));
    } else {
      onChange([...selected, tech]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {availableTechs.map((tech) => (
        <Badge
          key={tech}
          variant={selected.includes(tech) ? "default" : "outline"}
          className="cursor-pointer transition-colors hover:opacity-80"
          onClick={() => handleChipClick(tech)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleChipClick(tech);
            }
          }}
        >
          {tech}
        </Badge>
      ))}
      {selected.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="ml-2"
        >
          <X className="h-4 w-4" />
          Clear all
        </Button>
      )}
    </div>
  );
}
