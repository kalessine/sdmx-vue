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

import * as collections from "typescript-collections";
const LONG_MONTH_NAMES: Array<string> = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const SHORT_MONTH_NAMES: Array<string> = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
const NUMBERS: Array<string> = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12"
];
export function stringToMonthCode(s: string) {
  for (let i = 0; i < LONG_MONTH_NAMES.length; i++) {
    if (LONG_MONTH_NAMES[i] === s)
      return collections.arrays.indexOf(LONG_MONTH_NAMES, s);
  }
  for (let i = 0; i < SHORT_MONTH_NAMES.length; i++) {
    if (SHORT_MONTH_NAMES[i] === s)
      return collections.arrays.indexOf(SHORT_MONTH_NAMES, s);
  }
  for (let i = 0; i < NUMBERS.length; i++) {
    if (NUMBERS[i] === s)
      return collections.arrays.indexOf(NUMBERS, s);
  }
  return 1;
}

/*
 * RegularTimePeriod and the classes that extend RegularTimePeriod are adapted
 * from classes from the JFreeChart (Java) library (all except Semester))
 * the copyright notice from RegularTimePeriod.java is included here;
 * -James Gardner 31/5/2016
 */
/* ==================================================================
 * JFreeChart : a free chart library for the Java(tm) platform
 * ==================================================================
 *
 * (C) Copyright 2000-2014, by Object Refinery Limited and Contributors.
 *
 * Project Info:  http://www.jfree.org/jfreechart/index.html
 *
 * This library is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public
 * License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301,
 * USA.
 *
 * [Oracle and Java are registered trademarks of Oracle and/or its affiliates.
 * Other names may be trademarks of their respective owners.]
 *
 * ----------------------
 * RegularTimePeriod.java
 * ----------------------
 * (C) Copyright 2001-2014, by Object Refinery Limited.
 *
 * Original Author:  David Gilbert (for Object Refinery Limited);
 * Contributor(s):   -;
 *
 * Changes
 * -------
 * 11-Oct-2001 : Version 1 (DG);
 * 26-Feb-2002 : Changed getStart(), getMiddle() and getEnd() methods to
 *               evaluate with reference to a particular time zone (DG);
 * 29-May-2002 : Implemented MonthConstants interface, so that these constants
 *               are conveniently available (DG);
 * 10-Sep-2002 : Added getSerialIndex() method (DG);
 * 10-Jan-2003 : Renamed TimePeriod --> RegularTimePeriod (DG);
 * 13-Mar-2003 : Moved to com.jrefinery.data.time package (DG);
 * 29-Apr-2004 : Changed getMiddleMillisecond() methods to fix bug 943985 (DG);
 * 25-Nov-2004 : Added utility methods (DG);
 * ------------- JFREECHART 1.0.x ---------------------------------------------
 * 06-Oct-2006 : Deprecated the WORKING_CALENDAR field and several methods,
 *               added new peg() method (DG);
 * 16-Sep-2008 : Deprecated DEFAULT_TIME_ZONE (DG);
 * 23-Feb-2014 : Added getMillisecond() method (DG);
 *
 */

export interface RegularTimePeriod {
  getStart(): Date;
  getFirstMillisecond(): number;
  getEnd(): Date;
  getLastMillisecond(): number;
  /**
   * Returns the time period preceding this one, or <code>null</code> if some
   * lower limit has been reached.
   *
   * @return The previous time period (possibly <code>null</code>).
   */
  previous(): RegularTimePeriod | undefined;

  /**
   * Returns the time period following this one, or <code>null</code> if some
   * limit has been reached.
   *
   * @return The next time period (possibly <code>null</code>).
   */
  next(): RegularTimePeriod | undefined;

  /**
   * Returns a serial index number for the time unit.
   *
   * @return The serial index number.
   */
  getSerialIndex(): number;
}
export class AbstractRegularTimePeriod implements RegularTimePeriod {
  next(): RegularTimePeriod | undefined {
    return undefined;
  }

  previous(): RegularTimePeriod | undefined {
    return undefined;
  }

  getSerialIndex(): number {
    return 0;
  }

  /**
   * Returns the date/time that marks the start of the time period.  This
   * method returns a new <code>Date</code> instance every time it is called.
   *
   * @return The start date/time.
   *
   * @see #getFirstMillisecond()
   */
  public getStart(): Date {
    return new Date(this.getFirstMillisecond());
  }

  /**
   * Returns the date/time that marks the end of the time period.  This
   * method returns a new <code>Date</code> instance every time it is called.
   *
   * @return The end date/time.
   *
   * @see #getLastMillisecond()
   */
  public getEnd(): Date {
    return new Date(this.getLastMillisecond());
  }

  public getFirstMillisecond(): number {
    return 0;
  }

  /**
   * Returns the last millisecond of the time period.  This will be
   * determined relative to the time zone specified in the constructor, or
   * in the calendar instance passed in the most recent call to the
   * {@link #peg(Calendar)} method.
   *
   * @return The last millisecond of the time period.
   *
   * @see #getFirstMillisecond()
   */
  getLastMillisecond(): number {
    return 0;
  }

  /**
   * Returns the millisecond closest to the middle of the time period.
   *
   * @return The middle millisecond.
   */
  getMiddleMillisecond(): number {
    const m1: number = this.getFirstMillisecond();
    const m2: number = this.getLastMillisecond();
    return m1 + (m2 - m1) / 2;
  }

  toString(): string {
    return this.getStart().toString();
  }
}
export class MonthConstants {
  public static JANUARY = 0;
  public static FEBRUARY = 1;
  public static MARCH = 2;
  public static APRIL = 3;
  public static MAY = 4;
  public static JUNE = 5;
  public static JULY = 6;
  public static AUGUST = 7;
  public static SEPTEMBER = 8;
  public static OCTOBER = 9;
  public static NOVEMBER = 10;
  public static DECEMBER = 11;
  public static toMonthName(i: number) {
    switch (i) {
      case this.JANUARY:
        return "January";
      case this.FEBRUARY:
        return "February";
      case this.MARCH:
        return "March";
      case this.APRIL:
        return "April";
      case this.MAY:
        return "May";
      case this.JUNE:
        return "June";
      case this.JULY:
        return "July";
      case this.AUGUST:
        return "August";
      case this.SEPTEMBER:
        return "September";
      case this.OCTOBER:
        return "October";
      case this.NOVEMBER:
        return "November";
      case this.DECEMBER:
        return "December";
      default:
        return "Not A Month";
    }
  }
}
/**
 * Represents a year in the range -9999 to 9999.  This class is immutable,
 * which is a requirement for all {@link RegularTimePeriod} subclasses.
 */
export class Year extends AbstractRegularTimePeriod {
  /**
   * The minimum year value.
   *
   * @since 1.0.11
   */
  public static MINIMUM_YEAR = -9999;

  /**
   * The maximum year value.
   *
   * @since 1.0.11
   */
  public static MAXIMUM_YEAR = 9999;

  /** The year. */
  private year: number;

  /** The first millisecond. */
  private firstMillisecond: number;

  /** The last millisecond. */
  private lastMillisecond: number;

  /**
   * Creates a time period representing a single year.
   *
   * @param year  the year.
   */
  public constructor(year: number) {
    super();
    if (year < Year.MINIMUM_YEAR || year > Year.MAXIMUM_YEAR) {
      throw new Error(
        "Year constructor: year (" + year + ") outside valid range."
      );
    }
    this.year = year;
    const start: Date = new Date();
    start.setFullYear(year, MonthConstants.JANUARY, 1);
    this.firstMillisecond = start.getTime();
    const end: Date = new Date();
    end.setFullYear(year, MonthConstants.DECEMBER, 31);
    this.lastMillisecond = end.getTime();
  }

  /**
   * Returns the year.
   *
   * @return The year.
   */
  getYear(): number {
    return this.year;
  }

  /**
   * Returns the first millisecond of the year.  This will be determined
   * relative to the time zone specified in the constructor, or in the
   * calendar instance passed in the most recent call to the
   * {@link #peg(Calendar)} method.
   *
   * @return The first millisecond of the year.
   *
   * @see #getLastMillisecond()
   */
  getFirstMillisecond(): number {
    return this.firstMillisecond;
  }

  /**
   * Returns the last millisecond of the year.  This will be
   * determined relative to the time zone specified in the constructor, or
   * in the calendar instance passed in the most recent call to the
   * {@link #peg(Calendar)} method.
   *
   * @return The last millisecond of the year.
   *
   * @see #getFirstMillisecond()
   */
  getLastMillisecond(): number {
    return this.lastMillisecond;
  }

  /**
   * Returns the year preceding this one.
   *
   * @return The year preceding this one (or <code>null</code> if the
   *         current year is -9999).
   */
  public previous(): RegularTimePeriod | undefined {
    if (this.year > Year.MINIMUM_YEAR) {
      return new Year(this.year - 1);
    } else {
      return undefined;
    }
  }

  /**
   * Returns the year following this one.
   *
   * @return The year following this one (or <code>null</code> if the current
   *         year is 9999).
   */
  next(): RegularTimePeriod | undefined {
    if (this.year < Year.MAXIMUM_YEAR) {
      return new Year(this.year + 1);
    } else {
      return undefined;
    }
  }

  /**
   * Returns a serial index number for the year.
   * <P>
   * The implementation simply returns the year number (e.g. 2002).
   *
   * @return The serial index number.
   */
  getSerialIndex(): number {
    return this.year;
  }

  /**
   * Tests the equality of this <code>Year</code> object to an arbitrary
   * object.  Returns <code>true</code> if the target is a <code>Year</code>
   * instance representing the same year as this object.  In all other cases,
   * returns <code>false</code>.
   *
   * @param obj  the object (<code>null</code> permitted).
   *
   * @return <code>true</code> if the year of this and the object are the
   *         same.
   */
  equalsYear(obj: Year): boolean {
    if (obj === this) {
      return true;
    }
    if (!(obj instanceof Year)) {
      return false;
    }
    const that: Year = obj as Year;
    return this.year === that.year;
  }

  /**
   * Returns a hash code for this object instance.  The approach described by
   * Joshua Bloch in "Effective Java" has been used here:
   * <p>
   * <code>http://developer.java.sun.com/developer/Books/effectivejava
   *     /Chapter3.pdf</code>
   *
   * @return A hash code.
   */
  hashCode(): number {
    let result = 17;
    const c: number = this.year;
    result = 37 * result + c;
    return result;
  }

  /**
   * Returns an integer indicating the order of this <code>Year</code> object
   * relative to the specified object:
   *
   * negative === before, zero === same, positive === after.
   *
   * @param o1  the object to compare.
   *
   * @return negative === before, zero === same, positive === after.
   */
  compareTo(o1: AbstractRegularTimePeriod): number {
    let result: number;

    // CASE 1 : Comparing to another Year object
    // -----------------------------------------
    if (o1 instanceof Year) {
      const y: Year = o1 as Year;
      result = this.year - y.getYear();
    } else if (o1 instanceof AbstractRegularTimePeriod) {
      // more difficult case - evaluate later...
      result = 0;
    } else {
      // consider time periods to be ordered after general objects
      result = 1;
    }

    return result;
  }

  /**
   * Returns a string representing the year..
   *
   * @return A string representing the year.
   */
  toString(): string {
    return this.year.toString();
  }

  /**
   * Parses the string argument as a year.
   * <P>
   * The string format is YYYY.
   *
   * @param s  a string representing the year.
   *
   * @return <code>null</code> if the string is not parseable, the year
   *         otherwise.
   */
  public static parseYear(s: string): Year {
    // parse the string...
    let y: number;
    try {
      y = parseInt(s.trim());
    } catch (e) {
      throw Error("Cannot parse string as Year." + s);
    }

    // create the year...
    try {
      return new Year(y);
    } catch (e) {
      throw new Error("Year outside valid range.");
    }
  }
}
export class Month extends AbstractRegularTimePeriod {
  /** The month (1-12). */
  private month: number;

  /** The year in which the month falls. */
  private year: number;

  /** The first millisecond. */
  private firstMillisecond: number = 0;

  /** The last millisecond. */
  private lastMillisecond: number = 0;

  /**
   * Constructs a new month instance.
   *
   * @param month  the month (in the range 1 to 12).
   * @param year  the year.
   */
  public constructor(month: number, year: number) {
    super();
    if (month < 1 || month > 12) {
      throw new Error("Month outside valid range.");
    }
    this.month = month;
    this.year = year;
    let d = new Date();
    d.setFullYear(this.year);
    d.setMonth(month);
    d.setDate(1);
    this.firstMillisecond=d.getTime();
    d = new Date();
    d.setFullYear(this.year);
    d.setMonth(month);
    d.setHours(23);
    d.setMinutes(59);
    d.setSeconds(59);
    if (month == MonthConstants.SEPTEMBER || month == MonthConstants.APRIL || month == MonthConstants.JUNE || month == MonthConstants.NOVEMBER) {
      d.setDate(30);
    }
    if (month == MonthConstants.FEBRUARY) {
      // Ignore
      if(year%4==0){d.setDate(29);}
      else{d.setDate(28);}
    }
    if (month == MonthConstants.JANUARY || month == MonthConstants.MARCH || month == MonthConstants.MAY || month == MonthConstants.JULY || month == MonthConstants.AUGUST || month == MonthConstants.SEPTEMBER || month == MonthConstants.OCTOBER || month == MonthConstants.DECEMBER) {
      d.setDate(31);
    }
    this.lastMillisecond=d.getTime();
  }

  /**
   * Returns the year in which the month falls.
   *
   * @return The year in which the month falls (as a Year object).
   */
  public getYear(): RegularTimePeriod {
    return new Year(this.year);
  }

  /**
   * Returns the year in which the month falls.
   *
   * @return The year in which the month falls (as an int).
   */
  public getYearValue(): number {
    return this.year;
  }

  /**
   * Returns the month.  Note that 1=JAN, 2=FEB, ...
   *
   * @return The month.
   */
  public getMonth(): number {
    return this.month;
  }

  /**
   * Returns the first millisecond of the month.  This will be determined
   * relative to the time zone specified in the constructor, or in the
   * calendar instance passed in the most recent call to the
   * {@link #peg(Calendar)} method.
   *
   * @return The first millisecond of the month.
   *
   * @see #getLastMillisecond()
   */
  public getFirstMillisecond(): number {
    return this.firstMillisecond;
  }

  /**
   * Returns the last millisecond of the month.  This will be
   * determined relative to the time zone specified in the constructor, or
   * in the calendar instance passed in the most recent call to the
   * {@link #peg(Calendar)} method.
   *
   * @return The last millisecond of the month.
   *
   * @see #getFirstMillisecond()
   */
  public getLastMillisecond(): number {
    return this.lastMillisecond;
  }

  /**
   * Returns the month preceding this one.  Note that the returned
   * {@link Month} is "pegged" using the default time-zone, irrespective of
   * the time-zone used to peg of the current month (which is not recorded
   * anywhere).  See the {@link #peg(Calendar)} method.
   *
   * @return The month preceding this one.
   */
  public previous(): RegularTimePeriod | undefined {
    let result: Month | undefined;
    if (this.month !== MonthConstants.JANUARY) {
      result = new Month(this.month - 1, this.year);
    } else {
      if (this.year > 1900) {
        result = new Month(MonthConstants.DECEMBER, this.year - 1);
      } else {
        result = undefined;
      }
    }
    return result;
  }

  /**
   * Returns the month following this one.  Note that the returned
   * {@link Month} is "pegged" using the default time-zone, irrespective of
   * the time-zone used to peg of the current month (which is not recorded
   * anywhere).  See the {@link #peg(Calendar)} method.
   *
   * @return The month following this one.
   */
  public next(): RegularTimePeriod | undefined {
    let result: Month | undefined;
    if (this.month !== MonthConstants.DECEMBER) {
      result = new Month(this.month + 1, this.year);
    } else {
      if (this.year < 9999) {
        result = new Month(MonthConstants.JANUARY, this.year + 1);
      } else {
        result = undefined;
      }
    }
    return result;
  }

  /**
   * Returns a serial index number for the month.
   *
   * @return The serial index number.
   */
  public getSerialIndex(): number {
    return this.year * 12 + this.month;
  }

  /**
   * Returns a string representing the month (e.g. "January 2002").
   * <P>
   * To do: look at internationalisation.
   *
   * @return A string representing the month.
   */
  public toString(): string {
    return MonthConstants.toMonthName(this.month) + " " + this.year;
  }

  /**
   * Tests the equality of this Month object to an arbitrary object.
   * Returns true if the target is a Month instance representing the same
   * month as this object.  In all other cases, returns false.
   *
   * @param obj  the object (<code>null</code> permitted).
   *
   * @return <code>true</code> if month and year of this and object are the
   *         same.
   */
  public equals(obj: Month): boolean {
    if (obj === this) {
      return true;
    }
    if (!(obj instanceof Month)) {
      return false;
    }
    const that: Month = obj as Month;
    if (this.month !== that.month) {
      return false;
    }
    if (this.year !== that.year) {
      return false;
    }
    return true;
  }

  /**
   * Returns a hash code for this object instance.  The approach described by
   * Joshua Bloch in "Effective Java" has been used here:
   * <p>
   * <code>http://developer.java.sun.com/developer/Books/effectivejava
   * /Chapter3.pdf</code>
   *
   * @return A hash code.
   */
  public hashCode(): number {
    let result = 17;
    result = 37 * result + this.month;
    result = 37 * result + this.year;
    return result;
  }

  /**
   * Returns an integer indicating the order of this Month object relative to
   * the specified
   * object: negative === before, zero === same, positive === after.
   *
   * @param o1  the object to compare.
   *
   * @return negative === before, zero === same, positive === after.
   */
  public compareTo(o1: AbstractRegularTimePeriod): number {
    let result: number;
    // CASE 1 : Comparing to another Month object
    // --------------------------------------------
    if (o1 instanceof Month) {
      const m: Month = o1 as Month;
      result = this.year - m.getYearValue();
      if (result === 0) {
        result = this.month - m.getMonth();
      }
    } else if (o1 instanceof AbstractRegularTimePeriod) {
      result = 0;
    } else {
      // consider time periods to be ordered after general objects
      result = 1;
    }
    return result;
  }

  /**
   * Parses the string argument as a month.  This method is required to
   * accept the format "YYYY-MM".  It will also accept "MM-YYYY". Anything
   * else, at the moment, is a bonus.
   *
   * @param s  the string to parse (<code>null</code> permitted).
   *
   * @return <code>null</code> if the string is not parseable, the month
   *         otherwise.
   */
  public static parseMonth(s: string): Month | undefined {
    let result: Month | undefined = undefined;
    if (s === null) {
      return result;
    }
    // trim whitespace from either end of the string
    s = s.trim();
    const i: number = Month.findSeparator(s);
    let s1: string;
    let s2: string;
    let yearIsFirst: boolean;
    // if there is no separator, we assume the first four characters
    // are YYYY
    if (i === -1) {
      yearIsFirst = true;
      s1 = s.substring(0, 5);
      s2 = s.substring(5);
    } else {
      s1 = s.substring(0, i).trim();
      s2 = s.substring(i + 1, s.length).trim();
      // now it is trickier to determine if the month or year is first
      const y1: Year | undefined = Month.evaluateAsYear(s1);
      if (y1 === undefined) {
        yearIsFirst = false;
      } else {
        const y2: Year | undefined = Month.evaluateAsYear(s2);
        if (y2 === undefined) {
          yearIsFirst = true;
        } else {
          yearIsFirst = s1.length > s2.length;
        }
      }
    }
    let year: Year | undefined = undefined;
    let month: number | undefined = undefined;
    if (yearIsFirst) {
      year = Month.evaluateAsYear(s1);
      month = stringToMonthCode(s2);
    } else {
      year = Month.evaluateAsYear(s2);
      month = stringToMonthCode(s1);
    }
    if (month === -1) {
      throw Error("Can't evaluate the month.");
    }
    if (year === null) {
      throw new Error("Can't evaluate the year.");
    }
    result = new Month(month, year!.getYear());
    return result;
  }

  /**
   * Finds the first occurrence of '-', or if that character is not found,
   * the first occurrence of ',', or the first occurrence of ' ' or '.'
   *
   * @param s  the string to parse.
   *
   * @return The position of the separator character, or <code>-1</code> if
   *     none of the characters were found.
   */
  private static findSeparator(s: string): number {
    let result: number = s.indexOf("-");
    if (result === -1) {
      result = s.indexOf(",");
    }
    if (result === -1) {
      result = s.indexOf(" ");
    }
    if (result === -1) {
      result = s.indexOf(".");
    }
    return result;
  }

  /**
   * Creates a year from a string, or returns <code>null</code> (format
   * exceptions suppressed).
   *
   * @param s  the string to parse.
   *
   * @return <code>null</code> if the string is not parseable, the year
   *         otherwise.
   */
  private static evaluateAsYear(s: string): Year | undefined {
    let result: Year | undefined = undefined;
    try {
      result = Year.parseYear(s);
    } catch (e) {
      // suppress
    }
    return result;
  }
}
class Quarter implements RegularTimePeriod {

  /** Constant for quarter 1. */
  public static FIRST_QUARTER: number = 1;

  /** Constant for quarter 4. */
  public static LAST_QUARTER: number = 4;

  /** The first month in each quarter. */
  public static FIRST_MONTH_IN_QUARTER: Array<number> = [0,
    MonthConstants.JANUARY,
    MonthConstants.APRIL,
    MonthConstants.JULY,
    MonthConstants.OCTOBER];

  /** The last month in each quarter. */
  public static LAST_MONTH_IN_QUARTER: Array<number> = [0,
    MonthConstants.MARCH,
    MonthConstants.JUNE,
    MonthConstants.SEPTEMBER,
    MonthConstants.DECEMBER];

  /** The year in which the quarter falls. */
  private year: Year;

  /** The quarter (1-4). */
  private quarter: number;

  /**
   * Constructs a new quarter.
   *
   * @param year  the year (1900 to 9999).
   * @param quarter  the quarter (1 to 4).
   */
  constructor(quarter: number, year: number) {
    this.quarter = quarter;
    this.year = new Year(year);
  }

  /**
   * Returns the quarter.
   *
   * @return The quarter.
   */
  public getQuarter(): number {
    return this.quarter;
  }

  /**
   * Returns the year.
   *
   * @return The year.
   */
  public getYear(): Year {
    return this.year;
  }

  /**
   * Returns the quarter preceding this one.
   *
   * @return The quarter preceding this one (or null if this is Q1 1900).
   */
  public previous(): RegularTimePeriod | undefined {
    let result: Quarter | undefined;
    if (this.quarter > Quarter.FIRST_QUARTER) {
      result = new Quarter(this.quarter - 1, this.year.getYear());
    }
    else {
      var prevYear: Year | undefined = this.year.previous() as Year;
      if (prevYear != null) {
        result = new Quarter(Quarter.LAST_QUARTER, prevYear.getYear());
      }
      else {
        result = undefined;
      }
    }
    return result;

  }

  /**
   * Returns the quarter following this one.
   *
   * @return The quarter following this one (or null if this is Q4 9999).
   */
  public next(): RegularTimePeriod | undefined {
    let result: Quarter | undefined;
    if (this.quarter < Quarter.LAST_QUARTER) {
      result = new Quarter(this.quarter + 1, this.year.getYear());
    }
    else {
      let nextYear: Year = this.year.next() as Year;
      if (nextYear != null) {
        result = new Quarter(Quarter.FIRST_QUARTER, nextYear.getYear());
      }
      else {
        result = undefined;
      }
    }
    return result;

  }

  /**
   * Returns a serial index number for the quarter.
   *
   * @return The serial index number.
   */
  public getSerialIndex(): number {
    return this.year.getYear() * 4 + this.quarter;
  }

  /**
   * Tests the equality of this Quarter object to an arbitrary object.
   * Returns true if the target is a Quarter instance representing the same
   * quarter as this object.  In all other cases, returns false.
   *
   * @param obj  the object.
   *
   * @return <code>true</code> if quarter and year of this and the object are the same.
   */
  public equals(obj: object): boolean {

    if (obj != null) {
      if (typeof obj === typeof Quarter) {
        let target: Quarter = obj as Quarter;
        return ((this.quarter == target.getQuarter()) && (this.year.getYear() == target.getYear().getYear()));
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }

  }

  /**
   * Returns an integer indicating the order of this Quarter object relative
   * to the specified object:
   *
   * negative == before, zero == same, positive == after.
   *
   * @param o1  the object to compare
   *
   * @return negative == before, zero == same, positive == after.
   */
  public compareTo(o1: object): number {

    let result: number = 1;

    // CASE 1 : Comparing to another Quarter object
    // --------------------------------------------
    if (typeof o1 === typeof this) {
      let q: Quarter = o1 as Quarter;
      result = this.year.getYear() - q.getYear().getYear();
      if (result == 0) {
        result = this.quarter - q.getQuarter();
      }
    }
    return result;

  }

  /**
   * Returns a string representing the quarter (e.g. "Q1/2002").
   *
   * @return A string representing the quarter.
   */
  public toString(): string {
    return this.year.getYear() + "Q" + this.quarter;
  }

  /**
   * Returns the first millisecond in the Quarter, evaluated using the
   * supplied calendar (which determines the time zone).
   *
   * @param calendar  the calendar.
   *
   * @return the first millisecond in the Quarter.
   */
  public getFirstMillisecond(): number {
    let month = Quarter.FIRST_MONTH_IN_QUARTER[this.quarter];
    let d = new Date();
    d.setFullYear(this.year.getYear());
    d.setMonth(month);
    d.setDate(1);
    return d.getTime();
  }

  /**
   * Returns the last millisecond of the Quarter, evaluated using the
   * supplied calendar (which determines the time zone).
   *
   * @param calendar  the calendar.
   *
   * @return the last millisecond of the Quarter.
   */
  public getLastMillisecond(): number {
    let month = Quarter.LAST_MONTH_IN_QUARTER[this.quarter];
    let d = new Date();
    d.setFullYear(this.year.getYear());
    d.setMonth(month);
    if (month == MonthConstants.SEPTEMBER || month == MonthConstants.APRIL || month == MonthConstants.JUNE || month == MonthConstants.NOVEMBER) {
      d.setDate(30);
    }
    if (month == MonthConstants.FEBRUARY) {
      // Ignore
    }
    if (month == MonthConstants.JANUARY || month == MonthConstants.MARCH || month == MonthConstants.MAY || month == MonthConstants.JULY || month == MonthConstants.AUGUST || month == MonthConstants.SEPTEMBER || month == MonthConstants.OCTOBER || month == MonthConstants.DECEMBER) {
      d.setDate(31);
    }
    return d.getTime();
  }
  public getStart(): Date {
    return new Date(this.getFirstMillisecond());
  }

  /**
   * Returns the date/time that marks the end of the time period.  This
   * method returns a new <code>Date</code> instance every time it is called.
   *
   * @return The end date/time.
   *
   * @see #getLastMillisecond()
   */
  public getEnd(): Date {
    return new Date(this.getLastMillisecond());
  }

  /**
   * Parses the string argument as a quarter.
   * <P>
   * This method should accept the following formats: "YYYY-QN" and "QN-YYYY",
   * where the "-" can be a space, a forward-slash (/), comma or a dash (-).
   * @param s A string representing the quarter.
   *
   * @throws TimePeriodFormatException if there is a problem parsing the string.
   *
   * @return the quarter.
   */
  public static parseQuarter(s: string): Quarter {

    // find the Q and the integer following it (remove both from the
    // string)...
    let q = false;
    let i = s.indexOf("Q");
    if(i!==-1){q=true;}
    if (i === -1) {
      i = s.indexOf("-");
      if( i === -1 ) {
        i = s.indexOf(" ");
        if( i === -1 ) {
          i = s.indexOf("/");
        }
      }
    }
    if(i===-1) {
      throw new Error(
        "Quarter.parseQuarter(string): Can't find delimiter.");
    }

    if (i == (s.length - 1)) {
      throw new Error(
        "Quarter.parseQuarter(string): Q found at end of string.");
    }

    let qstr: string = s.substring(i + 1, s.length);
    console.log(qstr);
    let quarter: number = parseInt(qstr);
    let remaining = s.substring(0, i);

    // replace any / , or - with a space
    remaining = remaining.replace('/', ' ');
    remaining = remaining.replace(',', ' ');
    remaining = remaining.replace('-', ' ');

    // parse the string...
    let year: Year = Year.parseYear(remaining.trim());
    if(!q){
      switch(quarter){
        case 1:quarter=1;break;
        case 4:quarter=2;break;
        case 7:quarter=3;break;
        case 10:quarter=4;break;
      }
    }
    let result: Quarter = new Quarter(quarter, year.getYear());
    return result;

  }

}
export class TimeUtil {
  /* notes from Edgardo Greising from ILO.org
      The concept of Time Format is sometimes tied to the frequency,
      but more precisely to the reference period of the datum.
      In our case the time format can be taken from the time value
      which is stored in a proprietary extension of the ISO 8601 format
      that we call "User format". It is defined as [YYYY] for years (Ex.: 2009),
      [YYYY]Q[Q] for quarters (Ex.: 2011Q3) and [YYYY]M[MM] for months (Ex.: 2014M06).
      So the fourth character of the TIME concept value gives the reference period:
      Yearly (by absence), Quarterly or Monthly. We can also use other codes to represent
      other periods like S for Semesters or W for weeks, but we don't have this type of
      data so far. In any case, the valid codes are in the CL_FREQ codelist.
  */
  public static parseTime(freq: string, s: string | undefined): RegularTimePeriod {
    if (s == undefined) {
      throw new Error("Time Detail of undefined");
    }
    if (s === "") {
      throw new Error("Time Detail of ''");
    }
    try {
      if (freq === "A" || freq === "P1Y" || freq === "Annual") {
        return Year.parseYear(s);
      } else if (freq === "M" || freq === "P1M") {
        return Month.parseMonth(s)!;
      } else if (freq === "Q" || freq === "P3M") {
        return Quarter.parseQuarter(s);
      }
    } catch (e) {
      // console.log('Time:' + s + ' is not a format for freq:' + freq)
    }
    let rtd: RegularTimePeriod | undefined = undefined;
    if (s.indexOf("Q") === -1) {
      try {
        rtd = Year.parseYear(s);
      } catch (e) { }
      if (rtd != null) {
        //console.log("Year:"+rtd.getStart());
        return rtd;
      }
    } else {
      try {
        rtd = Quarter.parseQuarter(s);
      } catch (e) { }
      if (rtd != null) {
        //console.log("Quarter:"+rtd.getStart());
        return rtd;
      }
    }
    /*
      try {
          rtd = Day.parseDay(s);
      } catch (TimePeriodFormatException tpe) {
      }catch(StringIndexOutOfBoundsException sioob) {
      }
      if (rtd != null) {
          return rtd;
      }
      */
    try {
      rtd = Month.parseMonth(s);
    } catch (e) { }
    if (rtd != null) {
      return rtd;
    }
    /*
          try {
              rtd = Quarter.parseQuarter(s);
          } catch (TimePeriodFormatException tpe) {
          }catch(StringIndexOutOfBoundsException sioob) {
          }
          if (rtd != null) {
              return rtd;
          }
          try {
              rtd = Semester.parseSemester(s);
          } catch (TimePeriodFormatException tpe) {
          }catch(StringIndexOutOfBoundsException sioob) {
          }
          if (rtd != null) {
              return rtd;
          }
          try {
              rtd = Week.parseWeek(s);
          } catch (TimePeriodFormatException tpe) {
          }catch(StringIndexOutOfBoundsException sioob) {
          }
          if (rtd != null) {
              return rtd;
          }
          */
    throw new Error("Null Frequency Field");
  }
}
export default {
  AbstractRegularTimePeriod: AbstractRegularTimePeriod,
  Month: Month,
  MonthConstants: MonthConstants,
  TimeUtil: TimeUtil,
  Year: Year
};
