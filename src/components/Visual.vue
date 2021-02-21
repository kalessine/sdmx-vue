<template>
<div id="visual"><Sparkline /></div>
<div v-for="binding in bindings" :key="binding">
    <SelectDropdown v-if="binding.boundTo==10" :concept="binding.concept"/>
</div>
<h6 class="label">Date From</h6>
<Calendar v-model="startDate" yearNavigator="true" yearRange="1970:2021"/>
<h6 class="label">Date To</h6>
<Calendar v-model="endDate" yearNavigator="true" yearRange="1970:2021"/><br/>
{{ attribution }}
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, ComputedRef, ref, Ref } from "vue";
import * as bindings from "../visual/bindings";
import * as structure from "../sdmx/structure";
import Sparkline from "../components/adapters/Sparkline.vue";
import SelectDropdown from "../components/SelectDropdown.vue";
export default {
  setup(props:any) {
    const store = useStore();
    const attribution = computed(()=>{
      return store.state.visual!=undefined?store.state.visual.getAttribution():undefined;
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
    return { bindings, startDate, endDate, attribution };
  },
  name: "Visual",
  components: {
    Sparkline, SelectDropdown
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
