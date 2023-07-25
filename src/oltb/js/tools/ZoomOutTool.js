import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Config } from '../core/Config';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { toLonLat } from "ol/proj";
import { goToView } from '../helpers/GoToView';
import { LogManager } from '../core/managers/LogManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';

const FILENAME = 'tools/ZoomOutTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    delta: -1,
    onInitiated: undefined,
    onClicked: undefined,
    onZoomed: undefined
});

/**
 * About:
 * Zoom out of the Map
 * 
 * Description:
 * Reduce zooming and get a more comprehensive view of the surroundings in the Map.
 */
class ZoomOutTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.zoomOut.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `Zoom Out (${ShortcutKeys.zoomOutTool})`
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

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
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
        
        this.zoomOut(map);
    }

    // -------------------------------------------------------------------
    // # Section: Tool Actions
    // -------------------------------------------------------------------

    zoomOut(map) {
        const view = map.getView();
        const coordiantes = toLonLat(view.getCenter());
        const currentZoom = view.getZoom();
        const newZoom = view.getConstrainedZoom(currentZoom + this.options.delta);

        goToView(map, coordiantes, newZoom);

        window.setTimeout(() => {
            // Note: Consumer callback
            if(this.options.onZoomed instanceof Function) {
                this.options.onZoomed();
            }
        }, Config.animationDuration.normal);
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.zoomOutTool)) {
            this.onClickTool(event);
        }
    }
}

export { ZoomOutTool };