"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { Header } from "@/components/Header";
import { JournalForm } from "@/components/JournalForm";
import { JournalHistory } from "@/components/JournalHistory";
import { sentimentColors } from "@/constant/sentiments";

import { JournalEntry, Stats, TrendingKeyword } from "@/constant/types";

export default function AIMoodJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>(
    []
  );
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentEntry, setCurrentEntry] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setIsLoadingEntries(true);
    try {
      const [entriesRes, keywordsRes, statsRes] = await Promise.all([
        fetch("/api/entries"),
        fetch("/api/keywords/trending"),
        fetch("/api/stats"),
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

  const handleSubmit = async () => {
    if (!currentEntry.trim()) return;
    setIsSubmitting(true);

    const isEditing = !!editingId;
    const url = isEditing ? `/api/entries/${editingId}` : "/api/entries";
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
      const response = await fetch(`/api/entries/${id}`, { method: "DELETE" });
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

  return (
    <div className="min-h-screen bg-background text-foreground font-['Inter']">
      <div className="container mx-auto px-4 py-8">
        <Header />

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <JournalForm
              currentEntry={currentEntry}
              setCurrentEntry={setCurrentEntry}
              editingId={editingId}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onCancel={cancelEdit}
            />

            <JournalHistory
              entries={entries}
              isLoadingEntries={isLoadingEntries}
              onEdit={handleEdit}
              onDelete={setDeleteId}
            />
          </div>

          <DashboardSidebar
            latestEntry={latestEntry}
            stats={stats}
            moodDistribution={moodDistribution}
            trendingKeywords={trendingKeywords}
          />
        </main>
      </div>

      <DeleteConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </div>
  );
}
