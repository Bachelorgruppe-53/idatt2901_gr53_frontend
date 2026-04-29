import {
    getLanguageCode,
    type LanguageCode,
} from "@/services/language/languageCode";

describe("getLanguageCode", () => {
  describe("Norwegian Bokmål (nb)", () => {
    it("returns 'nb' for 'nb'", () => {
      expect(getLanguageCode("nb")).toBe("nb");
    });

    it("returns 'nb' for 'nb-NO'", () => {
      expect(getLanguageCode("nb-NO")).toBe("nb");
    });

    it("returns 'nb' for 'NB' (uppercase)", () => {
      expect(getLanguageCode("NB")).toBe("nb");
    });

    it("returns 'nb' for 'NB-NO' (uppercase)", () => {
      expect(getLanguageCode("NB-NO")).toBe("nb");
    });

    it("returns 'nb' for string starting with 'nb'", () => {
      expect(getLanguageCode("nb-Bokmål")).toBe("nb");
    });

    it("returns 'nb' for 'no' (Norwegian defaults to Bokmål)", () => {
      expect(getLanguageCode("no")).toBe("nb");
    });

    it("returns 'nb' for 'no-NO' (Norwegian defaults to Bokmål)", () => {
      expect(getLanguageCode("no-NO")).toBe("nb");
    });

    it("returns 'nb' for 'NO' (uppercase Norwegian)", () => {
      expect(getLanguageCode("NO")).toBe("nb");
    });
  });

  describe("Norwegian Nynorsk (nn)", () => {
    it("returns 'nn' for 'nn'", () => {
      expect(getLanguageCode("nn")).toBe("nn");
    });

    it("returns 'nn' for 'nn-NO'", () => {
      expect(getLanguageCode("nn-NO")).toBe("nn");
    });

    it("returns 'nn' for 'NN' (uppercase)", () => {
      expect(getLanguageCode("NN")).toBe("nn");
    });

    it("returns 'nn' for 'NN-NO' (uppercase)", () => {
      expect(getLanguageCode("NN-NO")).toBe("nn");
    });

    it("returns 'nn' for string starting with 'nn'", () => {
      expect(getLanguageCode("nn-Nynorsk")).toBe("nn");
    });
  });

  describe("English (en)", () => {
    it("returns 'en' for 'en'", () => {
      expect(getLanguageCode("en")).toBe("en");
    });

    it("returns 'en' for 'en-US'", () => {
      expect(getLanguageCode("en-US")).toBe("en");
    });

    it("returns 'en' for 'en-GB'", () => {
      expect(getLanguageCode("en-GB")).toBe("en");
    });

    it("returns 'en' for 'EN' (uppercase)", () => {
      expect(getLanguageCode("EN")).toBe("en");
    });

    it("returns 'en' for 'EN-US' (uppercase)", () => {
      expect(getLanguageCode("EN-US")).toBe("en");
    });
  });

  describe("Default behavior", () => {
    it("returns 'en' for undefined", () => {
      expect(getLanguageCode(undefined)).toBe("en");
    });

    it("returns 'en' for empty string", () => {
      expect(getLanguageCode("")).toBe("en");
    });

    it("returns 'en' for unknown language code", () => {
      expect(getLanguageCode("fr")).toBe("en");
    });

    it("returns 'en' for unknown language code with region", () => {
      expect(getLanguageCode("fr-FR")).toBe("en");
    });

    it("returns 'en' for empty region code", () => {
      expect(getLanguageCode("en-")).toBe("en");
    });

    it("returns 'en' for 'es' (Spanish)", () => {
      expect(getLanguageCode("es")).toBe("en");
    });

    it("returns 'en' for 'de' (German)", () => {
      expect(getLanguageCode("de")).toBe("en");
    });

    it("returns 'en' for random text", () => {
      expect(getLanguageCode("foobar")).toBe("en");
    });
  });

  describe("Case insensitivity", () => {
    it("normalizes input to lowercase before matching", () => {
      const testCases: Array<[string | undefined, LanguageCode]> = [
        ["NB", "nb"],
        ["NN", "nn"],
        ["EN", "en"],
        ["No", "nb"],
        ["No-NO", "nb"],
        ["FR-FR", "en"],
      ];

      testCases.forEach(([input, expected]) => {
        expect(getLanguageCode(input)).toBe(expected);
      });
    });
  });

  describe("Prefix matching", () => {
    it("matches on prefix for Norwegian Bokmål", () => {
      const bokmålCodes = ["nb", "nb-NO", "nb-Bokmål", "nb_NO", "NB_anything"];
      bokmålCodes.forEach((code) => {
        expect(getLanguageCode(code)).toBe("nb");
      });
    });

    it("matches on prefix for Norwegian Nynorsk", () => {
      const nynorskCodes = [
        "nn",
        "nn-NO",
        "nn-Nynorsk",
        "nn_NO",
        "NN_anything",
      ];
      nynorskCodes.forEach((code) => {
        expect(getLanguageCode(code)).toBe("nn");
      });
    });

    it("matches on prefix for generic Norwegian", () => {
      const norwegianCodes = ["no", "no-NO", "no_any"];
      norwegianCodes.forEach((code) => {
        expect(getLanguageCode(code)).toBe("nb");
      });
    });
  });

  describe("Type safety", () => {
    it("always returns valid LanguageCode type", () => {
      const validCodes: LanguageCode[] = ["en", "nb", "nn"];

      const testInputs = [undefined, "", "en", "nb", "nn", "no", "fr", "DE"];
      testInputs.forEach((input) => {
        const result = getLanguageCode(input);
        expect(validCodes).toContain(result);
      });
    });
  });
});
