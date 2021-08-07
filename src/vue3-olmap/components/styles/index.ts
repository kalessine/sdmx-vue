import Style from './Style.vue'
import Circle from './Circle.vue'
import Stroke from './Stroke.vue'
import Fill from './Fill.vue'
import Icon from './Icon.vue'
import Text from './Text.vue'

import { App } from '@vue/runtime-dom'

function install (app:App) {  
    app.component(Style.name, Style)
    app.component(Circle.name, Circle)
    app.component(Stroke.name, Stroke)
    app.component(Fill.name, Fill)
    app.component(Icon.name, Icon)
    app.component(Text.name, Text)
  }
  
  export default install
  
  export {
    install,
    Style,
    Stroke,
    Fill,
    Icon,
    Text
  }