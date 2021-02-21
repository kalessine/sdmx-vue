/*
    This file is part of sdmx-js.

    sdmx-js is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    sdmx-js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with sdmx-js.  If not, see <http://www.gnu.org/licenses/>.
    Copyright (C) 2016 James Gardner
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
