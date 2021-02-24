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
import * as sdmxdata from "../sdmx/data";
import * as structure from "../sdmx/structure";
import * as collections from "typescript-collections";
import * as visual from "../visual/visual";
import * as model from "../visual/model";
import * as bindings from "../visual/bindings";
import * as sdmxtime from "../sdmx/time";
export interface Adapter {
  getId(): number;
  getName(): string;
  canCreateModelFromVisual(v: visual.Visual): boolean;
  createModel(v: visual.Visual, cube: sdmxdata.Cube|undefined): model.Model;
  updateModel(
    v: visual.Visual,
    cube: sdmxdata.Cube,
    model: model.Model
  ): model.Model;
  setSingleValues(
    visual: visual.Visual,
    model: model.Model,
    key: sdmxdata.PartialKey
  ): void;
  addSingleDataPoint(
    visual: visual.Visual,
    model: model.Model,
    key: sdmxdata.PartialKey
  ): void;
  addCrossSectionalDataPoint(
    visual: visual.Visual,
    model: model.Model,
    key: sdmxdata.PartialKey,
    crossSections: collections.Dictionary<string, string>
  ): void;
}
export class CubeWalkUtils {
  visitRoot(
    cube: sdmxdata.Cube,
    visual: visual.Visual,
    adapter: Adapter,
    model: model.Model
  ) {
    const singles = new sdmxdata.PartialKey();
    const multiples = new sdmxdata.PartialKey();
    if (cube == null) {
      return;
    }
    const current: sdmxdata.RootCubeDimension = cube.getRootCubeDimension();
    // No Observations!!
    if (current.getSubDimension() == null) {
      return;
    }
    const innerbd: bindings.BoundTo = visual.findBinding(
      current.getSubDimension()!
    )!;
    for (let i = 0; i < current.listSubDimensions().length; i++) {
      const dim: sdmxdata.CubeDimension = current.listSubDimensions()[i];
      visual.addWalkedValue(innerbd.getConcept(), dim.getValue());
    }
    for (let i = 0; i < current.listSubDimensions().length; i++) {
      const dim: sdmxdata.CubeDimension = current.listSubDimensions()[i];
      if (
        visual
          .getQuery()!
          .getQueryKey(innerbd.getConcept())!
          .isWalkAll() ||
        visual
          .getQuery()!
          .getQueryKey(innerbd.getConcept())!
          .containsValue(dim.getValue())
      ) {
        CubeWalkUtils.visit(
          cube,
          visual,
          dim,
          adapter,
          model,
          singles,
          multiples
        );
      }
    }
  }

  static visit(
    cube: sdmxdata.Cube,
    visual: visual.Visual,
    current: sdmxdata.CubeDimension,
    adapter: Adapter,
    model: model.Model,
    singles: sdmxdata.PartialKey,
    multiples: sdmxdata.PartialKey
  ) {
    // console.log("visit");
    const concept: string = current.getConcept();
    const val: string = current.getValue();
    // System.out.println("Visit:"+concept+":"+val);
    const bd: bindings.BoundTo = visual.findBinding(concept)!;
    if (
      visual
        .getQuery()!
        .getQueryKey(bd.getConcept())!
        .containsValue(val) ||
      bd.isWalkAll()
    ) {
      const itm: structure.ItemType = visual
        .getQuery()!
        .getQueryKey(concept)!
        .getItemScheme()!
        .findItemString(val)!;
      if (bd.expectValues() === 1) {
        singles.setComponent(concept, itm);
      } else {
        multiples.setComponent(concept, itm);
      }
    }
    for (let i = 0; i < current.listSubDimensions().length; i++) {
      const inner: sdmxdata.CubeDimension = current.listSubDimensions()[i];
      const innerbd: bindings.BoundTo = visual.findBinding(inner.getConcept())!;
      visual.addWalkedValue(innerbd.getConcept(), inner.getValue());
    }
    for (let i = 0; i < current.listSubDimensions().length; i++) {
      const inner: sdmxdata.CubeDimension = current.listSubDimensions()[i];
      const innerbd: bindings.BoundTo = visual.findBinding(inner.getConcept())!;
      if (inner instanceof sdmxdata.TimeCubeDimension) {
        CubeWalkUtils.visitTime(
          cube,
          visual,
          inner as sdmxdata.TimeCubeDimension,
          adapter,
          model,
          singles,
          multiples
        );
      } else {
        if (
          visual
            .getQuery()!
            .getQueryKey(innerbd.getConcept())!
            .isWalkAll() ||
          visual
            .getQuery()!
            .getQueryKey(innerbd.getConcept())!
            .containsValue(inner.getValue())
        ) {
          CubeWalkUtils.visit(
            cube,
            visual,
            inner,
            adapter,
            model,
            singles,
            multiples
          );
        }
      }
    }
  }

  static visitTime(
    cube: sdmxdata.Cube,
    visual: visual.Visual,
    dim: sdmxdata.TimeCubeDimension,
    adapter: Adapter,
    model: model.Model,
    singles: sdmxdata.PartialKey,
    multiples: sdmxdata.PartialKey
  ) {
    const concept: string = dim.getConcept();
    const val: string = dim.getValue();
    const bd: bindings.BoundTo = visual.getTime()!;
    if (bd.expectValues() > 1) {
      multiples.setComponent(concept, val);
    } else {
      singles.setComponent(concept, val);
    }
    visual.addWalkedValue(concept, val);
    const obsList = dim.listObservations();
    for (let l = 0; l < obsList.length; l++) {
      const ob: sdmxdata.CubeObservation = obsList[l];
      CubeWalkUtils.visitObservation(
        cube,
        visual,
        ob,
        adapter,
        model,
        singles,
        multiples
      );
    }
  }

  static visitObservation(
    cube: sdmxdata.Cube,
    visual: visual.Visual,
    dim: sdmxdata.CubeObservation,
    adapter: Adapter,
    model: model.Model,
    singles: sdmxdata.PartialKey,
    multiples: sdmxdata.PartialKey
  ) {
    // console.log("visitObs");
    // System.out.println("Visit:" + dim.getConcept());
    if (dim.getCrossSection() != undefined) {
      const crossSection:bindings.BoundToCrossSection = visual.findBinding(dim.getConcept())!;
      // if (!visual.getQuery().getQueryKey(dim.getConcept())) {
      //  return
      // }
      const itm: object = visual
        .getQuery()!
        .getQueryKey(crossSection!.getConcept())!
        .getItemScheme()!
        .findItemString(dim.getCrossSection()!)!;
      visual.addWalkedValue(crossSection.getConcept(), dim.getCrossSection()!);
      if (crossSection.expectValues() > 1) {
        multiples.setComponent(dim.getCrossSection()!, itm);
      } else {
        singles.setComponent(dim.getCrossSection()!, itm);
      }
    }
    multiples.clearAttributes();
    const concept: string = dim.getObservationConcept();
    multiples.setComponent(concept, dim.getValue());
    for (let a = 0; a < dim.listAttributes().length; a++) {
      const att: sdmxdata.CubeAttribute = dim.listAttributes()[a];
      multiples.setAttribute(
        att.getConcept(),
        sdmxdata.ValueTypeResolver.resolveCode(
          visual
            .getQueryable()!
            .getRemoteRegistry()!
            .getLocalRegistry(),
          visual.getQuery()!.getDataStructue()!,
          att.getConcept(),
          att.getValue()
        )
      );
    }
    // console.log(cube);
    /*
        if (visual.getPercentOf() != null) {
            //console.log("Percent OF!");
            var percentOf: bindings.BoundToDiscrete = visual.getPercentOf();
            //console.log("Single Value:");
            //console.log(singles.getComponent(percentOf.getConcept()));
            //console.log("Mutliple Values");
            //console.log(multiples.getComponent(percentOf.getConcept()));
            //console.log("PercentOf");
            //console.log(percentOf.getPercentOfItemType());
            if (percentOf.getPercentOfItemType() != null && percentOf.getPercentOfItemType() != singles.getComponent(percentOf.getConcept())) {
                var k: sdmxdata.FullKey = new sdmxdata.FullKey();
                multiples.getDict().keys().forEach(function (key) {
                    k.getDict().setValue(key, multiples.getDict().getValue(key));
                });
                singles.getDict().keys().forEach(function (key) {
                    k.getDict().setValue(key, singles.getDict().getValue(key));
                });
                k.setComponent(percentOf.getConcept(), percentOf.getPercentOfItemType());
                //console.log(k);
                var obs: sdmxdata.CubeObs = cube.findCubeObs(k);
                if (obs == null) {
                    //console.log("Obs is null");
                    return;
                } else {
                    //console.log(obs);
                    // concept should be OBS_VALUE
                    var percent = parseFloat(dim.getValue()) / parseFloat(obs.getValue(concept));
                    percent *= 100;
                    // Override OBS_VALUE
                    multiples.setComponent(concept, percent.toString());
                    //console.log("Percent="+percent);
                }
            } else {
            //console.log("PercentOfPoint");
                // This Point is the PercentOf Point, do nothing
                return;
            }
        }
        */
    adapter.setSingleValues(visual, model, singles);
    adapter.addSingleDataPoint(visual, model, multiples);
  }
}

export class AdapterRegistrySingleton {
  static adapters: Array<Adapter> = [];

  static parseObjectFromJSON(b: Adapter) {
    // Do Nothing
  }

  static getList() {
    return AdapterRegistrySingleton.adapters;
  }

  static saveObjectToJSON(o: object) {
    // Do Nothing
  }

  static findAdapter(n: number):Adapter {
    for (let i = 0; i < this.adapters.length; i++) {
      if (this.adapters[i].getId() === n) return this.adapters[i];
    }
    throw new Error("Adapter not found:"+n);
  }
}

export function adapter2Object(ad: Adapter) {
  if (ad == null) return {};
  return { typeid: ad.getId(), name: ad.getName() };
}
//export function object2Adapter(o: any): Adapter {
//  if (o == null) return null;
//  switch (o.typeid) {
//  }
//}

export class SparklineAdapter implements Adapter {
  private id = 1000;
  private singleValues: sdmxdata.PartialKey|undefined = undefined;
  public getId() {
    return this.id;
  }
  public createModel(visual: visual.Visual, cube: sdmxdata.Cube): model.Model {
    return this.updateModel(visual, cube, new model.SparklineModel());
  }

  public updateModel(
    visual: visual.Visual,
    cube: sdmxdata.Cube,
    model: model.SparklineModel
  ): model.Model {
    /*
    let min: number = null
    let  max: number = null
    let  minDate: Date = null
    let  maxDate: Date = null
    */
    if (cube === null || cube === undefined) return model;
    console.log(visual);
    model.setXLabel(visual.findBindingByType("X", 0)!.getConceptName());
    model.setYLabel(visual.findBindingByType("Y", 0)!.getConceptName());
    const cu: CubeWalkUtils = new CubeWalkUtils();
    cu.visitRoot(cube, visual, this, model);
    model.finish(visual);
    return model;
  }

  public canCreateModelFromVisual(visual: visual.Visual): boolean {
    if (visual.countBindingByType("X") !== 1) {
      return false;
    }
    if (visual.countBindingByType("Y") !== 1) {
      return false;
    }
    if (visual.countExpectMultipleBindings() > 2) {
      return false;
    }
    return true;
  }

  public getName(): string {
    return "SingleSparkline";
  }

  public setSingleValues(
    visual: visual.Visual,
    model: model.Model,
    key: sdmxdata.PartialKey
  ): void {
    this.singleValues = key;
  }

  public addSingleDataPoint(
    visual: visual.Visual,
    model: model.SparklineModel,
    key: sdmxdata.PartialKey
  ): void {
    const x: string = visual.findBindingByType("X", 0)!.getConcept();
    const val: string = visual.findBindingByType("Y", 0)!.getConcept();
    const xVal: string = structure.NameableType.toIDString(key.getComponent(x));
    const v1: number = parseFloat(key.getComponent(val));
    const s: string = structure.NameableType.toIDString(key.getComponent(x));
    if (x === "TIME_PERIOD" || x === "TIME") {
      let freq: string = structure.NameableType.toIDString(
        this.singleValues!.getComponent("FREQ")
      );
      if (freq === null || freq === "") {
        freq = structure.NameableType.toIDString(
          this.singleValues!.getComponent("FREQUENCY")
        );
      }
      if (freq === null || freq === "") {
        freq = structure.NameableType.toString(
          this.singleValues!.getComponent("TIME_FORMAT")
        );
      }
      if (freq === null || freq === "") {
        freq = structure.NameableType.toIDString(key.getComponent("FREQ"));
      }
      if (freq === null || freq === "") {
        freq = structure.NameableType.toIDString(key.getComponent("FREQUENCY"));
      }
      if (freq === null || freq === "") {
        freq = structure.NameableType.toIDString(key.getComponent("TIME_FORMAT"));
      }
      const rtd: sdmxtime.RegularTimePeriod = sdmxtime.TimeUtil.parseTime(
        freq,
        s
      );
      if (rtd != null) {
        /*
        const d: Date = new Date(rtd.getFirstMillisecond())
        if (this.minDate === null || this.minDate.getTime() > d.getTime()) {
          this.minDate = d
        }
        if (this.maxDate === null || this.maxDate.getTime() < d.getTime()) {
          this.maxDate = d
        }
*/
        if (model.earliest == null) {
          model.earliest = rtd.getFirstMillisecond();
        }
        if (model.latest == null) {
          model.latest = rtd.getFirstMillisecond();
        }
        if (model.earliest > rtd.getFirstMillisecond()) {
          model.earliest = rtd.getFirstMillisecond();
        }
        if (model.latest < rtd.getFirstMillisecond()) {
          model.latest = rtd.getFirstMillisecond();
        }
        model.setTimeSeries(true);
        model.setTimeFormat(rtd);
        model.addPoint(rtd.getFirstMillisecond(), v1);
      }
    } else {
      model.addPoint(xVal, v1);
    }
  }

  public addCrossSectionalDataPoint(
    visual: visual.Visual,
    model: model.Model,
    key: sdmxdata.PartialKey,
    crossSections: collections.Dictionary<string, any>
  ): void {
    // Do Nothing
  }
}
export class SeriesSparklineAdapter implements Adapter {
  private id = 1001;
  private singleValues: sdmxdata.PartialKey|undefined = undefined;
  public getId() {
    return this.id;
  }
  public createModel(
    visual: visual.Visual,
    cube: sdmxdata.Cube
  ): model.SeriesSparklineModel {
    return this.updateModel(visual, cube, new model.SeriesSparklineModel());
  }

  public updateModel(
    visual: visual.Visual,
    cube: sdmxdata.Cube,
    model: model.SeriesSparklineModel
  ): model.SeriesSparklineModel {
    /*
    let min: number = null
    let  max: number = null
    let  minDate: Date = null
    let  maxDate: Date = null
    */
    if (cube === null || cube === undefined) return model;
    model.setXLabel(visual.findBindingByType("X", 0)!.getConceptName());
    model.setYLabel(visual.findBindingByType("Y", 0)!.getConceptName());
    const cu: CubeWalkUtils = new CubeWalkUtils();
    cu.visitRoot(cube, visual, this, model);
    model.finish(visual);
    return model;
  }

  public canCreateModelFromVisual(visual: visual.Visual): boolean {
    if (visual.countBindingByType("X") !== 1) {
      return false;
    }
    if (visual.countBindingByType("Y") !== 1) {
      return false;
    }
    if (visual.countBindingByType("Series") !== 1) {
      return false;
    }
    if (visual.countExpectMultipleBindings() > 3) {
      return false;
    }
    return true;
  }

  public getName(): string {
    return "SeriesSingleSparkline";
  }

  public setSingleValues(
    visual: visual.Visual,
    model: model.Model,
    key: sdmxdata.PartialKey
  ): void {
    this.singleValues = key;
  }

  public addSingleDataPoint(
    visual: visual.Visual,
    model: model.SeriesSparklineModel,
    key: sdmxdata.PartialKey
  ): void {
    const x: string = visual.findBindingByType("X", 0)!.getConcept();
    const val: string = visual.findBindingByType("Y", 0)!.getConcept();
    const xVal: string = structure.NameableType.toIDString(key.getComponent(x));
    const v1: number = parseFloat(key.getComponent(val));
    const seriesCol = visual.findBindingByType("Series", 0)!.getConcept();
    const s: string = structure.NameableType.toString(
      key.getComponent(seriesCol)
    );
    if (x === "TIME_PERIOD" || x === "TIME") {
      let freq: string = structure.NameableType.toIDString(
        this.singleValues!.getComponent("FREQ")
      );
      if (freq === null || freq === "") {
        freq = structure.NameableType.toIDString(
          this.singleValues!.getComponent("FREQUENCY")
        );
      }
      if (freq === null || freq === "") {
        freq = structure.NameableType.toIDString(
          this.singleValues!.getComponent("TIME_FORMAT")
        );
      }
      if (freq === null || freq === "") {
        freq = structure.NameableType.toString(key.getComponent("FREQ"));
      }
      if (freq === null || freq === "") {
        freq = structure.NameableType.toString(key.getComponent("FREQUENCY"));
      }
      if (freq === null || freq === "") {
        freq = structure.NameableType.toString(key.getComponent("TIME_FORMAT"));
      }
      const rtd: sdmxtime.RegularTimePeriod = sdmxtime.TimeUtil.parseTime(
        freq,
        xVal
      );
      if (rtd != null) {
        /*
        const d: Date = new Date(rtd.getFirstMillisecond())
        if (this.minDate === null || this.minDate.getTime() > d.getTime()) {
          this.minDate = d
        }
        if (this.maxDate === null || this.maxDate.getTime() < d.getTime()) {
          this.maxDate = d
        }
*/
        if (model.earliest == null) {
          model.earliest = rtd.getFirstMillisecond();
        }
        if (model.latest == null) {
          model.latest = rtd.getFirstMillisecond();
        }
        if (model.earliest > rtd.getFirstMillisecond()) {
          model.earliest = rtd.getFirstMillisecond();
        }
        if (model.latest < rtd.getFirstMillisecond()) {
          model.latest = rtd.getFirstMillisecond();
        }
        model.setTimeSeries(true);
        model.setTimeFormat(rtd);
        model.addPoint(s, rtd.getFirstMillisecond(), v1);
      }
    } else {
      model.addPoint(s, xVal, v1);
    }
  }

  public addCrossSectionalDataPoint(
    visual: visual.Visual,
    model: model.Model,
    key: sdmxdata.PartialKey,
    crossSections: collections.Dictionary<string, any>
  ): void {
    // Do Nothing
  }
}

AdapterRegistrySingleton.getList().push(new SparklineAdapter());
AdapterRegistrySingleton.getList().push(new SeriesSparklineAdapter());
