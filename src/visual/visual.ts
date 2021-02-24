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
import * as bindings from "./bindings";
import * as sdmxdata from "../sdmx/data";
import * as structure from "../sdmx/structure";
import * as collections from "typescript-collections";
import * as interfaces from "../sdmx/interfaces";
import * as commonreferences from "../sdmx/commonreferences";
import * as common from "../sdmx/common";
import * as adapterModule from "./adapter";
import * as model from "./model";
import * as sdmx from "../sdmx";
import * as message from "../sdmx/message";
export class Visual {
  private _clearedTime: boolean | undefined;
  public _cube: sdmxdata.Cube | undefined;
  private _adapter: adapterModule.Adapter | undefined;
  private _model: model.Model | undefined;
  private _requery: boolean | undefined;
  private _dirty: boolean | undefined;
  private _bindings: Array<bindings.BoundToDiscrete> | undefined;
  private _values: Array<bindings.BoundToContinuous> | undefined;
  private _time: bindings.BoundToTime | undefined;
  private _crossSection: bindings.BoundToCrossSection | undefined;
  private _query: sdmxdata.Query | undefined;
  private _queryable: interfaces.Queryable | undefined;
  private _dataservice: string | undefined;
  private _dataflows: Array<structure.Dataflow> | undefined;
  private _dataflow: structure.Dataflow | undefined;
  private _dataflowAgency: string | undefined;
  private _dataflowId: string | undefined;
  private _dataflowVersion: string | undefined;
  private _dataflowName: string | undefined;
  private _dataStruct: structure.DataStructure | undefined;
  private _structureAgency: string | undefined;
  private _structureId: string | undefined;
  private _structureVersion: string | undefined;
  private _bindingsColumnMapper: sdmxdata.FlatColumnMapper | undefined;
  private _visualId: string | undefined;
  private _loc: string | undefined;
  private _waitForPromises: Array<Promise<any>> | undefined;
  private _currentBinding: bindings.BoundTo | undefined;
  private _boundTo: number | undefined;
  private _boundToString: string | undefined;
  private _dataMessage: message.DataMessage | undefined;
  private _forceUpdate: number = 0;

  constructor() {
    this._bindingsColumnMapper = new sdmxdata.FlatColumnMapper();
    this._visualId = "render";
    this._loc = "en";
    this._waitForPromises = [];
  }

  set dataservice(s: string | undefined) {
    this._dataservice = s;
  }

  get dataservice(): string | undefined {
    return this._dataservice;
  }
  set dataflows(dfs: Array<structure.Dataflow> | undefined) {
    this._dataflows = dfs;
  }
  get query(): sdmxdata.Query | undefined {
    return this._query;
  }
  set query(q: sdmxdata.Query | undefined) {
    this._query = q;
  }
  get startDate(): Date | undefined {
    return this.query?.startDate;
  }
  set startDate(d: Date | undefined) {
    this.query!.startDate = d;
  }
  get endDate(): Date | undefined {
    return this.query?.endDate;
  }
  set endDate(d: Date | undefined) {
    this.query!.endDate = d;
    this._requery = true;
  }
  get dataflows(): Array<structure.Dataflow> | undefined {
    return this._dataflows;
  }
  get dataflow(): structure.Dataflow | undefined {
    return this._dataflow;
  }
  set dataflow(dataflow: structure.Dataflow | undefined) {
    if (dataflow === undefined) {
      return;
    }
    this._dataflow = dataflow;
    this._dataflowAgency = dataflow.getAgencyId()!.toString();
    this._dataflowId = dataflow.getId()!.toString();
    this._dataflowName = structure.NameableType.toString(dataflow);
    this._structureAgency = dataflow
      .getStructure()!
      .getAgencyId()!
      .toString();
    this._structureId = dataflow
      .getStructure()!
      .getMaintainableParentId()!
      .toString();
    this._structureVersion = dataflow
      .getStructure()!
      .getMaintainedParentVersion()!
      .toString();
  }
  public loadDataStructure(dataStruct: structure.DataStructure | undefined) {
    if (dataStruct == undefined) return;
    this._dataStruct = dataStruct;
    this._query = new sdmxdata.Query(
      this.dataflow!,
      this._queryable!.getRemoteRegistry()!.getLocalRegistry()
    );
    this._bindings = [];
    this._bindingsColumnMapper = new sdmxdata.FlatColumnMapper();
    const dimSize = dataStruct!
      .getDataStructureComponents()!
      .getDimensionList()
      .getDimensions().length;
    for (let i = 0; i < dimSize; i++) {
      const dim: structure.Dimension = dataStruct!
        .getDataStructureComponents()!
        .getDimensionList()
        .getDimensions()[i];
      const b: bindings.BoundTo = new bindings.BoundToDropdown(
        this._queryable!,
        dataStruct!,
        dim.getId()!.toString()
      );
      this._bindingsColumnMapper.registerColumn(
        dim.getId()!.toString(),
        sdmxdata.AttachmentLevel.OBSERVATION
      );
      this._bindings.push(b);
      this._query!
        .getQueryKey(dim.getId()!.toString())!
        .setValue(
          structure.NameableType.toIDString(
            this._query!
              .getQueryKey(dim.getId()!.toString())!
              .getPossibleValues()[0]
          )
        );
    }
    if (
      dataStruct
        .getDataStructureComponents()!
        .getDimensionList()
        .getTimeDimension() != null
    ) {
      const b3: bindings.BoundTo = new bindings.BoundToTimeX(
        this._queryable!,
        dataStruct,
        dataStruct
          .getDataStructureComponents()!
          .getDimensionList()!
          .getTimeDimension()!
          .getId()!
          .toString()
      );
      this._time = b3 as bindings.BoundToTime;
      this._query.startDate = this._time.defaultStartTime;
      this._query.endDate = this._time.defaultEndTime;
    }
    if (
      dataStruct
        .getDataStructureComponents()!
        .getDimensionList()
        .getMeasureDimension() != null
    ) {
      const b4: bindings.BoundTo = new bindings.BoundToDropdown(
        this._queryable!,
        dataStruct,
        dataStruct
          .getDataStructureComponents()!
          .getDimensionList()!
          .getMeasureDimension()!
          .getId()!
          .toString()
      );
      this._crossSection = b4;
      this._query!
        .getQueryKey(
          dataStruct
            .getDataStructureComponents()!
            .getDimensionList()!
            .getMeasureDimension()!
            .getId()!
            .toString()
        )!
        .setValue(
          structure.NameableType.toIDString(
            this._query!
              .getQueryKey(
                dataStruct
                  .getDataStructureComponents()!
                  .getDimensionList()!
                  .getMeasureDimension()!
                  .getId()!
                  .toString()
              )!
              .getPossibleValues()[0]
          )
        );
    } else {
      this._crossSection = undefined;
    }
    const b2: bindings.BoundTo = new bindings.BoundToContinuousY(
      this._queryable!,
      dataStruct,
      dataStruct
        .getDataStructureComponents()!
        .getMeasureList()!
        .getPrimaryMeasure()!
        .getId()!
        .toString()
    );
    this._values = [];
    this._values.push(b2 as bindings.BoundToContinuous);
    this._cube = new sdmxdata.Cube(this._dataStruct, this._queryable!.getRemoteRegistry()!.getLocalRegistry());
  }

  set adapter(i: number | undefined) {
    this._adapter = adapterModule.AdapterRegistrySingleton.findAdapter(i!);
    this._model = undefined;
  }
  get adapter(): number | undefined {
    if (this._adapter == undefined) { return undefined }
    return this._adapter.getId();
  }

  public doQuery(): Promise<message.DataMessage | undefined> {
    // If Message has 0 observations, cube.getRootCubeDimension() is null
    this.beforeQuery();
    const structRef: commonreferences.Reference = commonreferences.Reference.reference(
      this._structureAgency,
      this._structureId,
      this._structureVersion,
      undefined
    );
    const dataStruct: structure.DataStructure = this._queryable!
      .getRemoteRegistry()!
      .getLocalRegistry()
      .findDataStructure(structRef)!;
    return this._queryable!
      .getRepository()!
      .query(this._query!)!
      .then((msg: message.DataMessage | undefined) => {
        this._dataMessage = msg;
        return msg;
      });
  }
  set dataMessage(msg: message.DataMessage | undefined) {
    this._dataMessage = msg;
  }

  get dataMessage(): message.DataMessage | undefined {
    return this._dataMessage;
  }
  set dimensionBindings(s: Array<bindings.BoundToDiscrete> | undefined) {
    this._bindings = s;
  }

  get dimensionBindings(): Array<bindings.BoundToDiscrete> | undefined {
    return this._bindings;
  }
  set timeBinding(s: bindings.BoundToTime | undefined) {
    this._time = s;
  }

  get timeBinding(): bindings.BoundToTime | undefined {
    return this._time;
  }
  set crossSectionBinding(s: bindings.BoundToCrossSection | undefined) {
    this._crossSection;
  }

  get crossSectionBinding(): bindings.BoundToCrossSection | undefined {
    return this._crossSection;
  }
  set measureBindings(s: Array<bindings.BoundToContinuous> | undefined) {
    this._values = s;
  }

  get measureBindings(): Array<bindings.BoundToContinuous> | undefined {
    return this._values;
  }
  set currentBinding(b: bindings.BoundTo | undefined) {
    this._currentBinding = b;
  }

  get currentBinding(): bindings.BoundTo | undefined {
    return this._currentBinding;
  }
  set currentBindingValues(s: Array<string>) {
    this.getQuery()!.getQueryKey(this.currentBinding!.getConcept())!.setValues(s);
  }

  get currentBindingValues(): Array<string> {
    if (this.getQuery() === undefined) {
      throw new Error("Query undefined");
    }
    if (this.currentBinding === undefined) {
      throw new Error("Current Binding undefined");
    }
    if (this.getQuery()!.getQueryKey(this.currentBinding!.getConcept()) === undefined) {
      throw new Error("QueryKey undefined");
    }
    return this.getQuery()!.getQueryKey(this.currentBinding!.getConcept())!.getValues();
  }
  set currentBindingValue(s: structure.ItemType | undefined) {
    if (s != undefined) {
      let qk = this.getQuery()?.getQueryKey(this.currentBinding?.getConcept());
      this.getQuery()!.getQueryKey(this.currentBinding!.getConcept())!.setValue(structure.NameableType.toIDString(s));
    }
    this.currentBinding!.defaultBindingValues = [structure.NameableType.toIDString(s!)];
  }

  get currentBindingValue(): structure.ItemType | undefined {
    if (this.getQuery() === undefined) {
      throw new Error("Query undefined");
    }
    if (this.currentBinding === undefined) {
      throw new Error("Current Binding undefined");
    }
    if (this.getQuery()!.getQueryKey(this.currentBinding!.getConcept()) === undefined) {
      throw new Error("QueryKey undefined");
    }
    let qk = this.getQuery()?.getQueryKey(this.currentBinding?.getConcept());

    for (let i = 0; i < qk!.getPossibleValues().length; i++) {
      if (structure.NameableType.toIDString(qk!.getPossibleValues()[i]!) == qk!.getValue()) {
        return qk!.getPossibleValues()[i]!;
      }
    }
    return undefined;
  }

  public createModel(): model.Model | undefined {
    this.createCube();
    let model = this._adapter!.createModel(this, this._cube);
    return this.walk();
  }
  set model(s: model.Model | undefined) {
    this._model = s;
  }

  get model(): model.Model | undefined {
    return this._model;
  }

  public walk(): model.Model | undefined {
    this.beforeWalk();
    if (this._model != undefined) {
      this._model!.clear();
    }
    if (this._adapter == undefined) {
      console.log("no adapter");
      return;
    }
    this._model = this._adapter!.createModel(this, this._cube!);
    this.afterWalk();
    this._requery = false;
    this._dirty = false;
    return this._model;
  }

  public beforeQuery() {
    if (this._bindings === undefined) {
      throw new Error("Bindings is undefined!");
    }
    if (this._query === undefined) {
      throw new Error("Query is undefined!");
    }
    for (let i = 0; i < this._bindings.length; i++) {
      if (this._bindings[i].isQueryAll()) {
        this._query!
          .getQueryKey(this._bindings[i].getConcept())!
          .setQueryAll(true);
      } else {
        this._query!
          .getQueryKey(this._bindings[i].getConcept())!
          .setQueryAll(false);
      }
      this._query!
        .getQueryKey(this._bindings[i].getConcept())!
        .setWalkedValues([]);
    }
    if (this._time != null) {
      if (this._time.isQueryAll()) {
        this._query.getQueryKey(this._time.getConcept())!.setQueryAll(true);
      } else {
        this._query.getQueryKey(this._time.getConcept())!.setQueryAll(false);
      }
      this._query.getQueryKey(this._time.getConcept())!.setWalkedValues([]);
    }
    if (this._crossSection != null) {
      if (this._crossSection.isQueryAll()) {
        this._query
          .getQueryKey(this._crossSection.getConcept())!
          .setQueryAll(true);
      } else {
        this._query
          .getQueryKey(this._crossSection.getConcept())!
          .setQueryAll(false);
      }
      this._query
        .getQueryKey(this._crossSection.getConcept())!
        .setWalkedValues([]);
    }
  }

  public beforeWalk() {
    if (this._bindings === undefined) {
      throw new Error("Bindings is undefined!");
    }
    if (this._query === undefined) {
      throw new Error("Query is undefined!");
    }

    for (let i = 0; i < this._bindings.length; i++) {
      if (this._bindings[i].isWalkAll()) {
        this._query
          .getQueryKey(this._bindings[i].getConcept())!
          .setWalkAll(true);
      } else {
        this._query
          .getQueryKey(this._bindings[i].getConcept())!
          .setWalkAll(false);
      }
      //this._query
      //  .getQueryKey(this.bindings[i].getConcept())
      //  .filterValues();
      this._query.getQueryKey(this._bindings[i].getConcept())!.setPossibleValues(
        this._query
          .getQueryKey(this._bindings[i].getConcept())!
          .getItemScheme()!
          .getItems()
      );
      this.addCurrentValue(this._bindings[i].getConcept(), this._query.getQueryKey(this._bindings[i].getConcept())!.getPossibleValues()[0].getId()!.toString());
    }
    if (this._time != null) {
      if (this._time.isWalkAll()) {
        this._query.getQueryKey(this._time.getConcept())!.setWalkAll(true);
      } else {
        this._query.getQueryKey(this._time.getConcept())!.setWalkAll(false);
      }
      this._query.getQueryKey(this._time.getConcept())!.setPossibleValues(
        this._query
          .getQueryKey(this._time.getConcept())!
          .getItemScheme()!
          .getItems()
      );
    }
    if (this._crossSection != null) {
      if (this._crossSection.isWalkAll()) {
        this._query
          .getQueryKey(this._crossSection.getConcept())!
          .setWalkAll(true);
      } else {
        this._query
          .getQueryKey(this._crossSection.getConcept())!
          .setWalkAll(false);
      }
      this._query
        .getQueryKey(this._crossSection.getConcept())!
        .setPossibleValues(
          this._query
            .getQueryKey(this._crossSection.getConcept())!
            .getItemScheme()!
            .getItems()
        );
    }
  }

  public afterWalk() {
    if (this._bindings === undefined) {
      throw new Error("Bindings is undefined!");
    }
    for (let i = 0; i < this._bindings.length; i++) { }
    if (this._time != null) {
      //this._query.getQueryKey(this.time.getConcept()).filterValues();
    }
    if (this._crossSection != null) {
      //this._query.getQueryKey(this.crossSection.getConcept()).filterValues();
    }
  }

  get clearedTime(): boolean | undefined {
    return this._clearedTime;
  }

  set clearedTime(b: boolean | undefined) {
    this._clearedTime = b;
  }

  public dimSize(): number | undefined {
    return this._bindings!.length;
  }

  public getBinding(i: number | undefined): bindings.BoundToDiscrete {
    return this._bindings![i!]!;
  }

  public getTime() {
    return this._time;
  }
  public getCrossSection() {
    return this._crossSection;
  }
  public findBinding(concept: string): bindings.BoundTo | undefined {
    for (let i = 0; i < this._bindings!.length; i++) {
      // console.log("Compare:" + this.bindings[i].getConcept());
      if (this._bindings![i].getConcept() === concept) {
        // console.log("Returning:"+concept);
        return this._bindings![i];
      }
    }
    if (this._time !== null && this._time!.getConcept() === concept) {
      return this._time!;
    }
    if (
      this._crossSection != null &&
      this._crossSection.getConcept() === concept
    ) {
      return this._crossSection;
    }
    for (let i = 0; i < this._values!.length; i++) {
      if (this._values![i].getConcept() === concept) {
        return this._values![i];
      }
    }
    // console.log("Can't Find:"+concept);
    return undefined;
  }

  public addWalkedValue(dim: string, val: string) {
    this._query!.getQueryKey(dim)!.addWalkedValue(
      this._query!
        .getQueryKey(dim)!
        .getItemScheme()!
        .findItemString(val)!
    );
    if (this._query!.getQueryKey(dim)!.getValues().length === 0) {
      this._query!.getQueryKey(dim)!.setValue(val);
    }
    if (this.findBinding(dim)?.requery) {
      this._requery = true;
    }
  }

  public getQuery(): sdmxdata.Query | undefined {
    return this._query;
  }
  public getQueryable(): interfaces.Queryable | undefined {
    return this._queryable;
  }
  public findBindingByType(s: string, idx: number): bindings.BoundTo | undefined {
    let foundIndex = idx | 0;
    for (let i = 0; i < this._bindings!.length; i++) {
      if (this._bindings![i].isType(s)) {
        if (foundIndex === 0) {
          return this._bindings![i];
        } else {
          foundIndex--;
        }
      }
    }
    if (this._crossSection != undefined) {
      if (this._crossSection.isType(s)) {
        if (foundIndex === 0) {
          return this._crossSection;
        } else {
          foundIndex--;
        }
      }
    }
    if (this._time !== undefined) {
      if (this._time!.isType(s)) {
        if (foundIndex === 0) {
          return this._time;
        } else {
          foundIndex--;
        }
      }
    }
    for (let i = 0; i < this._values!.length; i++) {
      if (this._values![i].isType(s)) {
        if (foundIndex === 0) {
          return this._values![i];
        } else {
          foundIndex--;
        }
      }
    }
    return undefined;
  }

  public countBindingByType(s: string): number {
    if (this._bindings == undefined) { return 0; }
    let found = 0;
    for (let i = 0; i < this._bindings!.length; i++) {
      if (this._bindings![i].isType(s)) {
        found++;
      }
    }
    if (this._crossSection !== undefined) {
      if (this._crossSection!.isType(s)) {
        found++;
      }
    }
    if (this._time !== undefined) {
      if (this._time!.isType(s)) {
        found++;
      }
    }
    for (let i = 0; i < this._values!.length; i++) {
      if (this._values![i].isType(s)) {
        found++;
      }
    }
    return found;
  }

  public countExpectMultipleBindings(): number {
    let found = 0;
    for (let i = 0; i < this._bindings!.length; i++) {
      if (this._bindings![i].expectValues() > 1) {
        found++;
      }
    }
    if (this._crossSection != null) {
      if (this._crossSection.expectValues() > 1) {
        found++;
      }
    }
    if (this._time != null) {
      if (this._time.expectValues() > 1) {
        found++;
      }
    }
    for (let i = 0; i < this._values!.length; i++) {
      if (this._values![i].expectValues() > 1) {
        found++;
      }
    }
    return found;
  }

  public getAdapters(): Array<adapterModule.Adapter> {
    return adapterModule.AdapterRegistrySingleton.getList().filter(ad => {
      return ad.canCreateModelFromVisual(this);
    });
  }

  public findBindingByConceptId(s: string): bindings.BoundTo | undefined {
    for (let i = 0; i < this._bindings!.length; i++) {
      if (this._bindings![i].getConcept() === s) {
        return this._bindings![i];
      }
    }
    if (this._crossSection != null) {
      if (this._crossSection.getConcept() === s) {
        return this._crossSection;
      }
    }
    if (this._time !== null) {
      if (this._time!.getConcept() === s) {
        return this._time;
      }
      for (let i = 0; i < this._values!.length; i++) {
        if (this._values![i].getConcept() === s) {
          return this._values![i];
        }
      }
      return undefined;
    }
  }

  public setDataService(s: string) {
    this.dataservice = s;
  }

  public connect() {
    this._queryable = sdmx.SdmxIO.connect(this._dataservice!);

  }
  public loadDataflows(dataflows:Array<structure.Dataflow>) {
    this._dataflows = dataflows;
    this._requery = true;
  }

  public selectBinding(concept: string | undefined) {
    //this._ = concept!;
    const dataStruct = this._dataStruct;
    if (dataStruct === undefined) {
      throw new Error("datStruct is undefined");
    }
    for (let i = 0; i < this._bindings!.length; i++) {
      if (this._bindings![i].getConcept() === concept) {
        this._boundTo = this._bindings![i].boundTo;
        this._boundToString = this._bindings![i].boundToString;
        this._currentBinding = this._bindings![i];
      }
    }
    if (this._time) {
      if (this._time.getConcept() === concept) {
        this._boundTo = this._time.boundTo;
        this._boundToString = this._time.boundToString;
        this._currentBinding = this._time;
      }
    }
    for (let i = 0; i < this._values!.length; i++) {
      if (this._values![i].getConcept() === concept) {
        this._boundTo = this._values![i].boundTo;
        this._boundToString = this._values![i].boundToString;
        this._currentBinding = this._values![i];
      }
    }
  }

  public changeBindingClass(b: bindings.BoundTo) {
    if (this._query!.getQueryKey(b.getConcept()) !== undefined) {
      this._query!.getQueryKey(b.getConcept())!.clear();
      for (let i = 0; i < this._bindings!.length; i++) {
        if (this._bindings![i].getConcept() === b.getConcept()) {
          this._bindings![i] = b;
          if (!b.isQueryAll()) {
            this._query!
              .getQueryKey(b.getConcept())!
              .addValue(
                structure.NameableType.toIDString(
                  this._query!.getQueryKey(b.getConcept())!.getPossibleValues()[0]
                )
              );
          }
        }
      }
    }
    if (this._time!.getConcept() === b.getConcept()) {
      this._time = b as bindings.BoundToTime;
    }
    for (let i = 0; i < this._values!.length; i++) {
      if (this._values![i].getConcept() === b.getConcept()) {
        this._values![i] = b as bindings.BoundToContinuous;
      }
    }
    if(!b.isContinuous()&&b.defaultBindingValues!==undefined) {
      this._query!.getQueryKey(b.getConcept())!.clear();
      for (let i = 0; i < b.defaultBindingValues.length; i++) {
        this._query!.getQueryKey(b.getConcept())!.addValue(b.defaultBindingValues[i]);
      }
    }
    this._boundTo = b.boundTo;
    this._boundToString = b.boundToString;
    this.currentBinding = b;
    this._requery = true;
  }

  public createCube() {
    if (this.dataMessage == undefined) {
      this._cube = undefined;
      this._model = undefined;
      return;
    }
    this._model = undefined;
    const structRef: commonreferences.Reference = commonreferences.Reference.reference(
      this._structureAgency,
      this._structureId,
      this._structureVersion,
      undefined
    );
    const dataStruct: structure.DataStructure = this._queryable!
      .getRemoteRegistry()!
      .getLocalRegistry()
      .findDataStructure(structRef)!;
    this._cube = new sdmxdata.Cube(dataStruct, this._query!.getRegistry()!);
    for (let i = 0; i < this._dataMessage!.getDataSet(0).size(); i++) {
      this._cube.putObservation(
        undefined,
        this._dataMessage!.getDataSet(0).getColumnMapper(),
        this._dataMessage!.getDataSet(0).getFlatObs(i)
      );
    }
    this._dirty = false;
  }

  public setCurrentValues(concept: string, items: Array<structure.ItemType>) {
    this._query!.getQueryKey(concept)!.clear();
    for (let i = 0; i < items.length; i++) {
      this._query!.getQueryKey(concept)!.addValue(items[i].getId()!.toString());
    }
    const b: bindings.BoundTo | undefined = this.findBindingByConceptId(concept);
    if (b!.requery) {
      this._requery = true;
    }
    this._dirty = true;
  }

  public setCurrentValue(concept: string, item: structure.ItemType) {
    this._query!.getQueryKey(concept)!.clear();
    this._query!.getQueryKey(concept)!.addValue(item.getId()!.toString());
    const b: bindings.BoundTo | undefined = this.findBindingByConceptId(concept);
    if (b!.requery) {
      this._requery = true;
    }
    this._dirty = true;
  }

  public setCurrentValuesString(concept: string, items: Array<string>) {
    this._query!.getQueryKey(concept)!.clear();
    for (let i = 0; i < items.length; i++) {
      this._query!.getQueryKey(concept)!.addValue(items[i]);
    }
    this._requery = true;
    this._dirty = true;
  }

  public addCurrentValue(concept: string, value: string) {
    this._requery = true;
    this._dirty = true;
    //this._query!.getQueryKey(concept)!.addValue(value);
  }

  public removeCurrentValue(concept: string, value: string) {
    this._requery = true;
    this._dirty = true;
    this._query!.getQueryKey(concept)!.removeValue(value);
  }
  public forceUpdate(i: number) {
    this._forceUpdate = this._forceUpdate + 1;
  }
  public getAttribution() {
    return this._queryable != undefined ? this._queryable!.getAttribution() : "";
  }
  public toJSON(): any {
    if(this.dataservice==undefined)return {};
    let result: any = {};
    result.dataservice = this.dataservice;
    if(this.dataflow==undefined)return {};
    result.dataflow_agency = this.dataflow?.getAgencyId()?.toString();
    result.dataflow_id = this.dataflow?.getId()?.toString();
    result.dataflow_version = this.dataflow?.getVersion()?.toString();
    result.dataflow_name = this.dataflow?.getNames()[0].getText();
    result.dataflow_name_lang = this.dataflow?.getNames()[0].getLang();
    result.datastructure_agency = this.dataflow?.getStructure()?.getAgencyId()?.toString();
    result.datastructure_id = this.dataflow?.getStructure()!.getMaintainableParentId()!.toString();
    result.datastructure_version = this.dataflow?.getStructure()?.getMaintainedParentVersion()?.toString();
    if(this._bindings===undefined)return result;
    let bs = [];
    for (let i = 0; i < this._bindings!.length; i++) {
      bs[i] = bindings.defaultSaveBindingToObject(this._bindings![i]);
    }
    result.bindings = bs;
    if (this._time != undefined) {
      result.time = bindings.defaultSaveBindingToObject(this._time!);
    }
    if (this._crossSection != undefined) {
      result.crossSection = bindings.defaultSaveBindingToObject(this._crossSection!);
    }
    if(this._values===undefined)return result;
    let vs = [];
    for (let i = 0; i < this._values!.length; i++) {
      vs[i] = bindings.defaultSaveBindingToObject(this._values![i]);
    }
    result.values = vs;
    if(this._adapter===undefined)return result;
    result.adapter = this._adapter?.getId();
    return result;
  }
}
