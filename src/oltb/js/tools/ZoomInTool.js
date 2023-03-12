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
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';

const FILENAME = 'tools/ZoomInTool.js';

const DefaultOptions = Object.freeze({
    click: undefined,
    zoomed: undefined
});

class ZoomInTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.zoomIn.stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Zoom in (${ShortcutKeys.zoomInTool})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.options = { ...DefaultOptions, ...options };
        this.delta = 1;

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.zoomInTool)) {
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
        }, Config.animationDuration.normal);
    }
}

export { ZoomInTool };