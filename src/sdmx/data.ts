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
// import { Promise } from 'bluebird';

import * as collections from "typescript-collections";
import * as interfaces from "../sdmx/interfaces";
import * as structure from "../sdmx/structure";
import * as message from "../sdmx/message";
import * as commonreferences from "../sdmx/commonreferences";
import * as common from "../sdmx/common";
import * as timepack from "../sdmx/time";
import * as _ from "underscore";
import * as Language from "../sdmx/language";
export class QueryKey {
  private queryAll = false;
  private walkAll = false;
  private structRef: commonreferences.Reference | undefined = undefined;
  private registry: interfaces.LocalRegistry | undefined = undefined;
  private name: string | undefined = undefined;
  private values: Array<string> = [];
  private possibleValues: Array<structure.ItemType> = [];
  private walkedValues: Array<structure.ItemType> = [];
  constructor(
    structRef: commonreferences.Reference,
    registry: interfaces.LocalRegistry,
    s: string
  ) {
    this.structRef = structRef;
    this.registry = registry;
    this.name = s;
    this.possibleValues = [];
    if (this.getItemScheme() != undefined) {
      const items: Array<structure.ItemType> = this.getItemScheme()!.getItems();
      this.possibleValues = items;
    }
  }

  public getName(): string | undefined {
    return this.name;
  }
  public getValues(): Array<string> {
    return this.values;
  }

  public setName(s: string) {
    this.name = s;
  }
  public setValue(a: string) {
    this.values = [a];
  }
  public getValue(): string {
    return this.values[0];
  }
  public setValues(a: Array<string>) {
    this.values = a;
  }

  public addValue(s: string) {
    for (let i = 0; i < this.values.length; i++) {
      // already in here
      if (this.values[i] === s) {
        return;
      }
    }
    if (s === "undefined") {
      return;}
    if (s === null) {
      return;
    }
    this.values.push(s);
  }

  public removeValue(s: string) {
    collections.arrays.remove(this.values, s);
  }

  public getItemScheme(): structure.ItemSchemeType | undefined {
    if (this.registry == undefined) {
      throw new Error("Registry is undefined");
    }
    const comp: structure.Component = this.registry
      .findDataStructure(this.structRef!)!
      .findComponentString(this.name!)!;
    const lr = comp.getLocalRepresentation();
    if (lr === undefined || lr.getEnumeration() === undefined) {
      const conceptScheme: structure.ConceptSchemeType | undefined = this.registry.findConceptScheme(
        comp.getConceptIdentity()!
      );
      return conceptScheme;
    } else {
      if (lr !== undefined) {
        const codelist = this.registry.findCodelist(lr.getEnumeration()!);
        return codelist;
      }
      // lr === null
      return undefined;
    }
  }

  public isWalkAll(): boolean {
    return this.walkAll;
  }

  public setWalkAll(b: boolean) {
    this.walkAll = b;
  }

  public isQueryAll(): boolean {
    return this.queryAll;
  }

  public setQueryAll(b: boolean) {
    this.queryAll = b;
  }

  public possibleValuesString(): Array<string> {
    const result = [];
    for (let i = 0; i < this.possibleValues.length; i++) {
      result.push(structure.NameableType.toString(this.possibleValues[i]));
    }
    return result;
  }

  public getWalkedValues(): Array<structure.ItemType> {
    if (this.walkedValues != null) return this.walkedValues;
    return this.walkedValues;
  }

  public setWalkedValues(list: Array<structure.ItemType>) {
    this.walkedValues = list;
  }

  public filterValues(array: Array<string>) {
    this.values = this.values.filter(function (s, index, arr) {
      for (let i = 0; i < array.length; i++) {
        if (array[i] === s) return true;
      }
      return false;
    });
  }

  public getPossibleValues(): Array<structure.ItemType> {
    if (this.possibleValues != null) return this.possibleValues;
    return this.possibleValues;
  }

  public setPossibleValues(list: Array<structure.ItemType>) {
    this.possibleValues = list;
    // this.values = this.values.filter(function (value, index, arr) { return !this.canHaveValue(value) }.bind(this))
  }

  public addPossibleValue(itm: structure.ItemType) {
    for (let i = 0; i < this.possibleValues.length; i++) {
      // already in here
      if (this.possibleValues[i] === itm) {
        return;
      }
    }
    if (itm === null) return;
    this.possibleValues.push(itm);
  }

  public addWalkedValue(itm: structure.ItemType) {
    for (let i = 0; i < this.walkedValues.length; i++) {
      // already in here
      if (this.walkedValues[i] === itm) {
        return;
      }
    }
    if (itm === null) return;
    this.walkedValues.push(itm);
  }

  getQueryString() {
    if (this.isQueryAll()) {
      return "";
    } else {
      let s = "";
      for (let i = 0; i < this.values.length; i++) {
        s += this.values[i];
        if (i < this.values.length - 1) {
          s += "+";
        }
      }
      return s;
    }
  }

  public containsValue(s: string) {
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i] === s) return true;
    }
    return false;
  }

  public canHaveValue(s: string) {
    for (let i = 0; i < this.walkedValues.length; i++) {
      if (structure.NameableType.toIDString(this.walkedValues[i]) === s)
        return true;
    }
    return false;
  }

  public clear() {
    this.values = [];
  }

  public removeDuplicates(
    list: Array<structure.ItemType>
  ): Array<structure.ItemType> {
    return _.uniq(list);
  }

  public size() {
    return this.values.length;
  }

  public get(n: number) {
    return this.values[n];
  }

  public set(n: number, s: string) {
    this.values[n] = s;
  }

  get valuesArray() {
    return this.values;
  }

  set valuesArray(a: Array<string>) {
    this.values = a;
  }
}

export class Query {
  private flow: structure.Dataflow | undefined = undefined
  private structRef: commonreferences.Reference | undefined = undefined
  private registry: interfaces.LocalRegistry | undefined = undefined;
  private query: Array<QueryKey> = [];
  private _startDate: Date = new Date();
  private _endDate: Date = new Date();
  private timeQueryKey: QueryKey | undefined = undefined;
  private updatedAfter: Date | undefined = undefined;
  private firstNObservations: number | undefined = undefined;
  private lastNObservations: number | undefined = undefined;
  private dimensionAtObservation: string | undefined = undefined;
  private detail: string | undefined = undefined;
  private includeHistory: boolean | undefined = undefined;
  private providerRef: string | undefined = undefined;

  constructor(flow: structure.Dataflow, registry: interfaces.LocalRegistry) {
    this.flow = flow;
    this.structRef = flow.getStructure();
    this.registry = registry;
    const kns = this.getKeyNames();
    for (let i = 0; i < kns.length; i++) {
      if (this.getTimeKeyName() !== kns[i]) {
        this.query.push(new QueryKey(this.structRef!, registry, kns[i]));
      }
    }
    this.startDate!.setFullYear(2000);
    this.endDate!.setFullYear(2016);
    if (this.getTimeKeyName() != undefined) {
      this.timeQueryKey = new QueryKey(
        flow.getStructure()!,
        registry,
        this.getTimeKeyName()!
      );
    }
  }

  public getQueryKey(id: string | undefined): QueryKey | undefined {
    for (let i = 0; i < this.query.length; i++) {
      if (this.query[i].getName() === id) return this.query[i];
    }
    if (this.timeQueryKey !== undefined && this.timeQueryKey.getName() === id) {
      return this.timeQueryKey;
    }
    return undefined;
  }

  public getDataStructue(): structure.DataStructure | undefined {
    const struct: structure.DataStructure | undefined = this.registry!.findDataStructure(
      this.structRef!
    );
    return struct;
  }

  public getKeyNames(): Array<string> {
    const struct: structure.DataStructure | undefined = this.registry!.findDataStructure(
      this.structRef!
    );
    const keynames = [];
    for (
      let i = 0;
      i <
      struct!
        .getDataStructureComponents()!
        .getDimensionList()
        .getDimensions().length;
      i++
    ) {
      const dim1: structure.Dimension = struct!
        .getDataStructureComponents()!
        .getDimensionList()
        .getDimensions()[i];
      keynames.push(dim1.getId()!.toString());
    }
    if (
      struct!
        .getDataStructureComponents()!
        .getDimensionList()
        .getMeasureDimension() != null
    ) {
      const dim2: structure.MeasureDimension = struct!
        .getDataStructureComponents()!
        .getDimensionList()
        .getMeasureDimension()!;
      keynames.push(dim2.getId()!.toString());
    }
    return keynames;
  }

  public getTimeKeyName(): string | undefined {
    const struct: structure.DataStructure | undefined = this.registry!.findDataStructure(
      this.structRef!
    );
    if (
      struct!
        .getDataStructureComponents()!
        .getDimensionList()
        .getTimeDimension() === undefined
    ) {
      return undefined;
    }
    return struct!
      .getDataStructureComponents()!
      .getDimensionList()!
      .getTimeDimension()!
      .getId()!
      .toString();
  }

  public getTimeQueryKey(): QueryKey | undefined {
    return this.timeQueryKey;
  }

  getDataflow(): structure.Dataflow | undefined {
    return this.flow;
  }

  getRegistry(): interfaces.LocalRegistry | undefined {
    return this.registry;
  }

  get startDate(): Date|undefined {
    return this._startDate;
  }

  set startDate(d: Date|undefined) {
    if(d!=undefined){
       this._startDate.setTime(d.getTime());
    }
  }

  get endDate(): Date|undefined {
    return this._endDate;
  }

  set endDate(d: Date|undefined) {
    if(d!=undefined) {
       this._endDate.setTime(d.getTime());
    }
  }

  getQueryString() {
    let qString = "";
    const keyNames: Array<string> = this.getKeyNames();
    for (let i = 0; i < keyNames.length; i++) {
      qString += this.getQueryKey(keyNames[i])!.getQueryString();
      if (i < keyNames.length - 1) {
        qString += ".";
      }
    }
    return qString;
  }

  getUpdatedAfter(): Date | undefined {
    return this.updatedAfter;
  }
  setUpdatedAfter(d: Date | undefined) {
    this.updatedAfter = d;
  }
  getFirstNObservations(): number | undefined {
    return this.firstNObservations;
  }

  setFirstNObservations(n: number | undefined) {
    this.firstNObservations = n;
  }

  getLastNObservations(): number | undefined {
    return this.lastNObservations;
  }

  setLastNObservations(n: number | undefined) {
    this.lastNObservations = n;
  }

  getDimensionAtObservation(): string | undefined {
    return this.dimensionAtObservation;
  }

  setDimensionAtObservation(s: string | undefined) {
    this.dimensionAtObservation = s;
  }

  setDetail(s: string | undefined) {
    this.detail = s;
  }
  getDetail(): string | undefined {
    return this.detail;
  }
  getIncludeHistory(): boolean | undefined {
    return this.includeHistory;
  }
  setIncludeHistory(b: boolean | undefined) {
    this.includeHistory = b;
  }
  setProviderRef(s: string | undefined) {
    this.providerRef = s;
  }
  getProviderRef(): string | undefined {
    return this.providerRef;
  }

  size(): number {
    return this.query.length;
  }
}

export class FlatObs {
  private values: Array<string | undefined> = [];
  constructor(vals: Array<string>) {
    this.values = vals;
    if (vals === null) {
      this.values = [];
    }
  }

  setValue(i: number, o: string | undefined) {
    if (this.values.length <= i) {
      for (let j: number = this.values.length; j - 1 < i; j++) {
        this.values.push(undefined);
      }
    }
    this.values[i] = o;
  }

  getValue(i: number): string | undefined {
    if (i >= this.values.length) {
      return undefined;
    }
    return this.values[i];
  }

  dump() {
    let s = "";
    for (let i = 0; i < this.values.length; i++) {
      s += this.values[i];
      if (i < this.values.length) s += " ";
    }
  }

  size(): number {
    return this.values.length;
  }
}

export class AttachmentLevel {
  private static LIST: Array<AttachmentLevel> = [];

  public static ATTACHMENT_DATASET = 0;
  public static ATTACHMENT_SERIES = 1;
  public static ATTACHMENT_OBSERVATION = 2;
  public static ATTACHMENT_GROUP = 3;
  public static ATTACHMENT_DATASET_STRING = "DataSet";
  public static ATTACHMENT_SERIES_STRING = "Series";
  public static ATTACHMENT_OBSERVATION_STRING = "Observation";
  public static ATTACHMENT_GROUP_STRING = "Group";
  public static DATASET: AttachmentLevel = new AttachmentLevel(
    AttachmentLevel.ATTACHMENT_DATASET_STRING,
    AttachmentLevel.ATTACHMENT_DATASET
  );
  public static SERIES: AttachmentLevel = new AttachmentLevel(
    AttachmentLevel.ATTACHMENT_SERIES_STRING,
    AttachmentLevel.ATTACHMENT_SERIES
  );
  public static OBSERVATION: AttachmentLevel = new AttachmentLevel(
    AttachmentLevel.ATTACHMENT_OBSERVATION_STRING,
    AttachmentLevel.ATTACHMENT_OBSERVATION
  );
  public static GROUP: AttachmentLevel = new AttachmentLevel(
    AttachmentLevel.ATTACHMENT_GROUP_STRING,
    AttachmentLevel.ATTACHMENT_GROUP
  );

  private name: string | undefined = undefined;
  private id = 0;

  constructor(s: string, id: number) {
    this.name = s;
    this.id = id;
    AttachmentLevel.LIST.push(this);
  }

  public getName(): string | undefined {
    return this.name;
  }
  public getId(): number | undefined {
    return this.id;
  }
  public static fromString(s: string): AttachmentLevel | undefined {
    for (let i = 0; i < AttachmentLevel.LIST.length; i++) {
      if (AttachmentLevel.LIST[i].getName() === s)
        return AttachmentLevel.LIST[i];
    }
    return undefined;
  }

  public static fromId(id: number): AttachmentLevel | undefined {
    for (let i = 0; i < AttachmentLevel.LIST.length; i++) {
      if (AttachmentLevel.LIST[i].getId() === id)
        return AttachmentLevel.LIST[i];
    }
    return undefined;
  }
}

export class AbstractKey {
  private dict = new collections.Dictionary<string, any>();
  private attributes = new collections.Dictionary<string, any>();

  getComponent(s: string): any {
    return this.dict.getValue(s);
  }

  setComponent(s: string, v: any) {
    this.dict.setValue(s, v);
  }

  getAttribute(s: string): any {
    return this.attributes.getValue(s);
  }

  setAttribute(s: string, v: any) {
    this.attributes.setValue(s, v);
  }

  clearAttributes() {
    this.attributes.clear();
  }

  toString() {
    return this.dict.values().join(":");
  }

  getDict() {
    return this.dict;
  }
}
export class PartialKey extends AbstractKey { }
export class FullKey extends AbstractKey { }

export class Group {
  private groupName: string | undefined = undefined;
  private groupKey: collections.Dictionary<
    string,
    string
  > = new collections.Dictionary<string, string>();
  private groupAttributes: collections.Dictionary<
    string,
    string
  > = new collections.Dictionary<string, string>();

  private map: collections.Dictionary<
    string,
    string
  > | undefined = new collections.Dictionary<string, string>();

  public constructor(
    groupValues: collections.Dictionary<string, string>
  ) {
    this.map = groupValues;
  }

  putGroupValue(concept: string, value: string) {
    this.map!.setValue(concept, value);
  }

  getGroupValue(concept: string): string | undefined {
    return this.groupAttributes.getValue(concept);
  }

  processGroupValues(ds: interfaces.DataSet) {
    this.groupAttributes = new collections.Dictionary<string, string>();
    const keys: Array<string> = this.map!.keys();
    for (let i = 0; i < keys.length; i++) {
      const s: string = keys[i];
      if (
        ds.getColumnMapper().getColumnIndex(s) === -1 ||
        ds.getColumnMapper().isAttachedToGroupString(s)
      ) {
        this.groupAttributes.setValue(s, this.map!.getValue(s)!);
        if (!ds.getColumnMapper().isAttachedToGroupString(s)) {
          ds.getColumnMapper().registerColumn(s, AttachmentLevel.GROUP);
        }
      } else {
        this.groupKey.setValue(s, this.map!.getValue(s)!);
        collections.arrays.remove(keys, s);
      }
    }
    this.map = undefined;
  }

  getGroupKey(): collections.Dictionary<string, string> {
    return this.groupKey;
  }

  public matches(key: FullKey): boolean {
    const keys: Array<string> = this.getGroupKey().keys();
    for (let i = 0; i < keys.length; i++) {
      const s: string = keys[i];
      const gv: string | undefined = this.getGroupKey().getValue(s);
      if (gv != null) {
        if (!(key.getComponent(s) === gv)) {
          return false;
        }
      }
    }
    return true;
  }

  getGroupAttributes(): collections.Dictionary<string, string> {
    return this.groupAttributes;
  }

  getGroupName(): string | undefined {
    return this.groupName;
  }

  setGroupName(groupName: string | undefined) {
    this.groupName = groupName;
  }

  setGroupValue(columnName: string, val: string) {
    this.groupAttributes.setValue(columnName, val);
  }
}
export class FlatColumnMapper implements interfaces.ColumnMapper {
  private columns: Array<string> = [];
  private groupColumns: Array<string> = [];

  registerColumn(s: string, attach: AttachmentLevel): number {
    if (
      collections.arrays.contains(this.columns, s) ||
      collections.arrays.contains(this.groupColumns, s)
    ) {
      throw new Error("Attempt to Register already registered Column!!");
    }
    if (attach === AttachmentLevel.GROUP) {
      this.groupColumns.push(s);
      this.columns.push(s);
      return this.columns.indexOf(s);
    } else {
      this.columns.push(s);
      return this.columns.indexOf(s);
    }
  }

  getColumnIndex(s: string): number {
    return this.columns.indexOf(s);
  }

  getColumnName(i: number): string {
    return this.columns[i];
  }

  size(): number {
    return this.columns.length;
  }

  containsColumn(name: string): boolean {
    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i] === name) {
        return true;
      }
    }
    return false;
  }

  getAllColumns(): Array<string> {
    const result: Array<string> = [];
    for (let i = 0; i < this.columns.length; i++) {
      result.push(this.columns[i]);
    }
    return result;
  }

  getObservationColumns(): Array<string> {
    const result: Array<string> = [];
    for (let i = 0; i < this.columns.length; i++) {
      result.push(this.columns[i]);
    }
    return result;
  }

  getSeriesColumns(): Array<string> {
    return [];
  }

  getDataSetColumns(): Array<string> {
    return [];
  }

  getGroupColumns(): Array<string> {
    return [];
  }

  isAttachedToDataSetString(s: string): boolean {
    return false;
  }

  isAttachedToDataSetInt(i: number): boolean {
    return false;
  }

  isAttachedToSeriesString(s: string): boolean {
    return false;
  }

  isAttachedToSeriesInt(i: number): boolean {
    return false;
  }

  isAttachedToObservationString(s: string): boolean {
    return collections.arrays.contains(this.columns, s);
  }

  isAttachedToObservationInt(i: number): boolean {
    return true;
  }

  isAttachedToGroupString(s: string): boolean {
    return collections.arrays.contains(this.groupColumns, s);
  }

  isAttachedToGroupInt(i: number): boolean {
    return this.isAttachedToGroupString(this.getColumnName(i));
  }

  dump() {
    console.log("Column Mapper");
    for (let i = 0; i < this.size(); i++) {
      console.log(i + " = " + this.getColumnName(i));
    }
  }
}

export class FlatDataSet implements interfaces.DataSet {
  private groups: Array<Group> = [];
  private mapper: FlatColumnMapper = new FlatColumnMapper();
  private observations: Array<FlatObs> = [];

  private dimensionAtObservation = "AllDimensions";

  getColumnIndex(name: string): number {
    return this.mapper.getColumnIndex(name);
  }

  getValue(row: number, col: number): string | undefined {
    //if (this.observations[row] === null) {
    //}
    return this.observations[row].getValue(col);
  }

  setValueStringCol(row: number, col: string, val: string) {
    this.setValue(row, this.mapper.getColumnIndex(col), val);
  }

  setValue(row: number, col: number, val: string | undefined) {
    this.observations[row].setValue(col, val);
  }

  addObservation(o: FlatObs) {
    this.observations.push(o);
  }

  removeObservation(o: FlatObs) {
    collections.arrays.remove(this.observations, o);
  }

  getObservations() {
    return this.observations;
  }

  size(): number {
    return this.observations.length;
  }

  getColumnMapper(): FlatColumnMapper {
    return this.mapper;
  }

  dump() {
    let s = "";
    for (let i = 0; i < this.mapper.size(); i++) {
      s += this.getColumnMapper().getColumnName(i);
      s += "\t";
    }
    for (let i = 0; i < this.observations.length; i++) {
      const o: FlatObs = this.getFlatObs(i);
      let s = "";
      for (let j = 0; j < this.mapper.size(); j++) {
        s = s + o.getValue(j);
        if (j < this.mapper.size()) s = s + "\t";
      }
      console.log(s);
    }
  }

  getFlatObs(i: number): FlatObs {
    return this.observations[i];
  }

  registerColumn(s: string) {
    const col: number = this.mapper.registerColumn(
      s,
      AttachmentLevel.OBSERVATION
    );
    for (let i = 0; i < this.observations.length; i++) {
      this.observations[i].setValue(col, undefined);
    }
    return col;
  }

  getColumnName(i: number): string {
    return this.mapper.getColumnName(i);
  }

  getColumnSize(): number {
    return this.mapper.size();
  }

  getGroups() {
    return [];
  }

  groupSize(): number {
    return 0;
  }

  applyGroupKey(key: PartialKey, column: string, value: string) {
    // Do Nothing
  }

  setGroups(groups: Array<Group>) {
    // Do Nothing
  }

  query(cube: Cube, order: Array<string>): Cube {
    const time: number = new Date().getTime();
    for (let i = 0; i < this.size(); i++) {
      cube.putObservation(order, this.mapper, this.getFlatObs(i));
    }
    return cube;
  }

  find(key: FullKey): FlatObs | undefined {
    let found = true;
    for (let i = 0; i < this.size(); i++) {
      const obs: FlatObs = this.getFlatObs(i);
      found = true;
      for (let j = 0; j < this.mapper.size() && !found; j++) {
        if (
          !(
            structure.NameableType.toIDString(
              key.getComponent(this.mapper.getColumnName(j))
            ) === obs.getValue(j)
          )
        ) {
          found = false;
        }
      }
      if (found) {
        return obs;
      }
    }
    return undefined;
  }

  getDimensionAtObservation(
    reg: interfaces.LocalRegistry,
    dsref: commonreferences.Reference
  ) {
    return "AllDimensions";
  }

  setDimensionAtObservationString(s: string) {
    this.dimensionAtObservation = s;
  }

  getDimensionAtObservationString(): string {
    return this.dimensionAtObservation;
  }
}
export class FlatDataSetWriter implements interfaces.DataSetWriter {
  private mapper: FlatColumnMapper = new FlatColumnMapper();
  private dataSet: FlatDataSet | undefined = undefined;
  private dataSetValues: Array<string> | undefined = new Array<string>();
  private seriesValues: Array<string> | undefined = new Array<string>();
  private obsValues: Array<string> | undefined = new Array<string>();
  private groups: Array<Group> | undefined = new Array<Group>();

  newDataSet() {
    this.dataSet = new FlatDataSet();
    this.mapper = this.dataSet.getColumnMapper();
  }

  newSeries() {
    this.seriesValues = [];
    for (let i = 0; i < this.dataSetValues!.length; i++) {
      this.seriesValues.push(this.dataSetValues![i]);
    }
  }

  newObservation() {
    this.obsValues = [];
    if (this.seriesValues != null) {
      for (let i = 0; i < this.seriesValues.length; i++) {
        this.obsValues.push(this.seriesValues[i]);
      }
    }
  }

  writeDataSetComponent(name: string, val: string) {
    if (!this.dataSet!.getColumnMapper().containsColumn(name)) {
      this.dataSet!.registerColumn(name);
    }
    this.dataSetValues!.push(val);
  }

  writeSeriesComponent(name: string, val: string) {
    if (!this.dataSet!.getColumnMapper().containsColumn(name)) {
      this.dataSet!.registerColumn(name);
    }
    this.seriesValues!.push(val);
  }

  writeObservationComponent(name: string, val: string) {
    if (!this.dataSet!.getColumnMapper().containsColumn(name)) {
      this.dataSet!.registerColumn(name);
    }
    if (
      this.obsValues!.length <=
      this.dataSet!.getColumnMapper().getColumnIndex(name)
    ) {
      for (
        let j: number = this.obsValues!.length;
        j - 1 < this.dataSet!.getColumnIndex(name);
        j++
      ) {
        this.obsValues!.push("");
      }
    }
    this.obsValues![this.dataSet!.getColumnIndex(name)] = val;
  }

  finishSeries() {
    // Do Nothing
  }

  finishObservation() {
    this.dataSet!.addObservation(new FlatObs(this.obsValues!));
  }

  finishDataSet(): FlatDataSet {
    const ds: FlatDataSet = this.dataSet!;
    ds.setGroups(this.groups!);
    this.dataSet = undefined;
    return ds;
  }

  getColumnMapper(): FlatColumnMapper {
    return this.mapper;
  }

  writeGroupValues(
    name: string,
    groupValues: collections.Dictionary<string, string>
  ) {
    const group: Group = new Group(groupValues!);
    group.setGroupName(name);
    if (this.groups === null) {
      this.groups = [];
    }
    this.groups!.push(group);
  }
}
export class ValueTypeResolver {
  public static resolveCode(
    registry: interfaces.LocalRegistry,
    struct: structure.DataStructure,
    column: string,
    value: string
  ): structure.ItemType | undefined {
    if (value === null) {
      return undefined;
    }
    let dim: structure.Component = struct.findComponentString(column)!;
    // Cross Sectional Measures somtimes come in a a 'type' column..
    // see SDMX 2.0 example cross sectional file
    if (column === "type") {
      dim = struct
        .getDataStructureComponents()!
        .getDimensionList()
        .getMeasureDimension()!;
    }
    if (dim === null) {
      const itm: structure.CodeType = new structure.CodeType();
      const name: common.Name = new common.Name(
        Language.Language.getLanguage(),
        value
      );
      const names: Array<common.Name> = [name];
      itm.setNames(names);
      return itm;
    }
    const conceptRef = dim.getConceptIdentity();
    let rep: structure.RepresentationType | undefined = undefined;
    let concept: structure.ConceptType | undefined = undefined;
    if (conceptRef != null) {
      concept = registry.findConcept(conceptRef);
      if (concept === null) {
        const ct: structure.CodeType = new structure.CodeType();
        ct.setId(new commonreferences.ID(value));
        const name: common.Name = new common.Name("en", value);
        ct.setNames([name]);
        return ct;
      }
      rep = dim.getLocalRepresentation();
    }
    if (rep != null) {
      if (rep.getEnumeration() != undefined) {
        if (
          rep
            .getEnumeration()!
            .getRefClass()!
            .toInt() ===
          commonreferences.ObjectTypeCodelistType.CODELIST.toInt()
        ) {
          const codelist: structure.Codelist | undefined = registry.findCodelist(
            rep.getEnumeration()!
          );
          let id: commonreferences.ID | undefined = undefined;
          try {
            id = new commonreferences.ID(value);
          } catch (err) {
            // Ignore
          }
          if (codelist === null) {
            throw new Error(
              "Codelist is null Representation=" +
              rep.getEnumeration()!.toString()
            );
          }
          let ct: structure.CodeType | undefined = undefined;
          if (id != null) {
            ct = codelist!.findItemId(id);
          }
          if (ct === null) {
            const ct2: structure.CodeType = new structure.CodeType();
            ct2.setId(id!);
            const name: common.Name = new common.Name(
              "en",
              "Missing Code:" + value
            );
            const names: Array<common.Name> = [];
            names.push(name);
            ct2.setNames(names);
            return ct2;
          } else {
            return ct;
          }
        } else {
          const cs: structure.ConceptSchemeType | undefined = registry.findConceptScheme(
            rep.getEnumeration()!
          );
          let conceptMeasure: structure.ConceptType | undefined = undefined;
          for (let i = 0; i < cs!.size() && conceptMeasure === null; i++) {
            const tempConcept: structure.ConceptType = cs!.getItem(i);
            if (
              tempConcept.getId() != undefined &&
              tempConcept.getId()!.toString() === value
            ) {
              conceptMeasure = cs!.getItem(i);
            } else if (tempConcept.getId()!.toString() === value) {
              conceptMeasure = tempConcept;
            }
          }
          if (conceptMeasure != null) {
            // System.out.println("ConceptMeasure:"+conceptMeasure);
            return conceptMeasure;
          }
          return undefined;
        }
      } else {
        const itm: structure.CodeType = new structure.CodeType();
        const name: common.Name = new common.Name(
          Language.Language.getLanguage(),
          value
        );
        const names: Array<common.Name> = [name];
        itm.setNames(names);
        return itm;
      }
    }
    const itm: structure.CodeType = new structure.CodeType();
    const name: common.Name = new common.Name(
      Language.Language.getLanguage(),
      value
    );
    const names: Array<common.Name> = [name];
    itm.setNames(names);
    return itm;
  }

  public static getPossibleCodes(
    registry: interfaces.LocalRegistry,
    struct: structure.DataStructure,
    column: string
  ): structure.ItemSchemeType | undefined {
    let dim: structure.Component | undefined = struct.findComponentString(column);
    if (dim === undefined || column === "type") {
      dim = struct
        .getDataStructureComponents()!
        .getDimensionList()
        .getMeasureDimension();
    }
    const conceptRef = dim!.getConceptIdentity();
    let rep: structure.RepresentationType | undefined = undefined;
    let concept: structure.ConceptType | undefined = undefined;
    if (conceptRef != null) {
      concept = registry.findConcept(conceptRef);
      rep = dim!.getLocalRepresentation();
    }
    if (rep != null) {
      if (rep.getEnumeration() != undefined) {
        if (
          rep!
            .getEnumeration()!
            .getRefClass()!
            .toInt() ===
          commonreferences.ObjectTypeCodelistType.CODELIST.toInt()
        ) {
          const codelist: structure.Codelist | undefined = registry.findCodelist(
            rep.getEnumeration()!
          );
          return codelist!;
        } else {
          const cs: structure.ConceptSchemeType | undefined = registry.findConceptScheme(
            rep.getEnumeration()!
          );
          return cs!;
        }
      }
    }
    return undefined;
  }
}
export class StructuredValue {
  public getRepresentation(
    reg: interfaces.LocalRegistry,
    c: structure.Component
  ): structure.RepresentationType {
    const rep: structure.RepresentationType | undefined = c.getLocalRepresentation();
    if (rep === undefined) {
      const concept: structure.ConceptType | undefined = reg.findConcept(
        c.getConceptIdentity()!
      );
      // return concept.getCoreRepresentation();
    }
    return c.getLocalRepresentation()!;
  }

  public getLocalRepresentation(
    c: structure.Component
  ): structure.RepresentationType | undefined {
    if (c === null) return undefined;
    return c.getLocalRepresentation();
  }

  private concept: string | undefined = undefined;
  private value: string | undefined = undefined;
  private registry: interfaces.LocalRegistry | undefined = undefined;
  private structure: structure.DataStructure | undefined = undefined;

  public constructor(
    concept: string,
    value: string,
    registry: interfaces.LocalRegistry,
    struct: structure.DataStructure
  ) {
    this.concept = concept;
    this.value = value;
    this.registry = registry;
    this.structure = struct;
  }

  public isCoded(): boolean {
    let comp: structure.Component | undefined = this.structure!.findComponentString(
      this.concept!
    );
    if (this.concept === "type") {
      comp = this.structure!
        .getDataStructureComponents()!
        .getDimensionList()
        .getMeasureDimension();
    }
    if (comp === undefined) {
      return false;
    }
    const localRep: structure.RepresentationType = this.getRepresentation(
      this.registry!,
      comp!
    );
    if (localRep.getEnumeration() != null) {
      return true;
    } else return false;
  }

  public getCode(): structure.ItemType | undefined {
    // System.out.println("Concept:"+ concept+" Value:" + value);
    // Locale loc = Locale.getDefault();
    // ItemType item = ValueTypeResolver.resolveCode(registry, structure, concept, value);
    // System.out.println("Item=" + item.toString());
    // System.out.println("Item=" + item.findName(loc.getLanguage()));
    return ValueTypeResolver.resolveCode(
      this.registry!,
      this.structure!,
      this.concept!,
      this.getValue()!
    );
  }

  public getCodelist(): structure.ItemSchemeType | undefined {
    return ValueTypeResolver.getPossibleCodes(
      this.registry!,
      this.structure!,
      this.concept!
    );
  }

  public toString(): string {
    if (this.isCoded()) {
      const code: structure.ItemType | undefined = this.getCode();
      if (code === null) {
        return this.getValue()!;
      }
      return structure.NameableType.toString(code!);
    }
    return this.getValue()!;
  }

  /**
   * @return the concept
   */
  public getConcept(): structure.ConceptType | undefined {
    return this.registry!.findConcept(
      this.structure!.findComponentString(this.concept!)!.getConceptIdentity()!
    );
  }

  /**
   * @return the value
   */
  public getValue(): string | undefined {
    return this.value;
  }
}
export class StructuredDataSet {
  private dataSet: interfaces.DataSet | undefined = undefined;
  private registry: interfaces.LocalRegistry | undefined = undefined;
  private structure: structure.DataStructure | undefined = undefined;

  constructor(
    ds: interfaces.DataSet,
    reg: interfaces.LocalRegistry,
    struct: structure.DataStructure
  ) {
    this.dataSet = ds;
    this.registry = reg;
    this.structure = struct;
  }

  public getStructuredValue(row: number, column: number): StructuredValue {
    return new StructuredValue(
      this.getDataSet().getColumnName(column)!,
      this.getDataSet().getValue(row, column)!,
      this.registry!,
      this.getStructure()
    );
  }

  public getColumnName(i: number): string | undefined {
    const conceptString: string = this.getDataSet().getColumnName(i)!;
    // System.out.println("Concept="+conceptString);
    // System.out.println("ds="+getStructure());
    let c: structure.Component | undefined = this.getStructure().findComponentString(
      conceptString
    );
    if (c === null && conceptString === "type") {
      // "type" represents sdmx 2.0 cross sectional document
      c = this.getStructure()!
        .getDataStructureComponents()!
        .getDimensionList()
        .getMeasureDimension();
    }
    if (c === undefined) {
      return conceptString;
    }
    const conceptRef = c.getConceptIdentity();
    let concept: structure.ConceptType | undefined = undefined;
    if (conceptRef != null) {
      concept = this.registry!.findConcept(conceptRef);
      return structure.NameableType.toString(concept!);
    } else {
      return conceptString;
    }
  }

  public size(): number {
    return this.getDataSet().size();
  }

  public getColumnCount(): number {
    return this.getDataSet().getColumnSize();
  }

  /**
   * @return the dataSet
   */
  public getDataSet(): interfaces.DataSet {
    return this.dataSet!;
  }

  /**
   * @return the structure
   */
  public getStructure(): structure.DataStructure {
    return this.structure!;
  }

  public getColumnIndexes(): Array<number> {
    const result = [];
    for (let i = 0; i < this.getColumnCount(); i++) {
      result.push(i);
    }
    return result;
  }
}
export class StructuredDataMessage {
  private dataMessage: message.DataMessage | undefined = undefined;
  private registry: interfaces.LocalRegistry | undefined = undefined;
  private dataflow: structure.Dataflow | undefined = undefined;

  private list: Array<StructuredDataSet> = [];

  constructor(dm: message.DataMessage, reg: interfaces.LocalRegistry) {
    this.dataMessage = dm;
    this.registry = reg;
    for (let i = 0; i < this.dataMessage.size(); i++) {
      this.list.push(this.buildStructuredDataSet(i));
    }
  }

  public size(): number {
    return this.getDataMessage().size();
  }

  public getStructuredDataSet(i: number): StructuredDataSet {
    return this.list[i];
  }

  public buildStructuredDataSet(i: number): StructuredDataSet {
    // dataMessage.getHeader().getStructures().get(0).getStructure().dump();
    // NestedNCNameID agency = dataMessage.getHeader().getStructures().get(0).getStructure().getAgencyId();
    // IDType id = dataMessage.getHeader().getStructures().get(0).getStructure().getMaintainableParentId();
    // Version vers = dataMessage.getHeader().getStructures().get(0).getStructure().getMaintainedParentVersion();
    // System.out.println("Ref="+agency+":"+id+":"+vers);
    const structure: structure.DataStructure | undefined = this.getRegistry().findDataStructure(
      this.getDataMessage()
        .getHeader()!
        .getStructures()[0]
        .getStructure()!
    );
    // System.out.println("Structure="+structure);
    if (this.dataflow === null) {
      this.setDataflow(structure!.asDataflow());
    }
    return new StructuredDataSet(
      this.getDataMessage().getDataSet(i),
      this.getRegistry(),
      structure!
    );
  }

  /**
   * @return the dataMessage
   */
  public getDataMessage(): message.DataMessage {
    return this.dataMessage!;
  }

  /**
   * @return the registry
   */
  public getRegistry(): interfaces.LocalRegistry {
    return this.registry!;
  }

  /**
   * @return the dataflow
   */
  public getDataflow(): structure.Dataflow {
    return this.dataflow!;
  }

  /**
   * @param dataflow the dataflow to set
   */
  public setDataflow(dataflow: structure.Dataflow) {
    this.dataflow = dataflow;
  }
}
export class CubeDimension {
  private concept: string | undefined = undefined;
  private value: string | undefined = undefined;

  private subDimension: string | undefined = undefined;
  private subDimensions: Array<CubeDimension> = [];

  constructor(concept: string | undefined, value: string | undefined) {
    this.concept = concept;
    this.value = value;
  }

  /**
   * @return the concept
   */
  public getConcept(): string {
    return this.concept!;
  }

  /**
   * @param concept the concept to set
   */
  public setConcept(concept: string) {
    this.concept = concept;
  }

  public getSubCubeDimension(id: string): CubeDimension | undefined {
    for (let i = 0; i < this.subDimensions.length; i++) {
      if (this.subDimensions[i].getValue() === id) {
        return this.subDimensions[i];
      }
    }
    return undefined;
  }

  public putSubCubeDimension(sub: CubeDimension) {
    const sub2: CubeDimension | undefined = this.getSubCubeDimension(sub.getValue());
    if (sub2 != null) {
      // Remove Old Dimension
      this.subDimensions = this.subDimensions.splice(
        this.subDimensions.indexOf(sub2),
        1
      );
    }
    this.subDimensions.push(sub);
  }

  public listSubDimensions(): Array<CubeDimension> {
    return this.subDimensions;
  }
  public listDimensionValues(): Array<string> {
    const result = [];
    for (let i = 0; i < this.subDimensions.length; i++) {
      result.push(this.subDimensions[i].getValue());
    }
    return result;
  }

  /**
   * @return the value
   */
  public getValue(): string {
    return this.value!;
  }

  /**
   * @param value the value to set
   */
  public setValue(value: string) {
    this.value = value;
  }

  public dump() {
    // Do Nothing
  }

  /**
   * @return the subDimension
   */
  public getSubDimension(): string | undefined {
    return this.subDimension;
  }

  /**
   * @param subDimension the subDimension to set
   */
  public setSubDimension(subDimension: string) {
    this.subDimension = subDimension;
  }
}
export class CubeObs {
  private mapper: interfaces.ColumnMapper | undefined = undefined;
  private data: any = [];
  constructor(mapper: interfaces.ColumnMapper) {
    this.mapper = mapper;
  }

  public addValue(c: string, v: string) {
    this.data[this.mapper!.getColumnIndex(c)] = v;
  }

  public getValue(c: string) {
    return this.data[this.mapper!.getColumnIndex(c)];
  }

  public toString() {
    let s = "";
    for (let i = 0; i < this.mapper!.size(); i++) {
      s += this.data[i];
      if (i < this.mapper!.size()) {
        s += ":";
      }
    }
    return s;
  }
}
export class CubeObservation {
  private map: collections.Dictionary<
    string,
    CubeAttribute
  > = new collections.Dictionary<string, CubeAttribute>();
  private concept: string | undefined = undefined;
  private cross: string | undefined = undefined;
  private observationConcept: string | undefined = undefined;
  private value: string | undefined = undefined;

  constructor(
    crossSectionalMeasureConcept: string | undefined,
    crossSection: string | undefined,
    primaryMeasureConcept: string,
    value: string
  ) {
    this.concept = crossSectionalMeasureConcept;
    this.cross = crossSection;
    this.observationConcept = primaryMeasureConcept;
    this.value = value;
  }

  public getAttribute(id: string): CubeAttribute | undefined {
    return this.map.getValue(id);
  }

  public putAttribute(sub: CubeAttribute) {
    this.map.setValue(sub.getConcept(), sub);
  }

  public listAttributes(): Array<CubeAttribute> {
    return this.map.values();
  }

  public listAttributeNames(): Array<string> {
    return this.map.keys();
  }

  /**
   * @return the concept
   */
  public getCrossSection(): string | undefined {
    return this.cross;
  }

  /**
   * @param concept the concept to set
   */
  public setCrossSection(concept: string | undefined) {
    this.cross = concept;
  }

  /**
   * @return the value
   */
  public getValue(): string {
    return this.value!;
  }

  /**
   * @param value the value to set
   */
  public setValue(value: string) {
    this.value = value;
  }

  /**
   * @return the concept
   */
  public getConcept(): string {
    return this.concept!;
  }

  /**
   * @param concept the concept to set
   */
  public setConcept(concept: string) {
    this.concept = concept;
  }

  /**
   * @return the observationConcept
   */
  public getObservationConcept(): string {
    return this.observationConcept!;
  }

  /**
   * @param observationConcept the observationConcept to set
   */
  public setObservationConcept(observationConcept: string) {
    this.observationConcept = observationConcept;
  }

  public toCubeObs(key: FullKey, mapper: interfaces.ColumnMapper): CubeObs {
    const f: CubeObs = new CubeObs(mapper);
    for (let i = 0; i < mapper.size(); i++) {
      const s: string = mapper.getColumnName(i);
      const v: string = key.getComponent(s);
      f.addValue(s, v);
    }
    // Cross Sectional Data

    if (this.concept != null) {
      f.addValue(this.concept, this.cross!);
    }
    if (!mapper.containsColumn(this.observationConcept!)) {
      mapper.registerColumn(
        this.observationConcept!,
        AttachmentLevel.OBSERVATION
      );
    }
    f.addValue(this.observationConcept!, this.value!);
    for (let i = 0; i < this.map.keys().length; i++) {
      const s: string = this.map.keys()[i];
      const v2: CubeAttribute = this.map.getValue(s)!;
      if (!mapper.containsColumn(s)) {
        mapper.registerColumn(s, AttachmentLevel.OBSERVATION);
      }
      f.addValue(s, v2.getValue());
    }
    return f;
  }

  public toFlatObs(key: FullKey, mapper: interfaces.ColumnMapper): FlatObs {
    const f: FlatObs = new FlatObs([]);
    mapper.getObservationColumns().forEach(function (s: string) {
      const v = key.getComponent(s);
      f.setValue(mapper.getColumnIndex(s), v);
    });
    // Cross Sectional Data
    if (this.concept != null) {
      f.setValue(mapper.getColumnIndex(this.concept), this.cross);
    }
    // OBS_VALUE
    if (!mapper.containsColumn(this.observationConcept!)) {
      mapper.registerColumn(
        this.observationConcept!,
        AttachmentLevel.OBSERVATION
      );
    }
    f.setValue(mapper.getColumnIndex(this.observationConcept!), this.value);
    this.map.forEach(
      (at: string) => {
        const ca: CubeAttribute = this.getAttribute(at)!;
        // Attributes
        f.setValue(mapper.getColumnIndex(ca.getConcept()), ca.getValue());
      }
    );
    return f;
  }
}

export class CubeAttribute {
  private concept: string | undefined = undefined;
  private value: string | undefined = undefined;
  constructor(concept: string, value: string) {
    this.concept = concept;
    this.value = value;
  }

  public getConcept(): string {
    return this.concept!;
  }

  public getValue(): string {
    return this.value!;
  }
}

export class ListCubeDimension extends CubeDimension {
  private list: Array<CubeDimension> = [];
  constructor(concept: string | undefined, value: string | undefined) {
    super(concept, value);
    if (concept === null) {
      console.log("concept is null:ListCubeDimension" + value);
    }
  }

  public getSubCubeDimension(id: string): CubeDimension | undefined {
    for (let i = 0; i < this.list.length; i++) {
      const cd: CubeDimension = this.list[i];
      if (cd.getValue() === id) {
        return cd;
      }
    }
    return undefined;
  }

  public putSubCubeDimension(sub: CubeDimension) {
    const old: CubeDimension | undefined = this.getSubCubeDimension(sub.getValue());
    if (old !== undefined) {
      this.list.splice(this.list.indexOf(old), 1);
    }
    this.list.push(sub);
    this.setSubDimension(sub.getConcept());
  }

  public listSubDimensions(): Array<CubeDimension> {
    return this.list;
  }

  public listDimensionValues(): Array<string> {
    const set: Array<string> = [];
    for (let i = 0; i < this.list.length; i++) {
      set.push(this.list[i].getValue());
    }
    return set;
  }
}
export class RootCubeDimension extends ListCubeDimension {
  constructor() {
    super(undefined, undefined);
  }
}
export class TimeCubeDimension extends CubeDimension {
  private obs: Array<CubeObservation> = [];

  public listObservations(): Array<CubeObservation> {
    return this.obs;
  }

  public putObservation(sub: CubeObservation) {
    this.obs.push(sub);
  }

  public getObservation(id: string | undefined): CubeObservation | undefined {
    for (let i = 0; i < this.obs.length; i++) {
      const c: CubeObservation = this.obs[i];
      if (c.getCrossSection() === null) {
        return c;
      }
      if (c.getCrossSection() === id) {
        return c;
      }
    }
    return undefined;
  }

  public listObservationValues(): Array<string> {
    // TO DO
    return [];
  }

  public listSubDimensions(): Array<CubeDimension> {
    return [];
  }

  public listDimensionValues(): Array<string> {
    return [];
  }
}
export class Cube {
  private size = 0;
  private order: Array<string> | undefined = [];
  private struct: structure.DataStructure | undefined = undefined;
  private reg: interfaces.LocalRegistry | undefined = undefined;
  private mapper: FlatColumnMapper = new FlatColumnMapper();
  private cubeObsMapper: FlatColumnMapper = new FlatColumnMapper();
  private flatObsMapper: FlatColumnMapper = new FlatColumnMapper();

  private validCodes: collections.Dictionary<
    string,
    Array<string>
  > = new collections.Dictionary<string, Array<string>>();

  constructor(struct: structure.DataStructure, reg: interfaces.LocalRegistry) {
    this.struct = struct;
    this.reg = reg;
  }

  public getStructure(): structure.DataStructure {
    return this.struct!;
  }

  public getStructureReference(): commonreferences.Reference {
    return this.struct!.asReference();
  }

  private root: RootCubeDimension = new RootCubeDimension();

  public getRootCubeDimension(): RootCubeDimension {
    return this.root;
  }

  public putObservation(
    order: Array<string> | undefined,
    mapper: interfaces.ColumnMapper,
    obs: FlatObs
  ) {
    let dim: ListCubeDimension = this.getRootCubeDimension();
    this.order = order;
    let time: TimeCubeDimension | undefined = undefined;
    let cubeobs: CubeObservation | undefined = undefined;
    for (
      let i = 0;
      i <
      this.struct!
        .getDataStructureComponents()!
        .getDimensionList()
        .getDimensions().length;
      i++
    ) {
      // if( struct.getDataStructureComponents().getDimensionList().getDimension(i).)
      // This line goes through the components in their datastructure order
      // IDType dimId = struct.getDataStructureComponents().getDimensionList().getDimension(i).getId();
      // This line goes through the components in their specified order
      let dimId: commonreferences.ID | undefined = undefined;
      if (order !== undefined) {
        dimId = new commonreferences.ID(order[i]);
      } else {
        dimId = this.struct!
          .getDataStructureComponents()!
          .getDimensionList()
          .getDimensions()
        [i].getId();
      }
      if (this.validCodes.getValue(dimId!.toString()) === undefined) {
        this.validCodes.setValue(dimId!.toString(), []);
        if (this.mapper.getColumnIndex(dimId!.toString()) === -1) {
          this.mapper.registerColumn(
            dimId!.toString(),
            AttachmentLevel.OBSERVATION
          );
          this.cubeObsMapper.registerColumn(
            dimId!.toString(),
            AttachmentLevel.OBSERVATION
          );
          this.flatObsMapper.registerColumn(
            dimId!.toString(),
            AttachmentLevel.OBSERVATION
          );
        }
      }
      /*
                If the data you are trying to make a cube from does not have a complete key
                with values for all dimensions, mapper.getColumnIndex(dimId.toString()) returns -1
                here (because there is no dimension of that name in the FlatObservation)
                this filters down into FlatObservation.getValue(-1) which causes an array index
                out of bounds exception!
             */
      if (mapper.getColumnIndex(dimId!.toString()) === -1) {
        this.mapper.registerColumn(
          dimId!.toString(),
          AttachmentLevel.OBSERVATION
        );
        this.cubeObsMapper.registerColumn(
          dimId!.toString(),
          AttachmentLevel.OBSERVATION
        );
        this.flatObsMapper.registerColumn(
          dimId!.toString(),
          AttachmentLevel.OBSERVATION
        );
      }
      let myDim: CubeDimension | undefined = dim.getSubCubeDimension(
        obs.getValue(mapper.getColumnIndex(dimId!.toString()))!
      );
      if (myDim === undefined) {
        myDim = new ListCubeDimension(
          dimId!.toString(),
          obs.getValue(mapper.getColumnIndex(dimId!.toString()))
        );
        dim.putSubCubeDimension(myDim);
        if (this.validCodes.getValue(dimId!.toString()) === undefined) {
          this.validCodes.setValue(dimId!.toString(), []);
          if (
            !collections.arrays.contains(
              this.validCodes.getValue(dimId!.toString())!,
              myDim.getValue()
            )
          ) {
            this.validCodes.getValue(dimId!.toString())!.push(myDim.getValue());
          }
        }
      }
      dim = myDim as ListCubeDimension;
    }
    let myDim: CubeDimension | undefined = undefined;
    const dimId: commonreferences.ID | undefined = this.struct!
      .getDataStructureComponents()!
      .getDimensionList()!
      .getTimeDimension()!
      .getId();
    if (this.validCodes.getValue(dimId!.toString()) === undefined) {
      this.validCodes.setValue(dimId!.toString(), []);
    }
    const i: number = this.mapper.getColumnIndex(dimId!.toString());
    const s: string | undefined = obs.getValue(i);
    myDim = dim.getSubCubeDimension(
      obs.getValue(mapper.getColumnIndex(dimId!.toString()))!
    );
    if (myDim === null||myDim==undefined) {
      myDim = new TimeCubeDimension(
        dimId!.toString(),
        obs.getValue(mapper.getColumnIndex(dimId!.toString()))
      );
      dim.putSubCubeDimension(myDim);
      if (this.validCodes.getValue(dimId!.toString()) === undefined) {
        this.validCodes.setValue(dimId!.toString(), []);
        if (
          !collections.arrays.contains(
            this.validCodes.getValue(dimId!.toString())!,
            myDim.getValue()
          )
        ) {
          this.validCodes.getValue(dimId!.toString())!.push(myDim.getValue());
        }
      }
    }
    time = myDim as TimeCubeDimension;
    let cross: string | undefined = undefined;
    let dimId2: commonreferences.ID | undefined = undefined;
    if (
      this.struct!
        .getDataStructureComponents()!
        .getDimensionList()
        .getMeasureDimension() != null
    ) {
      dimId2 = this.struct!
        .getDataStructureComponents()!
        .getDimensionList()!
        .getMeasureDimension()!
        .getId();
      if (this.validCodes.getValue(dimId2!.toString()) === undefined) {
        this.validCodes.setValue(dimId2!.toString(), []);
        if (this.mapper.getColumnIndex(dimId2!.toString()) === -1) {
          this.mapper.registerColumn(
            dimId2!.toString(),
            AttachmentLevel.OBSERVATION
          );
          this.cubeObsMapper.registerColumn(
            dimId2!.toString(),
            AttachmentLevel.OBSERVATION
          );
          this.flatObsMapper.registerColumn(
            dimId2!.toString(),
            AttachmentLevel.OBSERVATION
          );
        }
      }
      cross = obs.getValue(mapper.getColumnIndex(dimId2!.toString()));
      if (
        !collections.arrays.contains(
          this.validCodes.getValue(dimId2!.toString())!,
          cross
        )
      ) {
        this.validCodes.getValue(dimId2!.toString())!.push(cross!);
      }
    }

    const dimId3: commonreferences.ID = this.struct!
      .getDataStructureComponents()!
      .getMeasureList()!
      .getPrimaryMeasure()!
      .getId()!;
    if (dimId2 != null) {
      cubeobs = new CubeObservation(
        dimId2.toString(),
        cross!,
        dimId3.toString(),
        obs.getValue(mapper.getColumnIndex(dimId3.toString()))!
      );
      if (this.mapper.getColumnIndex(dimId2.toString()) === -1) {
        this.mapper.registerColumn(
          dimId2.toString(),
          AttachmentLevel.OBSERVATION
        );
        this.cubeObsMapper.registerColumn(
          dimId2.toString(),
          AttachmentLevel.OBSERVATION
        );
      }
    } else {
      cubeobs = new CubeObservation(
        undefined,
        undefined,
        dimId3.toString(),
        obs.getValue(mapper.getColumnIndex(dimId3.toString()))!
      );
      if (this.mapper.getColumnIndex(dimId3.toString()) === -1) {
        this.mapper.registerColumn(
          dimId3.toString(),
          AttachmentLevel.OBSERVATION
        );
        this.flatObsMapper.registerColumn(
          dimId3.toString(),
          AttachmentLevel.OBSERVATION
        );
      }
    }

    time.putObservation(cubeobs);

    for (
      let k = 0;
      k <
      this.struct!
        .getDataStructureComponents()!
        .getAttributeList()
        .getAttributes().length;
      k++
    ) {
      const name: string = this.struct!
        .getDataStructureComponents()!
        .getAttributeList()!
        .getAttributes()!
      [k].getId()!
        .toString();
      let value: string | undefined = undefined;
      if (mapper.getColumnIndex(name) !== -1) {
        value = obs.getValue(mapper.getColumnIndex(name));
        cubeobs.putAttribute(new CubeAttribute(name, value!));
      }
    }
    // Increment Size counter
    this.size++;
  }

  public getColumnMapper(): interfaces.ColumnMapper {
    return this.mapper;
  }

  public getFlatColumnMapper(): interfaces.ColumnMapper {
    return this.flatObsMapper;
  }

  public getCubeObsColumnMapper(): interfaces.ColumnMapper {
    return this.cubeObsMapper;
  }

  public findCubeObs(key: FullKey): CubeObs | undefined {
    return this.findLatestCubeObs(key, false);
  }

  public findFlatObs(key: FullKey): FlatObs | undefined {
    return this.findLatestFlatObs(key, false);
  }

  public findLatestCubeObs(key: FullKey, latest: boolean): CubeObs | undefined {
    let dim: CubeDimension = this.getRootCubeDimension()!;
    let oldDim: CubeDimension = dim;
    for (
      let i = 0;
      i <
      this.struct!
        .getDataStructureComponents()!
        .getDimensionList()
        .getDimensions().length;
      i++
    ) {
      dim = dim.getSubCubeDimension(
        structure.NameableType.toIDString(
          key.getComponent(dim.getSubDimension()!)
        )
      )!;
      if (dim === null) {
        console.log(
          "Can't find dim:" +
          oldDim.getSubDimension() +
          ":" +
          structure.NameableType.toIDString(
            key.getComponent(oldDim.getSubDimension()!)
          )
        );
        return undefined;
      }
      oldDim = dim;
    }
    const time: structure.TimeDimension | undefined = this.struct!
      .getDataStructureComponents()!
      .getDimensionList()
      .getTimeDimension();
    if (time === undefined) {
      throw new Error("Time Dimension Is Null");
    } else if (latest) {
      const timesList: Array<string> = dim.listDimensionValues();
      for (let i = 0; i < timesList.length; i++) {
        for (let j = 0; j < timesList.length - i; j++) {
          const t1 = timepack.TimeUtil.parseTime(timesList[i], undefined);
          const t2 = timepack.TimeUtil.parseTime(timesList[j], undefined);
          if (t1.getStart() > t2.getStart()) {
            collections.arrays.swap(timesList, i, j);
          }
        }
      }
      const timeValue: string = timesList[timesList.length - 1];
      const tcd: TimeCubeDimension = dim.getSubCubeDimension(
        timeValue
      ) as TimeCubeDimension;
      if (tcd === null) {
        // System.out.println("TCD null:"+key.getComponent(time.getId().toString()+":"+timeValue));
        // dim.dump();
        return undefined;
      }
      if (
        this.struct!
          .getDataStructureComponents()!
          .getDimensionList()
          .getMeasureDimension() != null
      ) {
        const measure: string = structure.NameableType.toIDString(
          key.getComponent(
            this.struct!
              .getDataStructureComponents()!
              .getDimensionList()!
              .getMeasureDimension()!
              .getId()!
              .toString()
          )
        );
        // tcd.dump();
        // System.out.println("Measure="+measure);
        return tcd.getObservation(measure)!.toCubeObs(key, this.mapper);
      } else {
        const co: CubeObservation | undefined = tcd.getObservation(undefined);
        return co!.toCubeObs(key, this.mapper);
      }
    } else {
      const timeValue: string = structure.NameableType.toIDString(
        key.getComponent(time.getId()!.toString())
      );
      const tcd: TimeCubeDimension = dim.getSubCubeDimension(
        timeValue
      ) as TimeCubeDimension;
      if (tcd === null) {
        // System.out.println("TCD null:"+key.getComponent(time.getId().toString()+":"+timeValue));
        // dim.dump();
        console.log("Time Cube Dimension is null");
        return undefined;
      }
      if (
        this.struct!
          .getDataStructureComponents()!
          .getDimensionList()
          .getMeasureDimension() != null
      ) {
        const measure: string = structure.NameableType.toIDString(
          key.getComponent(
            this.struct!
              .getDataStructureComponents()!
              .getDimensionList()!
              .getMeasureDimension()!
              .getId()!
              .toString()
          )
        );
        // tcd.dump();
        // System.out.println("Measure="+measure);
        return tcd.getObservation(measure)!.toCubeObs(key, this.cubeObsMapper);
      } else {
        const co: CubeObservation | undefined = tcd.getObservation(undefined);
        return co!.toCubeObs(key, this.cubeObsMapper);
      }
    }
  }

  public findLatestFlatObs(key: FullKey, latest: boolean): FlatObs | undefined {
    let dim: CubeDimension = this.getRootCubeDimension();
    let oldDim: CubeDimension = dim;
    for (
      let i = 0;
      i <
      this.struct!
        .getDataStructureComponents()!
        .getDimensionList()
        .getDimensions().length;
      i++
    ) {
      dim = dim.getSubCubeDimension(
        structure.NameableType.toIDString(
          key.getComponent(dim.getSubDimension()!)
        )
      )!;
      if (dim === null) {
        // System.out.println("Can't find dim:"+key.getComponent(order.get(i))+":"+oldDim.getSubDimension());
        return undefined;
      }
      oldDim = dim;
    }
    const time: structure.TimeDimension | undefined = this.struct!
      .getDataStructureComponents()!
      .getDimensionList()
      .getTimeDimension();
    if (time === undefined) {
      throw new Error("Time Dimension Is Null");
    } else if (latest) {
      const timesList: Array<string> = dim.listDimensionValues();
      for (let i = 0; i < timesList.length; i++) {
        for (let j = 0; j < timesList.length - i; j++) {
          const t1 = timepack.TimeUtil.parseTime(timesList[i], undefined);
          const t2 = timepack.TimeUtil.parseTime(timesList[j], undefined);
          if (t1.getStart() > t2.getStart()) {
            collections.arrays.swap(timesList, i, j);
          }
        }
      }
      const timeValue: string = timesList[timesList.length - 1];
      const tcd: TimeCubeDimension = dim.getSubCubeDimension(
        timeValue
      ) as TimeCubeDimension;
      if (tcd === null) {
        // System.out.println("TCD null:"+key.getComponent(time.getId().toString()+":"+timeValue));
        // dim.dump();
        return undefined;
      }
      if (
        this.struct!
          .getDataStructureComponents()!
          .getDimensionList()
          .getMeasureDimension() != null
      ) {
        const measure: string = key.getComponent(
          this.struct!
            .getDataStructureComponents()!
            .getDimensionList()!
            .getMeasureDimension()!
            .getId()!
            .toString()
        );
        return tcd.getObservation(measure)!.toFlatObs(key, this.flatObsMapper);
      } else {
        const co: CubeObservation | undefined = tcd.getObservation(undefined);
        return co!.toFlatObs(key, this.flatObsMapper);
      }
    } else {
      const timeValue: string = key.getComponent(time.getId()!.toString());
      const tcd: TimeCubeDimension = dim.getSubCubeDimension(
        timeValue
      ) as TimeCubeDimension;
      if (tcd === null) {
        // System.out.println("TCD null:"+key.getComponent(time.getId().toString()+":"+timeValue));
        // dim.dump();
        return undefined;
      }
      if (
        this.struct!
          .getDataStructureComponents()!
          .getDimensionList()
          .getMeasureDimension() != null
      ) {
        const measure: string = key.getComponent(
          this.struct!
            .getDataStructureComponents()!
            .getDimensionList()!
            .getMeasureDimension()!
            .getId()!
            .toString()
        );
        // tcd.dump();
        // console.log("Measure=" + measure);
        const co: CubeObservation | undefined = tcd.getObservation(measure);
        if (co === null) return undefined;
        return tcd.getObservation(measure)!.toFlatObs(key, this.flatObsMapper);
      } else {
        const co: CubeObservation | undefined = tcd.getObservation(undefined);
        return co!.toFlatObs(key, this.flatObsMapper);
      }
    }
  }

  public getValues(col: string): Array<string> {
    const list: Array<string> = this.validCodes.getValue(col)!;
    if (list === null) {
      return [];
    }
    return list;
  }

  /**
   * @return the size
   */
  public getSize(): number {
    return this.size;
  }

  public getObservationCount(): number {
    return this.size;
  }

  public getAllItems(col: string): Array<structure.ItemType> {
    const com: structure.Component | undefined = this.getStructure().findComponentString(
      col
    );
    return this.reg!
      .findItemType(com!.getLocalRepresentation()!.getEnumeration()!)!
      .getItems();
  }

  public getAllValues(col: string): Array<string> {
    const items = this.getAllItems(col);
    const result = [];
    for (let i = 0; i < items.length; i++) {
      result.push(items[i].getId()!.toString());
    }
    return result;
  }

  public getSparsity(): number {
    return (this.getObservationCount() / this.getCellCount()) * 100;
  }

  public getItems(col: string): Array<structure.ItemType> {
    const com: structure.Component | undefined = this.getStructure().findComponentString(
      col
    );
    const result = [];
    const items = this.reg!
      .findItemType(com!.getLocalRepresentation()!.getEnumeration()!)!
      .getItems();
    const codes = this.getValues(col);
    for (let i = 0; i < items.length; i++) {
      for (let j = 0; j < codes.length; j++) {
        if (codes[j] === items[i].getId()!.getString()) {
          result.push(items[i]);
        }
      }
    }
    return result;
  }

  public getCellCount(): number {
    let c: number = this.getValues(this.mapper.getColumnName(0)).length;
    for (let i = 1; i < this.mapper.size(); i++) {
      c *= this.getValues(this.mapper.getColumnName(i)).length;
    }
    return c;
  }

  public dump() {
    this.recurse(this.root, 0);
  }

  public recurse(dim: CubeDimension, n: number) {
    for (let i = 0; i < dim.listSubDimensions().length; i++) {
      this.recurse(dim.listSubDimensions()[i], n + 1);
    }
    console.log(n + ":" + dim.getConcept() + ":" + dim.getValue());
  }
}

export default {
  AbstractKey: AbstractKey,
  AttachmentLevel: AttachmentLevel,
  Cube: Cube,
  CubeAttribute: CubeAttribute,
  CubeDimension: CubeDimension,
  CubeObs: CubeObs,
  CubeObservation: CubeObservation,
  FlatColumnMapper: FlatColumnMapper,
  FlatDataSet: FlatDataSet,
  FlatDataSetWriter: FlatDataSetWriter,
  FlatObs: FlatObs,
  FullKey: FullKey,
  Group: Group,
  ListCubeDimension: ListCubeDimension,
  PartialKey: PartialKey,
  Query: Query,
  QueryKey: QueryKey,
  RootCubeDimension: RootCubeDimension,
  StructuredDataMessage: StructuredDataMessage,
  StructuredDataSet: StructuredDataSet,
  StructuredValue: StructuredValue,
  TimeCubeDimension: TimeCubeDimension,
  ValueTypeResolver: ValueTypeResolver
};
