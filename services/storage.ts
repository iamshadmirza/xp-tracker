import { FailureGoal, CreateFailureGoalData, UpdateFailureGoalData } from '@/types';

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

  private getGoals(): FailureGoal[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((goal: any) => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt),
      }));
    } catch {
      return [];
    }
  }

  private saveGoals(goals: FailureGoal[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(goals));
  }

  async getAll(): Promise<FailureGoal[]> {
    return this.getGoals();
  }

  async getById(id: string): Promise<FailureGoal | null> {
    const goals = this.getGoals();
    return goals.find(goal => goal.id === id) || null;
  }

  async create(data: CreateFailureGoalData): Promise<FailureGoal> {
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
  }

  async update(id: string, data: UpdateFailureGoalData): Promise<FailureGoal> {
    const goals = this.getGoals();
    const index = goals.findIndex(goal => goal.id === id);
    
    if (index === -1) {
      throw new Error('Goal not found');
    }

    const updatedGoal = {
      ...goals[index],
      ...data,
      updatedAt: new Date(),
    };

    goals[index] = updatedGoal;
    this.saveGoals(goals);
    return updatedGoal;
  }

  async delete(id: string): Promise<void> {
    const goals = this.getGoals();
    const filteredGoals = goals.filter(goal => goal.id !== id);
    this.saveGoals(filteredGoals);
  }

  async markFailure(id: string): Promise<FailureGoal> {
    const goals = this.getGoals();
    const index = goals.findIndex(goal => goal.id === id);
    
    if (index === -1) {
      throw new Error('Goal not found');
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
  }
}

// Export the storage service instance
export const storageService: StorageService = new LocalStorageService();