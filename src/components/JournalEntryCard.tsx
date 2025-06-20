import { Edit, Trash2 } from "lucide-react";

import { JournalEntry } from "@/constant/types";
import { sentimentColors } from "@/constant/sentiments";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export const JournalEntryCard = ({
  entry,
  onEdit,
  onDelete,
}: JournalEntryCardProps) => (
  <Card
    className="group transition-colors"
    style={{
      borderLeft: `4px solid ${sentimentColors[entry.sentiment]}`,
    }}
  >
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <p className="text-muted-foreground text-sm">
          {new Date(entry.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(entry)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(entry.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-foreground mb-4 leading-relaxed">{entry.content}</p>

      <div className="flex flex-wrap gap-2">
        {entry.keywords.map((keyword: string, index: number) => (
          <Badge key={index} variant="secondary">
            {keyword}
          </Badge>
        ))}
      </div>
    </CardContent>
  </Card>
);
