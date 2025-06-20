import { JournalEntry } from "@/constant/types";

import { EmptyState } from "./EmptyState";
import { EntriesSkeleton } from "./EntriesSkeleton";
import { JournalEntryCard } from "./JournalEntryCard";

interface JournalHistoryProps {
  entries: JournalEntry[];
  isLoadingEntries: boolean;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export const JournalHistory = ({
  entries,
  isLoadingEntries,
  onEdit,
  onDelete,
}: JournalHistoryProps) => (
  <section className="space-y-4">
    <h2 className="text-2xl font-semibold text-foreground">Journal History</h2>

    {isLoadingEntries ? (
      <EntriesSkeleton />
    ) : entries.length === 0 ? (
      <EmptyState />
    ) : (
      <div className="space-y-4">
        {entries.map((entry) => (
          <JournalEntryCard
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    )}
  </section>
);
