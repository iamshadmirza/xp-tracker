"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { CreateFailureLogData } from "@/types";

interface LogFailureDialogProps {
  onLogFailure: (data: CreateFailureLogData) => Promise<void>;
  disabled?: boolean;
}

export function LogFailureDialog({
  onLogFailure,
  disabled,
}: LogFailureDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    learnedFrom: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.learnedFrom) return;

    setLoading(true);
    try {
      await onLogFailure(formData);
      setFormData({
        description: "",
        learnedFrom: "",
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to log failure:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" />
          Log a Failure
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Your Failure</DialogTitle>
          <DialogDescription>
            Document what happened and what you learned from this experience.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">What happened?</Label>
            <Textarea
              id="description"
              placeholder="Describe what went wrong..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learnedFrom">What did you learn?</Label>
            <Textarea
              id="learnedFrom"
              placeholder="Share your key learnings..."
              value={formData.learnedFrom}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  learnedFrom: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading || !formData.description || !formData.learnedFrom
              }
            >
              {loading ? "Logging..." : "Log Failure"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
