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
import * as collections from "typescript-collections";
// import { Promise } from 'bluebird';

import * as interfaces from "../sdmx/interfaces";
import * as registry from "../sdmx/registry";
import * as structure from "../sdmx/structure";
import * as message from "../sdmx/message";
import * as commonreferences from "../sdmx/commonreferences";
import * as common from "../sdmx/common";
import * as data from "../sdmx/data";
import * as xml from "../sdmx/xml";
import * as Language from "../sdmx/language";
export function parseXml(s: string): XMLDocument {
  const parseXml: DOMParser = new DOMParser();
  const xmlDoc = parseXml.parseFromString(s, "text/xml");
  return xmlDoc;
}
export class Sdmx20DataReaderTools {
  private msg: message.DataMessage|undefined = undefined;
  private dw: data.FlatDataSetWriter = new data.FlatDataSetWriter();

  constructor(s: string) {
    // console.log("sdmx20 parsing data");
    const dom: any = parseXml(s);
    // console.log("sdmx20 creating DataMessage");
    this.msg = this.toDataMessage(
      this.findCompactDataNode(dom.documentElement)
    );
  }

  findCompactDataNode(node:any):any {
    if (
      node.nodeName.indexOf("CompactData") !== -1 &&
      node.nodeName !== "GetCompactDataResult" &&
      node.nodeName !== "GetCompactDataResponse"
    ) {
      return node;
    }
    let st = null;
    for (let i = 0; i < node.childNodes.length && st === null; i++) {
      st = this.findCompactDataNode(node.childNodes[i]);
      if (st !== null) {
        return st;
      }
    }
    return null;
  }

  getDataMessage(): message.DataMessage|undefined {
    return this.msg;
  }
  toDataMessage(dm: any): message.DataMessage {
    const msg: message.DataMessage = new message.DataMessage();
    const childNodes = dm.childNodes;
    msg.setHeader(this.toHeader(this.findNodeName("Header", childNodes)));
    const dss = this.toDataSets(this.searchNodeName("DataSet", childNodes));
    for (let i = 0; i < dss.length; i++) {
      msg.addDataSet(dss[i]);
    }
    return msg;
  }

  toDataSets(dm: Array<any>): Array<data.FlatDataSet> {
    const dss: Array<data.FlatDataSet> = [];
    for (let i = 0; i < dm.length; i++) {
      dss.push(this.toDataSet(dm[i].childNodes));
    }
    return dss;
  }

  toDataSet(ds: any): data.FlatDataSet {
    this.dw.newDataSet();
    const series: Array<any> = this.searchNodeName("Series", ds);
    if (series.length === 0) {
      const obsArray: Array<any> = this.searchNodeName("Obs", ds);
      for (let i = 0; i < obsArray.length; i++) {
        this.dw.newObservation();
        const atts = obsArray[i].attributes;
        for (let av = 0; av < atts.length; av++) {
          this.dw.writeObservationComponent(atts[av].nodeName, atts[av].value);
        }
        this.dw.finishObservation();
      }
    } else {
      for (let i = 0; i < series.length; i++) {
        this.dw.newSeries();
        const satts: Array<any> = series[i].attributes;
        for (let av = 0; av < satts.length; av++) {
          this.dw.writeSeriesComponent(satts[av].nodeName, satts[av].value);
        }
        const obsArray: Array<any> = this.searchNodeName(
          "Obs",
          series[i].childNodes
        );
        for (let j = 0; j < obsArray.length; j++) {
          this.dw.newObservation();
          const atts = obsArray[j].attributes;
          for (let av = 0; av < atts.length; av++) {
            this.dw.writeObservationComponent(
              atts[av].nodeName,
              atts[av].value
            );
          }
          this.dw.finishObservation();
        }
        this.dw.finishSeries();
      }
    }
    return this.dw.finishDataSet();
  }

  toHeader(headerNode: Element) {
    const header: message.Header = new message.Header();
    header.setId(
      this.findNodeName("ID", headerNode.childNodes).childNodes[0].nodeValue
    );
    const test: string = this.findNodeName("Test", headerNode.childNodes)
      .childNodes[0].nodeValue;
    header.setTest(test === "true");
    // truncated not in sdmx 2.1
    // let truncated:string= this.findNodeName("Truncated",headerNode.childNodes).childNodes[0].nodeValue;
    // header.setTruncated(truncated==="true");
    const prepared: string = this.findNodeName(
      "Prepared",
      headerNode.childNodes
    ).childNodes[0].nodeValue;
    const prepDate: xml.DateTime|undefined = xml.DateTime.fromString(prepared);
    header.setPrepared(new message.HeaderTimeType((prepDate!==undefined?prepDate:new xml.DateTime(new Date()))));
    header.setSender(
      this.toSender(this.findNodeName("Sender", headerNode.childNodes))
    );
    return header;
  }

  toSender(senderNode: Element): message.Sender {
    // let sender: string = senderNode.childNodes[0].nodeValue;
    const senderType: message.Sender = new message.Sender();
    const senderId: string|undefined = senderNode.getAttribute("id")!;
    const senderID: commonreferences.ID = new commonreferences.ID(senderId);
    senderType.setId(senderID);
    return senderType;
  }

  toNames(node: Element): Array<common.Name> {
    const names: Array<common.Name> = [];
    const senderNames = this.searchNodeName("Name", node.childNodes);
    for (let i = 0; i < senderNames.length; i++) {
      names.push(this.toName(senderNames[i]));
    }
    return names;
  }

  toName(node: Element): common.Name {
    const lang = node.getAttribute("xml:lang");
    const text = node.childNodes[0].nodeValue;
    const name: common.Name = new common.Name(lang!, text!);
    Language.Language.registerLanguage(lang!);
    return name;
  }

  toDescriptions(node: Element): Array<common.Description> {
    const names: Array<common.Description> = [];
    const senderNames = this.searchNodeName("Description", node.childNodes);
    for (let i = 0; i < senderNames.length; i++) {
      names.push(this.toDescription(senderNames[i]));
    }
    return names;
  }

  toDescription(node: Element): common.Description {
    const lang = node.getAttribute("xml:lang");
    const text = node.childNodes[0].nodeValue;
    const desc: common.Description = new common.Description(lang!, text!);
    Language.Language.registerLanguage(lang!);
    return desc;
  }

  toTextType(node: Element): common.TextType {
    const lang = node.getAttribute("xml:lang");
    const text = node.childNodes[0].nodeValue;
    const textType: common.TextType = new common.TextType(lang!, text!);
    Language.Language.registerLanguage(lang!);
    return textType;
  }

  toPartyType(node: Element): message.PartyType {
    const pt = new message.PartyType();
    return pt;
  }

  findNodeName(s: string, childNodes: any) {
    for (let i = 0; i < childNodes.length; i++) {
      const nn: string = childNodes[i].nodeName;
      // alert("looking for:"+s+": name="+childNodes[i].nodeName);
      if (nn.indexOf(s) !== -1) {
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
      if (nn.indexOf(s) !== -1) {
        // alert("found node:"+s);
        result.push(childNodes[i]);
      }
    }
    if (result.length === 0) {
      // alert("cannot find any " + s + " in node");
    }
    return result;
  }

  findTextNode(node: Element): string|undefined {
    if (node === null) return "";
    const childNodes = node.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      const nodeType = childNodes[i].nodeType;
      if (nodeType === 3) {
        return childNodes[i].nodeValue!;
      }
    }
    return "";
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
        // this.outputNode(node)
      }
      if (node.childNodes) {
        this.recurseDomChildren(node, output);
      }
    }
  }
  /*
  outputNode (node: Element) {
    const whitespace = /^\s+$/g
    if (node.nodeType === 1) {
      console.log('element: ' + node.tagName)
    } else if (node.nodeType === 3) {
      // clear whitespace text nodes
      node.data = node.data.replace(whitespace, '')
      if (node.data) {
        console.log('text: ' + node.data)
      }
    }
  } */
}
export class Sdmx20GenericDataReaderTools {
  private msg: message.DataMessage|undefined = undefined;
  private dw: data.FlatDataSetWriter = new data.FlatDataSetWriter();

  constructor(s: string) {
    // console.log("sdmx20 parsing data");
    const dom: any = parseXml(s);
    // console.log("sdmx20 creating DataMessage");
    this.msg = this.toDataMessage(
      this.findGenericDataNode(dom.documentElement)
    );
  }

  findGenericDataNode(node:any):any {
    if (
      node.nodeName.indexOf("GenericData") !== -1 &&
      node.nodeName !== "GetGenericDataResult" &&
      node.nodeName !== "GetGenericDataResponse"
    ) {
      return node;
    }
    let st = null;
    for (let i = 0; i < node.childNodes.length && st === null; i++) {
      st = this.findGenericDataNode(node.childNodes[i]);
      if (st !== null) {
        return st;
      }
    }
    return null;
  }

  getDataMessage(): message.DataMessage|undefined {
    return this.msg;
  }
  toDataMessage(dm: any): message.DataMessage {
    const msg: message.DataMessage = new message.DataMessage();
    const childNodes = dm.childNodes;
    msg.setHeader(this.toHeader(this.findNodeName("Header", childNodes)));
    const dss = this.toDataSets(this.searchNodeName("DataSet", childNodes));
    for (let i = 0; i < dss.length; i++) {
      msg.addDataSet(dss[i]);
    }
    return msg;
  }

  toDataSets(dm: Array<any>): Array<data.FlatDataSet> {
    const dss: Array<data.FlatDataSet> = [];
    for (let i = 0; i < dm.length; i++) {
      dss.push(this.toDataSet(dm[i].childNodes));
    }
    return dss;
  }

  toDataSet(ds: any): data.FlatDataSet {
    this.dw.newDataSet();
    const series: Array<any> = this.searchNodeName("Series", ds);
    if (series.length === 0) {
      const obsArray: Array<any> = this.searchNodeName("Obs", ds);
      for (let i = 0; i < obsArray.length; i++) {
        this.toObs(obsArray[i], this.dw);
      }
    } else {
      for (let i = 0; i < series.length; i++) {
        this.dw.newSeries();
        const seriesKey = this.findNodeName("SeriesKey", series[i].childNodes);
        const satts: Array<any> = this.searchNodeName(
          "Value",
          seriesKey.childNodes
        );
        for (let av = 0; av < satts.length; av++) {
          this.dw.writeSeriesComponent(
            satts[av].getAttribute("concept"),
            satts[av].getAttribute("value")
          );
        }
        const obsArray: Array<any> = this.searchNodeName(
          "Obs",
          series[i].childNodes
        );
        for (let i = 0; i < obsArray.length; i++) {
          this.toObs(obsArray[i], this.dw);
        }
        this.dw.finishSeries();
      }
    }
    return this.dw.finishDataSet();
  }

  toObs(obs: any, dw: data.FlatDataSetWriter) {
    dw.newObservation();
    const timeNode = this.findNodeName("Time", obs.childNodes);
    const valueNode = this.findNodeName("ObsValue", obs.childNodes);
    const attributesNode = this.findNodeName("Attributes", obs.childNodes);
    if (timeNode !== null) {
      dw.writeObservationComponent(
        "TIME_PERIOD",
        timeNode.childNodes[0].nodeValue
      );
    }
    if (valueNode !== null) {
      dw.writeObservationComponent(
        "OBS_VALUE",
        valueNode.getAttribute("value")
      );
    }
    if (attributesNode !== null) {
      const attributesArray = this.searchNodeName(
        "Value",
        attributesNode.childNodes
      );
      for (let i = 0; i < attributesArray.length; i++) {
        dw.writeObservationComponent(
          attributesArray[i].getAttribute("concept"),
          attributesArray[i].getAttribute("value")
        );
      }
    }
    dw.finishObservation();
  }

  toHeader(headerNode: Element) {
    const header: message.Header = new message.Header();
    header.setId(
      this.findNodeName("ID", headerNode.childNodes).childNodes[0].nodeValue
    );
    const test: string = this.findNodeName("Test", headerNode.childNodes)
      .childNodes[0].nodeValue;
    header.setTest(test === "true");
    // truncated not in sdmx 2.1
    // let truncated:string= this.findNodeName("Truncated",headerNode.childNodes).childNodes[0].nodeValue;
    // header.setTruncated(truncated==="true");
    const prepared: string = this.findNodeName(
      "Prepared",
      headerNode.childNodes
    ).childNodes[0].nodeValue;
    const prepDate: xml.DateTime|undefined = xml.DateTime.fromString(prepared);
    header.setPrepared(new message.HeaderTimeType(prepDate!==undefined?prepDate:new xml.DateTime(new Date())));
    header.setSender(
      this.toSender(this.findNodeName("Sender", headerNode.childNodes))
    );
    return header;
  }

  toSender(senderNode: Element): message.Sender {
    // let sender: string = senderNode.childNodes[0].nodeValue;
    const senderType: message.Sender = new message.Sender();
    const senderId: string = senderNode.getAttribute("id")!;
    const senderID: commonreferences.ID = new commonreferences.ID(senderId);
    senderType.setId(senderID);
    return senderType;
  }

  toNames(node: Element): Array<common.Name> {
    const names: Array<common.Name> = [];
    const senderNames = this.searchNodeName("Name", node.childNodes);
    for (let i = 0; i < senderNames.length; i++) {
      names.push(this.toName(senderNames[i]));
    }
    return names;
  }

  toName(node: Element): common.Name {
    const lang = node.getAttribute("xml:lang")!;
    const text = node.childNodes[0].nodeValue!;
    const name: common.Name = new common.Name(lang, text);
    Language.Language.registerLanguage(lang);
    return name;
  }

  toDescriptions(node: Element): Array<common.Description> {
    const names: Array<common.Description> = [];
    const senderNames = this.searchNodeName("Description", node.childNodes);
    for (let i = 0; i < senderNames.length; i++) {
      names.push(this.toDescription(senderNames[i]));
    }
    return names;
  }

  toDescription(node: Element): common.Description {
    const lang = node.getAttribute("xml:lang")!;
    const text = node.childNodes[0].nodeValue!;
    const desc: common.Description = new common.Description(lang, text);
    Language.Language.registerLanguage(lang);
    return desc;
  }

  toTextType(node: Element): common.TextType {
    const lang = node.getAttribute("xml:lang")!;
    const text = node.childNodes[0].nodeValue!;
    const textType: common.TextType = new common.TextType(lang, text);
    Language.Language.registerLanguage(lang);
    return textType;
  }

  toPartyType(node: Element): message.PartyType {
    const pt = new message.PartyType();
    return pt;
  }

  findNodeName(s: string, childNodes: any) {
    for (let i = 0; i < childNodes.length; i++) {
      const nn: string = childNodes[i].nodeName;
      // alert("looking for:"+s+": name="+childNodes[i].nodeName);
      if (nn.indexOf(s) !== -1) {
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
      if (nn.indexOf(s) !== -1) {
        // alert("found node:"+s);
        result.push(childNodes[i]);
      }
    }
    if (result.length === 0) {
      // alert("cannot find any " + s + " in node");
    }
    return result;
  }

  findTextNode(node: Element): string {
    if (node === null) return "";
    const childNodes = node.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      const nodeType = childNodes[i].nodeType;
      if (nodeType === 3) {
        return childNodes[i].nodeValue!;
      }
    }
    return "";
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
        // this.outputNode(node)
      }
      if (node.childNodes) {
        this.recurseDomChildren(node, output);
      }
    }
  }
  /*
  outputNode (node: Element) {
    const whitespace = /^\s+$/g
    if (node.nodeType === 1) {
      console.log('element: ' + node.tagName)
    } else if (node.nodeType === 3) {
      // clear whitespace text nodes
      node.data = node.data.replace(whitespace, '')
      if (node.data) {
        console.log('text: ' + node.data)
      }
    }
  } */
}
export class Sdmx20StructureReaderTools {
  private registry: interfaces.LocalRegistry|undefined = undefined;
  private struct: message.StructureType|undefined = undefined;
  private currentKeyFamilyAgency: string|undefined = undefined;

  constructor(s: string, reg: interfaces.LocalRegistry|undefined) {
    this.registry = reg;
    const dom: XMLDocument = parseXml(s);
    const node: Node = dom;
    const structNode: Element|undefined = this.findStructureNode(dom.documentElement);
    this.struct = this.toStructureType(structNode!);
  }

  findStructureNode(node: Element): Element|undefined {
    if (
      node.nodeName.indexOf("Structure") !== -1 &&
      node.nodeName !== "GetDataStructureDefinitionResult" &&
      node.nodeName !== "GetDataStructureDefinitionResponse"
    ) {
      return node;
    }
    let st = null;
    for (let i = 0; i < node.childNodes.length && st === null; i++) {
      st = this.findStructureNode(node.childNodes[i] as Element);
      if (st !== null) {
        return st;
      }
    }
    return undefined;
  }

  toStructureType(structureNode: Element): message.StructureType {
    this.struct = new message.StructureType();
    const structures = new structure.Structures();
    this.struct.setStructures(structures);
    if (this.registry === undefined) {
      this.registry = this.struct;
    } else {
      this.registry = new registry.DoubleRegistry(this.registry!, this.struct);
    }
    const childNodes = structureNode.childNodes;
    this.struct.setHeader(
      this.toHeader(this.findNodeName("Header", childNodes))!
    );
    structures.setCodeLists(
      this.toCodelists(this.findNodeName("CodeLists", childNodes))!
    );
    structures.setConcepts(
      this.toConcepts(this.findNodeName("Concepts", childNodes))!
    );
    structures.setDataStructures(
      this.toKeyFamilies(this.findNodeName("KeyFamilies", childNodes))!
    );
    structures.setDataflows(this.toDataflows(undefined));
    return this.struct;
  }

  toHeader(headerNode: Element) {
    if (headerNode === null) return null;
    const header: message.Header = new message.Header();
    header.setId(
      this.findNodeName("ID", headerNode.childNodes).childNodes[0].nodeValue
    );
    const test: string = this.findNodeName("Test", headerNode.childNodes)
      .childNodes[0].nodeValue;
    header.setTest(test === "true");
    // truncated not in sdmx 2.1
    // let truncated:string= this.findNodeName("Truncated",headerNode.childNodes).childNodes[0].nodeValue;
    // header.setTruncated(truncated==="true");
    const prepared: string = this.findNodeName(
      "Prepared",
      headerNode.childNodes
    ).childNodes[0].nodeValue;
    const prepDate: xml.DateTime|undefined = xml.DateTime.fromString(prepared);
    header.setPrepared(new message.HeaderTimeType(prepDate!==undefined?prepDate:new xml.DateTime(new Date())));
    header.setSender(
      this.toSender(this.findNodeName("Sender", headerNode.childNodes))!
    );
    return header;
  }

  toSender(senderNode: Element): message.Sender|undefined {
    if (senderNode === null || senderNode.childNodes === null) return undefined;
    // let sender: string = senderNode.childNodes[0].nodeValue;
    const senderType: message.Sender = new message.Sender();
    const senderId: string = senderNode.getAttribute("id")!;
    const senderID: commonreferences.ID = new commonreferences.ID(senderId);
    senderType.setId(senderID);
    return senderType;
  }

  toNames(node: Element): Array<common.Name> {
    const names: Array<common.Name> = [];
    const senderNames = this.searchNodeName("Name", node.childNodes);
    for (let i = 0; i < senderNames.length; i++) {
      names.push(this.toName(senderNames[i]));
    }
    return names;
  }

  toName(node: Element): common.Name {
    const lang = node.getAttribute("xml:lang")!;
    const text = node.childNodes[0].nodeValue!;
    const name: common.Name = new common.Name(lang, text);
    Language.Language.registerLanguage(lang);
    return name;
  }

  toDescriptions(node: Element): Array<common.Description> {
    const names: Array<common.Description> = [];
    const senderNames = this.searchNodeName("Description", node.childNodes);
    for (let i = 0; i < senderNames.length; i++) {
      names.push(this.toDescription(senderNames[i]));
    }
    return names;
  }

  toDescription(node: Element): common.Description {
    const lang = node.getAttribute("xml:lang")!;
    if (node.childNodes.length === 0) {
      // <structure:Description xml:lang="en" />
      return new common.Description(lang, "");
    }
    const text = node.childNodes[0].nodeValue!;
    const desc: common.Description = new common.Description(lang, text);
    Language.Language.registerLanguage(lang);
    return desc;
  }

  toCodeNames(node: Element): Array<common.Name> {
    const names: Array<common.Name> = [];
    const senderNames = this.searchNodeName("Description", node.childNodes);
    for (let i = 0; i < senderNames.length; i++) {
      names.push(this.toCodeName(senderNames[i]));
    }
    return names;
  }

  toCodeName(node: Element): common.Description {
    const lang = node.getAttribute("xml:lang")!;
    if (node.childNodes.length === 0) {
      // <structure:Description xml:lang="en" />
      return new common.Name(lang, "");
    }
    const text = node.childNodes[0].nodeValue!;
    const name: common.Name = new common.Name(lang, text);
    Language.Language.registerLanguage(lang);
    return name;
  }

  toTextType(node: Element): common.TextType {
    const lang = node.getAttribute("xml:lang")!;
    const text = node.childNodes[0].nodeValue!;
    const textType: common.TextType = new common.TextType(lang, text);
    Language.Language.registerLanguage(lang);
    return textType;
  }

  toPartyType(node: Element): message.PartyType {
    const pt = new message.PartyType();
    return pt;
  }

  toDataflows(dataflowsNode: Element|undefined): structure.DataflowList {
    const dl: structure.DataflowList = new structure.DataflowList();
    return dl;
  }

  toDataflow(dataflowNode: Element): structure.Dataflow {
    const df: structure.Dataflow = new structure.Dataflow();
    df.setNames(this.toNames(dataflowNode));
    df.setId(this.toID(dataflowNode)!);
    df.setAgencyId(this.toNestedNCNameID(dataflowNode)!);
    df.setVersion(this.toVersion(dataflowNode));
    return df;
  }

  toCodelists(codelistsNode: Element) {
    if (codelistsNode === null) return null;
    const codelists: structure.CodeLists = new structure.CodeLists();
    const codes = this.searchNodeName("CodeList", codelistsNode.childNodes);
    for (let i = 0; i < codes.length; i++) {
      codelists.getCodelists().push(this.toCodelist(codes[i]));
    }
    return codelists;
  }

  toID(node: Element): commonreferences.ID|undefined{
    if (node === null) return undefined;
    return new commonreferences.ID(node.getAttribute("id")!);
  }

  toNestedNCNameID(node: Element): commonreferences.NestedNCNameID|undefined {
    if (node === null) return undefined;
    return new commonreferences.NestedNCNameID(node.getAttribute("agencyID")!);
  }

  toVersion(node: Element): commonreferences.Version|undefined {
    if (node === null) return undefined;
    if (
      node.getAttribute("version") === "" ||
      node.getAttribute("version") === null
    ) {
      return commonreferences.Version.ONE;
    }
    return new commonreferences.Version(node.getAttribute("version")!);
  }

  toCodelist(codelistNode: Element) {
    const cl: structure.Codelist = new structure.Codelist();
    cl.setNames(this.toNames(codelistNode));
    cl.setId(this.toID(codelistNode)!);
    cl.setAgencyId(this.toNestedNCNameID(codelistNode)!);
    cl.setVersion(this.toVersion(codelistNode));
    const codeNodes = this.searchNodeName("Code", codelistNode.childNodes);
    for (let i = 0; i < codeNodes.length; i++) {
      cl.getItems().push(this.toCode(codeNodes[i]));
    }
    return cl;
  }

  toCode(codeNode: Element): structure.CodeType {
    const c: structure.CodeType = new structure.CodeType();
    // Codes in SDMX 2.1 have Names, not Descriptions.. here we change the
    // description to a name instead.
    // c.setDescriptions(this.toDescriptions(codeNode));
    c.setNames(this.toCodeNames(codeNode));
    c.setId(this.toValue(codeNode)!);
    if (codeNode.getAttribute("parentCode") !== null) {
      const ref: commonreferences.Ref = new commonreferences.Ref();
      ref.setId(new commonreferences.ID(codeNode.getAttribute("parentCode")!));
      const reference: commonreferences.Reference = new commonreferences.Reference(
        ref,
        undefined
      );
      c.setParent(reference);
    }
    return c;
  }

  getParentCode(codeNode: Element): commonreferences.ID|undefined {
    const id = codeNode.getAttribute("parentCode");
    if (id === undefined) {
      return undefined;
    } else {
      return new commonreferences.ID(id!);
    }
  }

  toValue(codeNode: Element): commonreferences.ID|undefined {
    if (codeNode === undefined) return undefined;
    const id = codeNode.getAttribute("value");
    return new commonreferences.ID(id!);
  }

  toConcepts(conceptsNode: Element) {
    if (conceptsNode === null) return null;
    const concepts: structure.Concepts = new structure.Concepts();
    this.struct!.getStructures()!.setConcepts(concepts);
    const csNodes = this.searchNodeName(
      "ConceptScheme",
      conceptsNode.childNodes
    );
    for (let i = 0; i < csNodes.length; i++) {
      concepts.getConceptSchemes().push(this.toConceptScheme(csNodes[i])!);
    }
    if (csNodes.length === 0) {
      const conNodes = this.searchNodeName("Concept", conceptsNode.childNodes);
      for (let i = 0; i < conNodes.length; i++) {
        const conceptScheme: structure.ConceptSchemeType|undefined = this.findStandaloneConceptScheme(
          this.toNestedNCNameID(conNodes[i])!
        );
        this.toConcept(conceptScheme!, conNodes[i]);
      }
    }
    return concepts;
  }

  findStandaloneConceptScheme(
    ag: commonreferences.NestedNCNameID
  ): structure.ConceptSchemeType|undefined {
    const ref: commonreferences.Ref = new commonreferences.Ref();
    ref.setAgencyId(ag);
    ref.setMaintainableParentId(
      new commonreferences.ID("STANDALONE_CONCEPT_SCHEME")
    );
    ref.setVersion(undefined);
    const reference: commonreferences.Reference = new commonreferences.Reference(
      ref,
      undefined
    );
    let cs: structure.ConceptSchemeType|undefined = this.struct!.findConceptScheme(
      reference
    );
    if (cs === undefined) {
      cs = new structure.ConceptSchemeType();
      cs.setAgencyId(ag);
      cs.setId(new commonreferences.ID("STANDALONE_CONCEPT_SCHEME"));
      cs.setVersion(commonreferences.Version.ONE);
      const name: common.Name = new common.Name(
        "en",
        "Standalone Concept Scheme"
      );
      cs.setNames([name]);
      this.struct!
        .getStructures()!
        .getConcepts()!
        .getConceptSchemes()
        .push(cs);
    }
    return cs;
  }

  toConceptScheme(conceptSchemeNode: Element) {
    if (conceptSchemeNode === undefined) return undefined;
    const cs: structure.ConceptSchemeType = new structure.ConceptSchemeType();
    cs.setNames(this.toNames(conceptSchemeNode));
    cs.setAgencyId(this.toNestedNCNameID(conceptSchemeNode)!);
    cs.setId(this.toID(conceptSchemeNode)!);
    cs.setVersion(this.toVersion(conceptSchemeNode));
    const conceptNodes = this.searchNodeName(
      "Concept",
      conceptSchemeNode.childNodes
    );
    for (let i = 0; i < conceptNodes.length; i++) {
      this.toConcept(cs, conceptNodes[i]);
    }
    return cs;
  }

  toConcept(conceptScheme: structure.ConceptSchemeType, conceptNode: Element) {
    if (conceptNode === undefined) {
      return undefined;
    }
    const con: structure.ConceptType = new structure.ConceptType();
    con.setNames(this.toNames(conceptNode));
    con.setDescriptions(this.toDescriptions(conceptNode));
    con.setId(this.toID(conceptNode)!);
    conceptScheme.getItems().push(con);
  }

  toKeyFamilies(keyFamiliesNode: Element) {
    if (keyFamiliesNode === null) return null;
    const dst: structure.DataStructures = new structure.DataStructures();
    const kfNodes = this.searchNodeName(
      "KeyFamily",
      keyFamiliesNode.childNodes
    );
    for (let i = 0; i < kfNodes.length; i++) {
      dst.getDataStructures()!.push(this.toDataStructure(kfNodes[i])!);
    }
    return dst;
  }

  toDataStructure(keyFamilyNode: Element): structure.DataStructure {
    const dst: structure.DataStructure = new structure.DataStructure();
    dst.setNames(this.toNames(keyFamilyNode));
    dst.setId(this.toID(keyFamilyNode)!);
    this.currentKeyFamilyAgency = keyFamilyNode.getAttribute("agencyID")!;
    dst.setAgencyId(this.toNestedNCNameID(keyFamilyNode)!);
    dst.setVersion(this.toVersion(keyFamilyNode));
    dst.setDataStructureComponents(
      this.toDataStructureComponents(
        this.findNodeName("Components", keyFamilyNode.childNodes)
      )!
    );
    // this.recurseDomChildren(keyFamilyNode, true);
    return dst;
  }

  toDataStructureComponents(dsc: any): structure.DataStructureComponents|undefined {
    if (dsc === null) return undefined;
    const components: structure.DataStructureComponents = new structure.DataStructureComponents();
    const dimensions = this.searchNodeName("Dimension", dsc.childNodes);
    const timedimension = this.findNodeName("TimeDimension", dsc.childNodes);
    // TimeDimension gets stuck in dimensions sometimes :)
    collections.arrays.remove(dimensions, timedimension);
    const primaryMeasure = this.findNodeName("PrimaryMeasure", dsc.childNodes);
    const attributes = this.searchNodeName("Attribute", dsc.childNodes);
    components.setDimensionList(this.toDimensionList(dimensions)!);
    if (timedimension !== null) {
      this.toTimeDimension(components, timedimension);
    }
    this.toPrimaryMeasure(components, primaryMeasure);
    components.setAttributeList(this.toAttributeList(attributes));
    /*
      for (let i: number = 0; i < dimensions.length; i++) {
          this.recurseDomChildren(dimensions[i].childNodes, true);
      }
      this.recurseDomChildren(timedimension.childNodes, true);
      this.recurseDomChildren(primaryMeasure.childNodes, true);
      for (let i: number = 0; i < attributes.length; i++) {
          this.recurseDomChildren(attributes[i].childNodes, true);
      }
      */
    return components;
  }

  toDimensionList(dims: Array<any>): structure.DimensionList|undefined {
    if (dims === null) {
      return undefined;
    }
    const dimList: structure.DimensionList = new structure.DimensionList();
    const dimArray: Array<structure.Dimension> = [];
    for (let i = 0; i < dims.length; i++) {
      if (dims[i].getAttribute("isMeasureDimension") === "true") {
        dimList.setMeasureDimension(this.toMeasureDimension(dims[i]));
      } else {
        // Sometimes Time Dimension seems to get mistakenly sucked
        // into this list too :(
        if (dims[i].nodeName.indexOf("TimeDimension") === -1) {
          dimArray.push(this.toDimension(dims[i]));
        }
      }
    }
    dimList.setDimensions(dimArray);
    return dimList;
  }

  toAttributeList(dims: Array<any>): structure.AttributeList {
    const dimList: structure.AttributeList = new structure.AttributeList();
    const dimArray: Array<structure.Attribute> = [];
    for (let i = 0; i < dims.length; i++) {
      dimArray.push(this.toAttribute(dims[i]));
    }
    dimList.setAttributes(dimArray);
    return dimList;
  }

  toTimeDimension(comps: structure.DataStructureComponents, dim: any) {
    const dim2: structure.TimeDimension = new structure.TimeDimension();
    const cs: structure.ConceptSchemeType = this.getConceptScheme(dim)!;
    const cl: structure.Codelist|undefined = this.getCodelist(dim);
    const con: structure.ConceptType|undefined = this.getConcept(cs!, dim);
    if (dim.getAttribute("conceptRef") !== null) {
      dim2.setId(new commonreferences.ID(dim.getAttribute("conceptRef")));
    }
    if (con !== null) {
      const ref: commonreferences.Ref = new commonreferences.Ref();
      ref.setAgencyId(cs.getAgencyId());
      ref.setMaintainableParentId(cs.getId());
      ref.setVersion(cs.getVersion());
      ref.setId(con!.getId());
      const reference: commonreferences.Reference = new commonreferences.Reference(
        ref,
        undefined
      );
      dim2.setConceptIdentity(reference);
    }
    if (cl !== null) {
      const ttf: structure.TextFormatType|undefined = this.toTextFormatType(
        this.findNodeName("TextFormat", dim.childNodes)
      );
      dim2.setLocalRepresentation(this.toLocalRepresentation(cl, ttf!));
    } else {
      const ttf: structure.TextFormatType|undefined = this.toTextFormatType(
        this.findNodeName("TextFormat", dim.childNodes)
      );
      dim2.setLocalRepresentation(this.toLocalRepresentation(undefined, ttf!));
    }
    comps.getDimensionList().setTimeDimension(dim2);
  }

  toPrimaryMeasure(comps: structure.DataStructureComponents, dim: any) {
    const dim2: structure.PrimaryMeasure = new structure.PrimaryMeasure();
    const cs: structure.ConceptSchemeType = this.getConceptScheme(dim)!;
    const cl: structure.Codelist|undefined = this.getCodelist(dim);
    const con: structure.ConceptType|undefined = this.getConcept(cs, dim);
    if (dim.getAttribute("conceptRef") !== null) {
      dim2.setId(new commonreferences.ID(dim.getAttribute("conceptRef")));
    }
    if (con !== undefined) {
      const ref: commonreferences.Ref = new commonreferences.Ref();
      ref.setAgencyId(cs.getAgencyId());
      ref.setMaintainableParentId(cs.getId());
      ref.setVersion(cs.getVersion());
      ref.setId(con!.getId());
      const reference: commonreferences.Reference = new commonreferences.Reference(
        ref,
        undefined
      );
      dim2.setConceptIdentity(reference);
    } else {
      alert(
        "con is null cs=" + JSON.stringify(cs) + "con=" + JSON.stringify(con)
      );
    }
    if (cl !== null) {
      const ttf: structure.TextFormatType|undefined = this.toTextFormatType(
        this.findNodeName("TextFormat", dim.childNodes)
      );
      dim2.setLocalRepresentation(this.toLocalRepresentation(cl, ttf!));
    } else {
      const ttf: structure.TextFormatType|undefined = this.toTextFormatType(
        this.findNodeName("TextFormat", dim.childNodes)
      );
      dim2.setLocalRepresentation(this.toLocalRepresentation(undefined, ttf!));
    }
    comps.getMeasureList().setPrimaryMeasure(dim2);
  }

  toDimension(dim: any): structure.Dimension {
    const dim2: structure.Dimension = new structure.Dimension();
    const cs: structure.ConceptSchemeType = this.getConceptScheme(dim)!;
    const cl: structure.Codelist|undefined = this.getCodelist(dim);
    const con: structure.ConceptType|undefined = this.getConcept(cs, dim);
    if (dim.getAttribute("conceptRef") !== null) {
      dim2.setId(new commonreferences.ID(dim.getAttribute("conceptRef")));
    }
    if (con !== undefined) {
      const ref: commonreferences.Ref = new commonreferences.Ref();
      ref.setAgencyId(cs.getAgencyId());
      ref.setMaintainableParentId(cs.getId());
      ref.setVersion(cs.getVersion());
      ref.setId(con!.getId());
      const reference: commonreferences.Reference = new commonreferences.Reference(
        ref,
        undefined
      );
      dim2.setConceptIdentity(reference);
    }
    if (cl !== null) {
      const ttf: structure.TextFormatType|undefined = this.toTextFormatType(
        this.findNodeName("TextFormat", dim.childNodes)
      );
      dim2.setLocalRepresentation(this.toLocalRepresentation(cl, ttf!));
    } else {
      const ttf: structure.TextFormatType|undefined = this.toTextFormatType(
        this.findNodeName("TextFormat", dim.childNodes)
      );
      dim2.setLocalRepresentation(this.toLocalRepresentation(undefined, ttf!));
    }
    return dim2;
  }

  toAttribute(dim: any): structure.Attribute {
    const dim2: structure.Attribute = new structure.Attribute();
    const cs: structure.ConceptSchemeType = this.getConceptScheme(dim)!;
    const cl: structure.Codelist|undefined = this.getCodelist(dim);
    const con: structure.ConceptType|undefined = this.getConcept(cs, dim);
    if (dim.getAttribute("conceptRef") !== null) {
      dim2.setId(new commonreferences.ID(dim.getAttribute("conceptRef")));
    }
    if (con !== undefined) {
      const ref: commonreferences.Ref = new commonreferences.Ref();
      ref.setAgencyId(cs.getAgencyId());
      ref.setMaintainableParentId(cs.getId());
      ref.setVersion(cs.getVersion());
      ref.setId(con.getId());
      const reference: commonreferences.Reference = new commonreferences.Reference(
        ref,
        undefined
      );
      dim2.setConceptIdentity(reference);
    }
    if (cl !== null) {
      const ttf: structure.TextFormatType|undefined = this.toTextFormatType(
        this.findNodeName("TextFormat", dim.childNodes)
      );
      dim2.setLocalRepresentation(this.toLocalRepresentation(cl, ttf!));
    } else {
      const ttf: structure.TextFormatType|undefined = this.toTextFormatType(
        this.findNodeName("TextFormat", dim.childNodes)
      );
      dim2.setLocalRepresentation(this.toLocalRepresentation(undefined, ttf!));
    }
    return dim2;
  }

  public toTextFormatType(tft: any): structure.TextFormatType|undefined {
    if (tft === null) {
      return undefined;
    }
    const tft2: structure.TextFormatType = new structure.TextFormatType();
    if (tft.getAttribute("decimals") !== null) {
      tft2.setDecimals(parseInt(tft.getAttribute("decimals")));
    }
    if (tft.getAttribute("endValue") !== null) {
      tft2.setEndValue(parseInt(tft.getAttribute("endValue")));
    }
    if (tft.getAttribute("isSequence") !== null) {
      tft2.setIsSequence(tft.getAttribute("isSequence") === "true");
      if (tft.getAttribute("interval") !== null) {
        tft2.setInterval(parseInt(tft.getAttribute("interval")));
      }
    }
    if (tft.getAttribute("maxLength") !== null) {
      tft2.setMaxLength(parseInt(tft.getAttribute("maxLength")));
    }
    if (tft.getAttribute("pattern") !== null) {
      tft2.setPattern(tft.getAttribute("pattern"));
    }
    if (tft.getAttribute("startValue")) {
      tft2.setStartValue(parseInt(tft.getAttribute("startValue")));
    }
    if (tft.getAttribute("textType") !== null) {
      tft2.setTextType(
        common.DataType.fromStringWithException(tft.getAttribute("textType"))
      );
    }
    if (tft.getAttribute("timeInterval") !== null) {
      // DO ME!!!!
      tft2.setTimeInterval(undefined);
    }
    return tft2;
  }

  toLocalRepresentation(
    codelist: structure.Codelist|undefined,
    ttf: structure.TextFormatType
  ): structure.RepresentationType {
    const lr2: structure.RepresentationType = new structure.RepresentationType();
    lr2.setTextFormat(ttf);
    if (codelist !== undefined) {
      const ref: commonreferences.Ref = new commonreferences.Ref();
      ref.setAgencyId(codelist!.getAgencyId());
      ref.setMaintainableParentId(codelist!.getId());
      ref.setVersion(codelist!.getVersion());
      const reference = new commonreferences.Reference(ref, undefined);
      reference.setPack(commonreferences.PackageTypeCodelistType.CODELIST);
      reference.setRefClass(commonreferences.ObjectTypeCodelistType.CODELIST);
      lr2.setEnumeration(reference);
    }
    return lr2;
  }

  toLocalRepresentationConceptScheme(
    conceptScheme: structure.ConceptSchemeType|undefined,
    ttf: structure.TextFormatType
  ): structure.RepresentationType {
    const lr2: structure.RepresentationType = new structure.RepresentationType();
    lr2.setTextFormat(ttf);
    if (conceptScheme !== undefined) {
      const ref: commonreferences.Ref = new commonreferences.Ref();
      ref.setAgencyId(conceptScheme!.getAgencyId());
      ref.setMaintainableParentId(conceptScheme!.getId());
      ref.setVersion(conceptScheme!.getVersion());
      const reference = new commonreferences.Reference(ref, undefined);
      reference.setPack(commonreferences.PackageTypeCodelistType.CONCEPTSCHEME);
      reference.setRefClass(
        commonreferences.ObjectTypeCodelistType.CONCEPTSCHEME
      );
      lr2.setEnumeration(reference);
    }
    return lr2;
  }

  getCodelist(dim: any): structure.Codelist|undefined {
    if (dim.getAttribute("codelist") === null) {
      return undefined;
    }
    let code: structure.Codelist|undefined = undefined;
    if (
      dim.getAttribute("codelistAgency") === null &&
      dim.getAttribute("codelistVersion") === null
    ) {
      // All we have is a codelist name
      const ref: commonreferences.Ref = new commonreferences.Ref();
      ref.setAgencyId(
        new commonreferences.NestedNCNameID(this.currentKeyFamilyAgency!)
      );
      ref.setMaintainableParentId(
        new commonreferences.ID(dim.getAttribute("codelist"))
      );
      ref.setVersion(undefined);
      const reference: commonreferences.Reference = new commonreferences.Reference(
        ref,
        undefined
      );
      code = this.registry!.findCodelist(reference);
    } else if (
      dim.getAttribute("codelistAgency") !== null &&
      dim.getAttribute("codelistVersion") !== null
    ) {
      const ref: commonreferences.Ref = new commonreferences.Ref();
      ref.setAgencyId(
        new commonreferences.NestedNCNameID(dim.getAttribute("codelistAgency"))
      );
      ref.setMaintainableParentId(
        new commonreferences.ID(dim.getAttribute("codelist"))
      );
      ref.setVersion(
        new commonreferences.Version(dim.getAttribute("codelistVersion"))
      );
      const reference: commonreferences.Reference = new commonreferences.Reference(
        ref,
        undefined
      );
      code = this.registry!.findCodelist(reference);
    } else if (
      dim.getAttribute("codelistAgency") !== null &&
      dim.getAttribute("codelistVersion") === null
    ) {
      const ref: commonreferences.Ref = new commonreferences.Ref();
      ref.setAgencyId(
        new commonreferences.NestedNCNameID(dim.getAttribute("codelistAgency"))
      );
      ref.setMaintainableParentId(
        new commonreferences.ID(dim.getAttribute("codelist"))
      );
      ref.setVersion(undefined);
      const reference: commonreferences.Reference = new commonreferences.Reference(
        ref,
        undefined
      );
      code = this.registry!.findCodelist(reference);
    }
    return code;
  }

  getConceptScheme(dim: any): structure.ConceptSchemeType|undefined {
    if (
      (dim.getAttribute("conceptSchemeAgency") !== null ||
        dim.getAttribute("conceptAgency") !== null) &&
      dim.getAttribute("conceptSchemeRef") !== null &&
      dim.getAttribute("conceptRef") !== null
    ) {
      const csa: commonreferences.NestedNCNameID = new commonreferences.NestedNCNameID(
        dim.getAttribute("conceptSchemeAgency") === null
          ? dim.getAttribute("conceptAgency")
          : dim.getAttribute("conceptSchemeAgency")
      );
      const csi: commonreferences.ID = new commonreferences.ID(
        dim.getAttribute("conceptSchemeRef")
      );
      const vers: commonreferences.Version|undefined =
        dim.getAttribute("conceptVersion") === undefined
          ? undefined
          : new commonreferences.Version(dim.getAttribute("conceptVersion"));
      const csref: commonreferences.Ref = new commonreferences.Ref();
      csref.setAgencyId(csa);
      csref.setMaintainableParentId(csi);
      csref.setVersion(vers);
      const reference: commonreferences.Reference = new commonreferences.Reference(
        csref,
        undefined
      );
      let cst: structure.ConceptSchemeType|undefined = undefined;
      cst = this.struct!.findConceptScheme(reference);
      if (cst !== null) return cst;
      cst = this.registry!.findConceptScheme(reference);
      if (cst !== null) return cst;
    } else if (
      dim.getAttribute("conceptSchemeRef") !== null &&
      dim.getAttribute("conceptRef") !== null
    ) {
      const csa: commonreferences.NestedNCNameID = new commonreferences.NestedNCNameID(
        this.currentKeyFamilyAgency!
      );
      const csi: commonreferences.ID = new commonreferences.ID(
        dim.getAttribute("conceptSchemeRef")
      );
      const vers: commonreferences.Version|undefined =
        dim.getAttribute("conceptVersion") === undefined
          ? undefined
          : new commonreferences.Version(dim.getAttribute("conceptVersion"));
      const csref: commonreferences.Ref = new commonreferences.Ref();
      csref.setAgencyId(csa);
      csref.setMaintainableParentId(csi);
      csref.setVersion(vers);
      const reference: commonreferences.Reference = new commonreferences.Reference(
        csref,
        undefined
      );
      let cst: structure.ConceptSchemeType|undefined = undefined;
      cst = this.struct!.findConceptScheme(reference);
      if (cst !== null) return cst;
      cst = this.registry!.findConceptScheme(reference);
      if (cst !== null) return cst;
    } else if (
      dim.getAttribute("conceptRef") !== null &&
      dim.getAttribute("conceptAgency") === null
    ) {
      const csa: commonreferences.NestedNCNameID = new commonreferences.NestedNCNameID(
        this.currentKeyFamilyAgency!
      );
      const csi: commonreferences.ID = new commonreferences.ID(
        "STANDALONE_CONCEPT_SCHEME"
      );
      const vers: commonreferences.Version|undefined =
        dim.getAttribute("conceptVersion") === undefined
          ? undefined
          : new commonreferences.Version(dim.getAttribute("conceptVersion"));
      const csref: commonreferences.Ref = new commonreferences.Ref();
      csref.setAgencyId(csa);
      csref.setMaintainableParentId(csi);
      csref.setVersion(vers);
      const reference: commonreferences.Reference = new commonreferences.Reference(
        csref,
        undefined
      );
      let cst: structure.ConceptSchemeType|undefined = undefined;
      cst = this.struct!.findConceptScheme(reference);
      if (cst !== undefined) {
        if (cst.findItemString(dim.getAttribute("conceptRef")) !== null) {
          return cst;
        } else {
          // alert("can't find concpetscheme in currentKeyfamilyAgency:STANDALONE CS");
        }
      }
      cst = this.registry!.findConceptScheme(reference);
      if (cst !== undefined) {
        if (cst.findItemString(dim.getAttribute("conceptRef")) !== null) {
          return cst;
        } else {
          // alert("can't find concpetscheme in registry:STANDALONE CS");
        }
      }

      //
      // This is a trick for ABS SDMX Documents, which have
      // a Primary Measure and all it has is a conceptRef of "OBS_VALUE"
      // this points to a Primary Measure Concept that belongs to the OECD Agency :(
      // this code looks through the structure's conceptschemes, and finds a concept
      // in the document that has the same ID as the conceptRef..
      // this is really all i can do with this situation :(
      const css = this.struct!
        .getStructures()!
        .getConcepts()!
        .getConceptSchemes();
      for (let i = 0; i < css.length; i++) {
        for (let j = 0; j < css[i].size(); j++) {
          const concept = css[i].getItem(j);
          if (concept.getId()!.equalsString(dim.getAttribute("conceptRef"))) {
            return css[i];
          }
        }
      }
      alert(
        "Can't find concept scheme for concept: " +
          dim.getAttribute("conceptRef")
      );
      return undefined;
    } else if (
      dim.getAttribute("conceptRef")() !== null &&
      dim.getAttribute("conceptAgency") !== null
    ) {
      const csa: commonreferences.NestedNCNameID = new commonreferences.NestedNCNameID(
        dim.getAttribute("conceptAgency")
      );
      const csi: commonreferences.ID = new commonreferences.ID(
        "STANDALONE_CONCEPT_SCHEME"
      );
      const ref: commonreferences.Ref = new commonreferences.Ref();
      ref.setAgencyId(csa);
      ref.setId(csi);
      ref.setVersion(commonreferences.Version.ONE);
      const ref2: commonreferences.Reference = new commonreferences.Reference(
        ref,
        undefined
      );
      let cst: structure.ConceptSchemeType|undefined = undefined;
      cst = this.struct!.findConceptScheme(ref2);
      if (cst !== null) return cst;
      cst = this.registry!.findConceptScheme(ref2);
      if (cst !== null) return cst;
    }
    if (dim.getAttribute("conceptRef") !== null) {
      //
      // This is a trick for ABS SDMX Documents, which have
      // a Primary Measure and all it has is a conceptRef of "OBS_VALUE"
      // this points to a Primary Measure Concept that belongs to the OECD Agency :(
      const css = this.struct!
        .getStructures()!
        .getConcepts()!
        .getConceptSchemes();
      for (let i = 0; i < css.length; i++) {
        for (let j = 0; j < css[i].size(); j++) {
          const concept = css[i].getItem(j);
          if (concept.getId()!.equalsString(dim.getAttribute("conceptRef"))) {
            return css[i];
          }
        }
      }
      alert(
        "Can't find concept scheme for concept: " +
          dim.getAttribute("conceptRef")
      );
      return undefined;
    }
    alert("Falling through getConceptScheme");
    return undefined;
  }

  getConcept(cs: structure.ConceptSchemeType, dim: any): structure.ConceptType|undefined {
    if (cs !== undefined) {
      const concept: structure.ConceptType = cs.findItemString(
        dim.getAttribute("conceptRef")
      )!;
      return concept;
    } else return undefined;
  }

  findConcept(conceptRef: string): structure.ConceptType|undefined {
    const csa: commonreferences.NestedNCNameID = new commonreferences.NestedNCNameID(
      this.currentKeyFamilyAgency!
    );
    const csi: commonreferences.ID = new commonreferences.ID(conceptRef);
    const ref: commonreferences.Ref = new commonreferences.Ref();
    ref.setAgencyId(csa);
    ref.setId(csi);
    const reference: commonreferences.Reference = new commonreferences.Reference(
      ref,
      undefined
    );
    const ct: structure.ConceptType|undefined = this.registry!.findConcept(reference);
    if (ct === undefined) {
      const ref2: commonreferences.Ref = new commonreferences.Ref();
      ref2.setId(csi);
      const reference2: commonreferences.Reference = new commonreferences.Reference(
        ref2,
        undefined
      );
      return this.registry!.findConcept(reference2);
    }
    return ct;
  }

  toMeasureDimension(dim: any): structure.MeasureDimension {
    const dim2: structure.MeasureDimension = new structure.MeasureDimension();
    const cs: structure.ConceptSchemeType = this.getConceptScheme(dim)!;
    const cl: structure.Codelist = this.getCodelist(dim)!;
    const con: structure.ConceptType|undefined = this.getConcept(cs, dim);
    if (dim.getAttribute("conceptRef") !== null) {
      dim2.setId(new commonreferences.ID(dim.getAttribute("conceptRef")));
    }
    if (con !== undefined) {
      const ref: commonreferences.Ref = new commonreferences.Ref();
      ref.setAgencyId(cs.getAgencyId());
      ref.setMaintainableParentId(cs.getId());
      ref.setVersion(cs.getVersion());
      ref.setId(con.getId());
      const reference: commonreferences.Reference = new commonreferences.Reference(
        ref,
        undefined
      );
      dim2.setConceptIdentity(reference);
    }
    // Sdmx 2.1 files have concept schemes
    // for cross sectional measures...
    const createdConceptScheme: structure.ConceptSchemeType = new structure.ConceptSchemeType();
    createdConceptScheme.setAgencyId(cl.getAgencyId());
    createdConceptScheme.setId(cl.getId());
    createdConceptScheme.setVersion(cl.getVersion());
    createdConceptScheme.setNames(cl.getNames());
    createdConceptScheme.setDescriptions(cl.getDescriptions());
    for (let i = 0; i < cl.size(); i++) {
      const code: structure.ItemType = cl.getItem(i);
      const concept: structure.ConceptType = new structure.ConceptType();
      concept.setId(code.getId());
      concept.setParent(code.getParent()!);
      concept.setURN(code.getURN());
      concept.setURI(code.getURI());
      concept.setNames(code.getNames());
      concept.setDescriptions(code.getDescriptions());
      // concept.setAnnotations(code.getAnnotations());
      createdConceptScheme.addItem(concept);
    }
    if (this.struct!.getStructures()!.getConcepts() === null) {
      this.struct!.getStructures()!.setConcepts(new structure.Concepts());
    }
    this.struct!
      .getStructures()!
      .getConcepts()!
      .getConceptSchemes()
      .push(createdConceptScheme);
    if (cl !== null) {
      const ttf: structure.TextFormatType|undefined = this.toTextFormatType(
        this.findNodeName("TextFormat", dim.childNodes)
      );
      dim2.setLocalRepresentation(
        this.toLocalRepresentationConceptScheme(cl, ttf!)
      );
    } else {
      const ttf: structure.TextFormatType|undefined = this.toTextFormatType(
        this.findNodeName("TextFormat", dim.childNodes)
      );
      dim2.setLocalRepresentation(this.toLocalRepresentation(undefined, ttf!));
    }
    return dim2;
  }

  getStructureType(): message.StructureType|undefined {
    return this.struct;
  }

  findNodeName(s: string, childNodes: any) {
    for (let i = 0; i < childNodes.length; i++) {
      const nn: string = childNodes[i].nodeName;
      // alert("looking for:"+s+": name="+childNodes[i].nodeName);
      if (nn.indexOf(s) !== -1) {
        // alert("found node:"+s);
        return childNodes[i];
      }
    }
    // console.log("can't find node:"+s);
    return null;
  }

  searchNodeName(s: string, childNodes: any): Array<any> {
    const result: Array<any> = [];
    for (let i = 0; i < childNodes.length; i++) {
      const nn: string = childNodes[i].nodeName;
      // alert("looking for:"+s+": name="+childNodes[i].nodeName);
      if (nn.indexOf(s) !== -1) {
        // alert("found node:"+s);
        result.push(childNodes[i]);
      }
    }
    if (result.length === 0) {
      // alert("cannot find any " + s + " in node");
      // console.log("can't search node:"+s);
    }
    return result;
  }

  findTextNode(node: Element): string|null {
    if (node === null) return "";
    const childNodes = node.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      const nodeType = childNodes[i].nodeType;
      if (nodeType === 3) {
        return childNodes[i].nodeValue;
      }
    }
    return "";
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
        // this.outputNode(node)
      }
      if (node.childNodes) {
        this.recurseDomChildren(node, output);
      }
    }
  }
  /*
  outputNode (node: Element) {
    const whitespace = /^\s+$/g
    if (node.nodeType === 1) {
      console.log('element: ' + node.tagName)
    } else if (node.nodeType === 3) {
      // clear whitespace text nodes
      node.data = node.data.replace(whitespace, '')
      if (node.data) {
        console.log('text: ' + node.data)
      }
    }
  } */
}

export class Sdmx20StructureParser implements interfaces.SdmxParserProvider {
  getVersionIdentifier(): number {
    return 2.0;
  }

  canParse(input: string): boolean {
    if (input === null) return false;
    if (this.isStructure(input)) return true;
    if (this.isData(input)) return true;
    return false;
  }

  isStructure(input: string): boolean {
    if (
      input.indexOf("Structure") !== -1 &&
      input.indexOf(
        "http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message"
      ) !== -1
    ) {
      return true;
    } else return false;
  }

  isData(input: string): boolean {
    if (
      input.indexOf("CompactData") !== -1 &&
      input.indexOf(
        "http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message"
      ) !== -1
    ) {
      return true;
    }
    if (
      input.indexOf("GenericData") !== -1 &&
      input.indexOf(
        "http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message"
      ) !== -1
    ) {
      return true;
    }
    if (
      input.indexOf("MessageGroup") !== -1 &&
      input.indexOf(
        "http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message"
      ) !== -1
    ) {
      return true;
    } else return false;
  }

  isMetadata(header: string): boolean {
    return false;
  }

  parseStructureWithRegistry(
    input: string,
    reg: interfaces.LocalRegistry
  ): message.StructureType|undefined {
    const srt: Sdmx20StructureReaderTools = new Sdmx20StructureReaderTools(
      input,
      reg
    );
    return srt.getStructureType();
  }

  parseStructure(input: string): message.StructureType|undefined {
    const srt: Sdmx20StructureReaderTools = new Sdmx20StructureReaderTools(
      input,
      undefined
    );
    return srt.getStructureType();
  }

  isCompactData(input: string) {
    if (
      input.indexOf("CompactData") !== -1 &&
      input.indexOf(
        "http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message"
      ) !== -1
    ) {
      return true;
    }
    return false;
  }

  isGenericData(input: string) {
    if (
      input.indexOf("GenericData") !== -1 &&
      input.indexOf(
        "http://www.SDMX.org/resources/SDMXML/schemas/v2_0/message"
      ) !== -1
    ) {
      return true;
    }
    return false;
  }

  parseData(input: string): message.DataMessage|undefined {
    if (this.isGenericData(input)) {
      const parser: Sdmx20GenericDataReaderTools = new Sdmx20GenericDataReaderTools(
        input
      );
      return parser.getDataMessage();
    } else {
      const parser2: Sdmx20DataReaderTools = new Sdmx20DataReaderTools(input);
      return parser2.getDataMessage();
    }
  }
}
