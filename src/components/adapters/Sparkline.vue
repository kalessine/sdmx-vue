<template>
  <div :v-if="chartData!=undefined">
  <Chart type="line" :data="chartData" :options="options" style="min-height:450px;"/>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, ref } from "vue";
import { Model } from '@/visual/model';
export default {
  setup() {
    const store = useStore();
    const chartData = ref(undefined);
    const options = ref(undefined);
    store.subscribe((mutation, state) => {
      if (mutation.type === 'setModel'&&mutation.payload.md!=undefined) {
         chartData.value=undefined;
         chartData.value = mutation.payload.md.chartData;
         options.value = mutation.payload.md.options;
      }
    });
    return {
      chartData,options
    };
  },
  name: "Sparkline",
  props: {
  },
  data() {
    return {
    };
  }
};
</script>
