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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { CreateFailureGoalData } from "@/types";

interface CreateGoalDialogProps {
  onCreateGoal: (data: CreateFailureGoalData) => Promise<void>;
}

const categories = [
  "Learning & Skills",
  "Creative Arts",
  "Fitness & Health",
  "Career & Business",
  "Personal Growth",
  "Relationships",
  "Hobbies",
  "Other",
];

export function CreateGoalDialog({ onCreateGoal }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetFailures: 30,
    category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) return;

    setLoading(true);
    try {
      await onCreateGoal(formData);
      setFormData({
        title: "",
        description: "",
        targetFailures: 30,
        category: "",
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to create goal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Quest
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start a new quest</DialogTitle>
          <DialogDescription>
            Set your failure target and begin your path to mastery. Remember:
            every failure is a step closer to success.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">What are you learning?</Label>
            <Input
              id="title"
              placeholder="e.g., Playing Guitar, Learning Spanish..."
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your quest and what success looks like..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetFailures">Target Failures</Label>
            <Input
              id="targetFailures"
              type="number"
              min="1"
              max="1000"
              value={formData.targetFailures}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  targetFailures: parseInt(e.target.value) || 30,
                }))
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              How many failures do you want to accumulate before considering
              yourself successful?
            </p>
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
              disabled={loading || !formData.title || !formData.category}
            >
              {loading ? "Creating..." : "Start quest"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
