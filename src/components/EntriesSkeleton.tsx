import { Skeleton } from "./ui/skeleton";
import { Card, CardContent } from "./ui/card";

export const EntriesSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-6 w-16" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
