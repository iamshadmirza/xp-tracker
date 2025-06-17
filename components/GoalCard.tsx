"use client";

import { useState } from "react";
import { CreateFailureLogData, FailureGoal } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LogFailureDialog } from "./LogFailureDialog";
import { cn } from "@/lib/utils";
import { GraffitiCelebration } from "./GraffitiCelebration";
import {
  Trophy,
  Target,
  Trash2,
  Plus,
  History,
  Flame,
  Hourglass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface GoalCardProps {
  goal: FailureGoal;
  onMarkFailure: (id: string, logData: CreateFailureLogData) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, onMarkFailure, onDelete }: GoalCardProps) {
  const [showGraffiti, setShowGraffiti] = useState(false);
  const progressPercentage = (goal.currentFailures / goal.targetFailures) * 100;

  const getStreakIconWithTooltip = () => {
    let icon, tooltip;
    switch (goal.streakStatus) {
      case "active":
        icon = <Flame className="h-4 w-4 text-orange-500" />;
        tooltip = `${
          goal.currentStreak
        } Day Streak: You've logged failures for ${goal.currentStreak} day${
          goal.currentStreak === 1 ? "" : "s"
        } in a row.`;
        break;
      case "warning":
        icon = <Hourglass className="h-4 w-4 text-yellow-500" />;
        tooltip = `Streak at risk! Log a failure today to keep your streak.`;
        break;
      case "broken":
      default:
        icon = <Flame className="h-4 w-4 text-gray-500" />;
        tooltip = `Quest Resets: ${goal.currentStreak || 0}`;
        break;
    }
    return (
      <Tooltip>
        <TooltipTrigger asChild>{icon}</TooltipTrigger>
        <TooltipContent side="top" className="z-[100]">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  };

  const handleLogFailure = async (logData: {
    description: string;
    learnedFrom: string;
  }) => {
    setShowGraffiti(true);
    onMarkFailure(goal.id, logData);
  };

  return (
    <>
      <Card
        className={cn(
          "group relative transition-all duration-300 hover:shadow-lg hover:scale-105",
          goal.isCompleted
            ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20"
            : "bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 hover:border-slate-600/50"
        )}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                {goal.isCompleted ? (
                  <Trophy className="h-5 w-5 text-green-500" />
                ) : (
                  <Target className="h-5 w-5 text-blue-500" />
                )}
                {goal.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your quest and all associated failure logs.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(goal.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Quest
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <Badge variant="secondary" className="w-fit">
            {goal.category}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {goal.isCompleted ? "Quest Complete!" : "Path to Mastery"}
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className={cn(
                "h-3 transition-all duration-500",
                goal.isCompleted && "bg-green-100"
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {goal.currentFailures === 0
                  ? "Get started"
                  : `${goal.currentFailures}/${goal.targetFailures} failures`}
              </span>
              <div className="flex items-center gap-1">
                {getStreakIconWithTooltip()}
                <span className="text-muted-foreground">
                  {goal.currentStreak || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between space-x-2 items-center">
            <Link href={`/${goal.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <History className="h-4 w-4 mr-2" />
                View Logs
              </Button>
            </Link>
            <div className="flex-1">
              <LogFailureDialog
                onLogFailure={handleLogFailure}
                disabled={goal.isCompleted}
              />
            </div>
          </div>
          {goal.isCompleted && (
            <div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Congratulations! You&apos;ve completed your quest.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Success is just the beginning of the next adventure.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {showGraffiti && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            showGraffiti
              ? "animate-in fade-in duration-500"
              : "animate-out fade-out duration-500"
          )}
        >
          <GraffitiCelebration
            show={showGraffiti}
            onComplete={() => setShowGraffiti(false)}
          />
        </div>
      )}
    </>
  );
}
