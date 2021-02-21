<template>
      <h6 class="label">{{conceptName}}</h6>
      <Dropdown v-model="selectedItem" :options="items" optionLabel="name" optionValue="code" placeholder="Select a value" id="dropdown"/>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, ComputedRef, ref, Ref } from "vue";
import * as bindings from "../visual/bindings";
import * as structure from "../sdmx/structure";
export default {
  setup(props:{concept:string}) {
    const store = useStore();
    const binding:ComputedRef<bindings.BoundTo> = computed(()=>{
      return store.state.visual.findBindingByConceptId(props.concept);
    });
    const conceptName = computed(()=>{
      return binding.value.getConceptName();
    });
    const items = computed(()=>{
      if( binding.value.clientSide){
         return store.state.visual.query.getQueryKey(props.concept).getWalkedValues().map((item:structure.ItemType)=>{
        return {'name':structure.NameableType.toString(item), 'code':item.getId()?.toString()};
      });
      }
      return binding.value.getCodelist().getItems().map((item:structure.ItemType)=>{
        return {'name':structure.NameableType.toString(item), 'code':item.getId()?.toString()};
      });
    });
    let s = store.state.visual.query!.getQueryKey(props.concept).getValue();
    const selectedItem:ComputedRef<string> = computed({
      get: () : string => {
        return store.state.visual.query!.getQueryKey(props.concept).getValue();
      },
      set: (v : string) => {
        store.state.visual.query!.getQueryKey(props.concept).clear();
        store.state.visual.query!.getQueryKey(props.concept).setValue(v);
        if(binding.value.requery){
           store.dispatch("doRequery").then(()=>{
             store.dispatch("doWalk");
           });
        }else{
        store.dispatch("doWalk");
        }
      }
    });
    return { binding, items, selectedItem, conceptName  }
  },
  name: "SelectDropdown",
  props: {
    concept: {
      type: String,
      required: true
    }
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