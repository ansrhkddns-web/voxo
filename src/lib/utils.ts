import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';
import { ko, enUS, ja, zhCN, es, fr, type Locale } from 'date-fns/locale';

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
  } catch {
    return '';
  }
}

export function stripHtmlTags(value: string | null | undefined) {
  if (!value) return '';

  return value
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function estimateReadTimeMinutes(value: string | null | undefined, wordsPerMinute = 220) {
  const plainText = stripHtmlTags(value);
  if (!plainText) return 1;

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
