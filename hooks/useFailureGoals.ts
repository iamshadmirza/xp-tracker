'use client';

import { useState, useEffect } from 'react';
import { FailureGoal, CreateFailureGoalData, UpdateFailureGoalData } from '@/types';
import { storageService, StorageError } from '@/services/storage';
import { useToast } from '@/hooks/use-toast';

export function useFailureGoals() {
  const [goals, setGoals] = useState<FailureGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadGoals = async () => {
    try {
      setError(null);
      const allGoals = await storageService.getAll();
      setGoals(allGoals);
    } catch (error) {
      const message = error instanceof StorageError
        ? error.message
        : 'Failed to load goals. Please try again.';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const createGoal = async (data: CreateFailureGoalData): Promise<void> => {
    try {
      setError(null);
      const newGoal = await storageService.create(data);
      setGoals(prev => [...prev, newGoal]);
      toast({
        title: 'Success',
        description: 'Goal created successfully!',
      });
    } catch (error) {
      const message = error instanceof StorageError
        ? error.message
        : 'Failed to create goal. Please try again.';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateGoal = async (id: string, data: UpdateFailureGoalData) => {
    try {
      setError(null);
      const updatedGoal = await storageService.update(id, data);
      setGoals(prev => prev.map(goal => goal.id === id ? updatedGoal : goal));
      toast({
        title: 'Success',
        description: 'Goal updated successfully!',
      });
      return updatedGoal;
    } catch (error) {
      const message = error instanceof StorageError
        ? error.message
        : 'Failed to update goal. Please try again.';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      setError(null);
      await storageService.delete(id);
      setGoals(prev => prev.filter(goal => goal.id !== id));
      toast({
        title: 'Success',
        description: 'Goal deleted successfully!',
      });
    } catch (error) {
      const message = error instanceof StorageError
        ? error.message
        : 'Failed to delete goal. Please try again.';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const markFailure = async (id: string) => {
    try {
      setError(null);
      const updatedGoal = await storageService.markFailure(id);
      setGoals(prev => prev.map(goal => goal.id === id ? updatedGoal : goal));

      if (updatedGoal.isCompleted) {
        toast({
          title: 'Congratulations! 🎉',
          description: 'You have completed this goal!',
        });
      } else {
        toast({
          title: 'Progress Updated',
          description: `You're now at ${updatedGoal.currentFailures}/${updatedGoal.targetFailures} failures. Keep going!`,
        });
      }

      return updatedGoal;
    } catch (error) {
      const message = error instanceof StorageError
        ? error.message
        : 'Failed to mark failure. Please try again.';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const activeGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);

  return {
    goals,
    activeGoals,
    completedGoals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    markFailure,
    refreshGoals: loadGoals,
  };
}