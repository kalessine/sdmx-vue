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
import { MutationTypes } from './mutation-types';
import { State } from './state';
import * as structure from '../sdmx/structure';
import * as bindings from '../visual/bindings';
import * as model from '../visual/model';
import * as message from '../sdmx/message';

export type Mutations<S = State> = {
  [MutationTypes.connect](state: S, payload: {service:string}): void,
  [MutationTypes.loadDataflows](state: S, payload: {}): void,
  [MutationTypes.chooseDataflow](state: S, payload: {df:structure.Dataflow}): void,
  [MutationTypes.loadDataStruct](state: S, payload: {dataStruct:structure.DataStructure|undefined}): void,
  [MutationTypes.chooseBinding](state: S, payload: {b:string}): void
  [MutationTypes.changeBindingClass](state: S, payload: {b:bindings.BoundTo}): void,
  [MutationTypes.changeBindingItem](state: S, payload: {val:{name:string}}): void,
  [MutationTypes.selectedTab](state: S, payload: {t:number}): void,
  [MutationTypes.selectAdapter](state: S, payload: {id:number}): void,
  [MutationTypes.setModel](state: S, payload: {md:model.Model|undefined}):void,
  [MutationTypes.setDataMessage](state: S, payload: {msg:message.DataMessage|undefined}): void  
  [MutationTypes.createModel](state: S, payload: {}): void  
  [MutationTypes.walk](state: S, payload: {}): void  
}
export const mutations: Mutations = {
  [MutationTypes.connect](state:State, payload:{service:string;}): void {
    state.visual.setDataService(payload.service);
    state.visual.connect();
  },
  [MutationTypes.chooseDataflow](state:State, payload:{df:structure.Dataflow}):void {
    state.visual.dataflow = payload.df;
    state.selectedTab = 2;
  },
  [MutationTypes.loadDataflows](state:State, payload:{dfs:Array<structure.Dataflow>}):void{
    state.visual.loadDataflows(payload.dfs);
  },
  [MutationTypes.loadDataStruct](state:State, payload:{dataStruct:structure.DataStructure}): void {
    state.visual.loadDataStructure(payload.dataStruct);
    //state.selectedTab = 2;
  },
  [MutationTypes.chooseBinding](state:State, payload:{b:string}): Promise<void> {
    state.visual.selectBinding(payload.b);
    state.selectedTab = 3;
    const promise = new Promise<void>(
      (resolve: () => void, reject: any) => {
        resolve();
      }
    );
    return promise;
  },
  [MutationTypes.changeBindingClass](state:State, payload:{b:bindings.BoundTo}): Promise<void> {
    state.visual.changeBindingClass(payload.b);
    const promise = new Promise<void>(
      (resolve: () => void, reject: any) => {
        resolve();
      }
    );
    return promise;
  },
  [MutationTypes.changeBindingItem](state:State, payload:{val:{name:string}}): Promise<void> {
    let items = state.visual.getQuery()?.getQueryKey(state.visual.currentBinding?.getConcept())?.getPossibleValues();
    for(let i=0;i<items!.length;i++) {
       if( structure.NameableType.toString(items![i])==payload.val.name){
           state.visual.currentBindingValue=items![i];
       }
    }
    const promise = new Promise<void>(
      (resolve: () => void, reject: any) => {
        resolve();
      }
    );
    return promise;
  },
  [MutationTypes.selectedTab](state:State, payload:{t:number}): Promise<void> {
    state.selectedTab=payload.t;
    const promise = new Promise<void>(
      (resolve: () => void, reject: any) => {
        resolve();
      }
    );
    return promise;
  },
  [MutationTypes.selectAdapter](state:State, payload:{id:number}): void {
    state.visual.adapter=payload.id;
  },
  [MutationTypes.setModel](state:State, payload:{md:model.Model|undefined}): void {
    state.visual.model=payload.md;
  },
  [MutationTypes.setDataMessage](state:State, payload:{msg:message.DataMessage|undefined}): void {
    state.visual.dataMessage=payload.msg;
  },
  [MutationTypes.createModel](state:State, payload:{}): void {
    
  },
  [MutationTypes.walk](state:State, payload:{}): void {
  }
}
/*
export default {
  connect: (state, { service }) => {
    console.log(state);
    state.visual.setDataService(service);
    return state.visual.connect().then(()=>{
      state.selectedTab = 1;
    });
  },
  chooseDataflow: (state, { df }) => {
    state.visual.dataflow = df;
    state.selectedTab = 2;
  },
  chooseBinding: (state, { b }) => {
    state.visual.currentBinding = state.visual.findBinding(b);
    console.log(state.visual.currentBinding);
  }
};
*/