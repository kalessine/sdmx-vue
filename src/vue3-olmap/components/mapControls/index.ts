import FullScreenControl from './FullScreenControl.vue'
import MousePositionControl from './MousePositionControl.vue'
import AttributionControl from './AttributionControl.vue'
import OverviewMapControl from './OverviewMapControl.vue'
import ScaleLineControl from './ScaleLineControl.vue'
import ZoomControl from './ZoomControl.vue'
import ZoomSliderControl from './ZoomSliderControl.vue'
import ZoomToExtentControl from './ZoomToExtentControl.vue'
import RotateControl from './RotateControl.vue'
import ContextMenuControl from './ContextMenuControl.vue'

import { App } from '@vue/runtime-dom'

function install (app:App) {  
    app.component(FullScreenControl.name, FullScreenControl)
    app.component(MousePositionControl.name, MousePositionControl)
    app.component(AttributionControl.name, AttributionControl)
    app.component(OverviewMapControl.name, OverviewMapControl)
    app.component(ScaleLineControl.name, ScaleLineControl)
    app.component(ZoomControl.name, ZoomControl)
    app.component(ZoomSliderControl.name, ZoomSliderControl)
    app.component(ZoomToExtentControl.name, ZoomToExtentControl)
    app.component(RotateControl.name, RotateControl)
    app.component(ContextMenuControl.name, ContextMenuControl)
  }
  
  export default install
  
  export {
    install,
    FullScreenControl,
    MousePositionControl,
    AttributionControl,
    OverviewMapControl,
    ScaleLineControl,
    ZoomControl,
    ZoomSliderControl,
    ZoomToExtentControl,
    ContextMenuControl
  }