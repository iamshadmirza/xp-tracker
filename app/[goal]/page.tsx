"use client";

import { useParams } from "next/navigation";
import { useFailureGoals } from "@/hooks/useFailureGoals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Flame, Hourglass } from "lucide-react";
import Link from "next/link";
import { FailureLogs } from "@/components/FailureLogs";
import { Progress } from "@/components/ui/progress";
import { TooltipProvider } from "@/components/ui/tooltip";

// Remove the dynamic export since we're using client-side rendering
// export const dynamic = "force-dynamic";

export default function GoalPage() {
  const params = useParams();
  const { goals, markFailure } = useFailureGoals();
  const goal = goals.find((g) => g.id === params.goal);

  if (!goal) {
    return (
      <div className="container mx-auto h-screen py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Goal Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The goal you&apos;re looking for doesn&apos;t exist or has been
                deleted.
              </p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogFailure = async (logData: {
    description: string;
    learnedFrom: string;
  }) => {
    await markFailure(goal.id, logData);
  };

  const handleExportLogs = () => {
    if (!goal || !goal.logs || !goal.logs.length) {
      return;
    }

    try {
      // Create CSV content
      const headers = ["Date", "What Happened", "What I Learned"];
      const rows = goal.logs.map((log) => [
        new Date(log.createdAt).toLocaleString(),
        log.description || "",
        log.learnedFrom || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Create and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = url;
      link.download = `${
        goal.title?.toLowerCase().replace(/\s+/g, "-") || "failure"
      }-logs.csv`;

      // Trigger download
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting logs:", error);
    }
  };

  const progress = (goal.currentFailures / goal.targetFailures) * 100;

  const getStreakIcon = () => {
    if (!goal) return null;
    switch (goal.streakStatus) {
      case "active":
        return <Flame className="h-5 w-5 text-orange-500" />;
      case "warning":
        return <Hourglass className="h-5 w-5 text-yellow-500" />;
      default:
        return <Flame className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto h-screen flex flex-col">
      <div className="flex-1 py-8">
        <div className="flex justify-between items-center mb-4">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quests
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getStreakIcon()}
              <span>Current Streak: {goal.currentStreak}</span>
            </div>
            <Button
              variant="outline"
              onClick={handleExportLogs}
              disabled={!goal?.logs.length}
            >
              <Download className="h-4 w-4 mr-2" />
              Export logs
            </Button>
          </div>
        </div>
        <Card className="h-[calc(100vh-8rem)]">
          <CardHeader className="text-center">
            <CardTitle>{goal.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[calc(100%-4rem)]">
            <div className="flex flex-col h-full">
              <div className="flex-none">
                <p className="text-sm text-muted-foreground mb-4">
                  {goal.description}
                </p>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {goal.currentFailures} of {goal.targetFailures} failures
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
              <div className="border-t pt-6 flex-1 min-h-0">
                <FailureLogs logs={goal.logs} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
