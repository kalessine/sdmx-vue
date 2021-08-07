<template>
<div v-if="model!=undefined&&renderComponent">
<ol-map ref="map" :loadTilesWhileAnimating="true" :loadTilesWhileInteracting="true" style="width:600px;height:800px">
    <ol-view ref="view" :center="center" :rotation="rotation" :zoom="zoom" :projection="projection" />
    <ol-fullscreen-control />
    <ol-mouseposition-control />

    <ol-overviewmap-control>
        <ol-tile-layer>
            <ol-source-osm />
        </ol-tile-layer>
    </ol-overviewmap-control>

    <ol-tile-layer>
        <ol-source-osm />
    </ol-tile-layer>

    <!--<ol-interaction-select @select="featureMousedOver" :condition="mouseOverCondition">
        <ol-style>
            <ol-style-text  :text="model.getDescriptionForId(model.selected)" :scale="2.0"></ol-style-text>
        </ol-style>
    </ol-interaction-select>-->

    <ol-vector-layer>
        <ol-source-vector>
            <ol-feature v-for="id in model._featureIDs" :key="'multi'+id" :geometryOrProperties="{'id':id}">
                <ol-geom-multi-polygon :coordinates="getMultiPolygon(id)"></ol-geom-multi-polygon>
                <ol-style>
                    <ol-style-fill :color="model.getColourForId(id).getHex()"></ol-style-fill>
                    <ol-style-stroke color="black" :width="0.5"></ol-style-stroke>
                </ol-style>
            </ol-feature>
            <ol-feature v-for="id in model._featureIDs" :key="'poly'+id" :geometryOrProperties="{'id':id}">
                <ol-geom-polygon :coordinates="getPolygon(id)"></ol-geom-polygon>
                <ol-style>
                    <ol-style-fill :color="model.getColourForId(id).getHex()"></ol-style-fill>
                    <ol-style-stroke color="black" :width="0.5"></ol-style-stroke>
                </ol-style>
            </ol-feature>
        </ol-source-vector>
    </ol-vector-layer>

    <ol-scaleline-control />
    <ol-rotate-control />
    <ol-zoom-control />
    <ol-zoomslider-control />
    <ol-zoomtoextent-control :extent="[23.906,42.812,46.934,34.597]" tipLabel="Fit to Turkey" />

    <ol-interaction-select @select="featureSelected" :condition="selectCondition">
        <ol-style>
            <ol-style-stroke color="yellow" :width="1"></ol-style-stroke>
            <ol-style-text v-if="model.selected!=undefined" :text="model.getDescriptionForId(model.selected)" :scale="2.0"></ol-style-text>
            <ol-style-fill v-if="model.selected!=undefined" :color="model.getColourForId(model.selected).getHex()"></ol-style-fill>
        </ol-style>
    </ol-interaction-select>


</ol-map>
</div>
</template>

<script>
import { useStore } from "vuex";
import { computed, ref, readonly, nextTick } from "vue";
import { onMounted, onUpdated, onUnmounted } from 'vue'
import { Model } from '@/visual/model';
import * as visual from '@/visual/visual';
import markerIcon from '../../vue3-olmap/assets/marker.png'
import * as format from 'ol/format';
import * as selectConditions from 'ol/events/condition';
import * as extent from 'ol/extent';
import * as Feature from 'ol/Feature';
import * as Geom from 'ol/geom';
export default {

    setup() {
        const store = useStore()
        const center = ref([34, 39.13])
        const model = ref(undefined);
        const renderComponent = ref(true);
        store.subscribe((mutation, state) => {
        if (mutation.type === 'setModel'&&mutation.payload.md!=undefined) {
            model.value = undefined;
            nextTick(()=>{
               model.value = mutation.payload.md; 
               center.value = [model.value.centerLat,model.value.centerLon]
            });
            
            }
        });

        var getPolygon = function(id){
            let area = store.state.visual.findBindingByType("Area",0)
            let result = area.getPolygonWithMatchingId(id)
            return result
        }
        var getMultiPolygon = function(id){
            let area = store.state.visual.findBindingByType("Area",0)
            let result = area.getMultiPolygonWithMatchingId(id)
            return result
        }
        const forceRerender = function() {
        // Remove my-component from the DOM
        this.renderComponent = false;

        this.$nextTick(() => {
          // Add the component back in
          this.renderComponent = true;
        });
      }
        const featureSelected = (event) => {
            if (event.selected.length == 1) {
                model.value.selected=event.selected[0].getProperties().geometryOrProperties['id'];
            } else {
                model.value.selected=undefined;
            }
        }

/*
const featureMousedOver = (event) => {
            if (event.selected.length == 1) {
                //model.value.selected=event.selected[0].getProperties().geometryOrProperties['id'];
            } else {
            }
        }
*/
        const projection = ref('EPSG:4326')
        const zoom = ref(4)
        const rotation = ref(0)
        const selectCondition = selectConditions.click;
  //      const mouseOverCondition = selectConditions.pointerMove;
        const vectorsource = ref(null)
        const view = ref(null);
        const map = ref(null);

        onMounted(() => {
            
        });
        onUpdated(() => {
        });
        onUnmounted(() => {
        });
        return {
            center,
            projection,
            zoom,
            rotation,
            selectCondition,
            vectorsource,
            view,
            model,
            map,
            getPolygon,
            getMultiPolygon,
            featureSelected,
            renderComponent,forceRerender
        }
    },
}
</script>
<style>
.overlay-content {
    background: red !important;
    color: white;
    box-shadow: 0 5px 10px rgb(2 2 2 / 20%);
    padding: 10px 20px;
    font-size: 16px;
}
</style>