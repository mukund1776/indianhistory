export const LANGUAGES = [
  { code: 'en', name: 'English', direction: 'ltr' },
  { code: 'hi', name: 'हिन्दी', direction: 'ltr' },
  { code: 'bn', name: 'বাংলা', direction: 'ltr' },
  { code: 'ta', name: 'தமிழ்', direction: 'ltr' },
  { code: 'te', name: 'తెలుగు', direction: 'ltr' },
  { code: 'mr', name: 'मराठी', direction: 'ltr' },
  { code: 'ur', name: 'اردو', direction: 'rtl' },
  { code: 'gu', name: 'ગુજરાતી', direction: 'ltr' },
  { code: 'kn', name: 'ಕನ್ನಡ', direction: 'ltr' },
  { code: 'ml', name: 'മലയാളം', direction: 'ltr' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', direction: 'ltr' },
  { code: 'es', name: 'Español', direction: 'ltr' },
  { code: 'fr', name: 'Français', direction: 'ltr' },
  { code: 'ar', name: 'العربية', direction: 'rtl' },
  { code: 'zh', name: '中文', direction: 'ltr' },
  { code: 'pt', name: 'Português', direction: 'ltr' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export function languageFromUrl(value: string | null): LanguageCode {
  return LANGUAGES.find(language => language.code === value)?.code ?? 'en';
}
