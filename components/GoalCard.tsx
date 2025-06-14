'use client';

import { useState } from 'react';
import { FailureGoal } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GraffitiCelebration } from './GraffitiCelebration';

interface GoalCardProps {
  goal: FailureGoal;
  onMarkFailure: (id: string) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, onMarkFailure, onDelete }: GoalCardProps) {
  const [showGraffiti, setShowGraffiti] = useState(false);
  const progressPercentage = (goal.currentFailures / goal.targetFailures) * 100;
  const remainingFailures = goal.targetFailures - goal.currentFailures;

  const handleMarkFailure = () => {
    setShowGraffiti(true);
    onMarkFailure(goal.id);
  };

  return (
    <>
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105",
        goal.isCompleted 
          ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20" 
          : "bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50 hover:border-slate-600/50"
      )}>
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
              <CardDescription className="mt-1 text-muted-foreground">
                {goal.description}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(goal.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Badge variant="secondary" className="w-fit">
            {goal.category}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {goal.isCompleted ? 'Journey Complete!' : 'Failures Remaining'}
              </span>
              <span className="font-medium">
                {goal.isCompleted ? '🎉' : `${remainingFailures} left`}
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
              <span>{goal.currentFailures} failures logged</span>
              <span>{goal.targetFailures} target</span>
            </div>
          </div>

          {!goal.isCompleted && (
            <Button
              onClick={handleMarkFailure}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4 mr-2" />
              Mark Another Failure
            </Button>
          )}

          {goal.isCompleted && (
            <div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Congratulations! You've completed your failure journey.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Success is just the beginning of the next adventure.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <GraffitiCelebration 
        show={showGraffiti} 
        onComplete={() => setShowGraffiti(false)} 
      />
    </>
  );
}