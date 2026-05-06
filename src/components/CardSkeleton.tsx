import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function CardSkeleton() {
  return (
    <Card className="h-full flex flex-col" aria-busy="true">
      <CardHeader className="pb-4">
        <Skeleton className="h-5 w-24 mb-3" />
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-2" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <Skeleton className="h-16 w-full mb-4 rounded-lg" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </CardContent>
    </Card>
  );
}
