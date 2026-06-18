import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS
 * Utility function from shadcn/ui
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}