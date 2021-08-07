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
import * as message from "../sdmx/message";
import * as commonreferences from "../sdmx/commonreferences";
import * as common from "../sdmx/common";
import * as config from "../sdmx/config";
import * as xml from "../sdmx/xml";
import * as collections from "typescript-collections";
import * as Language from "../sdmx/language";
export class IdentifiableType extends common.AnnotableType {
  private id: commonreferences.ID|undefined = undefined;
  private urn: xml.AnyURI|undefined;
  private uri: xml.AnyURI|undefined;

  public getId(): commonreferences.ID|undefined {
    return this.id;
  }

  public getURN(): xml.AnyURI|undefined {
    return this.urn;
  }
  public getURI(): xml.AnyURI|undefined {
    return this.uri;
  }
  public setId(id: commonreferences.ID|undefined) {
    this.id = id;
  }

  public setURN(urn: xml.AnyURI|undefined) {
    this.urn = urn;
  }

  public setURI(uri: xml.AnyURI|undefined) {
    this.uri = uri;
  }

  public identifiesMeId(oid: commonreferences.ID): boolean {
    if(this.id === undefined ) return false;
    if (this.id.equalsID(oid)) return true;
    else return false;
  }

  public identifiesMeString(oid: string): boolean {
    if(this.id === undefined ) return false;
    if (this.id.equalsString(oid)) return true;
    else return false;
  }

  public identifiesMeNestedId(oid: commonreferences.NestedID): boolean {
    if(this.id === undefined ) return false;
    if (oid.equalsString(this.id.getString())) return true;
    else return false;
  }
}

export class NameableType extends IdentifiableType {
  private names: Array<common.Name> = [];
  private descriptions: Array<common.Description> = [];

  /**
   * @return the names
   */
  public getNames(): Array<common.Name> {
    return this.names;
  }

  /**
   * @param names the names to set
   */
  public setNames(names1: Array<common.Name>) {
    this.names = names1;
  }

  /**
   * @return the descriptions
   */
  public getDescriptions(): Array<common.Description> {
    return this.descriptions;
  }

  /**
   * @param descriptions the descriptions to set
   */
  public setDescriptions(descriptions: Array<common.Description>) {
    this.descriptions = descriptions;
  }

  public findName(lang: string): common.Name|undefined {
    if (this.names === undefined) {
      return undefined;
    }
    let def: common.Name|undefined = undefined;
    for (let i = 0; i < this.names.length; i++) {
      if (lang !== null && lang === this.names[i].getLang()) {
        return this.names[i];
      }
      if (this.names[i].getLang() === undefined) {
        def = this.names[i];
      }
    }
    if (def === null && lang !== "en") {
      def = this.findName("en");
    }
    return def;
  }

  public findDescription(lang: string): common.Description|undefined {
    if (this.descriptions === undefined) {
      return undefined;
    }
    let def: common.Description|undefined = undefined;
    for (let i = 0; i < this.descriptions.length; i++) {
      if (lang !== null && lang === this.descriptions[i].getLang()) {
        return this.descriptions[i];
      }
      if (this.descriptions[i].getLang() === undefined) {
        def = this.descriptions[i];
      }
    }
    if (def === null && lang !== "en") {
      def = this.findDescription("en");
    }
    return def;
  }

  public toString(): string {
    const loc: string = Language.Language.getLanguage();
    const name: common.Name|undefined = this.findName(loc);
    if (name !== undefined) {
      return config.SdmxConfig.truncateName(name.toString());
    }
    const desc: common.Description|undefined = this.findDescription(loc);
    if (desc !== undefined) {
      return config.SdmxConfig.truncateName(desc.getText());
    }
    return "NameableType";
  }

  public getName(): string {
    if (config.SdmxConfig.isSanitiseNames()) {
      return NameableType.sanitise(NameableType.toString(this));
    } else {
      return NameableType.toString(this);
    }
  }

  public static toString(named1: NameableType|string): string {
    const loc: string = Language.Language.getLanguage();
    if (named1 === undefined) {
      // console.log("Named is null");
      return "";
    }
    if( typeof(named1)=='string' ) return named1 as string;
    let named:NameableType = named1 as NameableType;
    if (named === undefined) return "";
    if ((named as NameableType).findDescription === undefined) {
      // Obviously not a NameableType :(
      return "";
    }
    const desc: common.Description|undefined = (named as NameableType).findDescription(loc);
    if (desc === undefined) {
      const name: common.Name|undefined = (named as NameableType).findName(loc);
      if (name === undefined) {
        return named.getId()!.toString();
      }
      return config.SdmxConfig.truncateName(name.getText());
    }
    return config.SdmxConfig.truncateName(desc.getText());
  }

  public static toStringWithLocale(named: NameableType|string, loc: string): string {
    // if (concept.equals("FREQ")) {
    //    ItemType code2 = getCode();
    //    System.out.println("FREQ Code=" + code2);
    // }
    if( typeof(named)==='string' ) return named;
    if (named === undefined) {
      return "";
    }
    const name: common.Name|undefined = named.findName(loc);
    if (name === undefined) {
      const desc: common.Description|undefined = named.findDescription(loc);
      if (desc === undefined) {
        return named.getId()!.toString();
      }
      return config.SdmxConfig.truncateName(desc.getText());
    }
    return config.SdmxConfig.truncateName(name.getText());
  }

  public static toIDString(named: NameableType|string): string {
    if (named!=undefined&&named instanceof NameableType) {
      return named.getId()!.toString();
    } else {
      if (named !== null) {
        return named;
      } else {
        return named as string;;
      }
    }
  }

  public static sanitise(s: string): string {
    if (s.indexOf("'") !== -1) {
      s = s.replace("'", "&apos;");
    }
    if (s.indexOf('"') !== -1) {
      s = s.replace('"', "&quot;");
    }
    return s;
  }
}
export class ItemType extends NameableType {
  private parent: commonreferences.Reference|undefined = undefined;
  private items: Array<ItemType> = new Array<ItemType>();

  get name() {
    return NameableType.toString(this);
  }

  /**
   * @return the parent
   */
  public getParent(): commonreferences.Reference|undefined {
    return this.parent;
  }

  /**
   * @param parent the parent to set
   */
  public setParent(parent: commonreferences.Reference) {
    this.parent = parent;
  }

  /**
   * @return the items
   */
  public getItems(): Array<ItemType> {
    return this.items;
  }

  /**
   * @param items the items to set
   */
  public setItems(items: Array<ItemType>) {
    this.items = items;
  }

  public getItem(i: number): ItemType {
    return this.items[i];
  }

  public setItem(i: number, it: ItemType) {
    this.items[i] = it;
  }

  public removeItem(it: ItemType) {
    collections.arrays.remove(this.items, it);
  }

  public addItem(it: ItemType) {
    this.items.push(it);
  }

  public size(): number {
    return this.items.length;
  }

  public findItemString(s: string): structure.ItemType|undefined {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].identifiesMeString(s)) return this.items[i];
    }
    return undefined;
  }

  public findItem(id: commonreferences.ID): ItemType|undefined {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].identifiesMeId(id)) return this.items[i];
    }
    return undefined;
  }
}

export class VersionableType extends NameableType {
  private version: commonreferences.Version|undefined = commonreferences.Version.ONE;
  private validFrom: xml.DateTime|undefined = undefined;
  private validTo: xml.DateTime|undefined = undefined;

  getVersion(): commonreferences.Version|undefined {
    return this.version;
  }

  /**
   * @param version the version to set
   */
  setVersion(version: commonreferences.Version|undefined) {
    this.version = version;
  }

  getValidFrom(): xml.DateTime|undefined {
    return this.validFrom;
  }

  setValidFrom(validFrom: xml.DateTime) {
    this.validFrom = validFrom;
  }

  public getValidTo(): xml.DateTime|undefined {
    return this.validTo;
  }

  setValidTo(validTo: xml.DateTime) {
    this.validTo = validTo;
  }
}
export class MaintainableType extends VersionableType {
  private agencyId: commonreferences.NestedNCNameID|undefined = undefined;
  private isfinal: boolean|undefined = undefined;
  private isexternalReference: boolean|undefined = undefined;
  private externalReferences: common.ExternalReferenceAttributeGroup|undefined = undefined;

  /**
   * @return the agencyID
   */
  public getAgencyId(): commonreferences.NestedNCNameID|undefined {
    return this.agencyId;
  }

  setAgencyId(agencyID: commonreferences.NestedNCNameID|undefined) {
    this.agencyId = agencyID;
  }

  isFinal(): boolean|undefined {
    return this.isfinal;
  }

  setFinal(isFinal: boolean|undefined) {
    this.isfinal = isFinal;
  }

  isExternalReference(): boolean|undefined {
    return this.isexternalReference;
  }

  setExternalReference(isExternalReference: boolean|undefined) {
    this.isexternalReference = isExternalReference;
  }

  public getExternalReferences(): common.ExternalReferenceAttributeGroup|undefined {
    return this.externalReferences;
  }

  setExternalReferences(
    externalReferences: common.ExternalReferenceAttributeGroup|undefined
  ) {
    this.externalReferences = externalReferences;
  }

  identifiesMeStrings(agency2: string, id2: string, vers2: string): boolean {
    return this.identifiesMe(
      new commonreferences.NestedNCNameID(agency2),
      new commonreferences.ID(id2),
      new commonreferences.Version(vers2)
    );
  }

  identifiesMe(
    agency2: commonreferences.NestedNCNameID,
    id2: commonreferences.NestedID,
    vers2: commonreferences.Version|undefined
  ): boolean {
    /*
     * I honestly dont know why i always end up in this function debugging...
     * next time i look here.. check in the parser api that the objects are being created properly
     * :D
     * JG
     */
    // System.out.println("Left=" + this.agencyID + "." + this.getId() + "." + this.getVersion());
    // System.out.println("Right=" + agency2 + "." + id2 + "." + vers2);
    // console.log("myAg:" + this.getAgencyId().toString() + " compare:" + agency2.toString());
    // console.log(this.getId().toString());
    // console.log("myId:" + this.getId().toString() + " compare:" + id2.toString());
    // if (this.getVersion()!==null&&vers2!==null){
    // console.log("myv:" + this.getVersion() + " compare:" + vers2.toString());
    // }
    if(this.agencyId===undefined) return false;
    if(this.getId()===undefined) return false;

    if(this.getVersion()===undefined) return false;


    if (vers2 === undefined || this.getVersion() === null) {
      if (
        this.agencyId.equalsNestedNCNameID(agency2) &&
        this.getId()!.equalsNestedID(id2)
      ) {
        // console.log("Identifies me1");
        return true;
      } else {
        // console.log("Doesn't Identify me2");
        // System.out.println("Doesn't Match!!");
        return false;
      }
    } else {
      if (
        this.agencyId.equalsNestedNCNameID(agency2) &&
        this.getId()!.equalsNestedID(id2) &&
        this.getVersion()!.equalsVersion(vers2)
      ) {
        // console.log("Identifies me3");
        return true;
      } else {
        // console.log("Doesn't Identify me4");
        return false;
      }
    }
  }

  identifiesMeURI(uri: xml.AnyURI): boolean {
    const ref: commonreferences.Reference = new commonreferences.Reference(
      undefined,
      uri
    );
    return this.identifiesMe(
      ref.getAgencyId()!,
      ref.getMaintainableParentId()!,
      ref.getVersion()!
    );
  }

  asReference(): commonreferences.Reference {
    const ref: commonreferences.Ref = new commonreferences.Ref();
    ref.setAgencyId(this.agencyId);
    ref.setMaintainableParentId(this.getId());
    ref.setMaintainableParentVersion(this.getVersion());
    const reference: commonreferences.Reference = new commonreferences.Reference(
      ref,
      this.getURI()
    );
    return reference;
  }
}
export class ItemSchemeType extends MaintainableType {
  private items: Array<ItemType> = new Array<ItemType>();
  private partial = false;

  /**
   * @return the items
   */
  public getItems(): Array<ItemType> {
    return this.items;
  }

  /**
   * @param items the items to set
   */
  public setItems(itms: Array<ItemType>) {
    this.items = itms;
  }

  /**
   * @return the partial
   */
  public isPartial(): boolean {
    return this.partial;
  }

  /**
   * @param partial the partial to set
   */
  public setPartial(partial: boolean) {
    this.partial = partial;
  }

  public getItem(i: number): ItemType {
    return this.items[i];
  }

  public setItem(i: number, it: ItemType) {
    this.items[i] = it;
  }

  public removeItem(it: ItemType) {
    this.items.splice(this.items.indexOf(it), 1);
  }

  public addItem(it: ItemType) {
    this.items.push(it);
  }

  public size(): number {
    return this.items.length;
  }

  public findItemString(s: string): ItemType|undefined {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].identifiesMeString(s)) return this.items[i];
    }
    return undefined;
  }

  public findItemId(s: commonreferences.ID): ItemType|undefined {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].identifiesMeId(s)) return this.items[i];
    }
    return undefined;
  }

  public findItemNestedId(s: commonreferences.NestedID): ItemType |undefined{
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].identifiesMeNestedId(s)) return this.items[i];
    }
    return undefined;
  }

  public findSubItemsString(s: string|undefined): Array<ItemType> {
    if (s === undefined) {
      return this.findSubItemsId(undefined);
    }
    return this.findSubItemsId(new commonreferences.ID(s));
  }

  public findSubItemsId(id: commonreferences.ID|undefined): Array<ItemType> {
    const result: Array<ItemType> = new Array<ItemType>();
    if (id === undefined) {
      for (let i = 0; i < this.items.length; i++) {
        const item: ItemType = this.items[i];
        if (item.getParent() === undefined) {
          result.push(item);
        }
      }
      return result;
    } else {
      for (let i = 0; i < this.items.length; i++) {
        const item: ItemType = this.items[i];
        if (
          item.getParent() !== null &&
          item.getParent()!.getId() !== null &&
          item
            .getParent()!
            .getId()!
            .equalsID(id)
        ) {
          result.push(item);
        }
      }
      return result;
    }
  }

  public isFlat() {
    for (let i = 0; i < this.size(); i++) {
      if (
        this.items[i].getParent() !== undefined &&
        this.items[i].getParent()!.getId() !== null
      ) {
        return false;
      } else {
        // console.log(this.items[i].getParent());
      }
    }
    return true;
  }

  public getLevel(s: string): number {
    if (s === null) return 0;
    const id: commonreferences.ID = new commonreferences.ID(s);
    let itm: structure.ItemType|undefined = this.findItemId(id);
    let i = 1;
    for (; i < 30 && itm!.getParent() !== null; i++) {
      itm = this.findItemString(
        itm!
          .getParent()!
          .getId()!
          .toString()
      );
    }
    return i;
  }

  public getItemsOnLevel(n: number): Array<ItemType> {
    const result = [];
    for (let i = 0; i < this.size(); i++) {
      if (this.getLevel(this.items[i].getId()!.toString()) === n) {
        result.push(this.items[i]);
      }
    }
    return result;
  }

  public getMaximumLevel(): number {
    let max = 0;
    for (let i = 0; i < this.size(); i++) {
      if (this.getLevel(this.items[i].getId()!.toString()) > max) {
        max = this.getLevel(this.items[i].getId()!.toString());
      }
    }
    return max;
  }
}

export class CodeType extends ItemType {}
export class Codelist extends ItemSchemeType {}
export class ConceptSchemeType extends ItemSchemeType {}
export class ConceptType extends ItemType {}
export class StructureUsageType extends MaintainableType {
  private structure: commonreferences.Reference|undefined = undefined;

  public getStructure(): commonreferences.Reference|undefined {
    return this.structure;
  }

  public setStructure(struct: commonreferences.Reference|undefined) {
    this.structure = struct;
  }
}

export class Dataflow extends StructureUsageType {
  public asReference() {
    const ref: commonreferences.Ref = new commonreferences.Ref();
    ref.setAgencyId(this.getAgencyId());
    ref.setId(this.getId());
    ref.setVersion(this.getVersion());
    const reference: commonreferences.Reference = new commonreferences.Reference(
      ref,
      undefined
    );
    return reference;
  }
}
export class DataflowList {
  private dataflowList: Array<Dataflow> = [];
  public getDataflowList() {
    return this.dataflowList;
  }

  public setDataflowList(dl: Array<Dataflow>) {
    this.dataflowList = dl;
  }

  public findDataflow(ref: commonreferences.Reference): Dataflow|undefined {
    for (let i = 0; i < this.dataflowList.length; i++) {
      if (
        this.dataflowList[i].identifiesMe(
          ref.getAgencyId()!,
          ref.getMaintainableParentId()!,
          ref.getMaintainedParentVersion()!
        )
      ) {
        return this.dataflowList[i];
      }
    }
    return undefined;
  }
}
export class Component extends IdentifiableType {
  private conceptIdentity: commonreferences.Reference|undefined = undefined;
  private localRepresentation: RepresentationType|undefined = undefined;

  public getId(): commonreferences.ID|undefined {
    if (super.getId() === undefined) {
      if (this.conceptIdentity === undefined) {
        // alert("Concept Identity Null:LocalRep:" + JSON.stringify(this.localRepresentation));
        // Thread.dumpStack();
        return new commonreferences.ID("MISS");
      }
      return new commonreferences.ID(this.conceptIdentity!.getId()!.toString());
    }
    return super.getId();
  }

  public getConceptIdentity() {
    return this.conceptIdentity;
  }

  public setConceptIdentity(ci: commonreferences.Reference) {
    this.conceptIdentity = ci;
  }

  public getLocalRepresentation() {
    return this.localRepresentation;
  }

  public setLocalRepresentation(lr: RepresentationType) {
    this.localRepresentation = lr;
  }
}
export class ComponentUtil {
  public static getRepresentation(
    reg: interfaces.LocalRegistry,
    c: Component
  ): RepresentationType|undefined {
    const rep: RepresentationType|undefined = c.getLocalRepresentation();
    if (rep === undefined) {
      const concept: ConceptType|undefined = reg.findConcept(c.getConceptIdentity()!);
      //return concept!.getCoreRepresentation()!;
      return undefined;
    }
    return c.getLocalRepresentation();
  }

  public static getLocalRepresentation(c: Component): RepresentationType|undefined {
    if (c === null) return undefined;
    return c.getLocalRepresentation();
  }
}
export class Dimension extends Component {
  private position = 0;
  public getPosition() {
    return this.position;
  }

  public setPosition(i: number) {
    this.position = i;
  }
}
export class TimeDimension extends Component {}
export class MeasureDimension extends Component {}

export class Attribute extends Component {}
export class PrimaryMeasure extends Component {}
export class DimensionList {
  private dimensions: Array<Dimension> = [];
  private timeDimension: TimeDimension|undefined = undefined;
  private measureDimension: MeasureDimension|undefined = undefined;
  public getDimensions(): Array<Dimension> {
    return this.dimensions;
  }
  public setDimensions(dims: Array<Dimension>) {
    this.dimensions = dims;
  }

  public getMeasureDimension(): MeasureDimension|undefined {
    return this.measureDimension;
  }
  public setMeasureDimension(md: MeasureDimension|undefined) {
    this.measureDimension = md;
  }

  public getTimeDimension(): TimeDimension|undefined {
    return this.timeDimension;
  }

  public setTimeDimension(td: TimeDimension) {
    this.timeDimension = td;
  }
}
export class AttributeList {
  private attributes: Array<Attribute> = [];
  public getAttributes(): Array<Attribute> {
    return this.attributes;
  }
  public setAttributes(at: Array<Attribute>) {
    this.attributes = at;
  }
}
export class MeasureList {
  private primaryMeasure: PrimaryMeasure|undefined = undefined;
  public getPrimaryMeasure(): PrimaryMeasure|undefined {
    return this.primaryMeasure;
  }
  public setPrimaryMeasure(pm: PrimaryMeasure) {
    this.primaryMeasure = pm;
  }
}
export class DataStructureComponents {
  private dimensionList: DimensionList = new DimensionList();
  private measureList: MeasureList = new MeasureList();
  private attributeList: AttributeList = new AttributeList();
  public getDimensionList(): DimensionList {
    return this.dimensionList;
  }

  public setDimensionList(dl: DimensionList) {
    this.dimensionList = dl;
  }

  public getMeasureList(): MeasureList {
    return this.measureList;
  }

  public setMeasureList(ml: MeasureList) {
    this.measureList = ml;
  }

  public getAttributeList(): AttributeList {
    return this.attributeList;
  }

  public setAttributeList(al: AttributeList) {
    this.attributeList = al;
  }
}
export class DataStructure extends MaintainableType {
  private components: DataStructureComponents|undefined = undefined;

  public getDataStructureComponents(): DataStructureComponents|undefined {
    return this.components;
  }

  public setDataStructureComponents(components: DataStructureComponents|undefined) {
    this.components = components;
  }

  public dump() {
    for (
      let i = 0;
      i < this.components!.getDimensionList().getDimensions().length;
      i++
    ) {
      const dim1: Dimension = this.components!
        .getDimensionList()
        .getDimensions()[i];
      console.log(
        "Dim:" +
          i +
          ":" +
          dim1.getId() +
          ": ci ref:agency" +
          dim1.getConceptIdentity()!.getAgencyId() +
          ":mid" +
          dim1.getConceptIdentity()!.getMaintainableParentId() +
          +"id:" +
          dim1.getConceptIdentity()!.getId() +
          ":v:" +
          dim1.getConceptIdentity()!.getVersion()
      );
      if (dim1.getLocalRepresentation()!.getEnumeration() !== null) {
        console.log(
          "Dim:" +
            i +
            "enum ref:agency" +
            dim1
              .getLocalRepresentation()!
              .getEnumeration()!
              .getAgencyId() +
            ":mid" +
            dim1
              .getLocalRepresentation()!
              .getEnumeration()!
              .getMaintainableParentId() +
            ":" +
            dim1
              .getLocalRepresentation()!
              .getEnumeration()!
              .getId() +
            ":v:" +
            dim1
              .getLocalRepresentation()!
              .getEnumeration()!
              .getVersion()
        );
      }
    }
    const dim2: Component = this.components!
      .getDimensionList()
      .getMeasureDimension()!;
    if (dim2 !== null) {
      console.log(
        "Dim:measure:" +
          dim2.getId() +
          ": ci ref:agency" +
          dim2.getConceptIdentity()!.getAgencyId() +
          ":mid" +
          dim2.getConceptIdentity()!.getMaintainableParentId() +
          "id:" +
          dim2.getConceptIdentity()!.getId() +
          ":v:" +
          dim2.getConceptIdentity()!.getVersion()
      );
      if (dim2.getLocalRepresentation()!.getEnumeration() !== null) {
        console.log(
          "Dim:" +
            "pm" +
            "enum ref:agency" +
            dim2
              .getLocalRepresentation()!
              .getEnumeration()!
              .getAgencyId() +
            ":mid" +
            dim2
              .getLocalRepresentation()!
              .getEnumeration()!
              .getMaintainableParentId() +
            ":" +
            dim2
              .getLocalRepresentation()!
              .getEnumeration()!
              .getId() +
            ":v:" +
            dim2
              .getLocalRepresentation()!
              .getEnumeration()!
              .getVersion()
        );
      }
    }
    const dim3: Component = this.components!
      .getDimensionList()
      .getTimeDimension()!;
    if (dim3 !== null) {
      console.log(
        "Dim:time:" +
          dim3.getId() +
          ": ci ref:agency" +
          dim3.getConceptIdentity()!.getAgencyId() +
          ":mid" +
          dim3.getConceptIdentity()!.getMaintainableParentId() +
          "id:" +
          dim3.getConceptIdentity()!.getId() +
          ":v:" +
          dim3.getConceptIdentity()!.getVersion()
      );
      if (dim3.getLocalRepresentation()!.getEnumeration() !== null) {
        console.log(
          "Dim:" +
            "time" +
            "enum ref:agency" +
            dim3
              .getLocalRepresentation()!
              .getEnumeration()!
              .getAgencyId() +
            ":mid" +
            dim3
              .getLocalRepresentation()!
              .getEnumeration()!
              .getMaintainableParentId() +
            ":" +
            dim3
              .getLocalRepresentation()!
              .getEnumeration()!
              .getId() +
            ":v:" +
            dim3
              .getLocalRepresentation()!
              .getEnumeration()!
              .getVersion()
        );
      }
    }
    const dim: Component = this.components!.getMeasureList().getPrimaryMeasure()!;
    if (dim !== null) {
      console.log(
        "Dim:pm:" +
          dim.getId() +
          ": ci ref:agency" +
          dim.getConceptIdentity()!.getAgencyId() +
          ":mid" +
          dim.getConceptIdentity()!.getMaintainableParentId() +
          "id:" +
          dim.getConceptIdentity()!.getId() +
          ":v:" +
          dim.getConceptIdentity()!.getVersion()
      );
      if (dim.getLocalRepresentation()!.getEnumeration() !== null) {
        console.log(
          "Dim:" +
            "pm" +
            "enum ref:agency" +
            dim
              .getLocalRepresentation()!
              .getEnumeration()!
              .getAgencyId() +
            ":mid" +
            dim
              .getLocalRepresentation()!
              .getEnumeration()!
              .getMaintainableParentId() +
            ":" +
            dim
              .getLocalRepresentation()!
              .getEnumeration()!
              .getId() +
            ":v:" +
            dim
              .getLocalRepresentation()!
              .getEnumeration()!
              .getVersion()
        );
      }
    }
    for (
      let i = 0;
      i < this.components!.getAttributeList().getAttributes().length;
      i++
    ) {
      const dim: Component = this.components!.getAttributeList().getAttributes()[
        i
      ];
      console.log(
        "Att:" +
          i +
          ":" +
          dim.getId() +
          ": ci ref:agency" +
          dim.getConceptIdentity()!.getAgencyId() +
          ":mid" +
          dim.getConceptIdentity()!.getMaintainableParentId() +
          "id:" +
          dim.getConceptIdentity()!.getId() +
          ":v:" +
          dim.getConceptIdentity()!.getVersion()
      );
      if (dim.getLocalRepresentation()!.getEnumeration() !== null) {
        console.log(
          "Att:" +
            i +
            "enum ref:agency" +
            dim
              .getLocalRepresentation()!
              .getEnumeration()!
              .getAgencyId() +
            ":mid" +
            dim
              .getLocalRepresentation()!
              .getEnumeration()!
              .getMaintainableParentId() +
            ":" +
            dim
              .getLocalRepresentation()!
              .getEnumeration()!
              .getId() +
            ":v:" +
            dim
              .getLocalRepresentation()!
              .getEnumeration()!
              .getVersion()
        );
      }
    }
  }

  public findComponentString(col: string): Component|undefined {
    return this.findComponent(new commonreferences.ID(col));
  }

  public findComponent(col: commonreferences.ID): Component|undefined {
    for (
      let i = 0;
      i < this.components!.getDimensionList().getDimensions().length;
      i++
    ) {
      const dim:Dimension = this.components!.getDimensionList().getDimensions()[i];
      if (dim.getId()!.equalsID(col)) {
        return dim;
      }
    }
    for (
      let i = 0;
      i < this.components!.getAttributeList().getAttributes().length;
      i++
    ) {
      const dim2:Attribute = this.components!.getAttributeList().getAttributes()[i]!;
      if (dim2.getId()!.equalsID(col)) {
        return dim2;
      }
    }
    if (this.components!.getDimensionList().getMeasureDimension() !== undefined) {
      const dim3:MeasureDimension= this.components!.getDimensionList().getMeasureDimension()!;
      if (dim3.getId()!.equalsID(col)) {
        return dim3;
      }
    }
    const time: TimeDimension = this.components!
      .getDimensionList()
      .getTimeDimension()!;
    if (time !== undefined && time.getId()!.equalsID(col)) {
      return time;
    }
    const dim2: PrimaryMeasure = this.components!
      .getMeasureList()
      .getPrimaryMeasure()!;
    if (dim2.getId()!.equalsID(col)) {
      return dim2;
    }
    if (col.getString() === "OBS_VALUE") {
      return dim2;
    }
    return undefined;
  }

  public asReference(): commonreferences.Reference {
    const ref: commonreferences.Ref = new commonreferences.Ref();
    ref.setAgencyId(this.getAgencyId());
    ref.setMaintainableParentId(this.getId());
    ref.setVersion(this.getVersion());
    const reference: commonreferences.Reference = new commonreferences.Reference(
      ref,
      undefined
    );
    return reference;
  }

  public asDataflow(): Dataflow {
    const dataFlow: Dataflow = new Dataflow();
    dataFlow.setNames(this.getNames());
    dataFlow.setDescriptions(this.getDescriptions());
    dataFlow.setStructure(this.asReference());
    dataFlow.setAnnotations(this.getAnnotations());
    dataFlow.setAgencyId(this.getAgencyId());
    dataFlow.setId(this.getId());
    dataFlow.setVersion(this.getVersion());
    return dataFlow;
  }

  public isDimension(s: string): boolean {
    for (
      let i = 0;
      i <
      this.getDataStructureComponents()!
        .getDimensionList()
        .getDimensions().length;
      i++
    ) {
      const d: Dimension = this.getDataStructureComponents()!
        .getDimensionList()
        .getDimensions()[i];
      if (s === d.getId()!.toString()) {
        return true;
      }
    }
    if (
      s ===
      this.getDataStructureComponents()!
        .getDimensionList()
        .getTimeDimension()!
        .getId()!
        .toString()
    ) {
      return true;
    }
    return false;
  }

  public isTimeDimension(s: string): boolean {
    if (
      s ===
      this.getDataStructureComponents()!
        .getDimensionList()
        .getTimeDimension()!
        .getId()!
        .toString()
    ) {
      return true;
    }
    return false;
  }

  public isAttribute(s: string): boolean {
    for (
      let i = 0;
      i <
      this.getDataStructureComponents()!
        .getAttributeList()
        .getAttributes().length;
      i++
    ) {
      if (
        s ===
        this.getDataStructureComponents()!
          .getAttributeList()
          .getAttributes()
          [i].getId()!
          .toString()
      ) {
        return true;
      }
    }
    return false;
  }

  public isPrimaryMeasure(s: string): boolean {
    if (s === "OBS_VALUE") {
      return true;
    }
    if (
      this.getDataStructureComponents()!
        .getMeasureList()
        .getPrimaryMeasure()!
        .getId()!
        .toString() === s
    ) {
      return true;
    }
    return false;
  }

  public getKeyPosition(s: string): number {
    let i = 0;
    for (
      let j = 0;
      j <
      this.getDataStructureComponents()!
        .getDimensionList()
        .getDimensions().length;
      i++
    ) {
      if (
        this.getDataStructureComponents()!
          .getDimensionList()
          .getDimensions()
          [i].getId()!
          .equalsString(s)
      ) {
        return i;
      }
      i++;
    }
    if (
      s ===
      this.getDataStructureComponents()!
        .getDimensionList()
        .getTimeDimension()!
        .getId()!
        .toString()
    ) {
      return i;
    }
    throw new Error(
      "Dimension " +
        s +
        " not found in DataStructure:" +
        this.getId()!.toString()
    );
  }
}

export class CodeLists {
  private codelists: Array<Codelist> = [];

  /**
   * @return the codelists
   */
  getCodelists(): Array<Codelist> {
    return this.codelists;
  }

  /**
   * @param codelists the codelists to set
   */
  setCodelists(cls: Array<Codelist>) {
    this.codelists = cls;
  }

  findCodelistStrings(agency: string, id: string, vers: string): Codelist|undefined {
    const findid: commonreferences.ID = new commonreferences.ID(id);
    const ag: commonreferences.NestedNCNameID = new commonreferences.NestedNCNameID(
      agency
    );
    const ver: commonreferences.Version|undefined =
      vers === undefined ? undefined : new commonreferences.Version(vers);
    return this.findCodelist(ag, findid, ver);
  }

  findCodelist(
    agency2: commonreferences.NestedNCNameID,
    findid: commonreferences.NestedID,
    ver: commonreferences.Version|undefined
  ): Codelist |undefined{
    for (let i = 0; i < this.codelists.length; i++) {
      const cl2: Codelist = this.codelists[i];
      if (cl2.identifiesMe(agency2, findid, ver)) {
        return cl2;
      }
    }
    return undefined;
  }

  findCodelistURI(uri: xml.AnyURI): Codelist|undefined {
    for (let i = 0; i < this.codelists.length; i++) {
      if (this.codelists[i].identifiesMeURI(uri)) {
        return this.codelists[i];
      }
    }
    return undefined;
  }

  /*
   * This method is used in sdmx 2.0 parsing to find a codelist with the correct ID..
   * this is because the Dimension in the KeyFamily does not contain a complete reference
   * only an ID.. we lookup the Codelist by it's ID, when we find a match, we can make a
   * LocalItemSchemeReference out of it with it's AgencyID and Version.
   */
  findCodelistById(id: commonreferences.NestedID): Codelist|undefined {
    let cl: Codelist|undefined = undefined;
    for (let i = 0; i < this.codelists.length; i++) {
      if (this.codelists[i].identifiesMeId(new commonreferences.ID(id.toString()))) {
        if (cl === undefined) cl = this.codelists[i];
        else {
          const j: number = cl
            .getVersion()!
            .compareTo(this.codelists[i].getVersion()!);
          switch (j) {
            case -1: // Less
              break;
            case 0: // Equal
              break;
            case 1:
              // Our found conceptscheme has a greater version number.
              cl = this.codelists[i];
              break;
          }
        }
      }
    }
    return cl;
  }

  findCodelistReference(ref: commonreferences.Reference): Codelist|undefined{
    return this.findCodelist(
      ref.getAgencyId()!,
      ref.getMaintainableParentId()!,
      ref.getVersion()
    );
  }

  merge(codelists: CodeLists) {
    if (codelists === null) return;
    for (let i = 0; i < codelists.getCodelists().length; i++) {
      this.codelists.push(codelists.getCodelists()[i]);
    }
  }
}
export class Concepts {
  private concepts: Array<ConceptSchemeType> = [];

  /**
   * @return the codelists
   */
  getConceptSchemes(): Array<ConceptSchemeType> {
    return this.concepts;
  }

  /**
   * @param codelists the codelists to set
   */
  setConceptSchemes(cls: Array<ConceptSchemeType>) {
    this.concepts = cls;
  }

  findConceptSchemeStrings(
    agency: string,
    id: string,
    vers: string
  ): ConceptSchemeType|undefined {
    const findid: commonreferences.ID = new commonreferences.ID(id);
    const ag: commonreferences.NestedNCNameID = new commonreferences.NestedNCNameID(
      agency
    );
    const ver: commonreferences.Version|undefined =
      vers === undefined ? undefined : new commonreferences.Version(vers);
    return this.findConceptScheme(ag, findid, ver);
  }

  findConceptScheme(
    agency2: commonreferences.NestedNCNameID,
    findid: commonreferences.NestedID,
    ver: commonreferences.Version|undefined
  ): ConceptSchemeType|undefined {
    for (let i = 0; i < this.concepts.length; i++) {
      const cl2: ConceptSchemeType = this.concepts[i];
      if (cl2.identifiesMe(agency2, findid, ver)) {
        return cl2;
      }
    }
    return undefined;
  }

  findConceptSchemeURI(uri: xml.AnyURI): ConceptSchemeType |undefined{
    for (let i = 0; i < this.concepts.length; i++) {
      if (this.concepts[i].identifiesMeURI(uri)) {
        return this.concepts[i];
      }
    }
    return undefined;
  }

  /*
   * This method is used in sdmx 2.0 parsing to find a codelist with the correct ID..
   * this is because the Dimension in the KeyFamily does not contain a complete reference
   * only an ID.. we lookup the Codelist by it's ID, when we find a match, we can make a
   * LocalItemSchemeReference out of it with it's AgencyID and Version.
   */
  findConceptSchemeById(id: commonreferences.NestedID): ConceptSchemeType|undefined {
    let cl: ConceptSchemeType|undefined = undefined;
    for (let i = 0; i < this.concepts.length; i++) {
      if (this.concepts[i].identifiesMeId(new commonreferences.ID(id.toString()))) {
        if (cl === undefined) cl = this.concepts[i];
        else {
          const j: number = cl
            .getVersion()!
            .compareTo(this.concepts[i].getVersion()!);
          switch (j) {
            case -1: // Less
              break;
            case 0: // Equal
              break;
            case 1:
              // Our found conceptscheme has a greater version number.
              cl = this.concepts[i];
              break;
          }
        }
      }
    }
    return cl;
  }

  findConceptSchemeReference(
    ref: commonreferences.Reference
  ): ConceptSchemeType|undefined {
    if (ref === null) {
      return undefined;
    } else {
      const cs: ConceptSchemeType|undefined = this.findConceptScheme(
        ref.getAgencyId()!,
        ref.getMaintainableParentId()!,
        ref.getVersion()
      );
      if (cs === undefined) {
        return undefined;
      }
      return cs;
    }
  }

  merge(conceptsType: Concepts) {
    if (conceptsType === null) {
      return;
    }
    for (let i = 0; i < conceptsType.getConceptSchemes().length; i++) {
      this.concepts.push(conceptsType.getConceptSchemes()[i]);
    }
  }
}
export class DataStructures {
  private datastructures: Array<DataStructure>|undefined = [];

  /**
   * @return the codelists
   */
  getDataStructures(): Array<DataStructure>|undefined {
    return this.datastructures;
  }

  /**
   * @param codelists the codelists to set
   */
  setDataStructures(cls: Array<DataStructure>|undefined) {
    this.datastructures = cls;
  }

  findDataStructureStrings(
    agency: string,
    id: string,
    vers: string
  ): DataStructure|undefined {
    const findid: commonreferences.ID = new commonreferences.ID(id);
    const ag: commonreferences.NestedNCNameID = new commonreferences.NestedNCNameID(
      agency
    );
    const ver: commonreferences.Version|undefined =
      vers === undefined ? undefined : new commonreferences.Version(vers);
    return this.findDataStructure(ag, findid, ver);
  }

  findDataStructure(
    agency2: commonreferences.NestedNCNameID,
    findid: commonreferences.NestedID,
    ver: commonreferences.Version|undefined
  ): DataStructure|undefined {
    for (let i = 0; i < this.datastructures!.length; i++) {
      const cl2: DataStructure = this.datastructures![i];
      if (cl2.identifiesMe(agency2, findid, ver)) {
        return cl2;
      }
    }
    return undefined;
  }

  findDataStructureURI(uri: xml.AnyURI): DataStructure|undefined {
    for (let i = 0; i < this.datastructures!.length; i++) {
      if (this.datastructures![i].identifiesMeURI(uri)) {
        return this.datastructures![i];
      }
    }
    return undefined;
  }

  findDataStructureReference(ref: commonreferences.Reference): DataStructure|undefined {
    return this.findDataStructure(
      ref.getAgencyId()!,
      ref.getMaintainableParentId()!,
      ref.getMaintainedParentVersion()
    );
  }

  merge(dss: DataStructures) {
    if (dss === null) return;
    for (let i = 0; i < dss.getDataStructures()!.length; i++) {
      this.datastructures!.push(dss.getDataStructures()![i]);
    }
  }
}

export class Structures implements interfaces.LocalRegistry {
  private codelists: CodeLists|undefined = undefined;
  private concepts: Concepts|undefined = undefined;
  private datastructures: DataStructures|undefined = undefined;
  private dataflows: DataflowList|undefined = undefined;
  getConcepts():Concepts|undefined {
    return this.concepts;
  }

  setConcepts(c: Concepts|undefined) {
    this.concepts = c;
  }

  getCodeLists():CodeLists|undefined {
    return this.codelists;
  }

  setCodeLists(c: CodeLists|undefined) {
    this.codelists = c;
  }

  getDataStructures() : DataStructures|undefined{
    return this.datastructures;
  }

  setDataStructures(ds: DataStructures|undefined) {
    this.datastructures = ds;
  }

  setDataflows(dl: DataflowList|undefined) {
    this.dataflows = dl;
  }

  getDataflows(): DataflowList|undefined {
    return this.dataflows;
  }

  // Registry
  listDataflows(): Array<structure.Dataflow> {
    if (this.dataflows === undefined) {
      return [];
    }
    return this.dataflows!.getDataflowList();
  }

  clear(): void {
    // Do Nothing
  }

  load(struct: message.StructureType): void {
    // Do Nothing
  }

  unload(struct: message.StructureType): void {
    // Do Nothing
  }

  findDataStructure(ref: commonreferences.Reference): structure.DataStructure|undefined {
    if (this.datastructures === undefined) return undefined;
    return this.datastructures.findDataStructureReference(ref);
  }

  findDataflow(ref: commonreferences.Reference): structure.Dataflow|undefined {
    if (this.dataflows === undefined) return undefined;
    return this.dataflows.findDataflow(ref);
  }

  findCode(ref: commonreferences.Reference): structure.CodeType|undefined {
    if (this.codelists === undefined) return undefined;
    return this.codelists
      .findCodelistReference(ref)!
      .findItemId(new commonreferences.ID(ref.getId()!.toString()));
  }

  findCodelist(ref: commonreferences.Reference): structure.Codelist|undefined {
    if (this.codelists === undefined||this.codelists === null) return undefined;
    return this.codelists.findCodelistReference(ref);
  }

  findItemType(item: commonreferences.Reference): structure.ItemType|undefined {
    return undefined;
  }

  findConcept(ref: commonreferences.Reference): structure.ConceptType|undefined{
    if (this.concepts === undefined) {
      return undefined;
    }
    const cs: ConceptSchemeType|undefined = this.concepts.findConceptSchemeReference(ref);
    if (cs === undefined) {
      return undefined;
    }
    return cs.findItemId(new commonreferences.ID(ref.getId()!.toString()));
  }

  findConceptScheme(
    ref: commonreferences.Reference
  ): structure.ConceptSchemeType|undefined {
    if (this.concepts === undefined||this.concepts=== null) {
      return undefined;
    }
    return this.concepts.findConceptSchemeReference(ref);
  }

  searchDataStructure(
    ref: commonreferences.Reference
  ): Array<structure.DataStructure> {
    return [];
  }

  searchDataflow(ref: commonreferences.Reference): Array<structure.Dataflow> {
    return [];
  }

  searchCodelist(ref: commonreferences.Reference): Array<structure.Codelist> {
    return [];
  }

  searchItemType(item: commonreferences.Reference): Array<structure.ItemType> {
    return [];
  }

  searchConcept(ref: commonreferences.Reference): Array<structure.ConceptType> {
    return [];
  }

  searchConceptScheme(
    ref: commonreferences.Reference
  ): Array<structure.ConceptSchemeType> {
    return [];
  }

  save(): void {
    // Do Nothing
  }
}
export class TextFormatType {
  private textType: common.DataType|undefined = undefined;
  private isSequence: boolean|undefined = undefined;
  private interval: number|undefined = undefined;
  private startValue: number|undefined = undefined;
  private endValue: number|undefined = undefined;
  private timeInterval: xml.Duration|undefined = undefined;
  private startTime: common.StandardTimePeriodType|undefined = undefined;
  private endTime: common.StandardTimePeriodType|undefined = undefined;
  private minLength: number|undefined = undefined;
  private maxLength: number |undefined= undefined;
  private minValue: number|undefined = undefined;
  private maxValue: number|undefined = undefined;
  private decimals: number|undefined = undefined;
  private pattern: string|undefined = undefined;
  private isMultiLingual: boolean|undefined= undefined;

  public getTextType(): common.DataType|undefined {
    return this.textType;
  }

  public getIsSequence(): boolean|undefined {
    return this.isSequence;
  }

  public getInterval(): number|undefined {
    return this.interval;
  }

  public getStartValue(): number|undefined {
    return this.startValue;
  }

  public getEndValue(): number|undefined {
    return this.endValue;
  }

  public getTimeInterval(): xml.Duration|undefined {
    return this.timeInterval;
  }

  public getStartTime(): common.StandardTimePeriodType|undefined {
    return this.startTime;
  }

  public getEndTime(): common.StandardTimePeriodType|undefined {
    return this.endTime;
  }

  public getMinLength(): number|undefined {
    return this.minLength;
  }

  public getMaxLength(): number |undefined{
    return this.maxLength;
  }

  public getDecimals(): number|undefined {
    return this.decimals;
  }

  public getPattern(): string |undefined{
    return this.pattern;
  }

  public getIsMultilingual(): boolean |undefined{
    return this.isMultiLingual;
  }

  public setTextType(t: common.DataType|undefined) {
    this.textType = t;
  }

  public setIsSequence(b: boolean|undefined) {
    this.isSequence = b;
  }

  public setInterval(n: number|undefined) {
    this.interval = n;
  }

  public setStartValue(n: number|undefined) {
    this.startValue = n;
  }

  public setEndValue(n: number|undefined) {
    this.endValue = n;
  }

  public setTimeInterval(d: xml.Duration|undefined) {
    this.timeInterval = d;
  }

  public setStartTime(t: common.StandardTimePeriodType|undefined) {
    this.startTime = t;
  }

  public setEndTime(t: common.StandardTimePeriodType|undefined) {
    this.endTime = t;
  }

  public setMinLength(n: number|undefined) {
    this.minLength = n;
  }

  public setMaxLength(n: number|undefined) {
    this.maxLength = n;
  }

  public setDecimals(n: number|undefined) {
    this.decimals = n;
  }

  public setPattern(s: string|undefined) {
    this.pattern = s;
  }

  public setIsMultilingual(b: boolean|undefined) {
    this.isMultiLingual = b;
  }
}
export class BasicComponentTextFormatType extends TextFormatType {}
export class SimpleComponentTextFormatType extends BasicComponentTextFormatType {}
export class CodededTextFormatType extends SimpleComponentTextFormatType {}
export class RepresentationType {
  private textFormat: TextFormatType|undefined = undefined;
  private enumeration: commonreferences.Reference|undefined = undefined;
  private enumerationFormat: CodededTextFormatType|undefined = undefined;

  /**
   * @return the textFormat
   */
  public getTextFormat(): TextFormatType|undefined {
    return this.textFormat;
  }

  /**
   * @param textFormat the textFormat to set
   */
  public setTextFormat(textFormat: TextFormatType|undefined) {
    this.textFormat = textFormat;
  }

  /**
   * @return the enumeration
   */
  public getEnumeration(): commonreferences.Reference|undefined {
    return this.enumeration;
  }

  /**
   * @param enumeration the enumeration to set
   */
  public setEnumeration(enumeration: commonreferences.Reference|undefined) {
    this.enumeration = enumeration;
  }

  /**
   * @return the enumerationForma
   */
  public getEnumerationFormat(): CodededTextFormatType|undefined {
    return this.enumerationFormat;
  }

  /**
   * @param enumerationForma the enumerationForma to set
   */
  public setEnumerationFormat(enumerationForma: CodededTextFormatType) {
    this.enumerationFormat = enumerationForma;
  }
}

export default {
  Attribute: Attribute,
  AttributeList: AttributeList,
  BasicComponentTextFormatType: BasicComponentTextFormatType,
  CodeLists: CodeLists,
  CodeType: CodeType,
  CodededTextFormatType: CodededTextFormatType,
  Codelist: Codelist,
  Component: Component,
  ComponentUtil: ComponentUtil,
  ConceptSchemeType: ConceptSchemeType,
  ConceptType: ConceptType,
  Concepts: Concepts,
  DataStructure: DataStructure,
  DataStructureComponents: DataStructureComponents,
  DataStructures: DataStructures,
  Dataflow: Dataflow,
  DataflowList: DataflowList,
  Dimension: Dimension,
  DimensionList: DimensionList,
  IdentifiableType: IdentifiableType,
  ItemSchemeType: ItemSchemeType,
  ItemType: ItemType,
  MaintainableType: MaintainableType,
  PrimaryMeasure: PrimaryMeasure,
  RepresentationType: RepresentationType,
  SimpleComponentTextFormatType: SimpleComponentTextFormatType,
  StructureUsageType: StructureUsageType,
  Structures: Structures,
  TextFormatType: TextFormatType,
  TimeDimension: TimeDimension,
  VersionableType: VersionableType
};
