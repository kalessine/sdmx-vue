// VUE 3.
import { createApp, h } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import store from "./store";


store.dispatch('loadJSON',JSON.parse('{ "dataservice": "ABS3", "dataflow_agency": "ABS", "dataflow_id": "ALC", "dataflow_version": "1.0.0", "dataflow_name": "en", "dataflow_name_lang": "Apparent Consumption of Alcohol, Australia", "datastructure_agency": "ABS", "datastructure_id": "ALC", "datastructure_version": "1.0.0", "bindings": [ { "boundTo": 10, "concept": "TYP" }, { "boundTo": 10, "concept": "MEA" }, { "boundTo": 10, "concept": "BEVT" }, { "boundTo": 14, "concept": "SUB", "defaultBindingValues": [] }, { "boundTo": 26, "concept": "FREQUENCY", "defaultBindingValues": [ "A" ] } ], "time": { "boundTo": 18, "concept": "TIME_PERIOD", "defaultBindingValues": [] }, "values": [ { "boundTo": 2, "concept": "OBS_VALUE", "defaultBindingValues": [] } ], "adapter": 1001 }'));



import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import TabView from "primevue/tabview";
import TabPanel from 'primevue/tabpanel';
import InputSwitch from 'primevue/inputswitch';
import Calendar from 'primevue/calendar';
import Chart from 'primevue/chart';
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

const app = createApp({
  render: () => h(App)
});

app
  .use(store)
  .use(PrimeVue)
  .component("Button", Button)
  .component("Dropdown", Dropdown)
  .component("TabView", TabView)
  .component("TabPanel", TabPanel)
  .component("InputSwitch", InputSwitch)
  .component("Calendar", Calendar)
  .component("Chart", Chart)
app.mount("#app");
