import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { goToView } from '../../ol-helpers/go-to-view';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { ContextMenuTool } from '../context-menu-tool/context-menu-tool';
import { LocalStorageKeys } from '../../browser-constants/local-storage-keys';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'home-tool.js';
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
class HomeTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        this.icon = getSvgIcon({
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

        this.#initContextMenuItems();
        this.attachGlobalListeners();

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated) {
            this.options.onInitiated();
        }
    }

    attachGlobalListeners() {
        this.onWindowKeyUpBind = this.#onWindowKeyUp.bind(this);
        this.onWindowBrowserStateClearedBind = this.#onWindowBrowserStateCleared.bind(this);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.addEventListener(Events.custom.ready, this.onOLTBReadyBind);
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.removeEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    onClickTool(event) {
        super.onClickTool(event);
        this.momentaryActivation();

        // Note: 
        // @Consumer callback
        if(this.options.onClicked) {
            this.options.onClicked();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    #initContextMenuItems() {
        ContextMenuTool.addItem({
            icon: this.icon, 
            i18nKey: `${I18N__BASE}.contextItems.setHome`, 
            fn: this.#onContextMenuSetHomeLocation.bind(this)
        });
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    momentaryActivation() {
        this.doNavigateHome();
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.homeTool)) {
            this.onClickTool(event);
        }
    }

    #onWindowBrowserStateCleared() {
        this.doClearState();
        this.doNavigateHome();

        // Note: 
        // @Consumer callback
        if(this.options.onBrowserStateCleared) {
            this.options.onBrowserStateCleared();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    #onContextMenuSetHomeLocation(map, coordinates, target) {
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
            autoremove: true
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
                if(this.options.onNavigatedHome) {
                    this.options.onNavigatedHome(result);
                }
            }
        });
    }
}

export { HomeTool };