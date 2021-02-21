<template>
  <h1>{{ msg }}</h1>
  <button @click="count++">count is: {{ count }}</button>
  <p>
    Edit <code>components/HelloWorld.vue</code> to test hot module replacement.
  </p>
</template>

<script>
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
  name: "Items",
  props: {
    msg: String
  },
  data() {
    return {
      count: 0
    };
  }
};
</script>
