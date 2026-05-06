interface DemoEmbedProps {
  demoUrl?: string;
  title: string;
}

export function DemoEmbed({ demoUrl, title }: DemoEmbedProps) {
  if (!demoUrl) return null;
  return (
    <div className="rounded-lg overflow-hidden border bg-muted/20">
      <iframe
        src={demoUrl}
        title={`${title} — live demo`}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms"
        className="w-full aspect-video"
      />
    </div>
  );
}
