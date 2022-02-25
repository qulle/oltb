import StateManager from "./StateManager";

class SettingsManager {
    static settings = new Map([
        ['mouseWheelZoom', {state: false, text: 'Enable zooming using mousewheel only'}],
        ['altShiftDragRotate', {state: true, text: 'Enable rotate of map using Shift + Alt + Drag'}],
        ['dragPan', {state: true, text: 'Enable dragging using mouse only'}],
        ['keyboardZoom', {state: true, text: 'Enable zooming using keyboard'}],
        ['keyboardPan', {state: true, text: 'Enable panning using keyboard'}],
        ['selectVectorMapShapes', {state: false, text: 'Enable select of shapes in vector map layers'}],
        ['showAttributions', {state: true, text: 'Show attributions (toggle requires reload of page)'}],
        ['alwaysNewLayers', {state: false, text: 'Always create new layer when selecting tool'}],
        ['copyCoordinatesOnClick', {state: true, text: 'Copy coordinates on click (Coordinates tool)'}],
    ]);

    static localStorageSettings = JSON.parse(StateManager.getStateObject('settings')) || {};

    static init() {
        // Update the states of the settings map with values from local storage
        this.settings.forEach((value, key) => {
            if(key in this.localStorageSettings) {
                value.state = this.localStorageSettings[key];
            }
        });
    }

    static getSettings() {
        return this.settings;
    }

    static setSetting(name, state) {
        this.settings.get(name).state = state;
        this.localStorageSettings[name] = state;

        StateManager.updateStateObject('settings', JSON.stringify(this.localStorageSettings));
    }

    static getSetting(name) {
        return this.settings.get(name).state;
    }
}

SettingsManager.init();

export default SettingsManager;