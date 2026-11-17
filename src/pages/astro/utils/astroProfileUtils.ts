import type { AstroGender } from '../../../services/api/astro';

export const GENDER_OPTIONS: AstroGender[] = [
  'Male',
  'Female',
  'Others',
  'Prefer not to say',
];

export const astroFieldClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white';

export const astroLabelClass =
  'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1';

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function pickDirtyFields<T extends Record<string, unknown>>(
  current: T,
  initial: T
): Partial<T> {
  const patch: Partial<T> = {};
  (Object.keys(current) as (keyof T)[]).forEach((key) => {
    if (current[key] !== initial[key]) {
      patch[key] = current[key];
    }
  });
  return patch;
}
