import StateManager from "./StateManager";
import { EVENTS } from "../../helpers/constants/Events";
import { SETTINGS } from "../../helpers/constants/Settings";

const LOCAL_STORAGE_NODE_NAME = 'settings';
const LOCAL_STORAGE_DEFAULTS = {};

class SettingsManager {
    static localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
    static localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...this.localStorageState };

    static settings = new Map([
        [SETTINGS.MouseWheelZoom, {state: false, text: 'Enable zooming using mousewheel only'}],
        [SETTINGS.AltShiftDragRotate, {state: true, text: 'Enable rotate of map using Shift + Alt + Drag'}],
        [SETTINGS.DragPan, {state: true, text: 'Enable dragging using mouse only'}],
        [SETTINGS.KeyboardZoom, {state: true, text: 'Enable zooming using keyboard'}],
        [SETTINGS.KeyboardPan, {state: true, text: 'Enable panning using keyboard'}],
        [SETTINGS.SelectVectorMapShapes, {state: false, text: 'Enable select of shapes in vector map layers'}],
        [SETTINGS.ShowAttributions, {state: true, text: 'Show attributions (toggle requires page reload)'}],
        [SETTINGS.AlwaysNewLayers, {state: false, text: 'Always create new layer when selecting tool'}],
    ]);

    static init() {
        // Update the states of the settings map with values from localStorage
        this.settings.forEach((value, key) => {
            if(key in this.localStorage) {
                value.state = this.localStorage[key];
            }
        });
    }

    static addSetting(key, valueObj) {
        this.settings.set(key, valueObj);
    }

    static getSettings() {
        return this.settings;
    }

    static setSetting(key, state) {
        this.settings.get(key).state = state;
        this.localStorage[key] = state;

        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
    }

    static getSetting(key) {
        return this.settings.get(key).state;
    }
}

window.addEventListener(EVENTS.Browser.DOMContentLoaded, function() {
    SettingsManager.init();
});

export default SettingsManager;