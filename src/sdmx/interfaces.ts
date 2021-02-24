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
import * as collections from 'typescript-collections'
// import { Promise } from 'bluebird';

import * as message from '../sdmx/message'
import * as commonreferences from '../sdmx/commonreferences'
import * as structure from '../sdmx/structure'
import * as data from '../sdmx/data'

interface Queryable {
    getRemoteRegistry(): RemoteRegistry|undefined;
    getRepository(): Repository|undefined;
    getDataService(): string|undefined;
    getAttribution():string;
    getDerivedAttribution():string;
}
/*
 * Sometimes i feel that i dont like the way this class works in javascript...
 * really i would like only one 'Registry' interface, whether they return promises
 * or concrete objects doesn't really matter just as long as there is only one
 * type of Registry interface, and i think Promises fit in better with javascript...
 * the only reason this class returns concrete objects, is because I need it for
 * sdmx 2.0 parsing to access the codelists and conceptschemes while parsing the
 * document.
 */
interface LocalRegistry {
    // Registry
    listDataflows(): Array<structure.Dataflow>|undefined;
    clear(): void;
    load(struct: message.StructureType): void;
    unload(struct: message.StructureType): void;
    findDataStructure(ref: commonreferences.Reference): structure.DataStructure|undefined;
    findDataflow(ref: commonreferences.Reference): structure.Dataflow|undefined;
    findCode(ref: commonreferences.Reference): structure.CodeType|undefined;
    findCodelist(ref: commonreferences.Reference): structure.Codelist|undefined;
    findItemType(item: commonreferences.Reference): structure.ItemType|undefined;
    findConcept(ref: commonreferences.Reference): structure.ConceptType|undefined;
    findConceptScheme(ref: commonreferences.Reference): structure.ConceptSchemeType|undefined;
    searchDataStructure(ref: commonreferences.Reference): Array<structure.DataStructure>|undefined;
    searchDataflow(ref: commonreferences.Reference): Array<structure.Dataflow>|undefined;
    searchCodelist(ref: commonreferences.Reference): Array<structure.Codelist>|undefined;
    searchItemType(item: commonreferences.Reference): Array<structure.ItemType>|undefined;
    searchConcept(ref: commonreferences.Reference): Array<structure.ConceptType>|undefined;
    searchConceptScheme(ref: commonreferences.Reference): Array<structure.ConceptSchemeType>|undefined;
    save(): void;

}
interface RemoteRegistry {
    // Registry
    listDataflows(): Promise<Array<structure.Dataflow>|undefined>;
    clear(): void;
    load(struct: message.StructureType): void;
    unload(struct: message.StructureType): void;
/*
 * Typically, a call to findDataStructure, should load the datastructure, and all child
 * references into the LocalRegistry...
 * or at least, i usually assume that after a call to findDataStructure, the required
 * codelists and conceptschemes have been loaded into LocalRegistry.
 */
    findDataStructure(ref: commonreferences.Reference): Promise<structure.DataStructure|undefined>;
    findDataflow(ref: commonreferences.Reference): Promise<structure.Dataflow|undefined>;
    findCode(ref: commonreferences.Reference): Promise<structure.CodeType|undefined>;
    findCodelist(ref: commonreferences.Reference): Promise<structure.Codelist|undefined>;
    findItemType(item: commonreferences.Reference): Promise<structure.ItemType|undefined>;
    findConcept(ref: commonreferences.Reference): Promise<structure.ConceptType|undefined>;
    findConceptScheme(ref: commonreferences.Reference): Promise<structure.ConceptSchemeType|undefined>;
    /*
    searchDataStructure(ref: commonreferences.Reference): Promise<Array<structure.DataStructure>|undefined>;
    searchDataflow(ref: commonreferences.Reference): Promise<Array<structure.Dataflow>|undefined>;
    searchCodelist(ref: commonreferences.Reference): Promise<Array<structure.Codelist>|undefined>;
    searchItemType(item: commonreferences.Reference): Promise<Array<structure.ItemType>|undefined>;
    searchConcept(ref: commonreferences.Reference): Promise<Array<structure.ConceptType>|undefined>;
    searchConceptScheme(ref: commonreferences.Reference): Promise<Array<structure.ConceptSchemeType>|undefined>;
    */
    getLocalRegistry(): LocalRegistry;
    save():void;

}

interface Repository {
    query(query: data.Query): Promise<message.DataMessage|undefined>;
}
interface SdmxParserProvider {
    getVersionIdentifier(): number;
    canParse(header: string): boolean;
    isStructure(header: string): boolean;
    isData(header: string): boolean;
    isMetadata(header: string): boolean;
    parseStructure(input: string): message.StructureType|undefined;
    parseStructureWithRegistry(input: string, reg: LocalRegistry): message.StructureType|undefined;
    parseData(input: string): message.DataMessage|undefined;
}
interface Attachable {
    getValueGivenColumn(s: string): string;
    setValueGivenColumn(s: string, val: string):void;
    getAttachmentLevel(): data.AttachmentLevel;
    getValueGivenColumnIndex(i: number): string;
    setValueGivenColumnIndex(i: number, val: string):void;
}
interface ColumnMapper {
    registerColumn(s: string, attach: data.AttachmentLevel): number;
    getColumnIndex(s: string): number;
    getColumnName(i: number): string;
    size(): number;
    containsColumn(name: string): boolean;
    getObservationColumns(): Array<string>;
    getSeriesColumns(): Array<string>;
    getDataSetColumns(): Array<string>;
    getGroupColumns(): Array<string>;
    isAttachedToDataSetString(s: string): boolean;
    isAttachedToDataSetInt(i: number): boolean;
    isAttachedToSeriesString(s: string): boolean;
    isAttachedToSeriesInt(i: number): boolean;
    isAttachedToObservationString(s: string): boolean;
    isAttachedToObservationInt(i: number): boolean;
    isAttachedToGroupString(s: string): boolean;
    isAttachedToGroupInt(i: number): boolean;
    dump():void;
}
interface DataSetWriter {
    // public ColumnMapper getColumnMapper();
    newDataSet():void;
    newSeries():void;
    newObservation():void;
    writeDataSetComponent(name: string, val: string):void;
    writeSeriesComponent(name: string, val: string):void;
    writeObservationComponent(name: string, val: string):void;
    writeGroupValues(name: string, group: collections.Dictionary<string, string>):void;
    finishObservation():void;
    finishSeries():void;
    finishDataSet(): DataSet|undefined;
}

interface DataSet {
    dump():void;
    getColumnName(i: number): string|undefined;
    getColumnIndex(s: string): number|undefined;
    getColumnSize(): number;
    size(): number;
    getValue(row: number, col: number):string|undefined;
    setValue(row: number, col: number, val: string|undefined):void;
    getFlatObs(row: number): data.FlatObs;
    query(cube: data.Cube, order: Array<string>): data.Cube;
    getColumnMapper(): ColumnMapper;
    setGroups(groups: Array<data.Group>):void;
    getGroups(): Array<data.Group>;
    groupSize(): number;
    find(key: data.FullKey): data.FlatObs|undefined;
}

export type { Queryable, LocalRegistry, RemoteRegistry, Repository, DataSet, DataSetWriter, ColumnMapper, Attachable, SdmxParserProvider } 
