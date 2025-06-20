import { Card, CardContent } from "./ui/card";

export const EmptyState = () => (
  <Card>
    <CardContent className="p-12 text-center">
      <p className="text-muted-foreground text-lg">
        No entries yet. Write your first journal entry to get started!
      </p>
    </CardContent>
  </Card>
);
