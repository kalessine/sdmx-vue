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
import moment from "moment";
export class XMLString {
  private value: string;
  constructor(s: string) {
    this.value = s;
  }

  public getString(): string {
    return this.value;
  }
  public toString(): string {
    return this.value;
  }

  public equalsString(s: string): boolean {
    return this.value === s;
  }
}
export class RegexXMLString extends XMLString {
  public getPatternArray(): string[] {
    return [];
  }
}
export class AnyURI {
  public s: string;
  constructor(s: string) {
    this.s = s;
  }

  public getString(): string {
    return this.s;
  }
  public toString(): string {
    return this.s;
  }
}
export class DateTime {
  public static DF = "yyyy-MM-dd'T'HH:mm:ssXXX";
  public static DF2 = "yyyy-MM-dd'T'HH:mm:ss";
  private baseString: string|undefined;
  private date: Date;

  constructor(d: Date) {
    this.date = d;
  }

  public getDate(): Date {
    return this.date;
  }

  public static fromString(s: string): DateTime |undefined{
    if (s === undefined || s === "") {
      return undefined;
    }
    const m = moment(s, [DateTime.DF, DateTime.DF2]);
    const dt: DateTime = new DateTime(m.toDate());
    dt.setBaseString(s);
    return dt;
  }

  public toString(): string {
    if (this.baseString != null) return this.baseString;
    return moment(this.date).format(DateTime.DF);
  }

  public static now(): DateTime {
    return new DateTime(moment().toDate());
  }

  public setBaseString(s: string) {
    this.baseString = s;
  }

  public getBaseString(): string|undefined {
    return this.baseString;
  }
}
export class Duration {}

export default {
  DateTime: DateTime,
  RegexXMLString: RegexXMLString,
  XMLString: XMLString,
  AnyURI: AnyURI,
  Duration: Duration
};
