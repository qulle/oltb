import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { Toast } from '../../common/toasts/toast';
import { Events } from '../../helpers/constants/events';
import { Control } from 'ol/control';
import { goToView } from '../../helpers/go-to-view';
import { LogManager } from '../../managers/log-manager/log-manager';
import { StateManager } from '../../managers/state-manager/state-manager';
import { ShortcutKeys } from '../../helpers/constants/shortcut-keys';
import { ConfigManager } from '../../managers/config-manager/config-manager';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { ContextMenuTool } from '../context-menu-tool/context-menu-tool';
import { LocalStorageKeys } from '../../helpers/constants/local-storage-keys';
import { SvgPaths, getIcon } from '../../icons/get-icon';
import { isShortcutKeyOnly } from '../../helpers/browser/is-shortcut-key-only';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';

const FILENAME = 'HomeTool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const I18N__BASE = 'tools.homeTool';

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
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: this.icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.homeTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.homeTool})`,
                'data-oltb-i18n': `${I18N__BASE}.title`
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

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    initContextMenuItems() {
        ContextMenuTool.addItem({
            icon: this.icon, 
            i18nKey: `${I18N__BASE}.contextItems.setHome`, 
            fn: this.onContextMenuSetHomeLocation.bind(this)
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
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

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
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

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    onContextMenuSetHomeLocation(map, coordinates, target) {
        this.doCreateNewHome(coordinates);
    }

    //--------------------------------------------------------------------
    // # Section: Getters and Setters
    //--------------------------------------------------------------------
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

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
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
            i18nKey: `${I18N__BASE}.toasts.infos.setHomeLocation`,
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