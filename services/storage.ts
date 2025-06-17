import { FailureGoal, CreateFailureGoalData, UpdateFailureGoalData, FailureLog, CreateFailureLogData } from '@/types';
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
  markFailure(id: string, logData: CreateFailureLogData): Promise<FailureGoal>;
  getFailureLogs(goalId: string): Promise<FailureLog[]>;
}

// Define the database schema
class FailureGoalsDatabase extends Dexie {
  goals!: Table<FailureGoal>;
  logs!: Table<FailureLog>;

  constructor() {
    super('quests_db');
    this.version(2).stores({
      goals: 'id, createdAt, category, isCompleted, lastFailureAt',
      logs: 'id, goalId, createdAt'
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
      const goalsWithLogs = await Promise.all(
        goals.map(async (goal) => {
          const logs = await this.getFailureLogs(goal.id);
          return {
            ...goal,
            logs,
            createdAt: new Date(goal.createdAt),
            updatedAt: new Date(goal.updatedAt),
          };
        })
      );
      return goalsWithLogs;
    } catch (error) {
      console.error('Failed to get all quests:', error);
      throw new StorageError('Failed to get all quests', error);
    }
  }

  async getById(id: string): Promise<FailureGoal | null> {
    try {
      const goal = await this.db.goals.get(id);
      if (!goal) return null;

      const logs = await this.getFailureLogs(id);
      return {
        ...goal,
        logs,
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
        logs: [],
        currentStreak: 0,
        lastFailureAt: null,
        streakStatus: 'broken'
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
      // Delete all logs associated with this goal
      await this.db.logs.where('goalId').equals(id).delete();
      // Delete the goal
      await this.db.goals.delete(id);
    } catch (error) {
      console.error(`Failed to delete quest with id ${id}:`, error);
      throw new StorageError(`Failed to delete quest with id ${id}`, error);
    }
  }

  async getFailureLogs(goalId: string): Promise<FailureLog[]> {
    try {
      const logs = await this.db.logs
        .where('goalId')
        .equals(goalId)
        .reverse()
        .sortBy('createdAt');

      return logs.map(log => ({
        ...log,
        createdAt: new Date(log.createdAt),
      }));
    } catch (error) {
      console.error(`Failed to get failure logs for quest ${goalId}:`, error);
      throw new StorageError(`Failed to get failure logs for quest ${goalId}`, error);
    }
  }

  async markFailure(id: string, logData: CreateFailureLogData): Promise<FailureGoal> {
    try {
      const existingGoal = await this.getById(id);
      if (!existingGoal) {
        throw new StorageError(`Quest with id ${id} not found`);
      }

      const newFailureCount = existingGoal.currentFailures + 1;
      const isCompleted = newFailureCount >= existingGoal.targetFailures;
      const now = new Date();

      // Calculate streak
      let currentStreak = existingGoal.currentStreak;
      let streakStatus = existingGoal.streakStatus;

      if (existingGoal.lastFailureAt) {
        const hoursSinceLastFailure = (now.getTime() - existingGoal.lastFailureAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastFailure <= 24) {
          // Within 24 hours - increment streak
          currentStreak += 1;
          streakStatus = 'active';
        } else if (hoursSinceLastFailure <= 34) { // 24 + 10 hours
          // Within grace period - maintain streak
          streakStatus = 'warning';
        } else {
          // Streak broken
          currentStreak = 1;
          streakStatus = 'broken';
        }
      } else {
        // First failure
        currentStreak = 1;
        streakStatus = 'active';
      }

      // Create the failure log
      const newLog: FailureLog = {
        id: this.isBrowser() ? crypto.randomUUID() : Math.random().toString(36).substring(7),
        goalId: id,
        ...logData,
        createdAt: now,
      };

      // Update the goal
      const updatedGoal = {
        ...existingGoal,
        currentFailures: newFailureCount,
        isCompleted,
        updatedAt: now,
        currentStreak,
        lastFailureAt: now,
        streakStatus
      };

      // Save both the log and the updated goal
      await this.db.transaction('rw', [this.db.logs, this.db.goals], async () => {
        await this.db.logs.add(newLog);
        await this.db.goals.put(updatedGoal);
      });

      return {
        ...updatedGoal,
        logs: [...existingGoal.logs, newLog],
      };
    } catch (error) {
      console.error(`Failed to mark failure for quest with id ${id}:`, error);
      throw new StorageError(`Failed to mark failure for quest with id ${id}`, error);
    }
  }
}

// Export the storage service instance
export const storageService: StorageService = new DexieStorageService();