import { PaginationInfo } from "@/app/types";

/**
 * Creates a PaginationInfo object with calculated fields
 * @param page - Current page number (1-indexed)
 * @param limit - Number of items per page
 * @param total - Total number of items
 * @returns PaginationInfo object with all pagination details
 */
export function createPaginationInfo(
  page: number,
  limit: number,
  total: number
): PaginationInfo {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Validates pagination parameters
 * @param pagination - PaginationInfo object to validate
 * @returns boolean indicating if pagination is valid
 */
export function isPaginationValid(pagination: PaginationInfo | null | undefined): boolean {
  if (!pagination) {
    return false;
  }

  const { page, limit, total, totalPages } = pagination;

  // Check for required fields and valid types
  if (
    typeof page !== "number" ||
    typeof limit !== "number" ||
    typeof total !== "number" ||
    typeof totalPages !== "number"
  ) {
    return false;
  }

  // Check for valid values
  if (page < 1 || limit < 1 || total < 0 || totalPages < 0) {
    return false;
  }

  // Verify totalPages calculation is consistent
  const expectedTotalPages = Math.ceil(total / limit);
  if (totalPages !== expectedTotalPages && total > 0) {
    return false;
  }

  // Verify page is within bounds (allow page 1 when total is 0)
  if (total > 0 && page > totalPages) {
    return false;
  }

  return true;
}

/**
 * Gets the start and end indices for the current page
 * @param pagination - PaginationInfo object
 * @returns Object with start and end indices (0-indexed)
 */
export function getPaginationRange(pagination: PaginationInfo): { start: number; end: number } {
  const start = (pagination.page - 1) * pagination.limit;
  const end = Math.min(start + pagination.limit, pagination.total);

  return { start, end };
}

/**
 * Creates a display string for pagination (e.g., "Mostrando 1-10 de 100")
 * @param pagination - PaginationInfo object
 * @param itemLabel - Label for items (default: "elementos")
 * @returns Formatted pagination display string
 */
export function getPaginationDisplayText(
  pagination: PaginationInfo,
  itemLabel: string = "elementos"
): string {
  if (pagination.total === 0) {
    return `No hay ${itemLabel}`;
  }

  const { start, end } = getPaginationRange(pagination);

  return `Mostrando ${start + 1}-${end} de ${pagination.total} ${itemLabel}`;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGINATION: PaginationInfo = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

/**
 * Common pagination limits
 */
export const PAGINATION_LIMITS = {
  SMALL: 5,
  DEFAULT: 10,
  MEDIUM: 20,
  LARGE: 50,
  EXTRA_LARGE: 100,
} as const;
