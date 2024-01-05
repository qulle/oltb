import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { goToView } from '../helpers/GoToView';
import { LogManager } from '../managers/LogManager';
import { ContextMenu } from '../common/ContextMenu';
import { StateManager } from '../managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ConfigManager } from '../managers/ConfigManager';
import { ElementManager } from '../managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { TranslationManager } from '../managers/TranslationManager';

const FILENAME = 'tools/HomeTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const I18N_BASE = 'tools.homeTool';

const DefaultLocation = ConfigManager.getConfig().location.default;
const DefaultOptions = Object.freeze({
    lon: DefaultLocation.lon,
    lat: DefaultLocation.lat,
    zoom: DefaultLocation.zoom,
    rotation: DefaultLocation.rotation,
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onNavigatedHome: undefined
});

const LocalStorageNodeName = LocalStorageKeys.homeTool;
const LocalStorageDefaults = Object.freeze({
    lon: DefaultLocation.lon,
    lat: DefaultLocation.lat,
    zoom: DefaultLocation.zoom,
    rotation: DefaultLocation.rotation,
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

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: this.icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.homeTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.homeTool})`,
                'data-oltb-i18n': `${I18N_BASE}.title`
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

        // Note: 
        // @Consumer callback
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
            i18nKey: `${I18N_BASE}.contextItems.setHome`, 
            fn: this.onContextMenuSetHomeLocation.bind(this)
        });
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');
        
        this.momentaryActivation();

        // Note: 
        // @Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    momentaryActivation() {
        this.doNavigateHome();
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

        // Note: 
        // @Consumer callback
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

    doClearState() {
        this.localStorage = _.cloneDeep(LocalStorageDefaults);
        StateManager.setStateObject(LocalStorageNodeName, LocalStorageDefaults);
    }

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
            i18nKey: `${I18N_BASE}.toasts.infos.setHomeLocation`,
            autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
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
                // Note: 
                // @Consumer callback
                if(this.options.onNavigatedHome instanceof Function) {
                    this.options.onNavigatedHome(result);
                }
            }
        });
    }
}

export { HomeTool };