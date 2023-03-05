import { DOM } from '../helpers/browser/DOM';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { toLonLat } from "ol/proj";
import { goToView } from '../helpers/GoToView';
import { LogManager } from '../core/managers/LogManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';

const FILENAME = 'tools/ZoomOutTool.js';
const DEFAULT_OPTIONS = Object.freeze({});

class ZoomOutTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.ZoomOut.Stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Zoom out (${SHORTCUT_KEYS.ZoomOut})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.delta = -1;

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.ZoomOut)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');

        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        this.momentaryActivation();
    }

    momentaryActivation() {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }
        
        const view = map.getView();
        const coordiantes = toLonLat(view.getCenter());
        const currentZoom = view.getZoom();
        const newZoom = view.getConstrainedZoom(currentZoom + this.delta);

        goToView(map, coordiantes, newZoom);

        window.setTimeout(() => {
            // User defined callback from constructor
            if(typeof this.options.zoomed === 'function') {
                this.options.zoomed();
            }
        }, CONFIG.AnimationDuration.Normal);
    }
}

export { ZoomOutTool };