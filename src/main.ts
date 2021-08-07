/*
MIT License

Copyright (c) 2021 James Gardner

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
// VUE 3.
import { createApp, h } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import {Map,Layers,Sources,MapControls,Geometries,Styles,Interactions} from './vue3-olmap/vue3-ol';
import 'vue3-openlayers/dist/vue3-openlayers.css';


import store from "./store";

store.dispatch('loadJSON',JSON.parse('{ "dataservice": "ABS3", "dataflow_agency": "ABS", "dataflow_id": "ALC", "dataflow_version": "1.0.0", "dataflow_name": "en", "dataflow_name_lang": "Apparent Consumption of Alcohol, Australia", "datastructure_agency": "ABS", "datastructure_id": "ALC", "datastructure_version": "1.0.0", "bindings": [ { "boundTo": 10, "concept": "TYP" }, { "boundTo": 10, "concept": "MEA" }, { "boundTo": 10, "concept": "BEVT" }, { "boundTo": 14, "concept": "SUB", "defaultBindingValues": [] }, { "boundTo": 26, "concept": "FREQUENCY", "defaultBindingValues": [ "A" ] } ], "time": { "boundTo": 18, "concept": "TIME_PERIOD", "defaultBindingValues": [] }, "values": [ { "boundTo": 2, "concept": "OBS_VALUE", "defaultBindingValues": [] } ], "adapter": 1001 }'));



import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import TabView from "primevue/tabview";
import TabPanel from 'primevue/tabpanel';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
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
  .use(Map)
  .use(Layers)
  .use(Sources)
  .use(MapControls)
  .use(Geometries)
  .use(Styles)
  .use(Interactions)
  .component("Button", Button)
  .component("Dropdown", Dropdown)
  .component("TabView", TabView)
  .component("TabPanel", TabPanel)
  .component("InputSwitch", InputSwitch)
  .component("InputText", InputText)
  .component("Calendar", Calendar)
  .component("Chart", Chart)
Map.install(app);
app.mount("#app");
