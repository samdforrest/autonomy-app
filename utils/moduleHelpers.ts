 // Helper utilities for module completion tracking

export const MODULE_CONFIGS = {
  mistakes: { name: 'Mistakes', totalDays: 5 },
  regulation: { name: 'Regulation', totalDays: 5 },
  job: { name: 'Responsibility', totalDays: 5 },
  collaboration: { name: 'Collaboration', totalDays: 5 },
  selfcoach: { name: 'Self-Coaching', totalDays: 5 },
  curiosity: { name: 'Curiosity', totalDays: 5 },
  shapeoflearning: { name: 'Shape of Learning', totalDays: 5 },
  neuroplasticity: { name: 'Neuroplasticity', totalDays: 5 },
  masterymoments: { name: 'Mastery Moments', totalDays: 5 },
  selfmonitoring: { name: 'Self-Monitoring', totalDays: 5 },
} as const;

export type ModuleId = keyof typeof MODULE_CONFIGS;

export function getModuleConfig(moduleId: string) {
  return MODULE_CONFIGS[moduleId as ModuleId] || { name: moduleId, totalDays: 5 };
}

export function getModuleName(moduleId: string): string {
  return getModuleConfig(moduleId).name;
}

export function getAllModuleIds(): ModuleId[] {
  return Object.keys(MODULE_CONFIGS) as ModuleId[];
}

// Helper to add completion tracking to any module screen
export function createModuleCompletionProps(moduleId: string, currentDay: number) {
  const config = getModuleConfig(moduleId);
  return {
    moduleId,
    moduleName: config.name,
    currentDay,
    totalDays: config.totalDays,
    onProgressUpdate: (completedDays: number, isCompleted: boolean) => {
      console.log(`📊 ${config.name} progress updated:`, { completedDays, isCompleted });
    }
  };
}
