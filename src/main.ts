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

import store from "./store";
import 'vue3-openlayers/dist/vue3-openlayers.css';
//store.dispatch('loadJSON',JSON.parse('{ "dataservice": "ABS3", "dataflow_agency": "ABS", "dataflow_id": "ALC", "dataflow_version": "1.0.0", "dataflow_name": "en", "dataflow_name_lang": "Apparent Consumption of Alcohol, Australia", "datastructure_agency": "ABS", "datastructure_id": "ALC", "datastructure_version": "1.0.0", "bindings": [ { "boundTo": 10, "concept": "TYP" }, { "boundTo": 10, "concept": "MEA" }, { "boundTo": 10, "concept": "BEVT" }, { "boundTo": 14, "concept": "SUB", "defaultBindingValues": [] }, { "boundTo": 26, "concept": "FREQUENCY", "defaultBindingValues": [ "A" ] } ], "time": { "boundTo": 18, "concept": "TIME_PERIOD", "defaultBindingValues": [] }, "values": [ { "boundTo": 2, "concept": "OBS_VALUE", "defaultBindingValues": [] } ], "adapter": 1001 }'));

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
import { Vue } from "vue-class-component";

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
store.dispatch('loadJSON',JSON.parse('{ "dataservice": "ABS3", "dataflow_agency": "ABS", "dataflow_id": "ABS_CENSUS2011_B03", "dataflow_version": "1.0.0", "dataflow_name": "B03 Place of Usual Residence on Census Night by Age (SA2+)", "dataflow_name_lang": "en", "datastructure_agency": "ABS", "datastructure_id": "ABS_CENSUS2011_B03", "datastructure_version": "1.0.0", "bindings": [ { "boundTo": 10, "concept": "MEASURE", "defaultBindingValues": [ "TT" ], "flat": true, "clientSide": false }, { "boundTo": 10, "concept": "POUR", "defaultBindingValues": [ "1" ], "flat": true, "clientSide": false, "perCentOfId": "TOT" }, { "boundTo": 27, "concept": "STATE", "defaultBindingValues": [] }, { "boundTo": 10, "concept": "REGIONTYPE", "defaultBindingValues": [ "STE" ], "flat": true, "clientSide": false }, { "boundTo": 4, "concept": "REGION", "defaultBindingValues": [], "flat": true, "level": 0, "density": true, "lat": 133.0361, "lon": -24.28, "zoom": 2, "ignoreTotal": true, "title": "ASGS2011", "matchField": "ID", "area": "AREA", "geoJSON": "https://geojson.s3.ap-southeast-2.amazonaws.com/asgs2011.geojson" }, { "boundTo": 10, "concept": "FREQUENCY", "defaultBindingValues": [ "A" ], "flat": true, "clientSide": false } ], "time": { "boundTo": 20, "concept": "TIME_PERIOD", "defaultBindingValues": [], "lastTime": 0, "singleLatestTime": false, "chooseTime": true, "defaultStartTime": "2000-01-01T00:00:00.000Z", "defaultEndTime": "2021-01-01T00:00:00.000Z" }, "values": [ { "boundTo": 5, "concept": "OBS_VALUE", "defaultBindingValues": [], "zeroOrigin": false, "minR": 255, "minG": 255, "minB": 255, "maxR": 0, "maxG": 0, "maxB": 0 } ], "adapter": 2000 }'));
