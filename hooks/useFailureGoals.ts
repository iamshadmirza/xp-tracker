'use client';

import { useState, useEffect } from 'react';
import { FailureGoal, CreateFailureGoalData, UpdateFailureGoalData } from '@/types';
import { storageService } from '@/services/storage';

export function useFailureGoals() {
  const [goals, setGoals] = useState<FailureGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGoals = async () => {
    try {
      const allGoals = await storageService.getAll();
      setGoals(allGoals);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const createGoal = async (data: CreateFailureGoalData): Promise<void> => {
    try {
      const newGoal = await storageService.create(data);
      setGoals(prev => [...prev, newGoal]);
    } catch (error) {
      console.error('Failed to create goal:', error);
      throw error;
    }
  };

  const updateGoal = async (id: string, data: UpdateFailureGoalData) => {
    try {
      const updatedGoal = await storageService.update(id, data);
      setGoals(prev => prev.map(goal => goal.id === id ? updatedGoal : goal));
      return updatedGoal;
    } catch (error) {
      console.error('Failed to update goal:', error);
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await storageService.delete(id);
      setGoals(prev => prev.filter(goal => goal.id !== id));
    } catch (error) {
      console.error('Failed to delete goal:', error);
      throw error;
    }
  };

  const markFailure = async (id: string) => {
    try {
      const updatedGoal = await storageService.markFailure(id);
      setGoals(prev => prev.map(goal => goal.id === id ? updatedGoal : goal));
      return updatedGoal;
    } catch (error) {
      console.error('Failed to mark failure:', error);
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
    createGoal,
    updateGoal,
    deleteGoal,
    markFailure,
    refreshGoals: loadGoals,
  };
}