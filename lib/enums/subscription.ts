/**
 * Enumeraciones para suscripciones y planes de facturación
 */

/**
 * Planes de suscripción disponibles
 */
export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PRO = 'pro',
}

/**
 * Labels para planes de suscripción
 */
export const SUBSCRIPTION_PLAN_LABELS: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.FREE]: 'Plan Gratuito',
  [SubscriptionPlan.STARTER]: 'Plan Starter',
  [SubscriptionPlan.PRO]: 'Plan Pro',
} as const;

/**
 * Estados de suscripción
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
}

/**
 * Labels para estados de suscripción
 */
export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: 'Activa',
  [SubscriptionStatus.INACTIVE]: 'Inactiva',
  [SubscriptionStatus.CANCELLED]: 'Cancelada',
  [SubscriptionStatus.PAST_DUE]: 'Pago Vencido',
  [SubscriptionStatus.TRIALING]: 'En Prueba',
} as const;

/**
 * Monedas soportadas
 */
export enum Currency {
  USD = 'usd',
  CLP = 'clp',
  EUR = 'eur',
}

/**
 * Símbolos de moneda
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.USD]: '$',
  [Currency.CLP]: '$',
  [Currency.EUR]: '€',
} as const;

/**
 * Nombres de moneda
 */
export const CURRENCY_NAMES: Record<Currency, string> = {
  [Currency.USD]: 'USD',
  [Currency.CLP]: 'CLP',
  [Currency.EUR]: 'EUR',
} as const;

/**
 * Obtiene el símbolo de una moneda
 */
export function getCurrencySymbol(currency: Currency | string): string {
  return CURRENCY_SYMBOLS[currency as Currency] || currency;
}

/**
 * Obtiene el nombre de una moneda
 */
export function getCurrencyName(currency: Currency | string): string {
  return CURRENCY_NAMES[currency as Currency] || currency;
}

/**
 * Valida si un string es un plan de suscripción válido
 */
export function isValidSubscriptionPlan(plan: string): plan is SubscriptionPlan {
  return Object.values(SubscriptionPlan).includes(plan as SubscriptionPlan);
}

/**
 * Valida si un string es un estado de suscripción válido
 */
export function isValidSubscriptionStatus(status: string): status is SubscriptionStatus {
  return Object.values(SubscriptionStatus).includes(status as SubscriptionStatus);
}

/**
 * Valida si un string es una moneda válida
 */
export function isValidCurrency(currency: string): currency is Currency {
  return Object.values(Currency).includes(currency as Currency);
}
