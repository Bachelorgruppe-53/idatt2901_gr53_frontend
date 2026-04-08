export type LanguageCode = "en" | "nb" | "nn";

/**
 * Determines the appropriate language code based on the selected language string.
 * The function normalizes the input and checks for specific language codes.
 * If the input starts with "nb", it returns "nb". If it starts with "nn", it returns "nn".
 * If it starts with "no", it defaults to "nb". For any other input, it defaults to "en".
 * 
 * @param selectedLanguage The language string to evaluate (e.g., "en-US", "no-NB", "nn-NN").
 * @returns The corresponding language code.
 */

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