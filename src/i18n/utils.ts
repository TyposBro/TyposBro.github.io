import en from './en.json';
import ko from './ko.json';
import ru from './ru.json';
import uz from './uz.json';
import type { Locale } from '../config';

const dictionaries = { en, ko, ru, uz } as const;

export function t(locale: Locale, path: string): string {
  const dict = dictionaries[locale] ?? en;
  return (
    path.split('.').reduce<unknown>((obj, key) => {
      if (obj && typeof obj === 'object' && key in obj) {
        return (obj as Record<string, unknown>)[key];
      }
      return undefined;
    }, dict) as string | undefined
  ) ?? path;
}
