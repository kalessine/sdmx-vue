/*
MIT License

Copyright (c) 2021 James Gardner

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
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
