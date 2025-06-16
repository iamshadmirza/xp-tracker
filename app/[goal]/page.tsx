"use client";

import { useParams } from "next/navigation";
import { useFailureGoals } from "@/hooks/useFailureGoals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FailureLogs } from "@/components/FailureLogs";
import { Progress } from "@/components/ui/progress";

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
                  Back to Goals
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

  const progress = (goal.currentFailures / goal.targetFailures) * 100;

  return (
    <div className="container mx-auto h-screen flex flex-col">
      <div className="flex-1 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
        </Link>
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
                <div className="space-y-2">
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
