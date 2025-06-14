import { FailureGoal, CreateFailureGoalData, UpdateFailureGoalData } from '@/types';

export class StorageError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}

// Storage interface that can be easily replaced with a backend service
export interface StorageService {
  getAll(): Promise<FailureGoal[]>;
  getById(id: string): Promise<FailureGoal | null>;
  create(data: CreateFailureGoalData): Promise<FailureGoal>;
  update(id: string, data: UpdateFailureGoalData): Promise<FailureGoal>;
  delete(id: string): Promise<void>;
  markFailure(id: string): Promise<FailureGoal>;
}

class LocalStorageService implements StorageService {
  private readonly STORAGE_KEY = 'failure_goals';
  private readonly STORAGE_QUOTA = 4 * 1024 * 1024; // 4MB limit

  private getGoals(): FailureGoal[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored) as Array<{
        id: string;
        title: string;
        description: string;
        targetFailures: number;
        currentFailures: number;
        category: string;
        createdAt: string;
        updatedAt: string;
        isCompleted: boolean;
      }>;
      return parsed.map(goal => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to parse stored goals:', error);
      return [];
    }
  }

  private saveGoals(goals: FailureGoal[]): void {
    if (typeof window === 'undefined') return;

    try {
      const serialized = JSON.stringify(goals);

      // Check if we're approaching storage quota
      if (serialized.length > this.STORAGE_QUOTA) {
        throw new StorageError('Storage quota exceeded. Please delete some goals to free up space.');
      }

      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError('Failed to save goals to storage', error);
    }
  }

  async getAll(): Promise<FailureGoal[]> {
    try {
      return this.getGoals();
    } catch (error) {
      throw new StorageError('Failed to get all goals', error);
    }
  }

  async getById(id: string): Promise<FailureGoal | null> {
    try {
      const goals = this.getGoals();
      return goals.find(goal => goal.id === id) || null;
    } catch (error) {
      throw new StorageError(`Failed to get goal with id ${id}`, error);
    }
  }

  async create(data: CreateFailureGoalData): Promise<FailureGoal> {
    try {
      const goals = this.getGoals();
      const newGoal: FailureGoal = {
        id: crypto.randomUUID(),
        ...data,
        currentFailures: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isCompleted: false,
      };

      goals.push(newGoal);
      this.saveGoals(goals);
      return newGoal;
    } catch (error) {
      throw new StorageError('Failed to create goal', error);
    }
  }

  async update(id: string, data: UpdateFailureGoalData): Promise<FailureGoal> {
    try {
      const goals = this.getGoals();
      const index = goals.findIndex(goal => goal.id === id);

      if (index === -1) {
        throw new StorageError(`Goal with id ${id} not found`);
      }

      const updatedGoal = {
        ...goals[index],
        ...data,
        updatedAt: new Date(),
      };

      goals[index] = updatedGoal;
      this.saveGoals(goals);
      return updatedGoal;
    } catch (error) {
      throw new StorageError(`Failed to update goal with id ${id}`, error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const goals = this.getGoals();
      const filteredGoals = goals.filter(goal => goal.id !== id);
      this.saveGoals(filteredGoals);
    } catch (error) {
      throw new StorageError(`Failed to delete goal with id ${id}`, error);
    }
  }

  async markFailure(id: string): Promise<FailureGoal> {
    try {
      const goals = this.getGoals();
      const index = goals.findIndex(goal => goal.id === id);

      if (index === -1) {
        throw new StorageError(`Goal with id ${id} not found`);
      }

      const goal = goals[index];
      const newFailureCount = goal.currentFailures + 1;
      const isCompleted = newFailureCount >= goal.targetFailures;

      const updatedGoal = {
        ...goal,
        currentFailures: newFailureCount,
        isCompleted,
        updatedAt: new Date(),
      };

      goals[index] = updatedGoal;
      this.saveGoals(goals);
      return updatedGoal;
    } catch (error) {
      throw new StorageError(`Failed to mark failure for goal with id ${id}`, error);
    }
  }
}

// Export the storage service instance
export const storageService: StorageService = new LocalStorageService();