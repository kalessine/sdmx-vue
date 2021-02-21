// VUE 3.
import { createApp, h } from "vue";
import Visual from "./components/Visual.vue";
import PrimeVue from "primevue/config";
import store from "./store";

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
let element:Element|null|undefined = document.getElementById('app');
let json:string|null|undefined = element?.getAttribute("json");
console.log(json);
store.dispatch('loadJSON',JSON.parse(json!));
const app = createApp({
  render: () => h(Visual)
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
