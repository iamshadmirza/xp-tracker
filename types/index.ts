export interface FailureLog {
  id: string;
  goalId: string;
  description: string;
  learnedFrom: string;
  createdAt: Date;
}

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
  logs: FailureLog[];
  currentStreak: number;
  lastFailureAt: Date | null;
  streakStatus: 'active' | 'warning' | 'broken';
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

export interface CreateFailureLogData {
  description: string;
  learnedFrom: string;
}