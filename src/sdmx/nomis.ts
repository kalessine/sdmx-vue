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
import moment from "moment";
// import { Promise } from 'bluebird';

import * as interfaces from "../sdmx/interfaces";
import * as registry from "../sdmx/registry";
import * as structure from "../sdmx/structure";
import * as message from "../sdmx/message";
import * as commonreferences from "../sdmx/commonreferences";
import * as common from "../sdmx/common";
import * as data from "../sdmx/data";
import * as parser from "../sdmx/parser";
import * as time from "./time";
import { Promise } from "bluebird";
export class NOMISGeography {
  private geography = "";
  private geographyName = "";
  private cubeName = "";
  private cubeId = "";
  constructor(
    geography: string,
    geographyName: string,
    cubeName: string,
    cubeId: string
  ) {
    this.geography = geography;
    this.geographyName = geographyName;
    this.cubeName = cubeName;
    this.cubeId = cubeId;
  }

  getGeography() {
    return this.geography;
  }

  getCubeName() {
    return this.cubeName;
  }
  getCubeId() {
    return this.cubeId;
  }

  getGeographyName() {
    return this.geographyName;
  }
}
export function parseXml(s: string): any {
  const parseXml: DOMParser = new DOMParser();
  const xmlDoc = parseXml.parseFromString(s, "text/xml");
  return xmlDoc;
}
export class NOMISRESTServiceRegistry
  implements interfaces.RemoteRegistry, interfaces.Queryable {
  private agency: string = "NOMIS";
  private serviceURL: string = "https://www.nomisweb.co.uk/api";
  private options: string = "uid=0xad235cca367972d98bd642ef04ea259da5de264f";
  private local: interfaces.LocalRegistry = new registry.LocalRegistry();

  private dataflowList: Array<structure.Dataflow> | undefined = undefined;

  getAttribution(): string {
    return "Source: NOMIS Statistics data";
  }

  getDerivedAttribution(): string {
    return "Based on NOMIS Statistics data";
  }
  getDataService(): string {
    return "NOMIS";
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

  query(q: data.Query): Promise<message.DataMessage> {
    const nomis = this;
    const flow: structure.Dataflow = q.getDataflow()!;
    const startTime: Date | undefined = q.startDate;
    const endTime = q.endDate;
    const geogIndex: number | undefined = flow
      .getId()!
      .toString()
      .lastIndexOf("_");
    // const geog: string = flow.getId().toString().substring(geogIndex + 1, flow.getId().toString().length)
    // let geographyString: string = '&geography=' + geog
    // if (geog === 'NOGEOG') {
    // geographyString = ''
    // }
    const id: string = flow
      .getId()!
      .toString()
      .substring(0, geogIndex);
    const dstRef: commonreferences.Ref = new commonreferences.Ref();
    dstRef.setAgencyId(flow.getAgencyId());
    dstRef.setMaintainableParentId(new commonreferences.ID(id));
    dstRef.setMaintainableParentVersion(flow.getVersion());
    const st: Promise<message.StructureType> = this.retrieve(
      this.getServiceURL() + "/v01/dataset/" + id + "/time/def.sdmx.xml"
    );
    return st.then(
      function (struc: message.StructureType) {
        let times = "&TIME=";
        const timeCL: structure.Codelist = struc
          .getStructures()!
          .getCodeLists()!
          .getCodelists()[0];
        let comma = true;
        for (let i = 0; i < timeCL.size(); i++) {
          const rtp: time.RegularTimePeriod = time.TimeUtil.parseTime(
            "",
            timeCL
              .getItems()!
            [i].getId()!
              .toString()
          );
          const ts = moment(rtp.getStart());
          const startMoment = moment(startTime);
          const endMoment = moment(endTime);
          if (ts.isBetween(startMoment, endMoment)) {
            // console.log(timeCL.getItems()[i].getId().toString() + " is between " + startTime + " and " + endTime);
            if (!comma) {
              times += ",";
              comma = true;
            }
            times += timeCL
              .getItem(i)
              .getId()!
              .toString();
            comma = false;
          } else {
          }
        }
        let queryString = "";
        const kns = q.getKeyNames();
        for (let i = 0; i < kns.length; i++) {
          const name: string = kns[i];
          if (i === 0) {
            queryString += "?";
          } else {
            queryString += "&";
          }
          queryString += name + "=";
          if (q.getQueryKey(kns[i])!.size() != 0) {
            for (let j = 0; j < q.getQueryKey(kns[i])!.size(); j++) {
              queryString += q.getQueryKey(kns[i])!.get(j);
              if (j < q.getQueryKey(kns[i])!.size() - 1) {
                queryString += ",";
              }
            }
          } else {
            if (nomis.local.findDataStructure(new commonreferences.Reference(dstRef, undefined))?.findComponentString(name)?.getLocalRepresentation()?.getEnumeration() != null) {
              const nameCL: structure.Codelist | undefined = nomis.local.findCodelist(nomis.local.findDataStructure(new commonreferences.Reference(dstRef, undefined))?.findComponentString(name)?.getLocalRepresentation()?.getEnumeration()!);
              queryString += kns[i] + "=";
              console.log(kns[i]);
              for (let j = 0; j < nameCL!.size(); j++) {
                queryString += structure.NameableType.toIDString(nameCL!.getItem(j));
                if (j < nameCL!.size() - 1) {
                  queryString += ",";
                }
              }
            }
          }
        }
        return nomis.retrieveData(
          flow,
          "http://www.nomisweb.co.uk/api/v01/dataset/" +
          dstRef.getMaintainableParentId() +
          ".compact.sdmx.xml" +
          queryString +
          times +
          "&" +
          nomis.options
        );
      }
    );
    /*
        StringBuilder q = new StringBuilder();
        for (int i = 0; i < structure.getDataStructureComponents().getDimensionList().size(); i++) {
            DimensionType dim = structure.getDataStructureComponents().getDimensionList().getDimension(i);
            boolean addedParam = false;
            String concept = dim.getConceptIdentity().getId().toString();
            List<String> params = message.getQuery().getDataWhere().getAnd().get(0).getDimensionParameters(concept);
            System.out.println("Params=" + params);
            if (params.size() > 0) {
                addedParam = true;
                q.append(concept + "=");
                for (int j = 0; j < params.size(); j++) {
                    q.append(params.get(j));
                    if (j < params.size() - 1) {
                        q.append(",");
                    }
                }
            }
            if (addedParam && i < structure.getDataStructureComponents().getDimensionList().size() - 1) {
                q.append("&");
            }
            addedParam = false;
        }
        DataMessage msg = null;
        msg = query(pparams, getServiceURL() + "/v01/dataset/" + id + ".compact.sdmx.xml?" + q + "&time=" + times.toString() + geography_string +"&" + options);
        */
    // return null;
  }

  constructor(agency: string, service: string, options: string) {
    if (service != null) {
      this.serviceURL = service;
    } else {
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

  makeRequest(opts: any): Promise<string> {
    return new Promise<string>(function (resolve: any, reject: any) {
      const xhr = new XMLHttpRequest();
      xhr.open(opts.method, opts.url);
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
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
      xhr.send(params);
    });
  }

  /*
   * Modified to always resolve
   *
   */
  makeRequest2(opts: any): Promise<string> {
    return new Promise<string>(function (resolve: any, reject: any) {
      const xhr = new XMLHttpRequest();
      xhr.open(opts.method, opts.url);
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
        } else {
          resolve("");
        }
      };
      xhr.onerror = function () {
        resolve("");
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
      xhr.send(params);
    });
  }

  public retrieve(urlString: string): Promise<message.StructureType> {
    let s: string = this.options;
    if (urlString.indexOf("?") === -1) {
      s = "?" + this.options + "&random=" + new Date().getTime();
    } else {
      s = "&" + this.options + "&random=" + new Date().getTime();
    }
    const opts: any = {};
    opts.url = urlString + s;
    opts.method = "GET";
    opts.headers = {
    };
    return this.makeRequest(opts).then(function (a: any): message.StructureType {
      return parser.SdmxParser.parseStructure(a)!;
    });
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
    opts.url = urlString + s;
    opts.method = "GET";
    opts.headers = {};
    return this.makeRequest(opts).then(function (a: any) {
      const dm = parser.SdmxParser.parseData(a);
      const payload = new common.PayloadStructureType();
      payload.setStructure(dataflow.getStructure()!);
      dm!.getHeader()!.setStructures([payload]);
      return dm!;
    });
  }

  public retrieve2(urlString: string, vals: any): Promise<any> {
    let s: string = this.options;
    if (urlString.indexOf("?") === -1) {
      s = "?" + s + "&random=" + new Date().getTime();
    } else {
      s = "&" + s + "&random=" + new Date().getTime();
    }
    const opts: any = {};
    opts.url = urlString;
    opts.method = "GET";
    opts.headers = {};
    return this.makeRequest2(opts).then(function (a: any) {
      const pack: any = { string: a };
      for (let i = 0; i < Object.keys(vals).length; i++) {
        const k = Object.keys(vals)[i];
        pack[k] = vals[k];
      }
      return pack;
    });
  }
  /*
      This function ignores the version argument!!!
      ILO stat does not use version numbers.. simply take the latest
     */

  public findDataStructure(
    ref: commonreferences.Reference
  ): Promise<structure.DataStructure | undefined> {
    const nomis = this;
    const dst: structure.DataStructure = this.local.findDataStructure(ref)!;
    if (dst != null) {
      const promise1 = new Promise<structure.DataStructure>(function (
        resolve: any,
        reject: any
      ) {
        resolve(dst);
      });
      return promise1;
    } else {
      const geogIndex = ref
        .getMaintainableParentId()!
        .toString()
        .lastIndexOf("_");
      const geog: string = ref
        .getMaintainableParentId()!
        .toString()
        .substring(
          geogIndex + 1,
          ref.getMaintainableParentId()!.toString().length
        );
      let geographyString: string = "geography=" + geog;
      if (geog === "NOGEOG") {
        geographyString = "";
      }
      const id: string = ref
        .getMaintainableParentId()!
        .toString()
        .substring(0, geogIndex);
      return nomis.retrieve(
        nomis.getServiceURL() +
        "/v01/dataset/" +
        id +
        ".structure.sdmx.xml?" +
        geographyString
      ).then(
        function (a: any) {
          a.getStructures()!
            .getDataStructures()!
            .getDataStructures()![0]
            .setId(ref.getMaintainableParentId());
          a.getStructures()!
            .getDataStructures()!
            .getDataStructures()![0]
            .setVersion(ref.getMaintainedParentVersion());
          nomis.load(a);
          console.log("returning structure");
          console.log(a);
          return nomis.local.findDataStructure(ref);
        }
      );
    }
  }

  public listDataflows(): Promise<Array<structure.Dataflow>> {
    const nomis = this;
    if (this.dataflowList != null) {
      const promise1 = new Promise<Array<structure.Dataflow>>(
        function (resolve: any, reject: any) {
          resolve(nomis.dataflowList);
        }.bind(this)
      );
      return promise1;
    } else {
      return nomis.retrieve("./nomis.xml").then(function (st: message.StructureType): Array<structure.Dataflow> {
        nomis.dataflowList = st.getStructures()?.getDataflows()?.getDataflowList();
        return nomis.dataflowList!;
      });
      /*
      
      
            const dfs: Array<structure.Dataflow> = [];
            const promise2: any = this.retrieve(
              this.serviceURL + "/v01/dataset/def.sdmx.xml"
            ).then(function(st: message.StructureType) {
              const packArray = [];
              const list: Array<structure.DataStructure> = st
                .getStructures()!
                .getDataStructures()!
                .getDataStructures()!;
              for (let i = 0; i < list.length; i++) {
                const dst: structure.DataStructure = list[i];
                const cubeId: string = structure.NameableType.toIDString(dst);
                const cubeName: string = dst.findName("en")!.getText();
                const url: string =
                  nomis.serviceURL + "/v01/dataset/" + cubeId + ".overview.xml";
                const pack = { cubeId: cubeId, cubeName: cubeName, url: url };
                packArray.push(pack);
              }
              return packArray;
            });
            return promise2
              .map(
                function(item:any, index:any, length:any) {
                  const pack = item;
                  return nomis.retrieve2(pack.url, pack).then(function(pack) {
                    const cubeId2: string = pack.cubeId;
                    const cubeName2: string = pack.cubeName;
                    const url2: string = pack.url;
                    const doc: string = pack.string;
                    const parsedDataflows = [];
                    try {
                      const geogList: Array<NOMISGeography> =nomis.parseGeography(
                        doc,
                        cubeId2,
                        cubeName2
                      );
                      for (let j = 0; j < geogList.length; j++) {
                        const dataFlow: structure.Dataflow = new structure.Dataflow();
                        dataFlow.setAgencyId(
                          new commonreferences.NestedNCNameID(nomis.agency)
                        );
                        dataFlow.setId(
                          new commonreferences.ID(
                            cubeId2 + "_" + geogList[j].getGeography()
                          )
                        );
                        const name: common.Name = new common.Name(
                          "en",
                          cubeName2 + " " + geogList[j].getGeographyName()
                        );
                        const names: Array<common.Name> = [];
                        names.push(name);
                        dataFlow.setNames(names);
                        const ref: commonreferences.Ref = new commonreferences.Ref();
                        ref.setAgencyId(
                          new commonreferences.NestedNCNameID(nomis.agency)
                        );
                        ref.setMaintainableParentId(dataFlow.getId());
                        ref.setMaintainableParentVersion(commonreferences.Version.ONE);
                        const reference = new commonreferences.Reference(ref, undefined);
                        dataFlow.setStructure(reference);
                        parsedDataflows.push(dataFlow);
                      }
                      if (geogList.length === 0) {
                        const dataFlow: structure.Dataflow = new structure.Dataflow();
                        dataFlow.setAgencyId(
                          new commonreferences.NestedNCNameID(nomis.agency)
                        );
                        dataFlow.setId(new commonreferences.ID(cubeId2 + "_NOGEOG"));
                        const name: common.Name = new common.Name("en", cubeName2);
                        const names: Array<common.Name> = [];
                        names.push(name);
                        dataFlow.setNames(names);
                        const ref: commonreferences.Ref = new commonreferences.Ref();
                        ref.setAgencyId(
                          new commonreferences.NestedNCNameID(nomis.agency)
                        );
                        ref.setMaintainableParentId(dataFlow.getId());
                        ref.setMaintainableParentVersion(commonreferences.Version.ONE);
                        const reference = new commonreferences.Reference(ref, undefined);
                        dataFlow.setStructure(reference);
                        parsedDataflows.push(dataFlow);
                      }
                    } catch (error) {}
                    return parsedDataflows;
                  });
                },
                { concurrency: 10 }
              )
              .delay(1300)
              .then(
                function(stuff:Array<Array<structure.Dataflow>>) {
                  // works with delay of 1000, put 1300 to be safe =D
                  const dfs = [];
                  for (let i = 0; i < stuff.length; i++) {
                    for (let j = 0; j < stuff[i].length; j++) {
                      dfs.push(stuff[i][j]);
                    }
                  }
                  nomis.dataflowList = dfs;
                  return dfs;
                }.bind(this)
              );*/
    }
  }

  public getServiceURL(): string {
    return this.serviceURL;
  }

  public parseGeography(
    doc: string,
    cubeId: string,
    cubeName: string
  ): Array<NOMISGeography> {
    const geogList: Array<NOMISGeography> = [];
    //const tagContent: string;
    //const lastLang: string;
    const xmlDoc = parseXml(doc);
    const dimNode = this.findNodeName(
      "Dimensions",
      xmlDoc.documentElement.childNodes
    );
    if (dimNode === null) {
      return geogList;
    }
    const dimsNode = this.searchNodeName("Dimension", dimNode.childNodes);
    if (dimsNode === null || dimsNode.length === 0) {
      return geogList;
    }
    let geogNode = null;
    for (let i = 0; i < dimsNode.length; i++) {
      if (dimsNode[i].getAttribute("concept") === "geography") {
        geogNode = dimsNode[i];
      }
    }
    if (geogNode === null) return geogList;
    const typesNode = this.findNodeName("Types", geogNode.childNodes);
    if (typesNode === null) return geogList;
    const typeArray = this.searchNodeName("Type", typesNode.childNodes);
    if (typeArray.length === 0) {
      return geogList;
    }
    for (let i = 0; i < typeArray.length; i++) {
      const ng: NOMISGeography = new NOMISGeography(
        typeArray[i].getAttribute("value"),
        typeArray[i].getAttribute("name"),
        cubeName,
        cubeId
      );
      geogList.push(ng);
    }
    return geogList;
  }

  recurseDomChildren(start: any, output: any) {
    let nodes;
    if (start.childNodes) {
      nodes = start.childNodes;
      this.loopNodeChildren(nodes, output);
    }
  }

  loopNodeChildren(nodes: Array<any>, output: any) {
    let node;
    for (let i = 0; i < nodes.length; i++) {
      node = nodes[i];
      if (output) {
        this.outputNode(node);
      }
      if (node.childNodes) {
        this.recurseDomChildren(node, output);
      }
    }
  }

  outputNode(node: any) {
    const whitespace = /^\s+$/g;
    if (node.nodeType === 1) {
      console.log("element: " + node.tagName);
    } else if (node.nodeType === 3) {
      // clear whitespace text nodes
      node.data = node.data.replace(whitespace, "");
      if (node.data) {
        // console.log('text: ' + node.data)
      }
    }
  }

  findNodeName(s: string, childNodes: any) {
    for (let i = 0; i < childNodes.length; i++) {
      const nn: string = childNodes[i].nodeName;
      // alert("looking for:"+s+": name="+childNodes[i].nodeName);
      if (nn.indexOf(s) === 0) {
        // alert("found node:"+s);
        return childNodes[i];
      }
    }
    return null;
  }

  searchNodeName(s: string, childNodes: any): Array<any> {
    const result: Array<any> = [];
    for (let i = 0; i < childNodes.length; i++) {
      const nn: string = childNodes[i].nodeName;
      // alert("looking for:"+s+": name="+childNodes[i].nodeName);
      if (nn.indexOf(s) === 0) {
        // alert("found node:"+s);
        result.push(childNodes[i]);
      }
    }
    if (result.length === 0) {
      // alert("cannot find any " + s + " in node");
    }
    return result;
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
  findItemType(item: commonreferences.Reference): Promise<structure.ItemType | undefined> {
    const promise = new Promise<structure.ItemType | undefined>(
      (resolve: (arg0: structure.ItemType | undefined) => void, reject: any) => {
        resolve(this.local.findItemType(item));
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
  ): Promise<Array<structure.DataStructure>|undefined >{
    return undefined;
  }
  searchDataflow(
    ref: commonreferences.Reference
  ): Promise<Array<structure.Dataflow>|undefined> {
    return undefined;
  }
  searchCodelist(
    ref: commonreferences.Reference
  ): Promise<Array<structure.Codelist>|undefined >{
    return undefined;
  }
  searchItemType(
    item: commonreferences.Reference
  ): Promise<Array<structure.ItemType>|undefined >{
    return undefined;
  }
  searchConcept(
    ref: commonreferences.Reference
  ): Promise<Array<structure.ConceptType>|undefined> {
    return undefined;
  }
  searchConceptScheme(
    ref: commonreferences.Reference
  ): Promise<Array<structure.ConceptSchemeType>|undefined>{
    return undefined;
  }*/
  getLocalRegistry(): interfaces.LocalRegistry {
    return this.local;
  }

  save(): any {
    // Do Nothing
  }
}

export default { NOMISRestServiceRegistry: NOMISRESTServiceRegistry };
