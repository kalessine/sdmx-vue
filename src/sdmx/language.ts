export class Language {
  private static languages:Array<string> = [];
  public static registerLanguage(s: string) {
    for (let i = 0; i < Language.languages.length; i++) {
      if (Language.languages[i] === s) return;
    }
    Language.languages.push(s);
  }

  public static listLanguages(): Array<string> {
    return Language.languages;
  }

  // This moved here from SdmxIO because of circular reference
  private static language: string = "en";
  public static setLanguage = (s: string) => {
    Language.language = s;
  };

  public static getLanguage = (): string => {
    return Language.language;
  };
}
export default { Language: Language };
