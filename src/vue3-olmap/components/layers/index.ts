import TileLayer from './TileLayer.vue'
import ImageLayer from './ImageLayer.vue'
import VectorLayer from './VectorLayer.vue'
import AnimatedClusterLayer from './AnimatedClusterLayer.vue'
import { App } from '@vue/runtime-dom'

function install (app:App) {  
    app.component(TileLayer.name, TileLayer)
    app.component(ImageLayer.name, ImageLayer)
    app.component(VectorLayer.name, VectorLayer)
    app.component(AnimatedClusterLayer.name, AnimatedClusterLayer)
  }
  
  export default install
  
  export {
    install,
    TileLayer,
    ImageLayer,
    VectorLayer,
    AnimatedClusterLayer
  }