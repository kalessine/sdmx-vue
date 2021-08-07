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
import * as sdmx from "../sdmx";
import * as structure from "../sdmx/structure";
import * as bindings from "../visual/bindings";
import { GetterTree } from 'vuex'
import { State } from './state'
import * as adapter from "../visual/adapter";
import * as model from "../visual/model";
export type Getters = {
  services: (state:State, _getters:Getters, rootState:State)=>Array<string>,
  service: (state:State, _getters:Getters, rootState:State)=>string|undefined,
  dataflows: (state:State, _getters:Getters, rootState:State)=>Array<structure.Dataflow>|undefined,
  dataflow: (state:State, _getters:Getters, rootState:State)=>structure.Dataflow|undefined,
  dimensionBindings: (state:State, _getters:Getters, rootState:State)=>Array<bindings.BoundToDiscrete>|undefined,
  timeBinding: (state:State, _getters:Getters, rootState:State)=>bindings.BoundToTime|undefined,
  crossSectionBinding: (state:State, _getters:Getters, rootState:State)=>bindings.BoundToCrossSection|undefined,
  measureBindings: (state:State, _getters:Getters, rootState:State)=>Array<bindings.BoundToContinuous>|undefined,
  currentBinding: (state:State, _getters:Getters, rootState:State)=>bindings.BoundTo|undefined,
  currentBindingItems: (state:State, _getters:Getters, rootState:State)=>Array<structure.ItemType>|undefined,
  currentBindingItem: (state:State, _getters:Getters, rootState:State)=>structure.ItemType|undefined,
  adapters: (state:State, _getters:Getters, rootState:State)=>Array<adapter.Adapter>|undefined,
  adapter: (state:State, _getters:Getters, rootState:State)=>number|undefined,
  selectedTab: (state:State, _getters:Getters, rootState:State)=>number
  model: (state:State, _getters:Getters, rootState:State)=>model.Model|undefined,
}

export const getters: GetterTree<State, State> & Getters = {
  services: (state:State, _getters:Getters, rootState:State):Array<string> => {
    return sdmx.SdmxIO.listServices();
  },
  service: (state:State, _getters:Getters, rootState:State):string|undefined => {
    return state.visual.dataservice;
  },
  dataflows: (state:State, _getters:Getters, rootState:State):Array<structure.Dataflow>|undefined=> {
    return state.visual.dataflows;
  },
  dataflow: (state:State, _getters:Getters, rootState:State):structure.Dataflow|undefined=> {
    return state.visual.dataflow;
  },
  adapters: (state:State, _getters:Getters, rootState:State):Array<adapter.Adapter>|undefined=> {
    return state.visual.getAdapters();
  },
  adapter: (state:State, _getters:Getters, rootState:State):number|undefined=> {
    return state.visual.adapter;
  },
  dimensionBindings: (state:State, _getters:Getters, rootState:State):Array<bindings.BoundToDiscrete>|undefined => {
    return state.visual.dimensionBindings;
  },
  timeBinding: (state:State, _getters:Getters, rootState:State):bindings.BoundToTime|undefined => {
    return state.visual.timeBinding;
  },
  crossSectionBinding: (state:State, _getters:Getters, rootState:State):bindings.BoundToCrossSection|undefined=> {
    return state.visual.crossSectionBinding;
  },
  measureBindings: (state:State, _getters:Getters, rootState:State):Array<bindings.BoundToContinuous>|undefined => {
    return state.visual.measureBindings;
  },
  currentBinding: (state:State, _getters:Getters, rootState:State):bindings.BoundTo|undefined => {
    return state.visual.currentBinding;
  },
  currentBindingItems: (state:State, _getters:Getters, rootState:State):Array<structure.ItemType>|undefined => {
    if( state.visual.currentBinding!=undefined&&state.visual.currentBinding.isDiscrete()&&state.visual.currentBinding.getCodelist()!=undefined) {
       return state.visual.currentBinding.getCodelist().getItems();
    }else {
      return undefined;
    }
    
  },
  currentBindingItem: (state:State, _getters:Getters, rootState:State):structure.ItemType|undefined => {
    if( state.visual.currentBinding!=undefined&&state.visual.currentBinding.isDiscrete()) {
       return state.visual.currentBindingValue;
    }else {
      return undefined;
    }
    
  },
  selectedTab: (state:State, _getters:Getters, rootState:State):number => {
    return state.selectedTab;
  },
  model: (state:State, _getters:Getters, rootState:State):model.Model|undefined => {
    return state.visual.model;
  }
}
