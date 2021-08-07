import SelectInteraction from './SelectInteraction.vue'

import { App } from '@vue/runtime-dom'

function install (app:App) {
      app.component(SelectInteraction.name, SelectInteraction)

  }
  
  export default install
  
  export {
    install,
    SelectInteraction
  }