import { Loader2 } from "lucide-react";

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface JournalFormProps {
  currentEntry: string;
  setCurrentEntry: (value: string) => void;
  editingId: string | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export const JournalForm = ({
  currentEntry,
  setCurrentEntry,
  editingId,
  isSubmitting,
  onSubmit,
  onCancel,
}: JournalFormProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{editingId ? "Edit Entry" : "New Entry"}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Textarea
        placeholder="What's on your mind today?"
        value={currentEntry}
        onChange={(e) => setCurrentEntry(e.target.value)}
        className="min-h-32 resize-none"
      />
      <div className="flex gap-2">
        <Button
          onClick={onSubmit}
          disabled={!currentEntry.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : editingId ? (
            "Update"
          ) : (
            "Analyze & Save"
          )}
        </Button>
        {editingId && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);
