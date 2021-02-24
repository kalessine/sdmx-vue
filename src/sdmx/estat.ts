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
import * as registry from "../sdmx/registry";
import * as structure from "../sdmx/structure";
import * as message from "../sdmx/message";
import * as commonreferences from "../sdmx/commonreferences";
import * as common from "../sdmx/common";
import * as data from "../sdmx/data";
import * as parser from "../sdmx/parser";
export class ESTAT implements interfaces.Queryable, interfaces.RemoteRegistry {
  private agency = "ESTAT";
  private serviceURL =
    "https://ec.europa.eu/eurostat/SDMX/diss-web/rest";
  private options = "";
  private local: interfaces.LocalRegistry = new registry.LocalRegistry();
  private dataflowList: Array<structure.Dataflow>|undefined = undefined;
  getDataService(): string {
    return "ESTAT";
  }
  getRemoteRegistry(): interfaces.RemoteRegistry {
    return this;
  }

  getRepository(): interfaces.Repository {
    return this;
  }

  clear() {
    this.local.clear();
  }
  public getAttribution():string{
    return "Base on Eurostat Data";
  }
  public getDerivedAttribution():string{
    return "Base on Eurostat Data";
  }
  query(q: data.Query): Promise<message.DataMessage|undefined> {
    let startPeriod =
      q.startDate!.getFullYear() +
      "-" +
      (q.startDate!.getMonth() < 10
        ? "0" + q.startDate!.getMonth()
        : q.startDate!.getMonth()) +
      "-" +
      (q.startDate!.getDate() < 10
        ? "0" + q.startDate!.getDate()
        : q.startDate!.getDate());
    let endPeriod =
      q.endDate!.getFullYear() +
      "-" +
      (q.endDate!.getMonth() < 10
        ? "0" + q.endDate!.getMonth()
        : q.endDate!.getMonth()) +
      "-" +
      (q.endDate!.getDate() < 10
        ? "0" + q.endDate!.getDate()
        : q.endDate!.getDate());
    startPeriod = ""+q.startDate?.getFullYear();
    endPeriod = ""+q.endDate?.getFullYear();
    const url =
      this.serviceURL +
      "/data/" +
      q
        .getDataflow()!
        .getId()!
        .toString() +
      "/" +
      q.getQueryString() +
      "?startPeriod=" +
      startPeriod +
      "&endPeriod=" +
      endPeriod +
      "";
    return this.retrieveData(q.getDataflow()!, url);
  }

  public retrieveData(
    dataflow: structure.Dataflow,
    urlString: string
  ): Promise<message.DataMessage|undefined> {
    let s: string = this.options;
    if (urlString.indexOf("?") === -1) {
      s = "?" + s + "&random=" + new Date().getTime();
    } else {
      s = "&" + s + "&random=" + new Date().getTime();
    }
    const opts: any = {};
    opts.url = urlString;
    opts.method = "GET";
    opts.headers = {
      Origin: document.location,
      Accept: "application/vnd.sdmx.structurespecificdata+xml"
    };
    return this.makeRequest(opts).then(function(a) {
      const dm = parser.SdmxParser.parseData(a);
      const payload = new common.PayloadStructureType();
      payload.setStructure(dataflow.getStructure()!);
      dm!.getHeader()!.setStructures([payload]);
      return dm;
    });
  }

  constructor(agency: string, service: string, options: string) {
    if (service != null) {
      this.serviceURL = service;
    }
    if (agency != null) {
      this.agency = agency;
    }
    if (options != null) {
      this.options = options;
    }
  }

  load(struct: message.StructureType) {
    this.local.load(struct);
  }

  unload(struct: message.StructureType) {
    this.local.unload(struct);
  }

  makeRequest(opts:any): Promise<string> {
    return new Promise<string>(function(resolve, reject) {
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
  }

  public retrieve(urlString: string): Promise<message.StructureType> {
    let s: string = this.options;
    if (urlString.indexOf("?") === -1) {
      s = "?" + s + "&random=" + new Date().getTime();
    } else {
      s = "&" + s + "&random=" + new Date().getTime();
    }
    const opts: any = {};
    opts.url = urlString;
    opts.method = "GET";
    opts.headers = { };
    return this.makeRequest(opts).then(function(a) {
      return parser.SdmxParser.parseStructure(a)!;
    });
  }

  public retrieve2(urlString: string): Promise<string> {
    let s: string = this.options;
    if (urlString.indexOf("?") === -1) {
      s = "?" + s + "&random=" + new Date().getTime();
    } else {
      s = "&" + s + "&random=" + new Date().getTime();
    }
    const opts: any = {};
    opts.url = urlString;
    opts.method = "GET";
    opts.headers = { Origin: document.location };
    return this.makeRequest(opts).then(function(a) {
      return a;
    });
  }

  public findDataStructure(
    ref: commonreferences.Reference
  ): Promise<structure.DataStructure|undefined> {
    const dst: structure.DataStructure|undefined = this.local.findDataStructure(ref);
    if (dst != null) {
      const promise = new Promise<structure.DataStructure>(function(
        resolve,
        reject
      ) {
        resolve(dst);
      });
      return promise;
    } else {
      return this.retrieve(
        this.getServiceURL() +
          "/datastructure/" +
          this.agency +
          "/" +
          ref.getMaintainableParentId()!.toString() +
          "/" +
          ref.getMaintainedParentVersion()!.toString() +
          "?references=all"
      ).then(
        (structure: message.StructureType) => {
          this.local.load(structure);
          return structure.getStructures()!.findDataStructure(ref);
        }
      );
    }
  }

  public listDataflows(): Promise<Array<structure.Dataflow>|undefined> {
    if (this.dataflowList != null) {
      const promise = new Promise<Array<structure.Dataflow>>(
        (resolve: (arg0: any) => void, reject: any) => {
          resolve(this.dataflowList);
        }
      );
      return promise;
    } else {
      return this.retrieve(
        this.serviceURL + "/dataflow/" + this.agency + "/all/latest"
      ).then(
        (st: message.StructureType) => {
          this.dataflowList = st
            .getStructures()!
            .getDataflows()!
            .getDataflowList();
          return this.dataflowList;
        }
      );
    }
  }

  public getServiceURL(): string {
    return this.serviceURL;
  }
  findDataflow(ref: commonreferences.Reference): Promise<structure.Dataflow|undefined> {
    const promise = new Promise<structure.Dataflow|undefined>(
      (resolve: (arg0: structure.Dataflow|undefined) => void, reject: any) => {
        resolve(this.local.findDataflow(ref));
      }
    );
    return promise;
  }
  findCode(ref: commonreferences.Reference): Promise<structure.CodeType|undefined> {
    const promise = new Promise<structure.CodeType|undefined>(
      (resolve: (arg0: structure.CodeType|undefined) => void, reject: any) => {
        resolve(this.local.findCode(ref));
      }
    );
    return promise;
  }
  findCodelist(ref: commonreferences.Reference): Promise<structure.Codelist|undefined> {
    const promise = new Promise<structure.Codelist|undefined>(
      (resolve: (arg0: structure.Codelist|undefined) => void, reject: any) => {
        resolve(this.local.findCodelist(ref));
      }
    );
    return promise;
  }
  findItemType(item: commonreferences.Reference): Promise<structure.ItemType|undefined> {
    const promise = new Promise<structure.ItemType|undefined>(
      (resolve: (arg0: structure.ItemType|undefined) => void, reject: any) => {
        resolve(this.local.findItemType(item));
      }
    );
    return promise;
  }
  findConcept(ref: commonreferences.Reference): Promise<structure.ConceptType|undefined> {
    const promise = new Promise<structure.ConceptType|undefined>(
      (resolve: (arg0: structure.ConceptType|undefined) => void, reject: any) => {
        resolve(this.local.findConcept(ref));
      }
    );
    return promise;
  }
  findConceptScheme(
    ref: commonreferences.Reference
  ): Promise<structure.ConceptSchemeType|undefined>{
    const promise = new Promise<structure.ConceptSchemeType|undefined>(
      (resolve: (arg0: structure.ConceptSchemeType|undefined) => void, reject: any) => {
        resolve(this.local.findConceptScheme(ref));
      }
    );
    return promise;
  }
  /*
  searchDataStructure(
    ref: commonreferences.Reference
  ): Promise<Array<structure.DataStructure>|undefined> {
    return undefined;
  }
  searchDataflow(
    ref: commonreferences.Reference
  ): Promise<Array<structure.Dataflow>|undefined> {
    return undefined;
  }
  searchCodelist(
    ref: commonreferences.Reference
  ): Promise<Array<structure.Codelist> |undefined>{
    return undefined;
  }
  searchItemType(
    item: commonreferences.Reference
  ): Promise<Array<structure.ItemType>|undefined>{
    return undefined;
  }
  searchConcept(
    ref: commonreferences.Reference
  ): Promise<Array<structure.ConceptType>|undefined>{
    return undefined;
  }
  searchConceptScheme(
    ref: commonreferences.Reference
  ): Promise<Array<structure.ConceptSchemeType>|undefined>{
    return undefined;
  }

*/
  getLocalRegistry(): interfaces.LocalRegistry {
    return this.local;
  }

  save(): any {
    // Do Nothing
  }
}
export default { ESTAT: ESTAT };
