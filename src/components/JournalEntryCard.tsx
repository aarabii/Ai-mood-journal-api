import { JournalEntry } from "@/constant/types";
import { sentimentColors } from "@/constant/sentiments";
import { Trash2, Edit } from "lucide-react";
import { geistMono } from "@/app/font";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export function JournalEntryCard({
  entry,
  onEdit,
  onDelete,
}: JournalEntryCardProps) {
  const sentimentColor =
    sentimentColors[entry.sentiment as keyof typeof sentimentColors] || "gray";

  const formattedDate = new Date(entry.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-card p-4 rounded-md shadow-sm border border-border transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-2 ">
        <span
          className="text-xs font-semibold px-2 py-1 rounded-md width-fit"
          style={{
            backgroundColor: sentimentColor, // a light background
            // color: "text-blo",
          }}
        >
          {entry.sentiment}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(entry)}
            className="text-muted-foreground hover:text-primary"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <p className={`${geistMono.variable} text-card-foreground mb-3`}>
        {entry.content}
      </p>
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-1">
          {entry.keywords.map((keyword, index) => (
            <span
              key={index}
              className="bg-muted px-1.5 py-0.5 rounded text-xs"
            >
              {keyword}
            </span>
          ))}
        </div>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}
