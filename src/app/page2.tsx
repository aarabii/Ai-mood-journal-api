"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Edit, Trash2, Sun, Moon, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ============================================================================
// Type Definitions
// ============================================================================

interface JournalEntry {
  id: string;
  content: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  keywords: string[];
  createdAt: string; // API returns string, will be converted to Date object
}

interface TrendingKeyword {
  keyword: string;
  count: number;
}

interface Stats {
  totalEntries: number;
  sentimentBreakdown: {
    sentiment: string;
    count: string;
    percentage: number;
  }[];
  averageSentimentScore: number;
}

// ============================================================================
// Constants
// ============================================================================

// These colors are for data visualization and should remain distinct from the UI theme.
const sentimentColors = {
  POSITIVE: "hsl(var(--chart-2))", // Using HSL values from your theme variables
  NEGATIVE: "hsl(var(--destructive))",
  NEUTRAL: "hsl(var(--chart-3))",
};

const sentimentEmojis = {
  POSITIVE: "😊",
  NEGATIVE: "😠",
  NEUTRAL: "😐",
};

// ============================================================================
// Main Component
// ============================================================================

export default function AIMoodJournal() {
  // ==========================================================================
  // State Management
  // ==========================================================================

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>(
    []
  );
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentEntry, setCurrentEntry] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ==========================================================================
  // API Interaction Hooks
  // ==========================================================================

  const fetchAllData = useCallback(async () => {
    setIsLoadingEntries(true);
    try {
      const baseUrl = window.location.origin;
      const [entriesRes, keywordsRes, statsRes] = await Promise.all([
        fetch(`${baseUrl}/api/entries`),
        fetch(`${baseUrl}/api/keywords/trending`),
        fetch(`${baseUrl}/api/stats`),
      ]);

      if (!entriesRes.ok || !keywordsRes.ok || !statsRes.ok) {
        throw new Error("Failed to fetch all necessary data.");
      }

      const entriesData = await entriesRes.json();
      const keywordsData = await keywordsRes.json();
      const statsData = await statsRes.json();

      setEntries(entriesData);
      setTrendingKeywords(keywordsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingEntries(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  const handleSubmit = async () => {
    if (!currentEntry.trim()) return;
    setIsSubmitting(true);

    const baseUrl = window.location.origin;
    const isEditing = !!editingId;
    const url = isEditing
      ? `${baseUrl}/api/entries/${editingId}`
      : `${baseUrl}/api/entries`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentEntry }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save entry.");
      }

      setCurrentEntry("");
      setEditingId(null);
      await fetchAllData();
    } catch (error) {
      console.error("Error submitting entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setCurrentEntry(entry.content);
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/entries/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete entry.");
      await fetchAllData();
    } catch (error) {
      console.error("Error deleting entry:", error);
    } finally {
      setDeleteId(null);
    }
  };

  const cancelEdit = () => {
    setCurrentEntry("");
    setEditingId(null);
  };

  // ==========================================================================
  // Memoized calculations for rendering
  // ==========================================================================

  const moodDistribution = useMemo(() => {
    if (!stats) return [];
    return stats.sentimentBreakdown
      .map((item) => ({
        name:
          item.sentiment.charAt(0).toUpperCase() +
          item.sentiment.slice(1).toLowerCase(),
        value: parseInt(item.count, 10),
        color: sentimentColors[item.sentiment as keyof typeof sentimentColors],
      }))
      .filter((item) => item.value > 0);
  }, [stats]);

  const latestEntry = entries[0];

  // ==========================================================================
  // Render Logic
  // ==========================================================================

  return (
    <div className="min-h-screen bg-background text-foreground font-['Inter']">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              AI Mood Journal
            </h1>
            <p className="text-muted-foreground text-lg">
              Your intelligent space to reflect and understand.
            </p>
          </div>
          {/* The theme toggle button would typically live in a layout or provider component */}
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Journal Entry Form */}
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
                    onClick={handleSubmit}
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
                    <Button variant="secondary" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Journal History */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Journal History
              </h2>

              {isLoadingEntries ? (
                // Skeleton Loading
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
              ) : entries.length === 0 ? (
                // Empty State
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground text-lg">
                      No entries yet. Write your first journal entry to get
                      started!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                // Entries List
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <Card
                      key={entry.id}
                      className="group transition-colors"
                      style={{
                        borderLeft: `4px solid ${
                          sentimentColors[entry.sentiment]
                        }`,
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <p className="text-muted-foreground text-sm">
                            {new Date(entry.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(entry)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(entry.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-foreground mb-4 leading-relaxed">
                          {entry.content}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {entry.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Dashboard Sidebar */}
          <aside className="space-y-6">
            {/* Latest Mood Card */}
            {latestEntry && (
              <Card className="overflow-hidden">
                <div
                  className="h-2"
                  style={{
                    backgroundColor: sentimentColors[latestEntry.sentiment],
                  }}
                />
                <CardHeader className="text-center pb-2">
                  <CardTitle>Latest Mood</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-6xl mb-2">
                    {sentimentEmojis[latestEntry.sentiment]}
                  </div>
                  <p
                    className="text-lg font-semibold capitalize"
                    style={{ color: sentimentColors[latestEntry.sentiment] }}
                  >
                    {latestEntry.sentiment.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Mood Distribution Chart */}
            {stats && stats.totalEntries > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Mood Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={moodDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                          nameKey="name"
                        >
                          {moodDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              hideLabel
                              className="bg-popover text-popover-foreground border-border"
                            />
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Trending Keywords */}
            {trendingKeywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Trending Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {trendingKeywords.map(({ keyword, count }) => {
                      const size = Math.min(count * 0.15 + 0.8, 1.5);
                      return (
                        <span
                          key={keyword}
                          className="text-primary hover:text-primary transition-colors cursor-default"
                          style={{ fontSize: `${size}rem` }}
                          title={`Appears ${count} times`}
                        >
                          {keyword}
                        </span>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this entry? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
