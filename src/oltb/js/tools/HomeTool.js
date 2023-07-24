import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Config } from '../core/Config';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { toLonLat } from 'ol/proj';
import { goToView } from '../helpers/GoToView';
import { LogManager } from '../core/managers/LogManager';
import { ContextMenu } from '../common/ContextMenu';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';

const FILENAME = 'tools/HomeTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    lon: 18.1201,
    lat: 35.3518,
    zoom: 3,
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onNavigatedHome: undefined
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
                'data-tippy-content': `Zoom home (${ShortcutKeys.homeTool})`
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

        this.homeLocation = [this.options.lon, this.options.lat];
        this.homeZoom = this.options.zoom;
        
        this.userDefinedHomeLocation = undefined;
        this.userDefinedHomeZoom = undefined;

        this.initContextMenuItems();

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateCleared.bind(this));

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
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
        const map = this.getMap();
        if(!map) {
            return;
        }
        
        const zoom = this.getZoom();
        const coordiantes = this.getCoordinates();

        goToView(map, coordiantes, zoom);

        window.setTimeout(() => {
            // Note: Consumer callback
            if(this.options.onNavigatedHome instanceof Function) {
                this.options.onNavigatedHome();
            }
        }, Config.animationDuration.normal);
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
        this.userDefinedHomeLocation = undefined;
        this.userDefinedHomeZoom = undefined;

        // Note: Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

    onContextMenuSetHomeLocation() {
        this.setHomeLocation();
    }

    // -------------------------------------------------------------------
    // # Section: Tool Actions
    // -------------------------------------------------------------------

    setHomeLocation() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const view = map.getView();

        this.userDefinedHomeZoom = view.getZoom();
        this.userDefinedHomeLocation = toLonLat(view.getCenter());

        Toast.success({
            title: 'New home',
            message: 'New location was set as home',
            autoremove: Config.autoRemovalDuation.normal
        });
    }

    getZoom() {
        return this.userDefinedHomeZoom
            ? this.userDefinedHomeZoom 
            : this.homeZoom;
    }

    getCoordinates() {
        return this.userDefinedHomeLocation 
            ? this.userDefinedHomeLocation 
            : this.homeLocation;
    }
}

export { HomeTool };