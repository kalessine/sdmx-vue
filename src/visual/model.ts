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
import * as time from "../sdmx/time";
import * as structure from "../sdmx/structure";
import { Visual } from "./visual";
import { BoundToSeries } from "./bindings";
import Color from '../Color';
import { OlHTMLAttributes } from "vue";
import { isRegExp } from "underscore";

export interface Model {
  hasStatus(): boolean;
  finish(v:Visual):void;
  clear():void;
}

export class ModelHolder {
  private _model: Model|undefined;
  get model(): Model|undefined {
    return this._model;
  }

  set model(m: Model|undefined) {
    this._model = m;
  }
}
export class SparklineModel implements Model {
  private finished = false;
  private timeSeries = false;
  private timePeriod: time.RegularTimePeriod|undefined = undefined;
  private data:Array<any> = [];
  private xAxisLabel = "Time";
  private yAxisLabel = "Amount";
  private min:number|undefined = undefined;
  private max:number|undefined = undefined;
  private _earliest:number|undefined = undefined;
  private _latest:number|undefined = undefined;
  private title:string = "";

  private _chartData:any = {
    title: "",
    labels: [""],
    datasets: [
      {
        label: "",
        backgroundColor: "#f87979",
        data: []
      }
    ]
  };

  public clear() {
    this.finished = false;
    this.data = [];
    this.xAxisLabel = "Time";
    this.yAxisLabel = "Amount";
    this.timeSeries = false;
    this.timePeriod = undefined;
  }

  public addPoint(xs: any, y: number) {
    let dat:any|undefined = undefined;
    if (this.timeSeries) {
      dat = { t: xs, y: y };
    } else {
      dat = { x: xs, y: y };
    }
    if (this.min === null) {
      this.min = y;
    }
    if (this.max === null) {
      this.max = y;
    }
    if (this.min! < y) {
      this.min = y;
    }
    if (this.max! < y) {
      this.max = y;
    }
    this.data.push(dat!);
  }

  public hasStatus() {
    return false;
  }

  public setMax(n: number) {
    this.max = n;
  }

  public setMin(n: number) {
    this.min = n;
  }

  public setXLabel(s: string) {
    this.xAxisLabel = s;
  }

  public setYLabel(s: string) {
    this.yAxisLabel = s;
    this._chartData.datasets[0].label = s;
  }

  get chartData() {
    return this._chartData;
  }
  public getModelOutput(s:string) {
    if( s == "chartData" ) return this.chartData;
    if( s == "options" ) return this.options;
    return undefined;
  }
  get options() {
    if (this.timeSeries) {
      let tf = "YYYY";
      let tu = "year";
      if (typeof this.timePeriod === typeof time.Year) {
        tf = "YYYY";
        tu = "year";
      }
      if (typeof this.timePeriod === typeof time.Month) {
        tf = "YYYY MMM";
        tu = "month";
      }
      return {
        title: {
          display: true,
          position: 'top',
          text: this.title
        },
        scales: {
          xAxes: [
            {
              type: "time",
              ticks: {
                source: "auto",
                min: this.earliest,
                max: this.latest
              },
              time: {
                tooltipFormat: tf,
                minUnit: tu,
                unit: tu,
                displayFormats: {
                  year: tf
                }
              }
            }
          ]
        },
        bounds: "data",
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 2000
        },
        hover: {
          animationDuration: 1000
        },
        responsiveAnimationDuration: 1000
      };
    } else {
      return {
        title: {
          display: true,
          position: 'top',
          text: this.title
        },
        scales: {
          xAxes: [{}]
        },
        bounds: "data",
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 2000
        },
        hover: {
          animationDuration: 1000
        },
        responsiveAnimationDuration: 1000
      };
    }
  }

  public finish(v:Visual) {
    this.title = structure.NameableType.toString(v.dataflow!);
    this.chartData.datasets[0].data = this.data;
    this.finished = true;
  }

  public setTimeFormat(rtp: time.RegularTimePeriod) {
    this.timePeriod = rtp;
  }

  public setTimeSeries(b: boolean) {
    this.timeSeries = b;
  }

  get earliest(): number|undefined {
    return this._earliest;
  }

  set earliest(d: number|undefined) {
    this._earliest = d;
  }

  get latest(): number|undefined {
    return this._latest;
  }

  set latest(d: number|undefined) {
    this._latest = d;
  }
}

export class SeriesSparklineModel implements Model {
  private finished = false;
  private timeSeries = false;
  private timePeriod: time.RegularTimePeriod|undefined = undefined;
  private data:any = [];
  private xAxisLabel = "Time";
  private yAxisLabel = "Amount";
  private min:number|undefined = undefined;
  private max:number|undefined = undefined;
  private _earliest:number|undefined = undefined;
  private _latest:number|undefined = undefined;
  private title:string = "";
  private _chartData:any = {
    title: "",
    labels: [""],
    datasets: [
      {
        label: "",
        backgroundColor: "#f87979",
        data: []
      }
    ]
  };

  public clear() {
    this.finished = false;
    this.data = [];
    this.xAxisLabel = "Time";
    this.yAxisLabel = "Amount";
    this.timeSeries = false;
    this.timePeriod = undefined;
  }
  public addPoint(series: string, xs: any, y: number) {
    let dat;
    if (this.timeSeries) {
      dat = { t: xs, y: y };
    } else {
      dat = { x: xs, y: y };
    }
    if (this.min === null) {
      this.min = y;
    }
    if (this.max === null) {
      this.max = y;
    }
    if (this.min!< y) {
      this.min = y;
    }
    if (this.max! < y) {
      this.max = y;
    }
    if (this.data[series] === undefined) {
      this.data[series] = [];
    }
    this.data[series].push(dat);
  }

  public hasStatus() {
    return false;
  }

  public setMax(n: number) {
    this.max = n;
  }

  public setMin(n: number) {
    this.min = n;
  }

  public setXLabel(s: string) {
    this.xAxisLabel = s;
  }

  public setYLabel(s: string) {
    this.yAxisLabel = s;
  }

  get chartData() {
    return this._chartData;
  }

  get options() {
    if (this.timeSeries) {
      let tf = "YYYY MMM";
      let tu = "month";
      if (typeof this.timePeriod === typeof time.Year) {
        tf = "YYYY";
        tu = "year";
      }
      if (typeof this.timePeriod === typeof time.Month) {
        tf = "YYYY MMM";
        tu = "month";
      }
      return {
        title: {
          display: true,
          position: 'top',
          text: this.title
        },
        scales: {
          xAxes: [
            {
              type: "time",
              ticks: {
                source: "auto",
                min: this.earliest,
                max: this.latest
              },
              time: {
                tooltipFormat: tf,
                minUnit: tu,
                unit: tu,
                displayFormats: {
                  year: tf
                }
              }
            }
          ]
        },
        bounds: "data",
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 2000
        },
        hover: {
          animationDuration: 1000
        },
        responsiveAnimationDuration: 1000
      };
    } else {
      return {
        title: {
          display: true,
          position: 'top',
          text: this.title
        },
        scales: {
          xAxes: [{}]
        },
        bounds: "data",
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 2000
        },
        hover: {
          animationDuration: 1000
        },
        responsiveAnimationDuration: 1000
      };
    }
  }

  public finish(v: Visual) {
    const datasets = [];
    for (let i = 0; i < Object.keys(this.data).length; i++) {
      const series = Object.keys(this.data)[i];
      datasets[i] = {
        label: series,
        data: this.data[series],
        backgroundColor: (v.findBindingByType(
          "Series",
          0
        ) as BoundToSeries).colours.getValue(series),
        borderColor: (v.findBindingByType(
          "Series",
          0
        ) as BoundToSeries).colours.getValue(series),
        fill: false
      };
    }
    this.chartData.datasets = datasets;
    this.title = structure.NameableType.toString(v.dataflow!);
    this.finished = true;
  }

  public setTimeFormat(rtp: time.RegularTimePeriod) {
    this.timePeriod = rtp;
  }

  public setTimeSeries(b: boolean) {
    this.timeSeries = b;
  }

  get earliest(): number|undefined {
    return this._earliest;
  }

  set earliest(d: number|undefined) {
    this._earliest = d;
  }

  get latest(): number|undefined {
    return this._latest;
  }

  set latest(d: number|undefined) {
    this._latest = d;
  }
  
}
export class MapModel implements Model {
  private _matchField:string = "ID";
  private _centerLat: number = 133.0361;
  private _centerLon: number = -24.28;
  private _featureIDs:Array<string> = [];
  private _featureNames:Array<string> = [];
  private _featureDescs:Array<string> = [];
  private _values:Array<number> = [];
  private _minColour:Color = new Color("#000");
  private _maxColour:Color = new Color("#fff");
  private _min:number|undefined = undefined;
  private _max:number|undefined = undefined;
  private _zeroOrigin:boolean = true;
  private _density:boolean = true;
  private _ignoreTotal: boolean = false;
  private _selected: string|undefined = undefined;

  public constructor() {
    this.clear();
  }
  get featureIds():Array<string> {
    return this._featureIDs;
  }
  get featureNames():Array<string> {
    return this._featureNames;
  }
  get featureDescs():Array<string>{
    return this._featureDescs;
  }
  get values():Array<number>{
    return this._values;
  }
  get selected():string|undefined{
    return this._selected;
  }
  set selected(s:string|undefined){
    this._selected=s;
  }
  get centerLon():number{
    return this._centerLon;
  }
  set centerLon(s:number){
    this._centerLon=s;
  }
  get centerLat():number{
    return this._centerLat;
  }
  set centerLat(s:number){
    this._centerLat=s;
  }
  public addFeature(id:string,name:string,val:number,desc:string,ignoreTotal:boolean) {
      if (this.ignoreTotal) {
          if (name != null && !(name.toLowerCase().indexOf("total") != -1)) {
              this.featureIds.push(id);
              this.featureNames.push(name);
              this.values.push(val);
              this.featureDescs.push(desc);
              if (this.min == undefined || val < this.min) {
                  this.min=val;
              }
              if (this.max == undefined || val > this.max) {
                  this.max=val;
              }
          }
      } else {
        this.featureIds.push(id);
        this.featureNames.push(name);
        this.values.push(val);
        this.featureDescs.push(desc);
        if (this.min == undefined || val < this.min) {
            this.min=val;
        }
        if (this.max == undefined || val > this.max) {
            this.max=val;
        }
      }
  }
  public isSelected(id:string) {
    return this._selected==undefined?false:this._selected==id?true:false;
  }
  public getColourForId(id:string):Color { 
    return this.getColour(this._values[this._featureIDs.indexOf(id)]);
  }
  public getDescriptionForId(id:string):string { 
    return this._featureDescs[this._featureIDs.indexOf(id)];
  }
  public getColour(val:number):Color {
    if(this.min===undefined||this.max===undefined){
       throw new Error("Min and max undefined");
    }
    var ratio = (val-this.min)/(this.max-this.min);
    if(isNaN(ratio)){ratio=1;}
    if(ratio>1)ratio=1;
    if(ratio<0)ratio=0;
    return this.minColour.combine(this.maxColour,ratio);
  }
  /**
   * @return the matchField
   */
  get matchField():string {
      return this._matchField;
  }
  set matchField(s:string) {
    this._matchField=s;
  }

  set min(min:number|undefined) {
      this._min = min;
  }
  
  get min():number|undefined {
    return this._min;
  }

  get max():number|undefined {
      return this._max;
  }

  set ignoreTotal(ig:boolean) {
    this._ignoreTotal = ig;
  }

  get ignoreTotal():boolean {
     return this._ignoreTotal;
  }

  /**
   * @param max the max to set
   */
  set max(max:number|undefined) {
      this._max = max;
  }
  get minColour():Color {
      return this._minColour;
  }

  /**
   * @param minColour the minColour to set
   */
  set minColour(minColour:Color) {
      this._minColour = minColour;
  }

  /**
   * @return the maxColour
   */
  get maxColour():Color {
      return this._maxColour;
  }

  /**
   * @param maxColour the maxColour to set
   */
  set maxColour(maxColour:Color) {
      this._maxColour = maxColour;
  }

  /**
   * @return the zeroOrigin
   */
  get zeroOrigin() {
      return this._zeroOrigin;
  }

  set zeroOrigin(zeroOrigin:boolean) {
      this._zeroOrigin = zeroOrigin;
      if( this._zeroOrigin ) {
          this.min = 0.0;
      }
  }

  get density():boolean {
      return this._density;
  }

  set density(d:boolean) {
      this._density = d;
  }
  hasStatus(): boolean{
    return false;
  }
  finish(v:Visual):void{

  }
  clear():void{
    this._matchField = "ID";
    this._featureIDs = [];
    this._featureNames = [];
    this._featureDescs = [];
    this._values = [];
    this._minColour = new Color("#000");
    this._maxColour = new Color("#fff");
    this._min = undefined;
    this._max = undefined;
    this._zeroOrigin = true;
    this._density = true;
    this._ignoreTotal = false;
  }
}
