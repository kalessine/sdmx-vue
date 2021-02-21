<template>
  <div>
    <Button
      v-for="df in dataflows"
      :key="df"
      type="primary"
      @click="chooseDataflow(df)"
      >{{ df }}</Button
    >
  </div>
</template>

<script>
import * as interfaces from "../sdmx/interfaces";
import * as sdmx from "../sdmx";
import * as structure from "../sdmx/structure";
import { useStore } from "vuex";
import { computed } from "vue";

export default {
  setup() {
    const store = useStore();
    const dataflows = computed(() => {
      if (store.getters.dataflows === undefined) {
        return [];
      }
      return store.getters.dataflows.map(function(df) {
        return structure.NameableType.toString(df);
      });
    });
    const chooseDataflow = df => {
      let dataflow = null;
      for (let i = 0; i < store.getters.dataflows.length; i++) {
        if (structure.NameableType.toString(store.getters.dataflows[i]) == df) {
          dataflow = store.getters.dataflows[i];
        }
      }
      store.dispatch("chooseDataflow", dataflow);
    };
    return {
      dataflows,
      chooseDataflow
    };
  },
  name: "Dataflows",
  props: {}
};
</script>
