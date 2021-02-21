<template>
  <div>
    <div><h3>Dimensions</h3></div>
    <div>
      <div>
        <div>
          <div v-for="b in dimensionBindings" :key="b.concept">
            <Button v-on:click="chooseBinding($event, b.concept)">{{
              b.getConceptName()
            }}</Button>
            <p style="float: right;margin-block-start: 0px;margin-block-end: 0px">{{ b.boundToString }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showTimeBinding">
      <div><h3>Time</h3></div>
      <div>
        <div>
          <div>
            <div>
              <div>
                <Button
                  v-on:click="chooseBinding($event, timeBinding.concept)"
                  >{{
                    timeBinding !== undefined
                      ? timeBinding.getConceptName()
                      : ""
                  }}</Button
                >
                <p style="float: right;margin-block-start: 0px;margin-block-end: 0px">
                  {{
                    timeBinding != undefined ? timeBinding.boundToString : ""
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showCrossSectionBinding">
      <div>
        <h3>Cross Sectional Measures</h3>
      </div>
      <div>
        <div>
          <div>
            <div>
              <div>
                <Button
                  v-on:click="
                    chooseBinding($event, crossSectionBinding.concept)
                  "
                  >{{
                    crossSectionBinding !== undefined
                      ? crossSectionBinding.getConceptName()
                      : ""
                  }}</Button
                >
                <p style="float: right;margin-block-start: 0px;margin-block-end: 0px">
                  {{
                    crossSectionBinding != undefined
                      ? crossSectionBinding.boundToString
                      : ""
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div><h3>Measures</h3></div>
    <div>
      <div>
        <div>
          <div v-for="b in measureBindings" :key="b.concept">
            <div>
              <Button v-on:click="chooseBinding($event, b.concept)">{{
                b.getConceptName()
              }}</Button>
              <p style="float: right;margin-block-start: 0px;margin-block-end: 0px">{{ b.boundToString }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed } from "vue";
export default {
  setup() {
    const store = useStore();
    const dimensionBindings = computed(() => {
      if (store.getters.dimensionBindings === undefined) {
        return [];
      }
      return store.getters.dimensionBindings;
    });
    const showTimeBinding = computed(() => {
      return store.getters.timeBinding !== undefined;
    });
    const timeBinding = computed(() => {
      return store.getters.timeBinding;
    });
    const crossSectionBinding = computed(() => {
      return store.getters.crossSectionBinding;
    });
    const showCrossSectionBinding = computed(() => {
      return store.getters.crossSectionBinding !== undefined;
    });
    const measureBindings = computed(() => {
      if (store.getters.measureBindings === undefined) {
        return [];
      }
      return store.getters.measureBindings;
    });
    const chooseBinding = ($event, b) => {
      store.dispatch("chooseBinding", b);
    };
    return {
      dimensionBindings,
      timeBinding,
      crossSectionBinding,
      measureBindings,
      chooseBinding,
      showCrossSectionBinding,
      showTimeBinding
    };
  },
  name: "BindingsComponent",
  props: {},
};
</script>
