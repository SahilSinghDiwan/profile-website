export function ChatSkeleton() {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-2"
      aria-busy="true"
      aria-label="Assistant is typing"
    >
      <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" />
    </div>
  );
}
