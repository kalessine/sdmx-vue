<template>
<div display="block" style="width:100%;height:100%">
<div v-if="vis.adapter==1000" id="visual1000"><Sparkline /></div>
<div v-if="vis.adapter==1001" id="visual1001"><Sparkline /></div>
<div v-if="vis.adapter==2000" id="visual2000" ><OpenlayersMap /></div>
<div v-for="binding in bindings" :key="binding">
    <SelectDropdown v-if="binding.boundTo==10" :concept="binding.concept"/>
</div>
<div v-if="timeBinding != undefined">
    <SelectDropdown v-if="timeBinding.boundTo==20" :concept="timeBinding.concept"/>
</div>
<h6 class="label">Date From</h6>
<Calendar v-model="startDate" :yearNavigator="true" yearRange="1970:2021"/>
<h6 class="label">Date To</h6>
<Calendar v-model="endDate" :yearNavigator="true" yearRange="1970:2021"/><br/>
{{ attribution }}
</div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, ComputedRef, ref, Ref } from "vue";
import * as bindings from "../visual/bindings";
import * as structure from "../sdmx/structure";
import * as visual from '../visual/visual';
import Sparkline from "../components/adapters/Sparkline.vue";
import OpenlayersMap from "../components/adapters/OpenlayersMap.vue";
import SelectDropdown from "../components/SelectDropdown.vue";
export default {
  setup(props:any) {
    const store = useStore();
    const updateKey = computed(():number => {
        return store.state.updateKey;
        });
    const attribution = computed(()=>{
      return store.state.visual!=undefined?store.state.visual.getAttribution():undefined;
      });
    const vis = computed({
      get: ():visual.Visual|undefined => {
        if( store.state.visual) {
          return store.state.visual;
        }else return undefined;
        },
      set: (val:visual.Visual|undefined) => {
      }
    });
    const startDate = computed({
      get: ():Date|undefined => {
        if( store.state.visual.query!=undefined) {
          return store.state.visual.startDate;

        }else return undefined;
        },
      set: (val:Date|undefined) => {
        store.state.visual.startDate=val;
        if(true){
           store.dispatch("doRequery").then(()=>{
             store.dispatch("doWalk");
           });
        }else{
        store.dispatch("doWalk");
        }
      }
    });
    const endDate = computed({
      get: ():Date|undefined => {
        if( store.state.visual.query!=undefined) {
          return store.state.visual.endDate;
        }else return undefined;
        },
      set: (val:Date|undefined) => {
        store.state.visual.endDate=val;
        if(true){
           store.dispatch("doRequery").then(()=>{
             store.dispatch("doWalk");
           });
        }else{
        store.dispatch("doWalk");
        }
      }
    });
    const bindings = computed(()=>{
      if(store.state.visual.dimensionBindings==undefined) return [];
      return store.state.visual.dimensionBindings;
    });
    const timeBinding = computed(()=>{
      console.log(store.state.visual.timeBinding);
      if(store.state.visual.timeBinding==undefined) return undefined;
      return store.state.visual.timeBinding;
    });
    return { bindings, startDate, endDate, attribution,vis,timeBinding,updateKey };
  },
  name: "Visual",
  components: {
    Sparkline, SelectDropdown, OpenlayersMap
  },
  props: {
    msg: String
  },
  data() {
    return {
    };
  }
};
</script>
<style scoped>
.label {
  margin-block-start: 0.5em;
  margin-block-end: 0.5em;
}
</style>
