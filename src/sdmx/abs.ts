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

import moment from "moment";
export class ABS implements interfaces.Queryable, interfaces.RemoteRegistry {
  private agency = "ABS";
  private serviceURL = "http://stat.data.abs.gov.au/sdmxws/sdmx.asmx";
  private options = "http://stats.oecd.org/OECDStatWS/SDMX/";
  private local: interfaces.LocalRegistry = new registry.LocalRegistry();
  private mediaType = "text/xml; charset=utf-8";
  private dataflowList: Array<structure.Dataflow> | undefined = undefined;

  getDataService(): string {
    return "ABS";
  }
  getRemoteRegistry(): interfaces.RemoteRegistry | undefined {
    return this;
  }

  getRepository(): interfaces.Repository {
    return this;
  }

  clear() {
    this.local.clear();
  }

  query(q: data.Query): Promise<message.DataMessage | undefined> {
    let data = null;
    if (
      this.getLocalRegistry()
        .findDataStructure(q.getDataflow()!.getStructure()!)!
        .getDataStructureComponents()!
        .getDimensionList()
        .getTimeDimension() != undefined
    ) {
      data = this.toGetDataQuery(q, this.options);
    } else {
      // No Time Dimension
      data = this.toGetDataQuery(q, this.options);
    }
    return this.retrieveData(
      q.getDataflow()!,
      this.serviceURL,
      this.toGetDataQuery(q, this.options),
      {
        headers: {
          "Content-Type": this.mediaType,
          SOAPAction: "http://stats.oecd.org/OECDStatWS/SDMX/GetCompactData"
        }
      }
    );
  }

  public retrieveData(
    dataflow: structure.Dataflow,
    urlString: string,
    send: string,
    opts: any
  ): Promise<message.DataMessage | undefined> {
    opts.url = urlString;
    opts.method = "POST";
    return this.makeRequest(opts, send).then(function (a) {
      const dm = parser.SdmxParser.parseData(a);
      if (dm === null) {
        const dm: message.DataMessage = new message.DataMessage();
        const payload = new common.PayloadStructureType();
        if (dataflow.getStructure() != undefined) {
          payload.setStructure(dataflow.getStructure()!);
        } else {
          throw new Error("Dataflow has no structure associated with it!");
        }
        dm.setHeader(parser.SdmxParser.getBaseHeader());
        dm.getHeader()!.setStructures([payload]);
        dm.setDataSet(0, new data.FlatDataSet());
        return dm;
      }
      const payload = new common.PayloadStructureType();
      if (dataflow.getStructure() != undefined) {
        payload.setStructure(dataflow.getStructure()!);
      } else {
        throw new Error("Dataflow has no structure associated with it!");
      }
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

  makeRequest(opts: any, send: string): Promise<string> {
    return new Promise<string>(function (resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open(opts.method, opts.url);
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(
            new Error("Status:" + xhr.status + " StatusText:" + xhr.statusText)
          );
        }
      };
      xhr.onerror = function () {
        reject(
          new Error("Status:" + xhr.status + " StatusText:" + xhr.statusText)
        );
      };
      if (opts.headers) {
        Object.keys(opts.headers).forEach(function (key) {
          xhr.setRequestHeader(key, opts.headers[key]);
        });
      }
      let params = opts.params;
      // We'll need to stringify if we've been given an object
      // If we have a string, this is skipped.
      if (params && typeof params === "object") {
        params = Object.keys(params)
          .map(function (key) {
            return (
              encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
            );
          })
          .join("&");
      }
      xhr.send(send);
    });
  }

  public async retrieve(
    urlString: string,
    send: string,
    opts: any
  ): Promise<message.StructureType | undefined> {
    opts.url = urlString;
    opts.method = "POST";
    return this.makeRequest(opts, send).then((a: string) => parser.SdmxParser.parseStructure(a));
  }

  public async retrieve2(urlString: string): Promise<string> {
    const opts = {
      url: urlString,
      method: "GET",
      headers: { Origin: document.location }
    };
    const a = await this.makeRequest(opts, "");
    return a;
  }

  public async findDataStructure(
    ref: commonreferences.Reference
  ): Promise<structure.DataStructure> {
    const dst: structure.DataStructure | undefined = this.local.findDataStructure(ref);
    if (dst != null) {
      const promise = new Promise<structure.DataStructure>(function (
        resolve,
        reject
      ) {
        resolve(dst);
      });
      return promise;
    } else {
      return this.retrieve(
        this.serviceURL,
        this.toGetDataStructureQuery(
          ref.getMaintainableParentId()!.toString(),
          ref.getAgencyId()!.toString(),
          this.options
        ),
        {
          headers: {
            "Content-Type": this.mediaType,
            SOAPAction:
              "http://stats.oecd.org/OECDStatWS/SDMX/GetDataStructureDefinition"
          }
        }
      ).then(
        (structure: any) => {
          this.local.load(structure);
          return structure.getStructures().findDataStructure(ref);
        }
      );
    }
  }

  public listDataflows(): Promise<Array<structure.Dataflow> | undefined> {
    if (this.dataflowList != null) {
      const promise = new Promise<Array<structure.Dataflow> | undefined>(
        (resolve: (arg0: Array<structure.Dataflow> | undefined) => void, reject: any) => {
          resolve(this.dataflowList);
        }
      );
      return promise;
    } else {
      return this.retrieve(
        this.serviceURL,
        this.toGetDataStructureListQuery11(this.agency, this.options),
        {
          headers: {
            "Content-Type": this.mediaType,
            SOAPAction:
              "http://stats.oecd.org/OECDStatWS/SDMX/GetDataStructureDefinition"
          }
        }
      ).then(
        (st: message.StructureType | undefined) => {
          const array: Array<structure.DataStructure> = st!
            .getStructures()!
            .getDataStructures()!
            .getDataStructures();
          const dfs: Array<structure.Dataflow> = [];
          for (let i = 0; i < array.length; i++) {
            dfs.push(array[i].asDataflow());
          }
          this.dataflowList = dfs;
          return dfs;
        }
      );
    }
  }

  public getServiceURL(): string {
    return this.serviceURL;
  }
  findDataflow(ref: commonreferences.Reference): Promise<structure.Dataflow | undefined> {
    const promise = new Promise<structure.Dataflow | undefined>(
      (resolve: (arg0: structure.Dataflow | undefined) => void, reject: any) => {
        resolve(this.local.findDataflow(ref));
      }
    );
    return promise;
  }
  findCode(ref: commonreferences.Reference): Promise<structure.CodeType | undefined> {
    const promise = new Promise<structure.CodeType | undefined>(
      (resolve: (arg0: structure.CodeType | undefined) => void, reject: any) => {
        resolve(this.local.findCode(ref));
      }
    );
    return promise;
  }
  findCodelist(ref: commonreferences.Reference): Promise<structure.Codelist | undefined> {
    const promise = new Promise<structure.Codelist | undefined>(
      (resolve: (arg0: structure.Codelist | undefined) => void, reject: any) => {
        resolve(this.local.findCodelist(ref));
      }
    );
    return promise;
  }
  findItemType(ref: commonreferences.Reference): Promise<structure.ItemType | undefined> {
    const promise = new Promise<structure.ItemType | undefined>(
      (resolve: (arg0: structure.ItemType | undefined) => void, reject: any) => {
        resolve(this.local.findItemType(ref));
      }
    );
    return promise;
  }
  findConcept(ref: commonreferences.Reference): Promise<structure.ConceptType | undefined> {
    const promise = new Promise<structure.ConceptType | undefined>(
      (resolve: (arg0: structure.ConceptType | undefined) => void, reject: any) => {
        resolve(this.local.findConcept(ref));
      }
    );
    return promise;
  }
  findConceptScheme(
    ref: commonreferences.Reference
  ): Promise<structure.ConceptSchemeType | undefined> {
    const promise = new Promise<structure.ConceptSchemeType | undefined>(
      (resolve: (arg0: structure.ConceptSchemeType | undefined) => void, reject: any) => {
        resolve(this.local.findConceptScheme(ref));
      }
    );
    return promise;
  }
  /*
    searchDataStructure(
      ref: commonreferences.Reference
    ): Array<structure.DataStructure> {
      return this.local.searchDataStructure(ref);
    }
    searchDataflow(ref: commonreferences.Reference): Array<structure.Dataflow> {
      return this.local.searchDataflow(ref);
    }
    searchCodelist(ref: commonreferences.Reference): Array<structure.Codelist> {
      return this.local.searchCodelist(ref);
    }
  
    searchItemType(ref: commonreferences.Reference): Array<structure.ItemType> {
      return this.local.searchItemType(ref);
    }
    searchConcept(ref: commonreferences.Reference): Array<structure.ConceptType> {
      return this.local.searchConcept(ref);
    }
    searchConceptScheme(
      ref: commonreferences.Reference
    ): Array<structure.ConceptSchemeType> {
      return this.local.searchConceptScheme(ref);
    }
    */
  save() {
    // Do Nothing
  }

  getLocalRegistry(): interfaces.LocalRegistry {
    return this.local;
  }

  public toGetDataStructureListQuery11(
    providerRef: string,
    soapNamespace: string
  ): string {
    let s = "";
    s +=
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sdmx="' +
      soapNamespace +
      '">';
    s += "<soapenv:Header></soapenv:Header>";
    s += "<soapenv:Body>";
    s += "<sdmx:GetDataStructureDefinition>";
    s += "<sdmx:QueryMessage>";
    s +=
      '<message:QueryMessage xmlns:message="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message"><Header xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message"><message:ID>none</message:ID><message:Test>false</message:Test><message:Prepared>2016-08-19T00:04:18+08:00</message:Prepared><message:Sender id="Sdmx-Sax" /><message:Receiver id="' +
      providerRef +
      '" /></Header><message:Query><query:KeyFamilyWhere xmlns:query="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/query"><query:And /></query:KeyFamilyWhere></message:Query></message:QueryMessage>';
    s += "</sdmx:QueryMessage>";
    s += "</sdmx:GetDataStructureDefinition>";
    s += "</soapenv:Body>";
    s += "</soapenv:Envelope>";
    return s;
  }

  public toGetDataStructureQuery(
    keyFamily: string,
    providerRef: string,
    soapNamespace: string
  ): string {
    let s = "";
    s +=
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sdmx="' +
      soapNamespace +
      '">';
    s += "<soapenv:Header></soapenv:Header>";
    s += "<soapenv:Body>";
    s += "<sdmx:GetDataStructureDefinition>";
    s += "<!--Optional:-->";
    s += "<sdmx:QueryMessage>";
    s +=
      '<message:QueryMessage xsi:schemaLocation="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/queryhttp://www.sdmx.org/docs/2_0/SDMXQuery.xsd http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message http://www.sdmx.org/docs/2_0/SDMXMessage.xsd" xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/query" xmlns:message="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
    s +=
      '<Header xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message">';
    s += "<ID>none</ID>";
    s += "<Test>false</Test>";
    s += "<Prepared>2012-06-01T09:33:53</Prepared>";
    s += '<Sender id="YourID">';
    s += '<Name xml:lang="en">Your English Name</Name>';
    s += "</Sender>";
    s += '<Receiver id="' + providerRef + '">';
    s += '<Name xml:lang="en">Australian Bureau of Statistics</Name>';
    s += '<Name xml:lang="fr">Australian Bureau of Statistics</Name>';
    s += "</Receiver>";
    s += "</Header>";
    s += "<message:Query>";
    s += "<KeyFamilyWhere>";
    s += "<Or>";
    s += "<KeyFamily>" + keyFamily + "</KeyFamily>";
    s += "</Or>";
    s += "</KeyFamilyWhere>";
    s += "</message:Query>";
    s += "</message:QueryMessage>";
    s += "</sdmx:QueryMessage>";
    s += "</sdmx:GetDataStructureDefinition>";
    s += "</soapenv:Body>";
    s += "</soapenv:Envelope>";
    return s;
  }

  public toGetDataQuery(q: data.Query, soapNamespace: string): string {
    let s = "";
    const startTime = moment(q.startDate);
    const endTime = moment(q.endDate);
    s +=
      '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">';
    s += "<soap12:Body>";
    s += '<GetCompactData xmlns="' + soapNamespace + '">';
    s += "<QueryMessage>";
    s +=
      '<message:QueryMessage xmlns:message="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message">';
    s +=
      '<Header xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message">';
    s += "<message:ID>none</message:ID>";
    s += "<message:Test>false</message:Test>";
    s += "<message:Prepared>2016-08-19T00:11:33+08:00</message:Prepared>";
    s += '<message:Sender id="Sdmx-Sax"/>';
    s += '<message:Receiver id="' + this.agency + '"/>';
    s += "</Header>";
    s += "<message:Query>";
    s +=
      '<DataWhere xmlns="http://www.SDMX.org/resources/SDMXML/schemas/v2_0/query">';
    s += "<And>";
    s +=
      "<DataSet>" +
      q
        .getDataflow()!
        .getId()!
        .toString() +
      "</DataSet>";
    s += "<Time>";
    s += "<StartTime>" + startTime.format("YYYY-MM-DD") + "</StartTime>";
    s += "<EndTime>" + endTime.format("YYYY-MM-DD") + "</EndTime>";
    s += "</Time>";

    for (let i = 0; i < q.size(); i++) {
      if (
        q.getQueryKey(q.getKeyNames()[i])!.size() > 0 &&
        !q.getQueryKey(q.getKeyNames()[i])!.isQueryAll()
      ) {
        s += "<Or>";
        for (let j = 0; j < q.getQueryKey(q.getKeyNames()[i])!.size(); j++) {
          s +=
            '<Dimension id="' +
            q.getQueryKey(q.getKeyNames()[i])!.getName() +
            '">' +
            q.getQueryKey(q.getKeyNames()[i])!.get(j) +
            "</Dimension>";
        }
        s += "</Or>";
      }
    }

    s += "</And>";
    s += "</DataWhere>";
    s += "</message:Query>";
    s += "</message:QueryMessage>";
    s += "</QueryMessage>";
    s += "</GetCompactData>";
    s += "</soap12:Body>";
    s += "</soap12:Envelope>";
    // console.log(s);
    return s;
  }
}
export default { ABS: ABS };
