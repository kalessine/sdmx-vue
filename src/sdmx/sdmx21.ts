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
  const xmlDoc: XMLDocument = parseXml.parseFromString(s, "text/xml");
  return xmlDoc;
}

export class Sdmx21StructureSpecificDataReaderTools {
  private msg: message.DataMessage|undefined = undefined;
  private dw: data.FlatDataSetWriter = new data.FlatDataSetWriter();

  constructor(s: string) {
    // console.log("sdmx20 parsing data");
    const dom: any = parseXml(s);
    // console.log("sdmx20 creating DataMessage");
    this.msg = this.toDataMessage(dom.documentElement);
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
    header.setPrepared(new message.HeaderTimeType(prepDate!));
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
    const lang = node.getAttribute("xml:lang")!;
    const text = node.childNodes[0].nodeValue!;
    const name: common.Name = new common.Name(lang, text);
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
    return desc;
  }

  toTextType(node: Element): common.TextType {
    const lang = node.getAttribute("xml:lang")!;
    const text = node.childNodes[0].nodeValue!;
    const textType: common.TextType = new common.TextType(lang, text);
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
    }
  */
}
export class Sdmx21GenericDataReaderTools {
  private msg: message.DataMessage|undefined= undefined;
  private dw: data.FlatDataSetWriter = new data.FlatDataSetWriter();
  private dimensionAtObservation = "TIME_PERIOD";

  constructor(s: string) {
    // console.log("sdmx20 parsing data");
    const dom: any = parseXml(s);
    // console.log("sdmx20 creating DataMessage");
    this.msg = this.toDataMessage(dom.documentElement);
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
        const obsDimensionNode = this.findNodeName(
          "ObsDimension",
          obsArray[i].childNodes
        );
        this.dw.writeObservationComponent(
          this.dimensionAtObservation,
          obsDimensionNode.getAttribute("value")
        );
        const obsValueNode = this.findNodeName(
          "ObsValue",
          obsArray[i].childNodes
        );
        // "OBS_VALUE is hard coded into SDMX 2.1
        this.dw.writeObservationComponent(
          "OBS_VALUE",
          obsValueNode.getAttribute("value")
        );
        const attNode = this.findNodeName("Attributes", obsArray[i].childNodes);
        if (attNode !== null) {
          const attNodes = this.searchNodeName("Value", attNode.childNodes);
          for (let av = 0; av < attNodes.length; av++) {
            this.dw.writeObservationComponent(
              attNodes[av].getAttribute("id"),
              attNodes[av].getAttribute("value")
            );
          }
        }
        this.dw.finishObservation();
      }
    } else {
      for (let i = 0; i < series.length; i++) {
        this.dw.newSeries();
        const satts: Array<any> = series[i].attributes;
        const seriesKeysNode = this.findNodeName(
          "SeriesKey",
          series[i].childNodes
        );
        const keyNodes = this.searchNodeName(
          "Value",
          seriesKeysNode.childNodes
        );
        for (let av = 0; av < keyNodes.length; av++) {
          this.dw.writeSeriesComponent(
            keyNodes[av].getAttribute("id"),
            keyNodes[av].getAttribute("value")
          );
        }
        const obsArray: Array<any> = this.searchNodeName(
          "Obs",
          series[i].childNodes
        );
        for (let j = 0; j < obsArray.length; j++) {
          this.dw.newObservation();
          const obsDimensionNode = this.findNodeName(
            "ObsDimension",
            obsArray[j].childNodes
          );
          this.dw.writeObservationComponent(
            this.dimensionAtObservation,
            obsDimensionNode.getAttribute("value")
          );
          const obsValueNode = this.findNodeName(
            "ObsValue",
            obsArray[j].childNodes
          );
          // "OBS_VALUE is hard coded into SDMX 2.1
          this.dw.writeObservationComponent(
            "OBS_VALUE",
            obsValueNode.getAttribute("value")
          );
          const attNode = this.findNodeName(
            "Attributes",
            obsArray[j].childNodes
          );
          if (attNode !== null) {
            const attNodes = this.searchNodeName("Value", attNode.childNodes);
            for (let av = 0; av < attNodes.length; av++) {
              this.dw.writeObservationComponent(
                attNodes[av].getAttribute("id"),
                attNodes[av].getAttribute("value")
              );
            }
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
    const prepDate: xml.DateTime = xml.DateTime.fromString(prepared)!;
    header.setPrepared(new message.HeaderTimeType(prepDate));
    header.setSender(
      this.toSender(this.findNodeName("Sender", headerNode.childNodes))
    );
    header.setStructures([
      this.toStructure(this.findNodeName("Structure", headerNode.childNodes))
    ]);
    return header;
  }

  toStructure(structureNode: Element): common.PayloadStructureType {
    this.dimensionAtObservation = structureNode.getAttribute(
      "dimensionAtObservation"
    )!;
    const refNode = this.findNodeName("Ref", structureNode.childNodes);
    const ref: commonreferences.Ref = new commonreferences.Ref();
    ref.setMaintainableParentId(this.toID(refNode));
    ref.setAgencyId(this.toNestedNCNameID(refNode));
    ref.setVersion(this.toVersion(refNode));
    const reference: commonreferences.Reference = new commonreferences.Reference(
      ref,
      undefined
    );
    const payload: common.PayloadStructureType = new common.PayloadStructureType();
    payload.setStructure(reference);
    return payload;
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
    return desc;
  }

  toTextType(node: Element): common.TextType {
    const lang = node.getAttribute("xml:lang")!;
    const text = node.childNodes[0].nodeValue!;
    const textType: common.TextType = new common.TextType(lang, text);
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
    }
    */

  toID(node: Element): commonreferences.ID|undefined {
    if (node === null) return undefined;
    return new commonreferences.ID(node.getAttribute("id")!);
  }

  toMaintainableParentID(node: Element): commonreferences.ID |undefined{
    if (node === null) return undefined;
    return new commonreferences.ID(node.getAttribute("maintainableParentID")!);
  }

  toNestedID(node: Element): commonreferences.NestedID|undefined {
    if (node === null) return undefined;
    return new commonreferences.NestedID(node.getAttribute("id")!);
  }

  toNestedNCNameID(node: Element): commonreferences.NestedNCNameID |undefined {
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
}
export class Sdmx21StructureReaderTools {
  private registry: interfaces.LocalRegistry|undefined;
  private struct: message.StructureType;
  private currentKeyFamilyAgency: string |undefined = undefined;

  constructor(s: string, reg: interfaces.LocalRegistry|undefined) {
    this.registry = reg;
    const dom: any = parseXml(s);
    this.struct = this.toStructureType(dom.documentElement);
  }

  toStructureType(structureNode: Element): message.StructureType {
    this.struct = new message.StructureType();
    const structures: structure.Structures = new structure.Structures();
    this.struct.setStructures(structures);
    if (this.registry === undefined) {
      this.registry = this.struct;
    } else {
      this.registry = new registry.DoubleRegistry(this.registry!, this.struct);
    }
    let childNodes = structureNode.childNodes;
    this.struct.setHeader(
      this.toHeader(this.findNodeName("Header", childNodes))
    );
    const structuresNode: Element = this.findNodeName("Structures", childNodes);
    childNodes = structuresNode.childNodes;
    structures.setCodeLists(
      this.toCodelists(this.findNodeName("Codelists", childNodes))
    );
    structures.setConcepts(
      this.toConcepts(this.findNodeName("Concepts", childNodes))
    );
    structures.setDataStructures(
      this.toDataStructures(this.findNodeName("DataStructures", childNodes))
    );
    structures.setDataflows(
      this.toDataflows(this.findNodeName("Dataflows", childNodes))
    );
    return this.struct;
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
    const prepDate: xml.DateTime = xml.DateTime.fromString(prepared)!;
    header.setPrepared(new message.HeaderTimeType(prepDate));
    header.setSender(
      this.toSender(this.findNodeName("Sender", headerNode.childNodes))
    );
    const receivers = [];
    for (
      let i = 0;
      i < this.searchNodeName("Receiver", headerNode.childNodes).length;
      i++
    ) {
      receivers.push(
        this.toReceiver(
          this.searchNodeName("Receiver", headerNode.childNodes)[i]
        )
      );
    }
    header.setReceivers(receivers);
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

  toReceiver(receiverNode: Element): message.PartyType {
    // let sender: string = receiverNode.childNodes[0].nodeValue;
    const receiverType: message.PartyType = new message.PartyType();
    const senderId: string = receiverNode.getAttribute("id")!;
    const senderID: commonreferences.ID = new commonreferences.ID(senderId);
    receiverType.setId(senderID);
    return receiverType;
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

  toDataflows(dataflowsNode: Element): structure.DataflowList|undefined {
    if (dataflowsNode === null) return undefined;
    const dl: structure.DataflowList = new structure.DataflowList();
    const dfs = this.searchNodeName("Dataflow", dataflowsNode.childNodes);
    const dataflows = [];
    for (let i = 0; i < dfs.length; i++) {
      dataflows.push(this.toDataflow(dfs[i]));
    }
    dl.setDataflowList(dataflows);
    return dl;
  }

  toDataflow(dataflowNode: Element): structure.Dataflow {
    const df: structure.Dataflow = new structure.Dataflow();
    df.setNames(this.toNames(dataflowNode));
    df.setId(this.toID(dataflowNode));
    df.setAgencyId(this.toNestedNCNameID(dataflowNode));
    df.setVersion(this.toVersion(dataflowNode));
    const struct = this.findNodeName("Structure", dataflowNode.childNodes);
    const refNode = this.findNodeName("Ref", struct.childNodes);
    const ref: commonreferences.Ref = new commonreferences.Ref();
    ref.setAgencyId(this.toNestedNCNameID(refNode));
    ref.setMaintainableParentId(this.toID(refNode));
    ref.setMaintainableParentVersion(this.toVersion(refNode));
    const reference: commonreferences.Reference = new commonreferences.Reference(
      ref,
      undefined
    );
    df.setStructure(reference);
    return df;
  }

  toCodelists(codelistsNode: Element):structure.CodeLists|undefined {
    if (codelistsNode === null) return undefined;
    const codelists: structure.CodeLists = new structure.CodeLists();
    const codes = this.searchNodeName("Codelist", codelistsNode.childNodes);
    for (let i = 0; i < codes.length; i++) {
      codelists.getCodelists().push(this.toCodelist(codes[i]));
    }
    return codelists;
  }

  toID(node: Element): commonreferences.ID|undefined {
    if (node === undefined||node === null) return undefined;
    return new commonreferences.ID(node.getAttribute("id")!);
  }

  toMaintainableParentID(node: Element): commonreferences.ID|undefined {
    if (node === undefined||node===null) return undefined;
    return new commonreferences.ID(node.getAttribute("maintainableParentID")!);
  }

  toNestedID(node: Element): commonreferences.NestedID|undefined {
    if (node === null||node===undefined) return undefined;
    return new commonreferences.NestedID(node.getAttribute("id")!);
  }

  toNestedNCNameID(node: Element): commonreferences.NestedNCNameID|undefined {
    if (node === null||node===undefined) return undefined;
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
    cl.setId(this.toID(codelistNode));
    cl.setAgencyId(this.toNestedNCNameID(codelistNode));
    cl.setVersion(this.toVersion(codelistNode));
    const codeNodes = this.searchNodeName("Code", codelistNode.childNodes);
    for (let i = 0; i < codeNodes.length; i++) {
      cl.getItems().push(this.toCode(codeNodes[i]));
    }
    return cl;
  }

  toCode(codeNode: Element): structure.CodeType {
    const c: structure.CodeType = new structure.CodeType();
    c.setNames(this.toNames(codeNode));
    c.setDescriptions(this.toDescriptions(codeNode));
    c.setId(this.toID(codeNode));
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
    if (codeNode === null||codeNode===undefined) return undefined;
    const id = codeNode.getAttribute("value");
    return new commonreferences.ID(id!);
  }

  toConcepts(conceptsNode: Element):structure.Concepts|undefined {
    if (conceptsNode === null||conceptsNode===undefined) return undefined;
    const concepts: structure.Concepts = new structure.Concepts();
    this.struct.getStructures()!.setConcepts(concepts);
    const conNodes = this.searchNodeName(
      "ConceptScheme",
      conceptsNode.childNodes
    );
    const conceptSchemes:Array<structure.ConceptSchemeType> = [];
    for (let i = 0; i < conNodes.length; i++) {
      conceptSchemes.push(this.toConceptScheme(conNodes[i])!);
    }
    concepts.setConceptSchemes(conceptSchemes);
    return concepts;
  }

  toConceptScheme(conceptSchemeNode: Element):structure.ConceptSchemeType|undefined {
    if (conceptSchemeNode === null) return undefined;
    const cs: structure.ConceptSchemeType = new structure.ConceptSchemeType();
    cs.setNames(this.toNames(conceptSchemeNode));
    cs.setId(this.toID(conceptSchemeNode));
    cs.setAgencyId(this.toNestedNCNameID(conceptSchemeNode));
    cs.setVersion(this.toVersion(conceptSchemeNode));
    const conNodes = this.searchNodeName(
      "Concept",
      conceptSchemeNode.childNodes
    );
    const concepts = [];
    for (let i = 0; i < conNodes.length; i++) {
      cs.getItems().push(this.toConcept(conNodes[i]));
    }
    return cs;
  }

  toConcept(conceptNode: Element): structure.ConceptType {
    const c = new structure.ConceptType();
    c.setURN(new xml.AnyURI(conceptNode.getAttribute("urn")!));
    c.setId(this.toID(conceptNode));
    c.setNames(this.toNames(conceptNode));
    c.setDescriptions(this.toDescriptions(conceptNode));
    return c;
  }

  toDataStructures(dsNode: Element):structure.DataStructures|undefined {
    if (dsNode === null) return undefined;
    const dst: structure.DataStructures = new structure.DataStructures();
    const dsNodes = this.searchNodeName("DataStructure", dsNode.childNodes);
    for (let i = 0; i < dsNodes.length; i++) {
      dst.getDataStructures()!.push(this.toDataStructure(dsNodes[i]));
    }
    return dst;
  }

  toDataStructure(dsNode: Element): structure.DataStructure {
    const dst: structure.DataStructure = new structure.DataStructure();
    dst.setNames(this.toNames(dsNode));
    dst.setId(this.toID(dsNode));
    dst.setVersion(this.toVersion(dsNode));
    dst.setFinal(dsNode.getAttribute("isFinal") === "true");
    this.currentKeyFamilyAgency = dsNode.getAttribute("agencyID")!;
    dst.setAgencyId(this.toNestedNCNameID(dsNode));
    dst.setVersion(this.toVersion(dsNode));

    dst.setDataStructureComponents(
      this.toDataStructureComponents(
        this.findNodeName("DataStructureComponents", dsNode.childNodes)
      )
    );
    // this.recurseDomChildren(keyFamilyNode, true);
    return dst;
  }

  toDataStructureComponents(dsc: any): structure.DataStructureComponents|undefined {
    if (dsc === undefined||dsc===null) return undefined;
    const components: structure.DataStructureComponents = new structure.DataStructureComponents();
    const dimListNode = this.findNodeName("DimensionList", dsc.childNodes);
    const attListNode = this.findNodeName("AttributeList", dsc.childNodes);
    const measListNode = this.findNodeName("MeasureList", dsc.childNodes);
    if (dimListNode !== null) {
      components.setDimensionList(this.toDimensionList(dimListNode));
    }
    if (attListNode !== null) {
      components.setAttributeList(
        this.toAttributeList(
          this.searchNodeName("Attribute", attListNode.childNodes)
        )
      );
    }
    if (measListNode !== null) {
      components.setMeasureList(this.toMeasureList(measListNode));
    }
    return components;
  }

  toMeasureList(measListNode: Element): structure.MeasureList {
    const ml: structure.MeasureList = new structure.MeasureList();
    const pm: any = this.findNodeName(
      "PrimaryMeasure",
      measListNode.childNodes
    );
    const dim: structure.PrimaryMeasure = this.toPrimaryMeasure(pm);
    ml.setPrimaryMeasure(dim);
    return ml;
  }

  toDimensionList(dimListNode: Element): structure.DimensionList {
    const dimensionList = new structure.DimensionList();
    const dimList = this.searchNodeName("Dimension", dimListNode.childNodes);
    const dimensions = [];
    for (let i = 0; i < dimList.length; i++) {
      if (dimList[i].nodeName.indexOf("TimeDimension") === -1) {
        const dim = this.toDimension(dimList[i]);
        dimensions.push(dim);
      }
    }
    dimensionList.setDimensions(dimensions);
    const time = this.findNodeName("TimeDimension", dimListNode.childNodes);
    dimensionList.setTimeDimension(this.toTimeDimension(time));
    const meas = this.findNodeName("MeasureDimension", dimListNode.childNodes);
    if (meas !== null) {
      dimensionList.setMeasureDimension(this.toMeasureDimension(meas));
    }
    return dimensionList;
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

  toAttribute(dim: any): structure.Attribute {
    const dim2: structure.Attribute = new structure.Attribute();
    dim2.setId(this.toID(dim));
    dim2.setConceptIdentity(this.getConceptIdentity(dim));
    dim2.setLocalRepresentation(this.getLocalRepresentation(dim));
    return dim2;
  }

  toTimeDimension(dim: any): structure.TimeDimension {
    const dim2: structure.TimeDimension = new structure.TimeDimension();
    dim2.setId(this.toID(dim));
    dim2.setConceptIdentity(this.getConceptIdentity(dim));
    dim2.setLocalRepresentation(this.getLocalRepresentation(dim));
    return dim2;
  }

  toMeasureDimension(dim: any): structure.MeasureDimension {
    const dim2: structure.MeasureDimension = new structure.MeasureDimension();
    dim2.setId(this.toID(dim));
    dim2.setConceptIdentity(this.getConceptIdentity(dim));
    dim2.setLocalRepresentation(this.getLocalRepresentationCrossSectional(dim));
    return dim2;
  }

  toPrimaryMeasure(dim: any): structure.PrimaryMeasure {
    const dim2: structure.PrimaryMeasure = new structure.PrimaryMeasure();
    dim2.setId(this.toID(dim));
    dim2.setConceptIdentity(this.getConceptIdentity(dim));
    dim2.setLocalRepresentation(this.getLocalRepresentation(dim));
    return dim2;
  }

  getLocalRepresentation(dim: any): structure.RepresentationType {
    const localRepNode = this.findNodeName(
      "LocalRepresentation",
      dim.childNodes
    );
    const rep: structure.RepresentationType = new structure.RepresentationType();
    if (localRepNode === null) {
      return rep;
    }
    const enumeration = this.findNodeName(
      "Enumeration",
      localRepNode.childNodes
    );
    if (enumeration !== null) {
      const refNode = this.findNodeName("Ref", enumeration.childNodes);
      const ref: commonreferences.Ref = new commonreferences.Ref();
      ref.setMaintainableParentId(this.toID(refNode));
      ref.setAgencyId(this.toNestedNCNameID(refNode));
      ref.setVersion(this.toVersion(refNode));
      ref.setRefClass(commonreferences.ObjectTypeCodelistType.CODELIST);
      ref.setPackage(commonreferences.PackageTypeCodelistType.CODELIST);
      const reference: commonreferences.Reference = new commonreferences.Reference(
        ref,
        undefined
      );
      rep.setEnumeration(reference);
    }
    return rep;
  }

  getLocalRepresentationCrossSectional(
    dim: Element
  ): structure.RepresentationType {
    const localRepNode = this.findNodeName(
      "LocalRepresentation",
      dim.childNodes
    );
    const rep: structure.RepresentationType = new structure.RepresentationType();
    if (localRepNode === null) {
      return rep;
    }
    const enumeration = this.findNodeName(
      "Enumeration",
      localRepNode.childNodes
    );
    if (enumeration !== null) {
      const refNode = this.findNodeName("Ref", enumeration.childNodes);
      const ref: commonreferences.Ref = new commonreferences.Ref();
      ref.setMaintainableParentId(this.toID(refNode));
      ref.setAgencyId(this.toNestedNCNameID(refNode));
      ref.setVersion(this.toVersion(refNode));
      ref.setRefClass(commonreferences.ObjectTypeCodelistType.CONCEPTSCHEME);
      const reference: commonreferences.Reference = new commonreferences.Reference(
        ref,
        undefined
      );
      rep.setEnumeration(reference);
    }
    return rep;
  }

  getConceptIdentity(dim: any): commonreferences.Reference {
    const conceptIdentityNode = this.findNodeName(
      "ConceptIdentity",
      dim.childNodes
    );
    const refNode = this.findNodeName("Ref", conceptIdentityNode.childNodes);
    const ref: commonreferences.Ref = new commonreferences.Ref();
    ref.setMaintainableParentId(this.toMaintainableParentID(refNode));
    ref.setId(this.toID(refNode));
    ref.setAgencyId(this.toNestedNCNameID(refNode));
    ref.setMaintainableParentVersion(this.toVersion(refNode));
    const reference: commonreferences.Reference = new commonreferences.Reference(
      ref,
      undefined
    );
    return reference;
  }

  toDimension(dim: any): structure.Dimension {
    const dim2: structure.Dimension = new structure.Dimension();
    dim2.setPosition(parseInt(dim.getAttribute("position")));
    dim2.setId(this.toID(dim));
    dim2.setConceptIdentity(this.getConceptIdentity(dim));
    dim2.setLocalRepresentation(this.getLocalRepresentation(dim));
    return dim2;
  }

  public toTextFormatType(tft: any): structure.TextFormatType|undefined {
    if (tft === null||tft===undefined) {
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

  getStructureType(): message.StructureType {
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
    }
*/
}
export class Sdmx21StructureParser implements interfaces.SdmxParserProvider {
  getVersionIdentifier(): number {
    return 2.1;
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
        "http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message"
      ) !== -1
    ) {
      return true;
    } else return false;
  }

  isData(input: string): boolean {
    if (this.isStructureSpecificData(input)) {
      return true;
    } else if (this.isGenericData(input)) {
      return true;
    } else return false;
  }

  public isGenericData(input: string) {
    if (
      input.indexOf("GenericData") !== -1 &&
      input.indexOf(
        "http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message"
      ) !== -1
    ) {
      return true;
    } else return false;
  }

  public isStructureSpecificData(input: string) {
    if (
      input.indexOf("StructureSpecificData") !== -1 &&
      input.indexOf(
        "http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message"
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
  ): message.StructureType {
    const srt: Sdmx21StructureReaderTools = new Sdmx21StructureReaderTools(
      input,
      reg
    );
    return srt.getStructureType();
  }

  parseStructure(input: string): message.StructureType {
    const srt: Sdmx21StructureReaderTools = new Sdmx21StructureReaderTools(
      input,
      undefined
    );
    return srt.getStructureType();
  }

  parseData(input: string): message.DataMessage|undefined {
    if (this.isGenericData(input)) {
      const parser: Sdmx21GenericDataReaderTools = new Sdmx21GenericDataReaderTools(
        input
      );
      return parser.getDataMessage();
    } else if (this.isStructureSpecificData(input)) {
      const parser2: Sdmx21StructureSpecificDataReaderTools = new Sdmx21StructureSpecificDataReaderTools(
        input
      );
      return parser2.getDataMessage();
    }
  }
}
