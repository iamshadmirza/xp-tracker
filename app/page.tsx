"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useFailureGoals } from "@/hooks/useFailureGoals";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import { GoalCard } from "@/components/GoalCard";
import { StatsOverview } from "@/components/StatsOverview";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Quote, Lightbulb, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreateFailureLogData } from "@/types";

// Dynamically import the GraffitiCelebration component with no SSR
const GraffitiCelebration = dynamic(
  () =>
    import("@/components/GraffitiCelebration").then(
      (mod) => mod.GraffitiCelebration
    ),
  { ssr: false }
);

export default function Home() {
  const [showGlobalGraffiti, setShowGlobalGraffiti] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const {
    goals,
    activeGoals,
    completedGoals,
    loading,
    error,
    createGoal,
    deleteGoal,
    markFailure,
  } = useFailureGoals();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMarkFailure = (id: string, logData: CreateFailureLogData) => {
    setShowGlobalGraffiti(true);
    markFailure(id, logData);
  };

  // Show loading state during SSR
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="flex justify-between items-center py-4 border-b border-slate-700/50 mb-8">
          <div className="flex items-center space-x-4">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-muted-foreground">
              Every experience is data. Every attempt is progress.
            </span>
          </div>
          <CreateGoalDialog onCreateGoal={createGoal} />
        </div>
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              XP Tracker
            </h1>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              Level up through experience. Track your journey from novice to
              expert, one XP gain at a time.
            </p>

            {/* Inspirational Quote */}
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-3">
                  <Quote className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-slate-300 italic">
                      &ldquo;If you knew you were 30 failures away from mastery,
                      how fast would you want to fail?&rdquo;
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Overview */}
          <StatsOverview goals={goals} />

          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="active">
                Active Quests ({activeGoals.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Mastered ({completedGoals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {activeGoals.length === 0 ? (
                <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
                  <CardContent className="p-12 text-center">
                    <div className="space-y-4">
                      <div className="text-4xl">🚀</div>
                      <h3 className="text-xl font-semibold text-foreground">
                        Ready to Start Gaining XP?
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Your journey to mastery begins with the first
                        experience. Create your first goal and start collecting
                        valuable learning XP.
                      </p>
                      <CreateGoalDialog onCreateGoal={createGoal} />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onMarkFailure={handleMarkFailure}
                      onDelete={deleteGoal}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              {completedGoals.length === 0 ? (
                <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
                  <CardContent className="p-12 text-center">
                    <div className="space-y-4">
                      <div className="text-4xl">🏆</div>
                      <h3 className="text-xl font-semibold text-foreground">
                        No Mastery Achieved Yet
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Keep working on your active goals. Your first mastery
                        achievement will appear here once you&apos;ve completed
                        your quest.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onMarkFailure={handleMarkFailure}
                      onDelete={deleteGoal}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {isMounted && (
        <GraffitiCelebration
          show={showGlobalGraffiti}
          onComplete={() => setShowGlobalGraffiti(false)}
        />
      )}
    </div>
  );
}
