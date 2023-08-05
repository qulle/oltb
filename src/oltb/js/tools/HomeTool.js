import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Config } from '../core/Config';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { goToView } from '../helpers/GoToView';
import { LogManager } from '../core/managers/LogManager';
import { ContextMenu } from '../common/ContextMenu';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';

const FILENAME = 'tools/HomeTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    lon: Config.defaultLocation.lon,
    lat: Config.defaultLocation.lat,
    zoom: Config.defaultLocation.zoom,
    rotation: Config.defaultLocation.rotation,
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onNavigatedHome: undefined
});

const LocalStorageNodeName = LocalStorageKeys.homeTool;
const LocalStorageDefaults = Object.freeze({
    lon: Config.defaultLocation.lon,
    lat: Config.defaultLocation.lat,
    zoom: Config.defaultLocation.zoom,
    rotation: Config.defaultLocation.rotation,
});

/**
 * About:
 * Navigate to your home location
 * 
 * Description:
 * Your home position is a fixed point that you can have as a base to start from. 
 * It can be set through the constructor and changed by the user.
 */
class HomeTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        this.icon = getIcon({
            path: SvgPaths.house.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: this.icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `Zoom Home (${ShortcutKeys.homeTool})`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.initContextMenuItems();

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateCleared.bind(this));

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
    }

    // -------------------------------------------------------------------
    // # Section: Init Helpers
    // -------------------------------------------------------------------

    initContextMenuItems() {
        ContextMenu.addItem({
            icon: this.icon, 
            name: 'Set Home', 
            fn: this.onContextMenuSetHomeLocation.bind(this)
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');
        
        this.momentaryActivation();

        // Note: Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    momentaryActivation() {
        this.doNavigateHome(map);
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.homeTool)) {
            this.onClickTool(event);
        }
    }

    onWindowBrowserStateCleared() {
        this.doClearState();
        this.doNavigateHome();

        // Note: Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

    onContextMenuSetHomeLocation(map, coordinates, target) {
        this.doCreateNewHome(coordinates);
    }

    // -------------------------------------------------------------------
    // # Section: Getters and Setters
    // -------------------------------------------------------------------

    getZoom() {
        if(this.localStorage.zoom !== this.options.zoom) {
            return this.localStorage.zoom;
        }

        return this.options.zoom;
    }

    getRotation() {
        if(this.localStorage.rotation !== this.options.rotation) {
            return this.localStorage.rotation;
        }

        return this.options.rotation;
    }

    getLocation() {
        if(
            this.localStorage.lon !== this.options.lon ||
            this.localStorage.lat !== this.options.lat
        ) {
            return [
                this.localStorage.lon,
                this.localStorage.lat
            ];
        }

        return [
            this.options.lon,
            this.options.lat
        ];
    }

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

    doCreateNewHome(coordinates) {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const view = map.getView();
        const zoom = view.getZoom();
        const rotation = view.getRotation();

        this.localStorage.zoom = zoom;
        this.localStorage.rotation = rotation;
        this.localStorage.lon = coordinates[0];
        this.localStorage.lat = coordinates[1];
        
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        Toast.success({
            title: 'New Home',
            message: 'New location was set as home',
            autoremove: Config.autoRemovalDuation.normal
        });
    }

    doNavigateHome() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const zoom = this.getZoom();
        const rotation = this.getRotation();
        const location = this.getLocation();

        goToView({
            map: map,
            coordinates: location,
            zoom: zoom,
            rotation: rotation,
            onDone: (result) => {
                // Note: Consumer callback
                if(this.options.onNavigatedHome instanceof Function) {
                    this.options.onNavigatedHome(result);
                }
            }
        });
    }

    doClearState() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
    }
}

export { HomeTool };