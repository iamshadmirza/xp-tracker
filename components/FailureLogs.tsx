"use client";

import { FailureLog } from "@/types";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FailureLogsProps {
  logs: FailureLog[];
}

export function FailureLogs({ logs }: FailureLogsProps) {
  if (logs.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No failure logs yet. Start logging your failures to track your progress!
      </p>
    );
  }

  return (
    <div className="h-full min-h-0">
      <ScrollArea className="h-full">
        <div className="space-y-4 pr-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-lg border bg-card text-card-foreground"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">What happened?</h4>
                <time className="text-sm text-muted-foreground">
                  {format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </time>
              </div>
              <p className="text-muted-foreground mb-4">{log.description}</p>
              <div>
                <h4 className="font-semibold mb-2">What I learned:</h4>
                <p className="text-muted-foreground">{log.learnedFrom}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
