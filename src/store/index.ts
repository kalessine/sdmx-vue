import { createStore } from "vuex";
import { mutations } from "./mutations";
import { getters } from "./getters";
import {actions} from "./actions";
import {state}  from './state';

export default createStore({
  state,
  actions,
  mutations,
  getters
});
