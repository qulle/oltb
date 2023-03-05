import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Dialog } from '../common/Dialog';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { toLonLat } from 'ol/proj';
import { goToView } from '../helpers/GoToView';
import { LogManager } from '../core/managers/LogManager';
import { ContextMenu } from '../common/ContextMenu';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { degreesToRadians, radiansToDegrees } from '../helpers/Conversions';

const FILENAME = 'tools/ResetNorthTool.js';
const DEFAULT_OPTIONS = Object.freeze({});

class ResetNorthTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Compass.Stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Reset North (${SHORTCUT_KEYS.ResetNorth})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        ContextMenu.addItem({
            icon: icon, 
            name: 'Rotate map', 
            fn: this.onContextMenuSetRotation.bind(this)
        });

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.ResetNorth)) {
            this.handleClick(event);
        }
    }

    onContextMenuSetRotation(map, coordinates, target) {
        const view = map.getView();

        const zoom = view.getZoom();
        const rotation = radiansToDegrees(view.getRotation());
        const normalizedRotation = rotation < 0 ? rotation + 360 : rotation;

        // Must use the center of the view
        // The method gets the coordinates where the user clicked
        const centerCoordinates = toLonLat(view.getCenter());

        Dialog.prompt({
            title: 'Rotate map',
            message: 'Set map rotation by degrees',
            value: Math.round(normalizedRotation),
            confirmText: 'Rotate map',
            onConfirm: (result) => {
                if(result.isDigitsOnly()) {
                    goToView(map, centerCoordinates, zoom, degreesToRadians(result));
                }else {
                    Toast.error({
                        title: 'Error',
                        message: 'Only digits are allowed as input'
                    });
                }
            }
        });
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
        const zoom = view.getZoom();
        const coordinates = toLonLat(view.getCenter());

        goToView(map, coordinates, zoom, 0);

        window.setTimeout(() => {
            // User defined callback from constructor
            if(typeof this.options.reset === 'function') {
                this.options.reset();
            }
        }, CONFIG.AnimationDuration.Normal);
    }
}

export { ResetNorthTool };