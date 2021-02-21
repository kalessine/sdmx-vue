import * as time from "../sdmx/time";
import * as structure from "../sdmx/structure";
import { Visual } from "./visual";
import { BoundToSeries } from "./bindings";

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
