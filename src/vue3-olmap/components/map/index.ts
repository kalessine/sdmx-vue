import Map from './Map.vue'
import View from './View.vue'
import Feature from './Feature.vue'
import Overlay from './Overlay.vue'
import GeoLocation from './GeoLocation.vue'
import { App } from '@vue/runtime-dom'

function install (app:App) {
    app.component(Map.name, Map)
    app.component(View.name, View)
    app.component(Feature.name, Feature)
    app.component(Overlay.name, Overlay)
    app.component(GeoLocation.name, GeoLocation)
  }
  
  export default install
  
  export {
    install,
    Map,
    View,
    Feature,
    Overlay,
    GeoLocation
  }