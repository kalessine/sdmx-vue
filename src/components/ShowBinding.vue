<template>
  <div v-if="currentBinding != undefined">
    <Button v-if="isDimension" v-on:click="changeClass(26)"
      >Single Value</Button
    >
    <Button v-if="isDimension" v-on:click="changeClass(27)">All Values</Button>
    <Button v-if="isTimeDimension" v-on:click="changeClass(18)">Time X</Button>
    <Button v-if="isTimeDimension" v-on:click="changeClass(19)">Time Y</Button>
    <Button v-if="isDimension" v-on:click="changeClass(1)">Discrete X</Button>
    <Button v-if="isDimension" v-on:click="changeClass(3)">Discrete Y</Button>

    <Button v-if="isContinuous" v-on:click="changeClass(7)"
      >Continuous Size</Button
    >
    <Button v-if="isContinuous" v-on:click="changeClass(0)"
      >Continuous X</Button
    >
    <Button v-if="isContinuous" v-on:click="changeClass(2)"
      >Continuous Y</Button
    >
    <Button v-if="isContinuous" v-on:click="changeClass(5)"
      >Continuous Colour</Button
    >
    <Button v-if="isDimension" v-on:click="changeClass(11)">List</Button>
    <Button v-if="isTimeDimension" v-on:click="changeClass(34)"
      >Time List</Button
    >
    <Button v-if="isTimeDimension" v-on:click="changeClass(33)"
      >Time Series</Button
    >
    <Button v-if="isDimension" v-on:click="changeClass(14)">Series</Button>
    <Button v-if="isDimension" v-on:click="changeClass(12)">Slider</Button>

    <Button v-if="isCrossSection" v-on:click="changeClass(31)"
      >Cross Sectional Multiple</Button
    >
    <Button v-if="isCrossSection" v-on:click="changeClass(32)"
      >Cross Sectional Single</Button
    >
    <Button v-if="isDimension" v-on:click="changeClass(10)">Dropdown</Button>
    <Button v-if="isDimension" v-on:click="changeClass(29)">Multimenu</Button>
    <Button v-if="isDimension" v-on:click="changeClass(30)">Level Menu</Button>
    <Button v-if="isDimension" v-on:click="changeClass(4)">Area</Button>
    <Button v-if="isTimeDimension" v-on:click="changeClass(20)"
      >Time Dropdown</Button
    >
    <Button v-if="isDimension" v-on:click="changeClass(35)">Buttonmenu</Button>
    <p>{{ currentBinding.boundTo }}</p>
    <p>{{ currentBinding.concept }}</p>
    <p>{{ currentBinding.boundToString }}</p>
    <div v-if="isTimeDimension">
      Single Latest Time<InputSwitch
        v-model="currentBinding.singleLatestTime"
      ></InputSwitch>
    </div>
    <div v-if="isTimeDimension">
      Can the User choose their own Times?
      <InputSwitch v-model="currentBinding.chooseTime"></InputSwitch>
      Date From<Calendar
        v-model="startDate"
        yearNavigator="true"
        yearRange="1970:2021"
      />
      Date To<Calendar
        v-model="endDate"
        yearNavigator="true"
        yearRange="1970:2021"
      />
    </div>
    <!--Start Date
  <Calendar v-model="getQuery().startDate" />
  End Date
  <Calendar v-model="getQuery().endDate" />-->
    <div v-if="isContinuous">
      Zero Origin<InputSwitch v-model="currentBinding.zeroOrigin"></InputSwitch>
      <div>
        Share Maximum Values<InputSwitch
          v-model="currentBinding.sharedMaximum"
        ></InputSwitch>
      </div>
    </div>
    <div v-if="currentBinding.boundTo === 26 && !isContinuous">
      <p>Choose the Single Value for this Dimension</p>
      <Dropdown :options="items" v-model="item" optionLabel="name" /><br />
    </div>
    <div
      v-if="
        currentBinding.boundTo === 10 ||
        (currentBinding.boundTo === 20 && !isContinuous)
      "
    >
      <p>Choose the Default Value for this Dropdown Dimension</p>
      <Dropdown :options="items" v-model="item" optionLabel="name" /><br />
      Client Side
      <InputSwitch v-model="currentBinding.clientSide"></InputSwitch>
      <p>PercentOf Id</p>
      <Dropdown
        :options="items2"
        v-model="percentOf"
        optionLabel="name"
      /><br />
    </div>
    <div v-if="currentBinding.boundTo === 14 && !isContinuous">
      14 colours
      <!--<ItemsColour :binding="currentBinding" />-->
    </div>
    <div v-if="currentBinding.boundTo === 4">
      <br />
      <span class="p-float-label">
        <InputText id="geojson" type="text" v-model="currentBinding.geoJSON" />
        <label for="username">URL to GeoJSON file</label>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, ref } from "vue";
import * as interfaces from "../sdmx/interfaces";
import * as sdmx from "../sdmx";
import * as sdmxdata from "../sdmx/data";
import * as bindings from "../visual/bindings";
import * as structure from "../sdmx/structure";
export default {
  setup() {
    const store = useStore();
    const startDate = computed({
      get: ():Date|undefined => {
        if( store.state.visual.query!=undefined) {
          return store.state.visual.query.startDate;

        }else return undefined;
        },
      set: (val:Date|undefined) => {
        console.log("set val:"+val);
        store.state.visual.query.startDate=val;
      },
    });
    const endDate = computed({
      get: ():Date|undefined => {
        if( store.state.visual.query!=undefined) {
          return store.state.visual.query.endDate;

        }else return undefined;
        },
      set: (val:Date|undefined) => {
        console.log("set val2:"+val);
        store.state.visual.query.endDate=val;
      },
    });
    const currentBinding = computed(() => {
      return store.getters.currentBinding;
    });
    const isDimension = computed(() => {
      if (store.getters.currentBinding == undefined) return false;
      return store.getters.currentBinding.isDimension();
    });
    const isTimeDimension = computed(() => {
      if (store.getters.currentBinding == undefined) return false;
      return store.getters.currentBinding.isTimeDimension();
    });
    const isCrossSection = computed(() => {
      if (store.getters.currentBinding == undefined) return false;
      return store.getters.currentBinding.isCrossSection();
    });
    const isContinuous = computed(() => {
      if (store.getters.currentBinding == undefined) return false;
      return store.getters.currentBinding.isContinuous();
    });
    const items = computed(() => {
      if (store.getters.currentBindingItems === undefined) {
        return [];
      }
      return store.getters.currentBindingItems.map((item:structure.ItemType)=>{
        return {'name':structure.NameableType.toString(item)};
      });
    });
    const items2 = computed(() => {
      if (store.getters.currentBindingItems === undefined) {
        return [];
      }
      let result = [{'name':'No Percentage Of Id'}];
      store.getters.currentBindingItems.map((item:structure.ItemType)=>{
        result.push({'name':structure.NameableType.toString(item)});
      });
      return result;
    });
    const item = computed({
      get: ():{name:string} => {
           return {'name':structure.NameableType.toString(store.getters.currentBindingItem)};
        },
      set: (val:{name:string}) => {
        store.dispatch("changeBindingItem", val);
      }
    });
    const percentOf = computed({
      get: ():{'name':string} => {
           if(store.getters.currentBinding.getPercentOfId()===undefined) {
             return {'name':'No Percentage Of Id'};
           } else {
             let item = sdmxdata.ValueTypeResolver.resolveCode(store.state.visual.getQueryable()!.getRemoteRegistry()!.getLocalRegistry(),store.state.visual.getQuery()!.getDataStructure()!,store.getters.currentBinding.getConcept(),store.getters.currentBinding.getPercentOfId());
             return {'name':structure.NameableType.toString(item!)};
           }
        },
      set: (val:{name:string}) => {
        if(val.name==='No Percentage Of Id'){
            store.getters.currentBinding.setPercentOfId(undefined);  
        }else{
          let items = store.state.visual.getQuery()?.getQueryKey(store.state.visual.currentBinding?.getConcept())?.getPossibleValues();
          let id = undefined;
          for(let i=0;i<items!.length;i++) {
          if( structure.NameableType.toString(items![i])==val.name){
             id = structure.NameableType.toIDString(items[i]);
            }
          }
          store.getters.currentBinding.setPercentOfId(id);
        }
      }
    });

    const changeClass = (bclass: number) => {
      let oldb: bindings.BoundTo = store.getters.currentBinding;
      let b = undefined;
      switch (bclass) {
        case bindings.BoundTo.BOUND_CONTINUOUS_X:
          b = new bindings.BoundToContinuousX(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_DISCRETE_X:
          b = new bindings.BoundToDiscreteX(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_CONTINUOUS_Y:
          b = new bindings.BoundToContinuousY(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_DISCRETE_Y:
          b = new bindings.BoundToDiscreteY(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_DISCRETE_AREA:
          b = new bindings.BoundToArea(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_CONTINUOUS_COLOUR:
          b = new bindings.BoundToContinuousColour(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_CONTINUOUS_SIZE:
          b = new bindings.BoundToContinuousSize(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_TOOLTIP:
          b = undefined;
        case bindings.BoundTo.BOUND_DISCRETE_DROPDOWN:
          b = new bindings.BoundToDropdown(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_DISCRETE_LIST:
          b = new bindings.BoundToList(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_DISCRETE_SLIDER:
          b = new bindings.BoundToSlider(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_DISCRETE_SERIES:
          b = new bindings.BoundToSeries(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_CONTINUOUS_BETWEEN:
          b = undefined;
          break;
        case bindings.BoundTo.BOUND_CONTINUOUS_GREATERTHAN:
          b = undefined;
          break;
        case bindings.BoundTo.BOUND_CONTINUOUS_LESSTHAN:
          b = undefined;
          break;
        case bindings.BoundTo.BOUND_TIME_X:
          b = new bindings.BoundToTimeX(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_TIME_Y:
          b = new bindings.BoundToTimeY(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_TIME_DROPDOWN:
          b = new bindings.BoundToTimeDropdown(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_TIME_LIST:
          b = new bindings.BoundToTimeList(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_TIME_SERIES:
          b = new bindings.BoundToTimeSeries(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_DISCRETE_SINGLE:
          b = new bindings.BoundToSingleValue(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_DISCRETE_ALL:
          b = new bindings.BoundToAllValues(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_DISCRETE_SINGLE_MENU:
          b = new bindings.BoundToSingleMenu(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_DISCRETE_MULTI_MENU:
          b = new bindings.BoundToMultiMenu(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_DISCRETE_LEVEL_MENU:
          b = new bindings.BoundToLevelMenu(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_DISCRETE_CROSS_MULTIPLE:
          b = new bindings.BoundToCrossMultiple(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_DISCRETE_CROSS_SINGLE:
          b = new bindings.BoundToCrossSingle(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
        case bindings.BoundTo.BOUND_DISCRETE_BUTTONMENU:
          b = new bindings.BoundToButtonMenu(
            oldb.getQueryable(),
            oldb.getDataStructure(),
            oldb.getConcept()
          );
          break;
      }
      if (b !== undefined) {
        store.dispatch("changeBindingClass", b);
      }
    };
    return {
      currentBinding,
      isDimension,
      isTimeDimension,
      isCrossSection,
      isContinuous,
      changeClass,
      items,
      item,
      startDate, endDate,percentOf,items2
    };
  },
  name: "ShowBinding",
  props: {
    msg: String,
  },
  data() {
    return {
      currentBindingType: 0,
    };
  },
};
</script>
