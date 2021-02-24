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
import * as structure from "../sdmx/structure";
import * as data from "../sdmx/data";
import * as collections from "typescript-collections";
import * as interfaces from "../sdmx/interfaces";
function getRandomColor():string {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const makeRequest = function(opts:any): Promise<string|object> {
  return new Promise<string|object>(function(resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open(opts.method, opts.url);
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject(
          new Error("Status:" + xhr.status + " StatusText:" + xhr.statusText)
        );
      }
    };
    xhr.onerror = function() {
      reject(
        new Error("Status:" + xhr.status + " StatusText:" + xhr.statusText)
      );
    };
    if (opts.headers) {
      Object.keys(opts.headers).forEach(function(key) {
        xhr.setRequestHeader(key, opts.headers[key]);
      });
    }
    let params = opts.params;
    // We'll need to stringify if we've been given an object
    // If we have a string, this is skipped.
    if (params && typeof params === "object") {
      params = Object.keys(params)
        .map(function(key) {
          return (
            encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
          );
        })
        .join("&");
    }
    xhr.send(params);
  });
};
export class BoundTo {
  static NOT_BOUND = -1;
  static BOUND_CONTINUOUS_X = 0;
  static BOUND_DISCRETE_X = 1;
  static BOUND_CONTINUOUS_Y = 2;
  static BOUND_DISCRETE_Y = 3;
  static BOUND_DISCRETE_AREA = 4;
  static BOUND_CONTINUOUS_COLOUR = 5;
  static BOUND_DISCRETE_COLOUR = 6;
  static BOUND_CONTINUOUS_SIZE = 7;
  static BOUND_DISCRETE_SIZE = 8;
  static BOUND_TOOLTIP = 9;

  static BOUND_DISCRETE_DROPDOWN = 10;
  static BOUND_DISCRETE_LIST = 11;
  static BOUND_DISCRETE_SLIDER = 12;
  static BOUND_DISCRETE_STATIC = 13;
  static BOUND_DISCRETE_SERIES = 14;

  static BOUND_CONTINUOUS_BETWEEN = 15;
  static BOUND_CONTINUOUS_GREATERTHAN = 16;
  static BOUND_CONTINUOUS_LESSTHAN = 17;

  static BOUND_TIME_X = 18;
  static BOUND_TIME_Y = 19;
  static BOUND_TIME_DROPDOWN = 20;
  static BOUND_TIME_LIST = 34;
  static BOUND_TIME_SERIES = 33;

  static BOUND_MEASURES_DROPDOWN = 21;
  static BOUND_MEASURES_LIST = 22;
  static BOUND_MEASURES_INDIVIDUAL = 23;
  static BOUND_MEASURES_SERIES = 24;
  static BOUND_MEASURES_X = 25;

  static BOUND_DISCRETE_SINGLE = 26;
  static BOUND_DISCRETE_ALL = 27;

  static BOUND_DISCRETE_SINGLE_MENU = 28;
  static BOUND_DISCRETE_MULTI_MENU = 29;
  static BOUND_DISCRETE_LEVEL_MENU = 30;

  static BOUND_DISCRETE_CROSS_MULTIPLE = 31;
  static BOUND_DISCRETE_CROSS_SINGLE = 32;

  static BOUND_DISCRETE_BUTTONMENU = 35;

  private queryable: interfaces.Queryable;
  private dataStruct: structure.DataStructure;
  private concept: string;
  private continuous = false;
  private queryAll = false;
  private walkAll = false;
  private _clientSide = false;
  private measureDescriptor = false;
  private _requery = true;
  private _defaultBindingValues:Array<string> = [];

  // static DIMENSION = [BoundTo.BOUND_DISCRETE_X, BoundTo.BOUND_DISCRETE_Y, BoundTo.BOUND_DISCRETE_DROPDOWN, BoundTo.BOUND_DISCRETE_LIST, BoundTo.BOUND_DISCRETE_SERIES];
  // static TIME = [BoundTo.BOUND_TIME_X, BoundTo.BOUND_TIME_Y, BoundTo.BOUND_TIME_DROPDOWN, BoundTo.BOUND_DISCRETE_LIST, BoundTo.BOUND_DISCRETE_SERIES];
  // static MEASURE = [BoundTo.BOUND_MEASURES_DROPDOWN, BoundTo.BOUND_MEASURES_LIST, BoundTo.BOUND_MEASURES_SERIES, BoundTo.BOUND_MEASURES_INDIVIDUAL];
  // static MEASURES = [BoundTo.BOUND_CONTINUOUS_X, BoundTo.BOUND_CONTINUOUS_Y, BoundTo.BOUND_CONTINUOUS_COLOUR, BoundTo.BOUND_CONTINUOUS_SIZE];

  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    this.queryable = queryable;
    this.dataStruct = dataStruct;
    this.concept = concept;
  }

  getQueryable() { return this.queryable; }
  getDataStructure() { return this.dataStruct; }

  static escape(s: string): string {
    if (s.indexOf("'") !== -1) {
      s = s.replace("'", "\\'");
    }
    return s;
  }

  static stripCRLFs(s: string) {
    if (s.indexOf("\r") !== -1) {
      s = s.replace("\r", "");
    }
    if (s.indexOf("\n") !== -1) {
      s = s.replace("\n", "");
    }
    return s;
  }

  /**
   * @return the concept
   */
  public getConcept(): string {
    return this.concept;
  }

  /**
   * @param concept the concept to set
   */
  public setConcept(concept: string) {
    this.concept = concept;
  }

  /**
   * @return the boundTo
   */
  get boundTo(): number {
    return BoundTo.NOT_BOUND;
  }

  get boundToString() {
    return "BoundTo";
  }

  /**
   * @return the boundTo
   */
  get defaultBindingValues(): Array<string> {
    return this._defaultBindingValues;
  }
  set defaultBindingValues(a:Array<string>) {
    this._defaultBindingValues=a;
  }

  /**
   * @return the continuous
   */
  public isContinuous(): boolean {
    return this.continuous;
  }

  /**
   * @param continuous the continuous to set
   */
  public setContinuous(continuous: boolean) {
    this.continuous = continuous;
  }

  public isDimension(): boolean {
    const dimList = this.dataStruct
      .getDataStructureComponents()!
      .getDimensionList()
      .getDimensions();
    for (let i = 0; i < dimList.length; i++) {
      if (dimList[i].getId()!.toString() === this.concept) return true;
    }
    return false;
  }

  public isDiscrete(): boolean {
    return !this.continuous;
  }

  public expectValues(): number {
    return this.queryAll ? 2 : 1;
  }

  public isMeasureDescriptor(): boolean {
    return this.measureDescriptor;
  }

  public setMeasureDescriptor(measureDescriptor: boolean) {
    this.measureDescriptor = measureDescriptor;
  }

  public isCrossSection(): boolean {
    if (
      this.dataStruct!
        .getDataStructureComponents()!
        .getDimensionList()
        .getMeasureDimension() === undefined
    )
      return false;
    if (
      this.dataStruct
        .getDataStructureComponents()!
        .getDimensionList()!
        .getMeasureDimension()!
        .getId()!
        .toString() === this.concept
    )
      return true;
    else return false;
  }

  public getConceptName(): string {
    if (this.dataStruct === undefined) return "";
    const comp:
      | structure.Component
      | null
      | undefined = this.dataStruct.findComponentString(this.concept);
    if (comp === undefined) {
      const ischeme:
        | structure.ItemSchemeType
        | undefined = this.queryable
        .getRemoteRegistry()!
        .getLocalRegistry()
        .findConceptScheme(
          this.dataStruct
            .getDataStructureComponents()!
            .getDimensionList()!
            .getMeasureDimension()!
            .getLocalRepresentation()!
            .getEnumeration()!
        );
      return structure.NameableType.toString(
        ischeme!.findItemString(this.concept)!
      );
    } else {
      const concept = this.queryable
        .getRemoteRegistry()!
        .getLocalRegistry()
        .findConcept(comp.getConceptIdentity()!);
      return structure.NameableType.toString(concept!);
    }
  }

  public getCodelist(): structure.ItemSchemeType {
    const is: structure.ItemSchemeType = data.ValueTypeResolver.getPossibleCodes(
      this.queryable.getRemoteRegistry()!.getLocalRegistry(),
      this.dataStruct,
      this.concept
    )!;
    return is;
  }

  get clientSide(): boolean {
    return this._clientSide;
  }

  /**
   * @param clientSide the clientSide to set
   */
  set clientSide(cs: boolean) {
    this._clientSide = cs;
    if (this._clientSide) {
      this.setQueryAll(true);
      this.setWalkAll(false);
      this.requery = false;
    } else {
      this.setQueryAll(false);
      this.setWalkAll(false);
      this.requery = true;
    }
  }

  get requery(): boolean {
    return this._requery;
  }

  /**
   * @param clientSide the clientSide to set
   */
  set requery(cs: boolean) {
    this._requery = cs;
  }

  public isQueryAll(): boolean {
    return this.queryAll;
  }

  public setQueryAll(b: boolean) {
    this.queryAll = b;
  }

  public isTimeDimension(): boolean {
    const comp:
      | structure.Component
      | null
      | undefined = this.dataStruct.findComponentString(this.concept);
    return comp instanceof structure.TimeDimension;
  }

  /**
   * @return the walkAll
   */
  public isWalkAll(): boolean {
    return this.walkAll;
  }

  /**
   * @param walkAll the walkAll to set
   */
  public setWalkAll(walkAll: boolean) {
    this.walkAll = walkAll;
  }

  public isType(s: string): boolean {
    // Do Nothing
    return false;
  }
}

export class BoundToDiscrete extends BoundTo {
  get boundTo(): number {
    return BoundTo.NOT_BOUND;
  }

  get boundToString() {
    return "Discrete";
  }
}
export class BoundToSingleValue extends BoundToDiscrete {
  get boundTo(): number {
    return BoundTo.BOUND_DISCRETE_SINGLE;
  }

  get boundToString() {
    return "SingleValue";
  }
}
export class BoundToCrossSection extends BoundToDiscrete {
  get boundTo(): number {
    return BoundTo.NOT_BOUND;
  }

  get boundToString() {
    return "BoundToCrossSection";
  }
}
export class BoundToAllValues extends BoundToDiscrete {
  get boundTo(): number {
    return BoundTo.BOUND_DISCRETE_ALL;
  }

  get boundToString() {
    return "All Values";
  }
}
export class BoundToTime extends BoundTo {
  private xsingleLatestTime = false;
  private xchooseTime = true;
  private xlastTime = 0;
  private _defaultStartTime = new Date();
  private _defaultEndTime = new Date();

  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.requery=true;
    super.setWalkAll(true);
    this._defaultStartTime.setTime(946684800000);
    this._defaultEndTime.setTime(1609459200000);
  }

  get boundTo(): number {
    return BoundTo.NOT_BOUND;
  }

  get singleLatestTime(): boolean {
    return this.xsingleLatestTime;
  }
  set singleLatestTime(b: boolean) {
    this.xsingleLatestTime = b;
  }
  get defaultStartTime(): Date{
    return this._defaultStartTime;
  }
  set defaultStartTime(d:Date){
    this._defaultStartTime=d;
  }
  get defaultEndTime(): Date{
    return this._defaultEndTime;
  }
  set defaultEndTime(d:Date){
    this._defaultEndTime=d;
  }
  public expectValues() {
    return 2;
  }
  get chooseTime(): boolean {
    return this.xchooseTime;
  }
  set chooseTime(b: boolean) {
    this.xchooseTime = b;
  }
  set lastTime(n: number) {
    this.xlastTime = n;
  }
  get lastTime() {
    return this.xlastTime;
  }

  public isType(s: string): boolean {
    if (s === "Time") return true;
    // Do Nothing
    return false;
  }
  public getConceptName(): string {
    return super.getConceptName();
  }
}
export class BoundToTimeX extends BoundToTime {
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setWalkAll(true);
  }

  get boundTo(): number {
    return BoundTo.BOUND_TIME_X;
  }

  get boundToString() {
    return "TimeX";
  }

  public expectValues() {
    return 2;
  }

  public isType(s: string) {
    if (s === "Time" || s === "X") {
      return true;
    }
    return false;
  }
  public getConceptName(): string {
    return super.getConceptName();
  }
}
export class BoundToTimeY extends BoundToTime {
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setWalkAll(true);
  }

  get boundTo(): number {
    return BoundTo.BOUND_TIME_Y;
  }

  get boundToString() {
    return "TimeY";
  }

  public expectValues() {
    return 2;
  }

  public isType(s: string): boolean {
    if (s === "Time" || s === "Y") {
      return true;
    }
    // Do Nothing
    return false;
  }
  public getConceptName(): string {
    return super.getConceptName();
  }
}
export class BoundToContinuous extends BoundTo {
  private xzeroOrigin = false;
  private xsharedMaximum = true;
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setContinuous(true);
  }

  get boundTo(): number {
    return BoundTo.NOT_BOUND;
  }

  get boundToString() {
    return "Continuous";
  }

  get zeroOrigin(): boolean {
    return this.xzeroOrigin;
  }
  set zeroOrigin(b: boolean) {
    this.xzeroOrigin = b;
  }
  set sharedMaximum(b: boolean) {
    this.xsharedMaximum = b;
  }
  get sharedMaximum() {
    return this.xsharedMaximum;
  }
}
export class BoundToDiscreteX extends BoundToDiscrete {
  get boundTo(): number {
    return BoundTo.BOUND_DISCRETE_X;
  }

  get boundToString() {
    return "DiscreteX";
  }
}
export class BoundToDiscreteY extends BoundToDiscrete {
  get betBoundTo(): number {
    return BoundTo.BOUND_DISCRETE_Y;
  }

  get boundToString() {
    return "DiscreteY";
  }

  public isType(s: string): boolean {
    if (s === "X") return true;
    // Do Nothing
    return false;
  }
}
export class BoundToContinuousX extends BoundToContinuous {
  get boundTo(): number {
    return BoundTo.BOUND_CONTINUOUS_X;
  }

  get boundToString() {
    return "BoundToContinuousX";
  }
}
export class BoundToContinuousY extends BoundToContinuous {
  get boundTo(): number {
    return BoundTo.BOUND_CONTINUOUS_Y;
  }

  get boundToString() {
    return "BoundToContinuousY";
  }

  public isType(s: string) {
    if (s === "Continuous" || s === "Y") {
      return true;
    }
    return false;
  }
}
export class BoundToContinuousSize extends BoundToContinuous {
  get boundTo(): number {
    return BoundTo.BOUND_CONTINUOUS_SIZE;
  }

  get boundToString() {
    return "BoundToContinuousSize";
  }

  public isType(s: string): boolean {
    if (s === "X") return true;
    // Do Nothing
    return false;
  }
}
export class BoundToContinuousColour extends BoundToContinuous {
  private minR:number = 255;
  private minG:number = 255;
  private minB:number = 255;
  private maxR:number = 0;
  private maxG:number = 0;
  private maxB:number = 0;

  private max: number |undefined = undefined;
  private min: number |undefined = undefined;

  get boundTo(): number {
    return BoundTo.BOUND_CONTINUOUS_COLOUR;
  }

  get boundToString() {
    return "BoundToContinuousColour";
  }

  public getMinRed() {
    return this.minR;
  }
  public getMinGreen() {
    return this.minG;
  }
  public getMinBlue() {
    return this.minB;
  }
  public setMinRed(i: number) {
    this.minR = i;
  }
  public setMinGreen(i: number) {
    this.minG = i;
  }
  public setMinBlue(i: number) {
    this.minB = i;
  }
  public getMaxRed() {
    return this.maxR;
  }
  public getMaxGreen() {
    return this.maxG;
  }
  public getMaxBlue() {
    return this.maxB;
  }
  public setMaxRed(i: number) {
    this.maxR = i;
  }
  public setMaxGreen(i: number) {
    this.maxG = i;
  }
  public setMaxBlue(i: number) {
    this.maxB = i;
  }
  public getMinColour(): string {
    return "rgb(" + this.minR + "," + this.minG + "," + this.minB + ")";
  }
  public getMaxColour(): string {
    return "rgb(" + this.maxR + "," + this.maxG + "," + this.maxB + ")";
  }
  public getMin() {
    return this.min;
  }
  public setMin(n: number) {
    this.min = n;
  }
  public getMax() {
    return this.max;
  }
  public setMax(n: number) {
    this.max = n;
  }
  public getColor(n: number): string {
    if (super.zeroOrigin) {
      this.min = 0;
    }
    if(this.min===undefined||this.max===undefined) {
      throw new Error("min or max is undefined");
    }
    const cval = (n - this.min) / (this.max - this.min);
    const rd = this.getMaxRed() - this.getMinRed();
    const gd = this.getMaxGreen() - this.getMinGreen();
    const bd = this.getMaxBlue() - this.getMinBlue();

    return (
      "rgba(" +
      Math.round(this.minR + cval * rd) +
      ", " +
      Math.round(this.minG + cval * gd) +
      ", " +
      Math.round(this.minB + cval * bd) +
      ", " +
      1.0 +
      ")"
    );
  }

  public isType(s: string): boolean {
    if (s === "Colour") return true;
    // Do Nothing
    return false;
  }
}

export class BoundToList extends BoundToDiscrete {
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setQueryAll(true);
    super.setWalkAll(true);
  }

  get boundTo(): number {
    return BoundTo.BOUND_DISCRETE_LIST;
  }

  get boundToString() {
    return "BoundToList";
  }

  public getColor(n: number) {
    // Do Nothing
  }

  public isType(s: string): boolean {
    if (s === "List") return true;
    // Do Nothing
    return false;
  }
}
export class BoundToTimeList extends BoundToTime {
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setQueryAll(true);
    super.setWalkAll(true);
  }

  get boundTo(): number {
    return BoundTo.BOUND_TIME_LIST;
  }

  get boundToString() {
    return "BoundToTimeList";
  }

  public isType(s: string): boolean {
    if (s === "Time" || s === "List") return true;
    // Do Nothing
    return false;
  }
}
export class BoundToTimeSeries extends BoundToTime {
  private colours = new collections.Dictionary<string, Array<number>>();
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setQueryAll(true);
    super.setWalkAll(true);
  }

  get boundTo(): number {
    return BoundTo.BOUND_TIME_SERIES;
  }

  get boundToString() {
    return "BoundToTimeSeries";
  }

  public getColours() {
    return this.colours;
  }

  public isType(s: string): boolean {
    if (s === "Time" || s === "Series") return true;
    // Do Nothing
    return false;
  }
}

export class BoundToSeries extends BoundToDiscrete {
  private _colours = new collections.Dictionary<string, string>();

  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setQueryAll(true);
    super.setWalkAll(true);
    for(var i=0;i<this.getCodelist().size();i++) {
      let item = this.getCodelist().getItem(i);
      this._colours.setValue(structure.NameableType.toString(item),getRandomColor());
    }
  }

  get boundTo(): number {
    return BoundTo.BOUND_DISCRETE_SERIES;
  }

  get boundToString() {
    return "Series";
  }

  get colours():collections.Dictionary<string,string> {
    return this._colours;
  }

  set colours(c: collections.Dictionary<string, string>) {
    this._colours = c;
  }

  public expectValues() {
    return 2;
  }

  public getColours() {
    return this.colours;
  }

  public isType(s: string): boolean {
    if (s === "Series") return true;
    // Do Nothing
    return false;
  }
}
export class BoundToSlider extends BoundToDiscrete {
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setQueryAll(true);
    super.setWalkAll(true);
  }

  get boundTo(): number {
    return BoundTo.BOUND_DISCRETE_SLIDER;
  }

  get boundToString() {
    return "Slider";
  }

  public isType(s: string): boolean {
    if (s === "Slider") return true;
    // Do Nothing
    return false;
  }
}

export class BoundToCrossMultiple extends BoundToCrossSection {
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setQueryAll(true);
    super.setWalkAll(true);
  }

  get boundTo(): number {
    return BoundTo.BOUND_DISCRETE_CROSS_MULTIPLE;
  }

  get boundToString() {
    return "Cross Sectional - Multiple";
  }

  public isType(s: string): boolean {
    if (s === "CrossSection" || s === "Multiple") return true;
    // Do Nothing
    return false;
  }
}
export class BoundToCrossSingle extends BoundToCrossSection {
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setQueryAll(false);
    super.setWalkAll(true);
  }

  get boundTo(): number {
    return BoundTo.BOUND_DISCRETE_CROSS_SINGLE;
  }

  get boundToString() {
    return "Cross Sectional - Single";
  }

  public isType(s: string): boolean {
    if (s === "CrossSection" || s === "Single") return true;
    // Do Nothing
    return false;
  }
}
export class BoundToDropdown extends BoundToDiscrete {
  public flat = true;
  public perCentId: string | null | undefined = null;
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setQueryAll(false);
    super.setWalkAll(true);
  }

  public expectValues(): number {
    return 1;
  }

  public isFlat(): boolean {
    return this.flat;
  }

  public setFlat(b: boolean) {
    this.flat = b;
  }

  public getPercentOfId() {
    return this.perCentId;
  }

  public setPercentOfId(s: string) {
    this.perCentId = s;
  }

  get boundTo(): number {
    return BoundTo.BOUND_DISCRETE_DROPDOWN;
  }

  get boundToString() {
    return "Dropdown";
  }

  public isType(s: string): boolean {
    if (s === "Dropdown") return true;
    // Do Nothing
    return false;
  }
}

export class BoundToButtonMenu extends BoundToDiscrete {
  public flat = true;
  public perCentId: string | null | undefined = null;
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setQueryAll(false);
    super.setWalkAll(false);
  }

  public expectValues(): number {
    return 1;
  }

  public isFlat(): boolean {
    return this.flat;
  }

  public setFlat(b: boolean) {
    this.flat = b;
  }

  public getPercentOfId() {
    return this.perCentId;
  }

  public setPercentOfId(s: string) {
    this.perCentId = s;
  }

  get boundTo(): number {
    return BoundTo.BOUND_DISCRETE_BUTTONMENU;
  }

  get boundToString() {
    return "Button";
  }

  public isType(s: string): boolean {
    if (s === "Button") return true;
    // Do Nothing
    return false;
  }
}
export class BoundToMultiMenu extends BoundToDiscrete {
  public level = 0;
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setQueryAll(false);
    super.setWalkAll(true);
  }

  public expectValues(): number {
    return 2;
  }

  public getLevel(): number {
    return this.level;
  }

  public setLevel(b: number) {
    this.level = b;
  }

  get boundTo(): number {
    return BoundTo.BOUND_DISCRETE_MULTI_MENU;
  }

  get boundToString() {
    return "Multi Menu";
  }
}
export class BoundToSingleMenu extends BoundToDiscrete {
  public level = 0;
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setQueryAll(false);
    super.setWalkAll(true);
  }

  public expectValues(): number {
    return 1;
  }

  public getLevel(): number {
    return this.level;
  }

  public setLevel(b: number) {
    this.level = b;
  }

  get boundTo(): number {
    return BoundTo.BOUND_DISCRETE_SINGLE_MENU;
  }

  get boundToString() {
    return "Single Menu";
  }
}
export class BoundToLevelMenu extends BoundToDiscrete {
  private level = 0;
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setQueryAll(false);
    super.setWalkAll(true);
  }

  public expectValues(): number {
    return 1;
  }

  get boundTo(): number {
    return BoundTo.BOUND_DISCRETE_LEVEL_MENU;
  }

  get boundToString() {
    return "Level Menu";
  }

  public getLevel() {
    return this.level;
  }
  public setLevel(n: number) {
    this.level = n;
  }
}
export class BoundToArea extends BoundToDiscrete {
  private flat = true;
  private level = 0;
  private density = true;
  private lat = 131.0361;
  private lon = -35.345;
  private zoom = 2;
  private ignoreTotal = true;
  private title = "ASGS2011";
  private geoJSON = "asgs2011.geojson";
  private matchField = "ID";
  private area = "AREA";
  private geoJSONObject: object | Promise<object> |undefined = undefined;

  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setQueryAll(true);
    super.setWalkAll(true);
  }

  public isDensity() {
    return this.density;
  }
  public setDensity(b: boolean) {
    this.density = b;
  }

  get boundTo() {
    return BoundTo.BOUND_DISCRETE_AREA;
  }
  get boundToString() {
    return "Area";
  }
  public isFlat(): boolean {
    return this.flat;
  }
  public setFlat(b: boolean) {
    this.flat = b;
  }
  public getLevel() {
    return this.level;
  }
  public setLevel(i: number) {
    this.level = i;
  }
  public getLatitude(): number {
    return this.lat;
  }
  public setLatitude(l: number) {
    this.lat = l;
  }
  public getLongitude(): number {
    return this.lon;
  }
  public setLongitude(l: number) {
    this.lon = l;
  }
  public getZoom(): number {
    return this.zoom;
  }
  public setZoom(i: number) {
    this.zoom = i;
  }
  public getIgnoreTotal(): boolean {
    return this.ignoreTotal;
  }
  public setIgnoreTotal(b: boolean) {
    this.ignoreTotal = b;
  }
  public getTitle(): string {
    return this.title;
  }
  public setTitle(s: string) {
    this.title = s;
  }
  public getGeoJSON(): string {
    return this.geoJSON;
  }
  public setGeoJSON(s: string): Promise<object> {
    this.geoJSON = s;
    return makeRequest({ url: this.geoJSON, method: "GET" }).then(
      (gj: any) => {
        this.geoJSONObject = JSON.parse(gj);
        return gj;
      }
    );
  }

  public getGeoJSONObject(): object|undefined {
    return this.geoJSONObject;
  }
  public getMatchField(): string {
    return this.matchField;
  }

  public setMatchField(s: string) {
    this.matchField = s;
  }

  public getAreaField(): string {
    return this.area;
  }

  public setAreaField(s: string) {
    this.area = s;
  }

  public isType(s: string): boolean {
    if (s === "Area") return true;
    // Do Nothing
    return false;
  }
}
export class BoundToTimeDropdown extends BoundToTime {
  public flat = true;
  public perCentId: string|undefined = undefined;
  constructor(
    queryable: interfaces.Queryable,
    dataStruct: structure.DataStructure,
    concept: string
  ) {
    super(queryable, dataStruct, concept);
    super.setQueryAll(true);
    super.setWalkAll(true);
  }

  public expectValues(): number {
    return 1;
  }

  public isFlat(): boolean {
    return this.flat;
  }

  public setFlat(b: boolean) {
    this.flat = b;
  }

  public getPercentOfId() {
    return this.perCentId;
  }

  public setPercentOfId(s: string) {
    this.perCentId = s;
  }

  get boundTo(): number {
    return BoundTo.BOUND_TIME_DROPDOWN;
  }

  get boundToString() {
    return "Dropdown";
  }

  public isType(s: string): boolean {
    if (s === "Dropdown" || s === "Time") return true;
    // Do Nothing
    return false;
  }
}
export class BindingEntry {
  private id = 0;
  private name = "BoundTo";
  private parseObjectToBinding: Function|undefined = undefined;
  private saveBindingToObject: Function|undefined = undefined;
  private customise: Function|undefined = undefined;
  private createNew: Function|undefined = undefined;
  constructor(
    id: number,
    name: string,
    parse: Function,
    save: Function,
    createNew: Function
  ) {
    this.id = id;
    this.name = name;
    this.parseObjectToBinding = parse;
    this.saveBindingToObject = save;
    if (this.id === 18) {
    }
    this.createNew = createNew;
  }

  public getId(): number {
    return this.id;
  }
  public getName(): string {
    return this.name;
  }
  public setParseObjectToBinding(f: Function|undefined) {
    this.parseObjectToBinding = f;
  }
  public getParseObjectToBinding(): Function|undefined {
    return this.parseObjectToBinding;
  }
  public setSaveBindingToObject(f: Function|undefined) {
    this.saveBindingToObject = f;
  }
  public getSaveBindingToObject(): Function|undefined {
    return this.saveBindingToObject;
  }
  public setCustomise(f: Function|undefined) {
    this.customise = f;
  }
  public getCustomise(): Function|undefined {
    return this.customise;
  }

  public getCreateNew() {
    return this.createNew;
  }
  public setCreateNew(c: Function|undefined) {
    this.createNew = c;
  }
}

export class BindingRegister {
  private list: Array<BindingEntry> = [];

  public register(be: BindingEntry) {
    this.list.push(be);
  }

  public getList() {
    return this.list;
  }
}
export class DimensionBindingRegister extends BindingRegister {
  static register: DimensionBindingRegister = new DimensionBindingRegister();
  static registerState(be: BindingEntry) {
    DimensionBindingRegister.register.register(be);
  }

  static getList(): Array<BindingEntry> {
    return DimensionBindingRegister.register.getList();
  }
}
export class TimeBindingRegister extends BindingRegister {
  static register: TimeBindingRegister = new TimeBindingRegister();
  static registerState(be: BindingEntry) {
    TimeBindingRegister.register.register(be);
  }

  static getList(): Array<BindingEntry> {
    return TimeBindingRegister.register.getList();
  }
}
export class CrossSectionBindingRegister extends BindingRegister {
  static register: CrossSectionBindingRegister = new CrossSectionBindingRegister();
  static registerState(be: BindingEntry) {
    CrossSectionBindingRegister.register.register(be);
  }

  static getList(): Array<BindingEntry> {
    return CrossSectionBindingRegister.register.getList();
  }
}
export class MeasureBindingRegister extends BindingRegister {
  static register: MeasureBindingRegister = new MeasureBindingRegister();
  static registerState(be: BindingEntry) {
    MeasureBindingRegister.register.register(be);
  }

  static getList(): Array<BindingEntry> {
    return MeasureBindingRegister.register.getList();
  }
}
export class BindingRegisterUtil {
  static findBindingEntry(i: number): BindingEntry | undefined {
    let list = DimensionBindingRegister.getList();
    for (let j = 0; j < list.length; j++) {
      if (list[j].getId() === i) {
        return list[j];
      }
    }
    list = TimeBindingRegister.getList();
    for (let j = 0; j < list.length; j++) {
      if (list[j].getId() === i) {
        return list[j];
      }
    }
    list = CrossSectionBindingRegister.getList();
    for (let j = 0; j < list.length; j++) {
      if (list[j].getId() === i) {
        return list[j];
      }
    }
    list = MeasureBindingRegister.getList();
    for (let j = 0; j < list.length; j++) {
      if (list[j].getId() === i) {
        return list[j];
      }
    }
    return undefined;
  }
}

export function defaultSaveBindingToObject(b: BoundTo): any {
  const o:any = {};
  o.boundTo = b.boundTo;
  o.concept = b.getConcept();
  o.defaultBindingValues = b['defaultBindingValues'];
  if (b.boundTo === BoundTo.BOUND_DISCRETE_AREA) {
    let ba:BoundToArea = b as BoundToArea;
    o.flat = ba.isFlat();
    o.level = ba.getLevel();
    o.density = ba.isDensity();
    o.lat = ba.getLatitude();
    o.lon = ba.getLongitude();
    o.zoom = ba.getZoom();
    o.ignoreTotal = ba.getIgnoreTotal();
    o.title = ba.getTitle();
    o.matchField = ba.getMatchField();
    o.area = ba.getAreaField();
  } else if (o.boundTo === BoundTo.BOUND_DISCRETE_DROPDOWN) {
    let ba:BoundToDropdown = b as BoundToDropdown;
    o.flat = ba.isFlat();
    o.clientSide = ba.clientSide;
    o.perCentOfId = ba.getPercentOfId();
  } else if (o.boundTo === BoundTo.BOUND_CONTINUOUS_X) {
    let ba:BoundToContinuousX = b as BoundToContinuousX;
  } else if (o.boundTo === BoundTo.BOUND_CONTINUOUS_Y) {
    let ba:BoundToContinuousY = b as BoundToContinuousY;
  } else if (o.boundTo === BoundTo.BOUND_CONTINUOUS_COLOUR) {
    let ba:BoundToContinuousColour = b as BoundToContinuousColour;
    o.zeroOrigin = ba.zeroOrigin;
    o.minR = ba.getMinRed();
    o.minG = ba.getMinGreen();
    o.minB = ba.getMinBlue();
    o.maxR = ba.getMaxRed();
    o.maxG = ba.getMaxGreen();
    o.maxB = ba.getMaxBlue();
  } else if (o.boundTo === BoundTo.BOUND_TIME_X) {
    let ba:BoundToTimeX = b as BoundToTimeX;
    o.lastTime = ba.lastTime;
    o.singleLatestTime = ba.singleLatestTime;
    o.chooseTime = ba.chooseTime;
    o.defaultStartTime = ba.defaultStartTime;
    o.defaultEndTime = ba.defaultEndTime;
  } else if (o.boundTo === BoundTo.BOUND_TIME_Y) {
    let ba:BoundToTimeY = b as BoundToTimeY;
    o.lastTime = ba.lastTime;
    o.singleLatestTime = ba.singleLatestTime;
    o.chooseTime = ba.chooseTime;
    o.defaultStartTime = ba.defaultStartTime;
    o.defaultEndTime = ba.defaultEndTime;
  } else if (o.boundTo === BoundTo.BOUND_TIME_DROPDOWN) {
    let ba:BoundToTimeDropdown = b as BoundToTimeDropdown;
    o.lastTime = ba.lastTime;
    o.singleLatestTime = ba.singleLatestTime;
    o.chooseTime = ba.chooseTime;
    o.defaultStartTime = ba.defaultStartTime;
    o.defaultEndTime = ba.defaultEndTime;
  } else if (o.boundTo === BoundTo.BOUND_DISCRETE_LIST) {
    let ba:BoundToList = b as BoundToList;
  } else if (o.boundTo === BoundTo.BOUND_DISCRETE_SERIES) {
    let ba:BoundToSeries = b as BoundToSeries;
  } else if (o.boundTo === BoundTo.BOUND_DISCRETE_SLIDER) {
    let ba:BoundToSlider = b as BoundToSlider;
  } else if( o.boundTo === BoundTo.BOUND_DISCRETE_SINGLE) {
    let ba:BoundToSingleValue = b as BoundToSingleValue;
  }
  return o;
}
export function defaultParseObjectToBinding(
  o: any,
  q: interfaces.Queryable,
  dataStruct: structure.DataStructure
): BoundTo|undefined {
  let b:BoundTo|undefined = undefined;
  if (o.boundTo === BoundTo.BOUND_DISCRETE_AREA) {
    const ba = new BoundToArea(q, dataStruct, o.concept);
    ba.setFlat(o.flat);
    ba.setLevel(o.level);
    ba.setDensity(o.density);
    ba.setLatitude(o.lat);
    ba.setLongitude(o.lon);
    ba.setZoom(o.zoom);
    ba.setTitle(o.ignoreTotal);
    ba.setTitle(o.title);
    ba.setMatchField(o.matchField);
    ba.setAreaField(o.area);
    b = ba;
  } else if (o.boundTo === BoundTo.BOUND_DISCRETE_DROPDOWN) {
    b = new BoundToDropdown(q, dataStruct, o.concept);
    (b as BoundToDropdown).flat=o.flat;
    (b as BoundToDropdown).clientSide=o.clientSide;
    (b as BoundToDropdown).setPercentOfId(o.perCentOfId);
    (b as BoundToDropdown).defaultBindingValues=o.defaultBindingValues;
  } else if (o.boundTo === BoundTo.BOUND_CONTINUOUS_X) {
    b = new BoundToContinuousX(q, dataStruct, o.concept);
  } else if (o.boundTo === BoundTo.BOUND_CONTINUOUS_Y) {
    b = new BoundToContinuousY(q, dataStruct, o.concept);
  } else if (o.boundTo === BoundTo.BOUND_CONTINUOUS_COLOUR) {
    b = new BoundToContinuousColour(q, dataStruct, o.concept);
    (b as BoundToContinuousColour).zeroOrigin=(o.zeroOrigin === "true");
    (b as BoundToContinuousColour).setMinRed(o.minR);
    (b as BoundToContinuousColour).setMinGreen(o.minG);
    (b as BoundToContinuousColour).setMinBlue(o.minB);
    (b as BoundToContinuousColour).setMaxRed(o.maxR);
    (b as BoundToContinuousColour).setMaxGreen(o.maxG);
    (b as BoundToContinuousColour).setMaxBlue(o.maxB);
  } else if (o.boundTo === BoundTo.BOUND_DISCRETE_SINGLE) {
    b = new BoundToSingleValue(q, dataStruct, o.concept);
    (b as BoundToSingleValue).defaultBindingValues=o.defaultBindingValues;
  } else if (o.boundTo === BoundTo.BOUND_TIME_X) {
    b = new BoundToTimeX(q, dataStruct, o.concept);
    (b as BoundToTimeX).lastTime=(o.lastTime);
    (b as BoundToTimeX).singleLatestTime=o.singleLatestTime;
    (b as BoundToTimeX).chooseTime=o.chooseTime;
    const start = new Date();
    start.setTime(o.defaultStartTime);
    const end = new Date();
    end.setTime(o.defaultEndTime);
    (b as BoundToTimeX).defaultStartTime=start;
    (b as BoundToTimeX).defaultEndTime=end;
  } else if (o.boundTo === BoundTo.BOUND_TIME_Y) {
    b = new BoundToTimeY(q, dataStruct, o.concept);
    (b as BoundToTimeY).lastTime=o.lastTime;
    (b as BoundToTimeY).singleLatestTime=o.singleLatestTime;
    (b as BoundToTimeY).chooseTime=o.chooseTime;
    const start = new Date();
    start.setTime(o.defaultStartTime);
    const end = new Date();
    end.setTime(o.defaultEndTime);
    (b as BoundToTimeY).defaultStartTime=start;
    (b as BoundToTimeY).defaultEndTime=end;
  } else if (o.boundTo === BoundTo.BOUND_TIME_DROPDOWN) {
    b = new BoundToTimeDropdown(q, dataStruct, o.concept);
    (b as BoundToTimeDropdown).lastTime=o.lastTime;
    (b as BoundToTimeDropdown).singleLatestTime=o.singleLatestTime;
    (b as BoundToTimeDropdown).chooseTime=o.chooseTime;
    (b as BoundToTimeDropdown).defaultBindingValues=o.defaultBindingValues;
    const start = new Date();
    start.setTime(o.defaultStartTime);
    const end = new Date();
    end.setTime(o.defaultEndTime);
    (b as BoundToTimeDropdown).defaultStartTime=start;
    (b as BoundToTimeDropdown).defaultEndTime=end;
  } else if (o.boundTo === BoundTo.BOUND_DISCRETE_LIST) {
    b = new BoundToList(q, dataStruct, o.concept);
  } else if (o.boundTo === BoundTo.BOUND_DISCRETE_SERIES) {
    b = new BoundToSeries(q, dataStruct, o.concept);
  } else if (o.boundTo === BoundTo.BOUND_DISCRETE_SLIDER) {
    b = new BoundToSlider(q, dataStruct, o.concept);
  }
  if(b===undefined) throw new Error("Undefined binding parse!"+o.typeid);
  return b;
}

const be1: BindingEntry = new BindingEntry(
  BoundTo.BOUND_DISCRETE_DROPDOWN,
  "Dropdown",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToDropdown
);
const be2: BindingEntry = new BindingEntry(
  BoundTo.BOUND_DISCRETE_X,
  "DiscreteX",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToDiscreteX
);
const be3: BindingEntry = new BindingEntry(
  BoundTo.BOUND_DISCRETE_LIST,
  "List",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToList
);
const be4: BindingEntry = new BindingEntry(
  BoundTo.BOUND_DISCRETE_SERIES,
  "Series",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToSeries
);
const be5: BindingEntry = new BindingEntry(
  BoundTo.BOUND_DISCRETE_SINGLE,
  "Single Value",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToSingleValue
);
const be6: BindingEntry = new BindingEntry(
  BoundTo.BOUND_DISCRETE_ALL,
  "All Values",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToAllValues
);
const be7: BindingEntry = new BindingEntry(
  BoundTo.BOUND_TIME_X,
  "Time X",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToTimeX
);
const be20: BindingEntry = new BindingEntry(
  BoundTo.BOUND_DISCRETE_AREA,
  "Area",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToArea
);

const be8: BindingEntry = new BindingEntry(
  BoundTo.BOUND_TIME_Y,
  "Time Y",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToTimeY
);
const be9: BindingEntry = new BindingEntry(
  BoundTo.BOUND_TIME_DROPDOWN,
  "Dropdown",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToTimeDropdown
);
const be10: BindingEntry = new BindingEntry(
  BoundTo.BOUND_TIME_LIST,
  "List",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToTimeList
);
const be11: BindingEntry = new BindingEntry(
  BoundTo.BOUND_TIME_SERIES,
  "Series",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToTimeSeries
);
const be12: BindingEntry = new BindingEntry(
  BoundTo.BOUND_CONTINUOUS_X,
  "X",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToContinuousX
);
const be13: BindingEntry = new BindingEntry(
  BoundTo.BOUND_CONTINUOUS_Y,
  "Y",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToContinuousY
);
const be14: BindingEntry = new BindingEntry(
  BoundTo.BOUND_CONTINUOUS_COLOUR,
  "Colour",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToContinuousColour
);
const be15: BindingEntry = new BindingEntry(
  BoundTo.BOUND_DISCRETE_SINGLE_MENU,
  "Single Menu",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToSingleMenu
);
const be16: BindingEntry = new BindingEntry(
  BoundTo.BOUND_DISCRETE_MULTI_MENU,
  "Multi Menu",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToMultiMenu
);
const be17: BindingEntry = new BindingEntry(
  BoundTo.BOUND_DISCRETE_LEVEL_MENU,
  "Level Menu",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToLevelMenu
);
const be18: BindingEntry = new BindingEntry(
  BoundTo.BOUND_DISCRETE_CROSS_MULTIPLE,
  "Cross Sectional - Multiple",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToCrossMultiple
);
const be19: BindingEntry = new BindingEntry(
  BoundTo.BOUND_DISCRETE_AREA,
  "Area",
  defaultParseObjectToBinding,
  defaultSaveBindingToObject,
  BoundToArea
);

DimensionBindingRegister.registerState(be1);
DimensionBindingRegister.registerState(be2);
DimensionBindingRegister.registerState(be3);
DimensionBindingRegister.registerState(be4);
DimensionBindingRegister.registerState(be5);
DimensionBindingRegister.registerState(be6);
DimensionBindingRegister.registerState(be15);
DimensionBindingRegister.registerState(be16);
DimensionBindingRegister.registerState(be17);
DimensionBindingRegister.registerState(be19);
DimensionBindingRegister.registerState(be20);
TimeBindingRegister.registerState(be7);
TimeBindingRegister.registerState(be8);
TimeBindingRegister.registerState(be9);
TimeBindingRegister.registerState(be10);
TimeBindingRegister.registerState(be11);

MeasureBindingRegister.registerState(be12);
MeasureBindingRegister.registerState(be13);
MeasureBindingRegister.registerState(be14);

CrossSectionBindingRegister.registerState(be1);
CrossSectionBindingRegister.registerState(be2);
CrossSectionBindingRegister.registerState(be4);
CrossSectionBindingRegister.registerState(be5);
CrossSectionBindingRegister.registerState(be18);
