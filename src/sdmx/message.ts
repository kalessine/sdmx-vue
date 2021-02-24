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
// import { Promise } from 'bluebird';

import * as interfaces from "../sdmx/interfaces";
import * as structure from "../sdmx/structure";
import * as commonreferences from "../sdmx/commonreferences";
import * as common from "../sdmx/common";
import * as data from "../sdmx/data";
// import * as sdmx from '../sdmx';
import * as xml from "../sdmx/xml";
import * as collections from "typescript-collections";
export class DataMessage {
  private header: Header |undefined = undefined;
  private dataSets: Array<data.FlatDataSet> = [];

  getHeader() {
    return this.header;
  }
  setHeader(h: Header) {
    this.header = h;
  }
  getDataSet(i: number): data.FlatDataSet {
    return this.dataSets[i];
  }
  setDataSet(i: number, ds: data.FlatDataSet) {
    this.dataSets[i] = ds;
  }
  addDataSet(ds: data.FlatDataSet): number {
    this.dataSets.push(ds);
    return collections.arrays.indexOf(this.dataSets, ds);
  }

  removeDataSet(ds: data.FlatDataSet) {
    collections.arrays.remove(this.dataSets, ds);
  }

  size(): number {
    return this.dataSets.length;
  }
}

export class DataQuery {}
export class StructureType implements interfaces.LocalRegistry {
  private header: Header|undefined = undefined;
  private structures: structure.Structures |undefined = undefined;

  getHeader() {
    return this.header;
  }
  setHeader(h: Header) {
    this.header = h;
  }
  getStructures() {
    return this.structures;
  }

  setStructures(s: structure.Structures) {
    this.structures = s;
  }

  // Registry
  listDataflows(): Array<structure.Dataflow>|undefined {
    return this.structures!.listDataflows();
  }

  clear(): void {
    // Do Nothing
  }

  load(struct: StructureType): void {
    // Do Nothing
  }

  unload(struct: StructureType): void {
    // DO Nothing
  }

  findDataStructure(ref: commonreferences.Reference): structure.DataStructure|undefined {
    return this.structures!.findDataStructure(ref);
  }

  findDataflow(ref: commonreferences.Reference): structure.Dataflow|undefined {
    return this.structures!.findDataflow(ref);
  }

  findCode(ref: commonreferences.Reference): structure.CodeType|undefined {
    return this.structures!.findCode(ref);
  }

  findCodelist(ref: commonreferences.Reference): structure.Codelist|undefined {
    return this.structures!.findCodelist(ref);
  }

  findItemType(item: commonreferences.Reference): structure.ItemType|undefined {
    return this.structures!.findItemType(item);
  }

  findConcept(ref: commonreferences.Reference): structure.ConceptType|undefined {
    return this.structures!.findConcept(ref);
  }

  findConceptScheme(
    ref: commonreferences.Reference
  ): structure.ConceptSchemeType|undefined {
    return this.structures!.findConceptScheme(ref);
  }

  searchDataStructure(
    ref: commonreferences.Reference
  ): Array<structure.DataStructure>|undefined {
    return this.structures!.searchDataStructure(ref);
  }

  searchDataflow(ref: commonreferences.Reference): Array<structure.Dataflow>|undefined {
    return this.structures!.searchDataflow(ref);
  }

  searchCodelist(ref: commonreferences.Reference): Array<structure.Codelist>|undefined {
    return this.structures!.searchCodelist(ref);
  }

  searchItemType(item: commonreferences.Reference): Array<structure.ItemType>|undefined {
    return this.structures!.searchItemType(item);
  }

  searchConcept(ref: commonreferences.Reference): Array<structure.ConceptType>|undefined {
    return this.structures!.searchConcept(ref);
  }

  searchConceptScheme(
    ref: commonreferences.Reference
  ): Array<structure.ConceptSchemeType>|undefined {
    return this.structures!.searchConceptScheme(ref);
  }

  save(): void {
    // Do Nothing
  }
}
export class HeaderTimeType {
  private date: xml.DateTime|undefined = undefined;
  constructor(d: xml.DateTime) {
    this.date = d;
  }

  getDate(): xml.DateTime|undefined {
    return this.date;
  }
  setDate(d: xml.DateTime|undefined): void {
    this.date = d;
  }
}
export class Contact {
  public name: Array<common.Name> = [];
  public departments: Array<common.TextType> = [];
  public roles: Array<common.TextType> = [];
  public telephones: Array<string> = [];
  public faxes: Array<string> = [];
  public z400s: Array<string> = [];
  public uris: Array<xml.AnyURI> = [];
  public emails: Array<string> = [];
}
export class PartyType extends structure.NameableType {
  public contacts: Array<Contact> = [];
}
export class Sender extends PartyType {}

export class Header {
  private id: string|undefined = undefined;
  private test: boolean |undefined = undefined;
  private prepared: HeaderTimeType|undefined = undefined;
  private sender: PartyType|undefined = undefined;
  private receivers: Array<PartyType> = [];
  private names: Array<common.Name> = [];
  private structures: Array<common.PayloadStructureType> = [];
  private dataproviderReference: commonreferences.Reference|undefined = undefined;
  private dataSetAction: common.ActionType|undefined = undefined;
  private dataSetId: Array<commonreferences.ID> = [];
  private extracted: xml.DateTime|undefined = undefined;
  private reportingBegin: common.ObservationalTimePeriodType|undefined = undefined;
  private reportingEnd: common.ObservationalTimePeriodType|undefined = undefined;
  private embargoDate: xml.DateTime|undefined = undefined;
  private source: Array<common.Name> = [];

  getId(): string|undefined {
    return this.id;
  }
  setId(s: string) {
    this.id = s;
  }
  getTest(): boolean|undefined {
    return this.test;
  }
  setTest(b: boolean) {
    this.test = b;
  }

  getPrepared(): HeaderTimeType|undefined {
    return this.prepared;
  }
  setPrepared(h: HeaderTimeType) {
    this.prepared = h;
  }

  getSender(): Sender|undefined {
    return this.sender;
  }
  setSender(p: Sender) {
    this.sender = p;
  }

  getReceivers(): Array<PartyType> {
    return this.receivers;
  }

  setReceivers(recs: Array<PartyType>) {
    this.receivers = recs;
  }

  getNames(): Array<common.Name> {
    return this.names;
  }

  setNames(n: Array<common.Name>) {
    this.names = n;
  }

  setStructures(pl: Array<common.PayloadStructureType>) {
    this.structures = pl;
  }

  getStructures(): Array<common.PayloadStructureType> {
    return this.structures;
  }

  getDataproviderReference(): commonreferences.Reference|undefined {
    return this.dataproviderReference;
  }

  setDataproviderReference(ref: commonreferences.Reference) {
    this.dataproviderReference = ref;
  }

  setAction(ac: common.ActionType) {
    this.dataSetAction = ac;
  }

  getAction(): common.ActionType|undefined {
    return this.dataSetAction;
  }

  getDataSetId(): Array<commonreferences.ID> {
    return this.dataSetId;
  }

  setDataSetId(ids: Array<commonreferences.ID>) {
    this.dataSetId = ids;
  }

  getExtracted(): xml.DateTime|undefined {
    return this.extracted;
  }

  setExtracted(d: xml.DateTime) {
    this.extracted = d;
  }

  getReportingBegin(): common.ObservationalTimePeriodType|undefined {
    return this.reportingBegin;
  }

  setReportingBegin(o: common.ObservationalTimePeriodType) {
    this.reportingBegin = o;
  }

  getReportingEnd(): common.ObservationalTimePeriodType|undefined {
    return this.reportingEnd;
  }

  setReportingEnd(o: common.ObservationalTimePeriodType) {
    this.reportingEnd = o;
  }

  getEmbargoDate(): xml.DateTime|undefined {
    return this.embargoDate;
  }

  setEmbargoDate(dt: xml.DateTime) {
    this.embargoDate = dt;
  }

  getSource(): Array<common.Name> {
    return this.source;
  }

  setSource(s: Array<common.Name>) {
    this.source = s;
  }
}

export default {
  Contact: Contact,
  DataMessage: DataMessage,
  DataQuery: DataQuery,
  Header: Header,
  HeaderTimeType: HeaderTimeType,
  PartyType: PartyType,
  Sender: Sender,
  StructureType: StructureType
};
