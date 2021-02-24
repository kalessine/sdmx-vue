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
import * as structure from "../sdmx/structure";
import * as interfaces from "../sdmx/interfaces";
import * as commonreferences from "../sdmx/commonreferences";
import * as message from "../sdmx/message";
export class LocalRegistry implements interfaces.LocalRegistry {
  private structures: Array<message.StructureType> = [];
  // Registry
  listDataflows(): Array<structure.Dataflow> {
    const dataflowList: Array<structure.Dataflow> = [];
    const parray: Array<structure.Dataflow> = [];
    for (let i = 0; i < this.structures.length; i++) {
      for (let j = 0; j < this.structures[i].listDataflows()!.length; j++) {
        dataflowList.push(this.structures[i].listDataflows()![j]);
      }
    }
    return dataflowList;
  }

  clear(): void {
    this.structures = [];
  }

  load(struct: message.StructureType): void {
    if (struct != null) {
      this.structures.push(struct);
    }
  }

  unload(struct: message.StructureType): void {
    collections.arrays.remove(this.structures, struct);
  }

  findDataStructure(ref: commonreferences.Reference): structure.DataStructure|undefined {
    for (let i = 0; i < this.structures.length; i++) {
      if (this.structures[i].findDataStructure(ref) !== undefined) {
        return this.structures[i].findDataStructure(ref)!;
      }
    }
    return undefined;
  }

  findDataflow(ref: commonreferences.Reference): structure.Dataflow|undefined {
    return undefined;
  }

  findCode(ref: commonreferences.Reference): structure.CodeType|undefined {
    return undefined;
  }

  findCodelist(ref: commonreferences.Reference): structure.Codelist|undefined {
    for (let i = 0; i < this.structures.length; i++) {
      if (this.structures[i].findCodelist(ref) != null) {
        return this.structures[i].findCodelist(ref);
      }
    }
    return undefined;
  }

  findItemType(item: commonreferences.Reference): structure.ItemType|undefined {
    return undefined;
  }

  findConcept(ref: commonreferences.Reference): structure.ConceptType|undefined {
    for (let i = 0; i < this.structures.length; i++) {
      if (this.structures[i].findConcept(ref) != null) {
        return this.structures[i].findConcept(ref);
      }
    }
    return undefined;
  }

  findConceptScheme(
    ref: commonreferences.Reference
  ): structure.ConceptSchemeType|undefined {
    for (let i = 0; i < this.structures.length; i++) {
      if (this.structures[i].findConceptScheme(ref) != null) {
        return this.structures[i].findConceptScheme(ref);
      }
    }
    return undefined;
  }

  searchDataStructure(
    ref: commonreferences.Reference
  ): Array<structure.DataStructure>|undefined {
    return undefined;
  }

  searchDataflow(ref: commonreferences.Reference): Array<structure.Dataflow>|undefined {
    return undefined;
  }

  searchCodelist(ref: commonreferences.Reference): Array<structure.Codelist>|undefined {
    return undefined;
  }

  searchItemType(item: commonreferences.Reference): Array<structure.ItemType>|undefined {
    return undefined;
  }

  searchConcept(ref: commonreferences.Reference): Array<structure.ConceptType>|undefined {
    return undefined;
  }

  searchConceptScheme(
    ref: commonreferences.Reference
  ): Array<structure.ConceptSchemeType>|undefined {
    return undefined;
  }

  save(): void {
    // Do Nothing
  }
}
export class DoubleRegistry implements interfaces.LocalRegistry {
  private left: interfaces.LocalRegistry|undefined = undefined;
  private right: interfaces.LocalRegistry|undefined = undefined;
  constructor(left: interfaces.LocalRegistry, right: interfaces.LocalRegistry) {
    this.left = left;
    this.right = right;
  }

  // Registry
  listDataflows(): Array<structure.Dataflow> {
    const dataflowList: Array<structure.Dataflow> = [];
    collections.arrays.forEach(this.left!.listDataflows()!, function(a) {
      dataflowList.push(a);
    });
    collections.arrays.forEach(this.right!.listDataflows()!, function(a) {
      dataflowList.push(a);
    });
    return dataflowList;
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
    if (this.left!.findDataStructure(ref) != null) {
      return this.left!.findDataStructure(ref)!;
    } else {
      return this.right!.findDataStructure(ref);
    }
  }

  findDataflow(ref: commonreferences.Reference): structure.Dataflow|undefined {
    if (this.left!.findDataflow(ref) != null) {
      return this.left!.findDataflow(ref);
    } else {
      return this.right!.findDataflow(ref);
    }
  }

  findCode(ref: commonreferences.Reference): structure.CodeType|undefined {
    if (this.left!.findCode(ref) != null) {
      return this.left!.findCode(ref);
    } else {
      return this.right!.findCode(ref);
    }
  }

  findCodelist(ref: commonreferences.Reference): structure.Codelist |undefined{
    if (this.left!.findCodelist(ref) != null) {
      return this.left!.findCodelist(ref);
    } else {
      return this.right!.findCodelist(ref);
    }
  }

  findItemType(item: commonreferences.Reference): structure.ItemType|undefined {
    if (this.left!.findItemType(item) != null) {
      return this.left!.findItemType(item);
    } else {
      return this.right!.findItemType(item);
    }
  }

  findConcept(ref: commonreferences.Reference): structure.ConceptType|undefined {
    if (this.left!.findConcept(ref) != null) {
      return this.left!.findConcept(ref);
    } else {
      return this.right!.findConcept(ref);
    }
  }

  findConceptScheme(
    ref: commonreferences.Reference
  ): structure.ConceptSchemeType|undefined {
    if (this.left!.findConceptScheme(ref) != undefined) {
      return this.left!.findConceptScheme(ref)!;
    } else {
      return this.right!.findConceptScheme(ref);
    }
  }

  searchDataStructure(
    ref: commonreferences.Reference
  ): Array<structure.DataStructure> |undefined{
    const datastrucList: Array<structure.DataStructure> = [];
    collections.arrays.forEach(this.left!.searchDataStructure(ref)!, function(a) {
      datastrucList.push(a);
    });
    collections.arrays.forEach(this.right!.searchDataStructure(ref)!, function(
      a
    ) {
      datastrucList.push(a);
    });
    return datastrucList;
  }

  searchDataflow(ref: commonreferences.Reference): Array<structure.Dataflow> |undefined{
    const dataflowList: Array<structure.Dataflow> = [];
    collections.arrays.forEach(this.left!.searchDataflow(ref)!, function(a) {
      dataflowList.push(a);
    });
    collections.arrays.forEach(this.right!.searchDataflow(ref)!, function(a) {
      dataflowList.push(a);
    });
    return dataflowList;
  }

  searchCodelist(ref: commonreferences.Reference): Array<structure.Codelist>|undefined {
    const codeList: Array<structure.Codelist> = [];
    collections.arrays.forEach(this.left!.searchCodelist(ref)!, function(a) {
      codeList.push(a);
    });
    collections.arrays.forEach(this.right!.searchCodelist(ref)!, function(a) {
      codeList.push(a);
    });
    return codeList;
  }

  searchItemType(item: commonreferences.Reference): Array<structure.ItemType>|undefined {
    const ittList: Array<structure.ItemType> = [];
    collections.arrays.forEach(this.left!.searchItemType(item)!, function(a) {
      ittList.push(a);
    });
    collections.arrays.forEach(this.right!.searchItemType(item)!, function(a) {
      ittList.push(a);
    });
    return ittList;
  }

  searchConcept(ref: commonreferences.Reference): Array<structure.ConceptType>|undefined {
    const cList: Array<structure.ConceptType> = [];
    collections.arrays.forEach(this.left!.searchConcept(ref)!, function(a) {
      cList.push(a);
    });
    collections.arrays.forEach(this.right!.searchConcept(ref)!, function(a) {
      cList.push(a);
    });
    return cList;
  }

  searchConceptScheme(
    ref: commonreferences.Reference
  ): Array<structure.ConceptSchemeType> {
    const csList: Array<structure.ConceptSchemeType> = [];
    collections.arrays.forEach(this.left!.searchConceptScheme(ref)!, function(a) {
      csList.push(a);
    });
    collections.arrays.forEach(this.right!.searchConceptScheme(ref)!, function(
      a
    ) {
      csList.push(a);
    });
    return csList;
  }

  save(): void {
    // Do Nothing
  }
}

export default {
  DoubleRegistry: DoubleRegistry,
  LocalRegistry: LocalRegistry
};
