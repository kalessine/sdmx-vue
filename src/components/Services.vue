<template>
  <div>
    <Button
      v-for="svc in services"
      :key="svc"
      type="primary"
      @click="connect(svc)"
      >{{ svc }}</Button
    >
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed } from "vue";
import * as interfaces from "../sdmx/interfaces";
import * as sdmx from "../sdmx";
export default {
  setup() {
    const store = useStore();
    const services = computed(() => {
      return store.getters.services;
    });
    const connect = service => {
      store.dispatch("connect", service);
    };
    return {
      services,
      connect
    };
  },
  name: "Services",
  props: {},
  methods: {}
};
</script>
