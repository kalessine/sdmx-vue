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
import { ActionTree, ActionContext } from 'vuex'
import { state, State } from './state'
import { Mutations } from './mutations'
import { ActionTypes } from './action-types'
import { MutationTypes } from './mutation-types'
import structure, { Dataflow, DataStructure } from '../sdmx/structure'
import * as model from '../visual/model'
import * as bindings from '../visual/bindings';
import commonreferences, { ID, Reference } from '@/sdmx/commonreferences'
import common from '@/sdmx/common'
import { StructuredDataMessage } from '@/sdmx/data'

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>
} & Omit<ActionContext<State, State>, 'commit'>

export interface Actions {
  [ActionTypes.connect](
    { commit }: AugmentedActionContext,
    service: string
  ): void,
  [ActionTypes.chooseDataflow](
    { commit }: AugmentedActionContext,
    df: Dataflow
  ): Promise<void>,
  [ActionTypes.loadDataStruct](
    { commit }: AugmentedActionContext,
    dataStruct: DataStructure
  ): void,
  [ActionTypes.chooseBinding](
    { commit }: AugmentedActionContext,
    b: string
  ): Promise<void>
  [ActionTypes.changeBindingClass](
    { commit }: AugmentedActionContext,
    b: bindings.BoundTo
  ): Promise<void>
  [ActionTypes.changeBindingItem](
    { commit }: AugmentedActionContext,
    val: { name: string }
  ): Promise<void>
  [ActionTypes.selectedTab](
    { commit }: AugmentedActionContext,
    t: number
  ): Promise<void>
  [ActionTypes.selectAdapter](
    { state, commit }: AugmentedActionContext,
    id: number
  ): void,
  [ActionTypes.doRequery](
    { state, commit }: AugmentedActionContext
  ): void,
  [ActionTypes.doWalk](
    { state, commit }: AugmentedActionContext
  ): void,
  [ActionTypes.loadJSON](
    { state, commit }: AugmentedActionContext, json: any
  ): void
}

export const actions: ActionTree<State, State> & Actions = {
  [ActionTypes.connect]({ commit }, service: string) {
    commit(MutationTypes.connect, {
      service
    });
    state.visual.getQueryable()?.getRemoteRegistry()?.listDataflows().then((dfs) => {
      commit(MutationTypes.loadDataflows, { dfs: dfs });
    });
  },
  async [ActionTypes.chooseDataflow]({ commit }, df: Dataflow) {
    commit(MutationTypes.chooseDataflow, {
      df
    });
    let dataStruct = await state.visual.getQueryable()?.getRemoteRegistry()?.findDataStructure(df.getStructure()!)
    commit(MutationTypes.loadDataStruct, { dataStruct });
  },
  async [ActionTypes.loadDataStruct]({ commit }, dataStruct: DataStructure) {
    commit(MutationTypes.loadDataStruct, {
      'dataStruct': dataStruct
    });
  },
  [ActionTypes.chooseBinding]({ commit }, b: string) {
    return new Promise((resolve) => {
      commit(MutationTypes.chooseBinding, {
        b
      });
    })
  },
  [ActionTypes.changeBindingClass]({ commit }, b: bindings.BoundTo) {
    return new Promise((resolve) => {
      commit(MutationTypes.changeBindingClass, {
        b
      });
    })
  },
  [ActionTypes.changeBindingItem]({ commit }, val: { name: string }) {
    return new Promise((resolve) => {
      commit(MutationTypes.changeBindingItem, {
        val
      });
    })
  },
  [ActionTypes.selectedTab]({ commit }, t: number) {
    return new Promise((resolve) => {
      commit(MutationTypes.selectedTab, {
        t
      });
    })
  },
  async [ActionTypes.selectAdapter]({ state, commit }, id: number) {
    commit(MutationTypes.selectAdapter, { id });
    commit(MutationTypes.setDataMessage, { 'msg': undefined });
    let dataMessage = await state.visual.doQuery();
    commit(MutationTypes.setDataMessage, { 'msg': dataMessage });
    let md: model.Model | undefined = state.visual.createModel();
    commit(MutationTypes.setModel, { 'md': md });
    commit(MutationTypes.selectedTab, { 't': 5 });

  },
  async [ActionTypes.doRequery]({ state, commit }) {
    commit(MutationTypes.setDataMessage, { 'msg': undefined });
    let dataMessage = await state.visual.doQuery();
    commit(MutationTypes.setDataMessage, { 'msg': dataMessage });
  },
  async [ActionTypes.doWalk]({ state, commit }) {
    let md: model.Model | undefined = state.visual.createModel();
    commit(MutationTypes.setModel, { 'md': md });
    commit(MutationTypes.selectedTab, { 't': 5 });
  },

  async [ActionTypes.loadJSON]({ state, commit }, json: any) {
    commit(MutationTypes.connect, {
      'service': json.dataservice as string
    });
    let dataflow = new structure.Dataflow();
    dataflow.setAgencyId(new commonreferences.NestedNCNameID(json.dataflow_agency));
    dataflow.setId(new commonreferences.ID(json.dataflow_id));
    dataflow.setVersion(new commonreferences.Version(json.dataflow_version));
    dataflow.setNames([new common.Name(json.dataflow_name, json.dataflow_name_lang)]);
    let ds_agency = new commonreferences.NestedNCNameID(json.datastructure_agency);
    let ds_id = new commonreferences.ID(json.datastructure_id);
    let ds_ver = new commonreferences.Version(json.datastructure_version);
    let ds = new commonreferences.Ref();
    ds.setAgencyId(ds_agency);
    ds.setMaintainableParentId(ds_id);
    ds.setMaintainableParentVersion(ds_ver);
    let reference = new Reference(ds, undefined);
    dataflow.setStructure(reference);
    commit(MutationTypes.chooseDataflow, {
      'df': dataflow
    });
    let dataStruct = await state.visual.getQueryable()!.getRemoteRegistry()!.findDataStructure(dataflow.getStructure()!);

    commit(MutationTypes.loadDataStruct, { dataStruct });
    for (let i = 0; i < json.bindings.length; i++) {
      let b:bindings.BoundTo = bindings.defaultParseObjectToBinding(json.bindings[i], state.visual.getQueryable()!, dataStruct!)!;
      commit(MutationTypes.changeBindingClass, { 'b': b });
    }
    if (json.time !== undefined) {
      commit(MutationTypes.changeBindingClass, { 'b': bindings.defaultParseObjectToBinding(json.time, state.visual.getQueryable()!, dataStruct!)! });
    }
    if (json.crossSection !== undefined) {
      commit(MutationTypes.changeBindingClass, { 'b': bindings.defaultParseObjectToBinding(json.crossSection, state.visual.getQueryable()!, dataStruct!)! });
    }
    for (let i = 0; i < json.values.length; i++) {
      commit(MutationTypes.changeBindingClass, { 'b': bindings.defaultParseObjectToBinding(json.values[i], state.visual.getQueryable()!, dataStruct!)! });
    }
    commit(MutationTypes.selectAdapter, { 'id':json.adapter });
    commit(MutationTypes.setDataMessage, { 'msg': undefined });
    let dataMessage = await state.visual.doQuery();
    commit(MutationTypes.setDataMessage, { 'msg': dataMessage });
    let md: model.Model | undefined = state.visual.createModel();
    commit(MutationTypes.setModel, { 'md': md });
    commit(MutationTypes.selectedTab, { 't': 5 });
  }
}
