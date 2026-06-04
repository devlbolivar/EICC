import { SubscriptionPlan } from './enums/subscription';

export const PLAN_LIMITS = {
  [SubscriptionPlan.FREE]: {
    maxEmployees: 5,
    maxDistinctCourses: 3,
    certificates: false,
  },
  [SubscriptionPlan.STARTER]: {
    maxEmployees: 20,
    maxDistinctCourses: Infinity,
    certificates: true,
  },
  [SubscriptionPlan.PRO]: {
    maxEmployees: 50,
    maxDistinctCourses: Infinity,
    certificates: true,
  },
} as const satisfies Record<SubscriptionPlan, PlanLimits>;

export interface PlanLimits {
  maxEmployees: number;
  maxDistinctCourses: number;
  certificates: boolean;
}

export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  const key = (plan ?? SubscriptionPlan.FREE) as SubscriptionPlan;
  return PLAN_LIMITS[key] ?? PLAN_LIMITS[SubscriptionPlan.FREE];
}
