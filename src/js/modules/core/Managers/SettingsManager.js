import StateManager from "./StateManager";

const LOCAL_STORAGE_NODE_NAME = 'settings';
const LOCAL_STORAGE_DEFAULTS = {};

class SettingsManager {
    static localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
    static localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...this.localStorageState };

    static settings = new Map([
        ['mouseWheelZoom', {state: false, text: 'Enable zooming using mousewheel only'}],
        ['altShiftDragRotate', {state: true, text: 'Enable rotate of map using Shift + Alt + Drag'}],
        ['dragPan', {state: true, text: 'Enable dragging using mouse only'}],
        ['keyboardZoom', {state: true, text: 'Enable zooming using keyboard'}],
        ['keyboardPan', {state: true, text: 'Enable panning using keyboard'}],
        ['selectVectorMapShapes', {state: false, text: 'Enable select of shapes in vector map layers'}],
        ['showAttributions', {state: true, text: 'Show attributions (toggle requires page reload)'}],
        ['alwaysNewLayers', {state: false, text: 'Always create new layer when selecting tool'}],
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

window.addEventListener('DOMContentLoaded', function() {
    SettingsManager.init();
});

export default SettingsManager;