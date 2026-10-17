import type { CEFRLevel } from '../types/api';

export const DAILY_GOAL_PRESETS = [10, 20, 30, 50, 100] as const;

export interface ProfileFormValues {
  name: string;
  currentLevel: CEFRLevel;
  dailyGoal: string;
}

export interface ProfileFormErrors {
  name?: string;
  dailyGoal?: string;
}

/** Profil formunu doğrular. Hata yoksa boş nesne döner. */
export function validateProfileForm(values: ProfileFormValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {};
  if (!values.name.trim()) {
    errors.name = 'İsim boş olamaz';
  }

  const goal = Number(values.dailyGoal);
  if (!Number.isInteger(goal) || goal < 1 || goal > 200) {
    errors.dailyGoal = 'Günlük hedef 1 ile 200 arasında tam sayı olmalı';
  }
  return errors;
}
