"use client";

import { useState, useEffect } from "react";
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

// Types
interface JournalEntry {
  id: string;
  content: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  keywords: string[];
  createdAt: Date;
}

// Mock data
const mockEntries: JournalEntry[] = [
  {
    id: "1",
    content:
      "Had an amazing day at the beach with friends. The weather was perfect and we played volleyball for hours. Feeling grateful for these moments of pure joy and connection.",
    sentiment: "POSITIVE",
    keywords: [
      "amazing",
      "beach",
      "friends",
      "perfect",
      "volleyball",
      "grateful",
      "joy",
      "connection",
    ],
    createdAt: new Date("2024-12-20"),
  },
  {
    id: "2",
    content:
      "Work was really stressful today. The deadline is approaching and I feel overwhelmed with all the tasks. Need to find better ways to manage my time and stress levels.",
    sentiment: "NEGATIVE",
    keywords: [
      "stressful",
      "deadline",
      "overwhelmed",
      "tasks",
      "manage",
      "stress",
    ],
    createdAt: new Date("2024-12-19"),
  },
  {
    id: "3",
    content:
      "Regular day at the office. Attended meetings, worked on some projects. Nothing particularly exciting but got things done. Looking forward to the weekend.",
    sentiment: "NEUTRAL",
    keywords: ["regular", "office", "meetings", "projects", "weekend"],
    createdAt: new Date("2024-12-18"),
  },
];

const sentimentColors = {
  POSITIVE: "#10b981", // green-500
  NEGATIVE: "#ef4444", // red-500
  NEUTRAL: "#f59e0b", // amber-500
};

const sentimentEmojis = {
  POSITIVE: "😊",
  NEGATIVE: "😠",
  NEUTRAL: "😐",
};

export default function AIMoodJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Simulate loading entries
  useEffect(() => {
    setTimeout(() => {
      setEntries(mockEntries);
      setIsLoadingEntries(false);
    }, 1500);
  }, []);

  // Mock sentiment analysis
  const analyzeSentiment = (
    text: string
  ): { sentiment: JournalEntry["sentiment"]; keywords: string[] } => {
    const positiveWords = [
      "amazing",
      "great",
      "happy",
      "joy",
      "love",
      "perfect",
      "wonderful",
      "grateful",
      "excited",
    ];
    const negativeWords = [
      "stress",
      "sad",
      "angry",
      "frustrated",
      "overwhelmed",
      "tired",
      "worried",
      "anxious",
    ];

    const words = text.toLowerCase().split(/\s+/);
    const keywords = words.filter((word) => word.length > 3);

    const positiveCount = words.filter((word) =>
      positiveWords.some((pw) => word.includes(pw))
    ).length;
    const negativeCount = words.filter((word) =>
      negativeWords.some((nw) => word.includes(nw))
    ).length;

    let sentiment: JournalEntry["sentiment"] = "NEUTRAL";
    if (positiveCount > negativeCount) sentiment = "POSITIVE";
    else if (negativeCount > positiveCount) sentiment = "NEGATIVE";

    return { sentiment, keywords: keywords.slice(0, 8) };
  };

  const handleSubmit = async () => {
    if (!currentEntry.trim()) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const analysis = analyzeSentiment(currentEntry);

    if (editingId) {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingId
            ? { ...entry, content: currentEntry, ...analysis }
            : entry
        )
      );
      setEditingId(null);
    } else {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        content: currentEntry,
        ...analysis,
        createdAt: new Date(),
      };
      setEntries((prev) => [newEntry, ...prev]);
    }

    setCurrentEntry("");
    setIsLoading(false);
  };

  const handleEdit = (entry: JournalEntry) => {
    setCurrentEntry(entry.content);
    setEditingId(entry.id);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    setDeleteId(null);
  };

  const cancelEdit = () => {
    setCurrentEntry("");
    setEditingId(null);
  };

  // Calculate mood distribution
  const moodDistribution = [
    {
      name: "Positive",
      value: entries.filter((e) => e.sentiment === "POSITIVE").length,
      color: sentimentColors.POSITIVE,
    },
    {
      name: "Negative",
      value: entries.filter((e) => e.sentiment === "NEGATIVE").length,
      color: sentimentColors.NEGATIVE,
    },
    {
      name: "Neutral",
      value: entries.filter((e) => e.sentiment === "NEUTRAL").length,
      color: sentimentColors.NEUTRAL,
    },
  ].filter((item) => item.value > 0);

  // Calculate trending keywords
  const allKeywords = entries.flatMap((entry) => entry.keywords);
  const keywordFreq = allKeywords.reduce((acc, keyword) => {
    acc[keyword] = (acc[keyword] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const trendingKeywords = Object.entries(keywordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20);

  const latestEntry = entries[0];

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-['Inter']">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                AI Mood Journal
              </h1>
              <p className="text-slate-400 text-lg">
                Your intelligent space to reflect and understand.
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Journal Entry Form */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    {editingId ? "Edit Entry" : "New Entry"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind today?"
                    value={currentEntry}
                    onChange={(e) => setCurrentEntry(e.target.value)}
                    className="min-h-32 bg-slate-900 border-slate-600 text-white placeholder:text-slate-400 resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={!currentEntry.trim() || isLoading}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      {isLoading ? (
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
                      <Button
                        variant="outline"
                        onClick={cancelEdit}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Journal History */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Journal History
                </h2>

                {isLoadingEntries ? (
                  // Skeleton Loading
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="bg-slate-800 border-slate-700">
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <Skeleton className="h-4 w-24 bg-slate-700" />
                            <Skeleton className="h-20 w-full bg-slate-700" />
                            <div className="flex gap-2">
                              {[...Array(4)].map((_, j) => (
                                <Skeleton
                                  key={j}
                                  className="h-6 w-16 bg-slate-700"
                                />
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : entries.length === 0 ? (
                  // Empty State
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-12 text-center">
                      <p className="text-slate-400 text-lg">
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
                        className="bg-slate-800 border-slate-700 group hover:bg-slate-750 transition-colors"
                        style={{
                          borderLeft: `4px solid ${
                            sentimentColors[entry.sentiment]
                          }`,
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <p className="text-slate-300 text-sm">
                              {entry.createdAt.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(entry)}
                                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(entry.id)}
                                className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-slate-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-white mb-4 leading-relaxed">
                            {entry.content}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {entry.keywords.map((keyword, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-slate-700 text-slate-300 hover:bg-slate-600"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dashboard Sidebar */}
            <div className="space-y-6">
              {/* Latest Mood Card */}
              {latestEntry && (
                <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                  <div
                    className="h-2"
                    style={{
                      background: `linear-gradient(90deg, ${
                        sentimentColors[latestEntry.sentiment]
                      }22, ${sentimentColors[latestEntry.sentiment]}44)`,
                    }}
                  />
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-white">Latest Mood</CardTitle>
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
              {entries.length > 0 && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Mood Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        positive: {
                          label: "Positive",
                          color: sentimentColors.POSITIVE,
                        },
                        negative: {
                          label: "Negative",
                          color: sentimentColors.NEGATIVE,
                        },
                        neutral: {
                          label: "Neutral",
                          color: sentimentColors.NEUTRAL,
                        },
                      }}
                      className="h-48"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={moodDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {moodDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {/* Trending Keywords */}
              {trendingKeywords.length > 0 && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Trending Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {trendingKeywords.map(([keyword, freq]) => {
                        const size = Math.min(freq * 0.2 + 0.8, 1.5);
                        return (
                          <span
                            key={keyword}
                            className="text-teal-400 hover:text-teal-300 transition-colors cursor-default"
                            style={{ fontSize: `${size}rem` }}
                            title={`Appears ${freq} times`}
                          >
                            {keyword}
                          </span>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription className="text-slate-400">
                Are you sure you want to delete this entry? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteId && handleDelete(deleteId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
