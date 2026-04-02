export type LanguageCode = "en" | "nb" | "nn";

export function getLanguageCode(selectedLanguage?: string): LanguageCode {
  const normalized = (selectedLanguage ?? "").toLowerCase();

  if (normalized.startsWith("nb")) {
    return "nb";
  }

  if (normalized.startsWith("nn")) {
    return "nn";
  }

  if (normalized.startsWith("no")) {
    return "nb";
  }

  return "en";
}