import { FailureGoal, CreateFailureGoalData, UpdateFailureGoalData } from '@/types';
import Dexie, { Table } from 'dexie';

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

// Define the database schema
class FailureGoalsDatabase extends Dexie {
  goals!: Table<FailureGoal>;

  constructor() {
    super('quests_db');
    this.version(1).stores({
      goals: 'id, createdAt, category, isCompleted'
    });
  }
}

class DexieStorageService implements StorageService {
  private db: FailureGoalsDatabase;

  constructor() {
    this.db = new FailureGoalsDatabase();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  async getAll(): Promise<FailureGoal[]> {
    try {
      const goals = await this.db.goals.toArray();
      return goals.map(goal => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to get all quests:', error);
      throw new StorageError('Failed to get all quests', error);
    }
  }

  async getById(id: string): Promise<FailureGoal | null> {
    try {
      const goal = await this.db.goals.get(id);
      if (!goal) return null;

      return {
        ...goal,
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt),
      };
    } catch (error) {
      console.error(`Failed to get quest with id ${id}:`, error);
      throw new StorageError(`Failed to get quest with id ${id}`, error);
    }
  }

  async create(data: CreateFailureGoalData): Promise<FailureGoal> {
    try {
      const newGoal: FailureGoal = {
        id: this.isBrowser() ? crypto.randomUUID() : Math.random().toString(36).substring(7),
        ...data,
        currentFailures: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isCompleted: false,
      };

      await this.db.goals.add(newGoal);
      return newGoal;
    } catch (error) {
      console.error('Failed to create quest:', error);
      throw new StorageError('Failed to create quest', error);
    }
  }

  async update(id: string, data: UpdateFailureGoalData): Promise<FailureGoal> {
    try {
      const existingGoal = await this.getById(id);
      if (!existingGoal) {
        throw new StorageError(`Quest with id ${id} not found`);
      }

      const updatedGoal = {
        ...existingGoal,
        ...data,
        updatedAt: new Date(),
      };

      await this.db.goals.put(updatedGoal);
      return updatedGoal;
    } catch (error) {
      console.error(`Failed to update quest with id ${id}:`, error);
      throw new StorageError(`Failed to update quest with id ${id}`, error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.goals.delete(id);
    } catch (error) {
      console.error(`Failed to delete quest with id ${id}:`, error);
      throw new StorageError(`Failed to delete quest with id ${id}`, error);
    }
  }

  async markFailure(id: string): Promise<FailureGoal> {
    try {
      const existingGoal = await this.getById(id);
      if (!existingGoal) {
        throw new StorageError(`Quest with id ${id} not found`);
      }

      const newFailureCount = existingGoal.currentFailures + 1;
      const isCompleted = newFailureCount >= existingGoal.targetFailures;

      const updatedGoal = {
        ...existingGoal,
        currentFailures: newFailureCount,
        isCompleted,
        updatedAt: new Date(),
      };

      await this.db.goals.put(updatedGoal);
      return updatedGoal;
    } catch (error) {
      console.error(`Failed to mark failure for quest with id ${id}:`, error);
      throw new StorageError(`Failed to mark failure for quest with id ${id}`, error);
    }
  }
}

// Export the storage service instance
export const storageService: StorageService = new DexieStorageService();