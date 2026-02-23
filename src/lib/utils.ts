import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';
import { ko, enUS, ja, zhCN, es, fr } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Map string language names to date-fns locales
const localeMap: Record<string, Locale> = {
  'Korean': ko,
  'English': enUS,
  'Japanese': ja,
  'Chinese': zhCN,
  'Spanish': es,
  'French': fr,
};

export function timeAgo(dateString: string | null | undefined, language: string = 'English') {
  if (!dateString) return '';
  const date = new Date(dateString);
  const locale = localeMap[language] || enUS;

  try {
    return formatDistanceToNow(date, { addSuffix: true, locale });
  } catch (e) {
    return '';
  }
}
