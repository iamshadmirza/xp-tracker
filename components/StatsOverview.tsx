"use client";

import { FailureGoal } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Target, TrendingUp, Calendar } from "lucide-react";

interface StatsOverviewProps {
  goals: FailureGoal[];
}

export function StatsOverview({ goals }: StatsOverviewProps) {
  const activeGoals = goals.filter((goal) => !goal.isCompleted);
  const completedGoals = goals.filter((goal) => goal.isCompleted);
  const totalFailures = goals.reduce(
    (sum, goal) => sum + goal.currentFailures,
    0
  );
  const averageProgress =
    activeGoals.length > 0
      ? (activeGoals.reduce(
          (sum, goal) => sum + goal.currentFailures / goal.targetFailures,
          0
        ) /
          activeGoals.length) *
        100
      : 0;

  const stats = [
    {
      title: "Active Quests",
      value: activeGoals.length,
      description: "Currently in progress",
      icon: Target,
      color: "text-blue-500",
    },
    {
      title: "Completed",
      value: completedGoals.length,
      description: "Success achieved!",
      icon: Trophy,
      color: "text-green-500",
    },
    {
      title: "Total Failures",
      value: totalFailures,
      description: "Steps toward mastery",
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "Avg Progress",
      value: `${Math.round(averageProgress)}%`,
      description: "Across active goals",
      icon: Calendar,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
