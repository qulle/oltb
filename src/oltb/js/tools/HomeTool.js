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
    onClick: undefined,
    onHome: undefined
});

class HomeTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.house.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
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

        ContextMenu.addItem({
            icon: icon, 
            name: 'Set as home', 
            fn: this.onContextMenuSetHomeLocation.bind(this)
        });

        window.addEventListener(Events.custom.settingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.homeTool)) {
            this.onClickTool(event);
        }
    }

    onClickTool() {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        // Note: Consumer callback
        if(this.options.onClick instanceof Function) {
            this.options.onClick();
        }
        
        this.momentaryActivation();
    }

    momentaryActivation() {
        const map = this.getMap();
        if(!map) {
            return;
        }
        
        const zoom = this.userDefinedHomeZoom
            ? this.userDefinedHomeZoom 
            : this.homeZoom;

        const coordiantes = this.userDefinedHomeLocation 
            ? this.userDefinedHomeLocation 
            : this.homeLocation;

        goToView(map, coordiantes, zoom);

        window.setTimeout(() => {
            // Note: Consumer callback
            if(this.options.onHome instanceof Function) {
                this.options.onHome();
            }
        }, Config.animationDuration.normal);
    }

    onWindowSettingsCleared() {
        this.userDefinedHomeLocation = undefined;
        this.userDefinedHomeZoom = undefined;
    }

    onContextMenuSetHomeLocation() {
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
}

export { HomeTool };