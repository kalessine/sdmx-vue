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

import * as interfaces from "../sdmx/interfaces";
import * as registry from "../sdmx/registry";
import * as structure from "../sdmx/structure";
import * as message from "../sdmx/message";
import * as commonreferences from "../sdmx/commonreferences";
import * as common from "../sdmx/common";
import * as data from "../sdmx/data";
import * as parser from "../sdmx/parser";
export class Knoema
  implements
    interfaces.Queryable,
    interfaces.RemoteRegistry,
    interfaces.Repository {
  private agency = "Knoema";
  // http://stats.oecd.org/restsdmx/sdmx.ashx/GetDataStructure/ALL/OECD
  private serviceURL = "http://knoema.com/api/1.0/sdmx";
  // private serviceURL: string = "http://stat.abs.gov.au/restsdmx/sdmx.ashx/";
  private options = "";
  private local: interfaces.LocalRegistry = new registry.LocalRegistry();

  private dataflowList: Array<structure.Dataflow> = null;
  getDataService(): string {
    return "KNOEMA";
  }
  getRemoteRegistry(): interfaces.RemoteRegistry {
    return this;
  }

  getRepository(): interfaces.Repository {
    return null; // this;
  }

  clear() {
    this.local.clear();
  }

  query(q: data.Query): Promise<message.DataMessage> {
    let qs = "";
    for (let i = 0; i < q.size(); i++) {
      const k = q.getKeyNames()[i];
      const qk = q.getQueryKey(k);
      qs += k + "=";
      for (let j = 0; j < qk.size(); j++) {
        const v = qk.get(j);
        qs += v;
        if (j < qk.size() - 1) {
          qs += "%2C";
        }
      }
      if (i < q.size() - 1) {
        qs += "&";
      }
    }
    const url =
      this.serviceURL +
      "/2.1/get?id=" +
      q
        .getDataflow()
        .getId()
        .toString() +
      "&" +
      qs +
      "&startTime=" +
      q.getStartDate().getFullYear() +
      "&endTime=" +
      q.getEndDate().getFullYear();
    return this.retrieveData(q.getDataflow(), url);
  }

  public retrieveData(
    dataflow: structure.Dataflow,
    urlString: string
  ): Promise<message.DataMessage> {
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
      const dm = parser.SdmxParser.parseData(a);
      const payload = new common.PayloadStructureType();
      payload.setStructure(dataflow.getStructure());
      dm.getHeader().setStructures([payload]);
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

  makeRequest(opts): Promise<string> {
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
    opts.headers = { Origin: document.location };
    return this.makeRequest(opts).then(function(a) {
      return parser.SdmxParser.parseStructure(a);
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
  ): Promise<structure.DataStructure> {
    const dst: structure.DataStructure = this.local.findDataStructure(ref);
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
        this.getServiceURL() + "/2.1/" + ref.getMaintainableParentId()
      ).then(
        function(structure: message.StructureType) {
          this.local.load(structure);
          return structure.getStructures().findDataStructure(ref);
        }.bind(this)
      );
    }
  }

  public listDataflows(): Promise<Array<structure.Dataflow>> {
    if (this.dataflowList != null) {
      const promise = new Promise<Array<structure.Dataflow>>(
        function(resolve, reject) {
          resolve(this.dataflowList);
        }.bind(this)
      );
      return promise;
    } else {
      return this.retrieve(this.serviceURL).then(
        function(st: message.StructureType) {
          const array: Array<structure.DataStructure> = st
            .getStructures()
            .getDataStructures()
            .getDataStructures();
          const dfs: Array<structure.Dataflow> = [];
          for (let i = 0; i < array.length; i++) {
            dfs.push(array[i].asDataflow());
          }
          this.dataflowList = dfs;
          return dfs;
        }.bind(this)
      );
    }
  }

  public getServiceURL(): string {
    return this.serviceURL;
  }
  findDataflow(ref: commonreferences.Reference): Promise<structure.Dataflow> {
    return null;
  }
  findCode(ref: commonreferences.Reference): Promise<structure.CodeType> {
    return null;
  }
  findCodelist(ref: commonreferences.Reference): Promise<structure.Codelist> {
    return null;
  }
  findItemType(item: commonreferences.Reference): Promise<structure.ItemType> {
    return null;
  }
  findConcept(ref: commonreferences.Reference): Promise<structure.ConceptType> {
    return null;
  }
  findConceptScheme(
    ref: commonreferences.Reference
  ): Promise<structure.ConceptSchemeType> {
    return null;
  }
  searchDataStructure(
    ref: commonreferences.Reference
  ): Promise<Array<structure.DataStructure>> {
    return null;
  }
  searchDataflow(
    ref: commonreferences.Reference
  ): Promise<Array<structure.Dataflow>> {
    return null;
  }
  searchCodelist(
    ref: commonreferences.Reference
  ): Promise<Array<structure.Codelist>> {
    return null;
  }
  searchItemType(
    item: commonreferences.Reference
  ): Promise<Array<structure.ItemType>> {
    return null;
  }
  searchConcept(
    ref: commonreferences.Reference
  ): Promise<Array<structure.ConceptType>> {
    return null;
  }
  searchConceptScheme(
    ref: commonreferences.Reference
  ): Promise<Array<structure.ConceptSchemeType>> {
    return null;
  }
  getLocalRegistry(): interfaces.LocalRegistry {
    return this.local;
  }

  save(): any {
    // Do Nothing
  }
}
export default { Knoema: Knoema };
