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
