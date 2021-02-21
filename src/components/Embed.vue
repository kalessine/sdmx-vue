<template>
  <p>{{ embed }}</p>
  <button v-on:click="click">Click me</button>
</template>

<script>
import { useStore } from "vuex";
import { computed } from "vue";
export default {
  setup() {
    const store = useStore();
    const embed = computed(() => {
      return store.state.visual.toJSON();
    });
    let click = ()=>{
      console.log(store.state.visual.toJSON());
    }
    return {
      embed,click
    };
  },
  name: "Embed",
  props: {
  },
  data() {
    return {
    };
  }
};
</script>
