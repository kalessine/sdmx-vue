import * as visual from '../visual/visual';
export const state = {
    visual: new visual.Visual(),
    selectedTab: 0
}
export type State = typeof state
