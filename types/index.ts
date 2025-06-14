export interface FailureGoal {
  id: string;
  title: string;
  description: string;
  targetFailures: number;
  currentFailures: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
}

export interface CreateFailureGoalData {
  title: string;
  description: string;
  targetFailures: number;
  category: string;
}

export interface UpdateFailureGoalData {
  title?: string;
  description?: string;
  targetFailures?: number;
  category?: string;
}