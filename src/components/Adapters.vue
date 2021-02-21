<template>
  <div>
    <Button
      v-for="ad in adapters"
      :key="ad.getId()"
      type="primary"
      @click="selectAdapter(ad.getId())"
      >{{ ad }}</Button
    >
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed } from "vue";
import * as model from '../visual/model';
export default {
  setup() {
    const store = useStore();
    const adapters = computed(() => {
      return store.getters.adapters;
    });
    const selectAdapter = (ad:number) => {
      store.dispatch("selectAdapter", ad);
    };
    return {
      adapters,
      selectAdapter
    };
  },
  name: "Adapters",
  props: {
    msg: String
  },
  data() {
    return {
    };
  }
};
</script>
