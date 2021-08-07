import {
    Map,
    Layers,
    Sources,
    MapControls,
    Geometries,
    Styles,
    Interactions
} from './components'


import 'ol/ol.css'
import 'ol-contextmenu/dist/ol-contextmenu.css'
import './assets/style.css'

import feature from 'ol/Feature';
import * as geom from 'ol/geom';
import * as format from 'ol/format';
import * as loadingstrategy from 'ol/loadingstrategy';
import * as selectconditions from 'ol/events/condition';
import * as extent from 'ol/extent';
import * as animations from 'ol/easing'

import { App } from '@vue/runtime-dom'

function install (app:App) {  
    app.use(Map)
    app.use(Layers)
    app.use(Sources)
    app.use(MapControls)
    app.use(Geometries)
    app.use(Styles);
    app.use(Interactions);

    app.provide('ol-feature',feature)
    app.provide('ol-geom',geom)
    app.provide('ol-animations',animations)
    app.provide('ol-format',format)
    app.provide('ol-loadingstrategy',loadingstrategy)
    app.provide('ol-selectconditions',selectconditions)
    app.provide('ol-extent',extent)
}

export {
    install,
    Map,
    Layers,
    Sources,
    MapControls,
    Geometries,
    Styles,
    Interactions
}