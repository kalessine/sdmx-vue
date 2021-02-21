<template>
  <div class="grid-container">
    <div class="item3">
      <TabView style="flex: 1" v-model:activeIndex="selectedTab">
        <TabPanel header="Services"><Services /></TabPanel>
        <TabPanel header="Dataflows" :disabled="dataflowsActive"><Dataflows /></TabPanel>
        <TabPanel header="Bindings" :disabled="dataflowActive"><BindingsComponent /></TabPanel>
        <TabPanel header="ShowBinding" :disabled="bindingActive"><ShowBinding /></TabPanel>
        <TabPanel header="Adapters" :disabled="false"><Adapters /></TabPanel>
        <TabPanel header="Visual" :disabled="false"><Visual /></TabPanel>
        <TabPanel header="Embed" :disabled="false"><Embed /></TabPanel>
      </TabView>
    </div>
    <div class="item1">Header</div>
    <div class="item4">Right</div>
    <div class="item5">Footer</div>
    <div class="item2">Menu</div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed } from "vue";
import Services from "./components/Services.vue";
import Dataflows from "./components/Dataflows.vue";
import BindingsComponent from "./components/BindingsComponent.vue";
import ShowBinding from "./components/ShowBinding.vue";
import Adapters from "./components/Adapters.vue";
import Visual from "./components/Visual.vue";
import Embed from "./components/Embed.vue";
import * as sdmx from "./sdmx";
import * as structure from "./sdmx/structure";
export default {
  setup() {
    const store = useStore();
    const selectedTab = computed({
      get: () => store.getters.selectedTab,
      set: (val) => {
        store.dispatch("selectedTab", val);
      },
    });
    const dataflowsActive = computed(() => {
      if (store.getters.dataflows !== undefined) {
        return false;
      }
      return true;
    });
    const dataflowActive = computed(() => {
      if (store.getters.dataflow !== undefined) {
        return false;
      }
      return true;
    });
    const bindingActive = computed(() => {
      if (store.getters.currentBinding !== undefined) {
        return false;
      }
      return true;
    });
    return {
      selectedTab,
      dataflowsActive,
      dataflowActive,
      bindingActive
    };
  },
  name: "App",
  components: {
    Services,
    Dataflows,
    BindingsComponent,
    ShowBinding,
    Adapters,
    Visual,
    Embed
  },
};
</script>
<style scoped>
.item1 {
  grid-area: header;
}
.item2 {
  grid-area: menu;
}
.item3 {
  grid-area: main;
}
.item4 {
  grid-area: right;
}
.item5 {
  grid-area: footer;
}

.grid-container {
  display: grid;
  grid:
    "header header header header header header"
    "menu main main main right right"
    "menu footer footer footer footer footer";
  grid-gap: 10px;
  background-color: #2196f3;
  padding: 10px;
}
</style>