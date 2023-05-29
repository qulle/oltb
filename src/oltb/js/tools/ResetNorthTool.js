import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Dialog } from '../common/Dialog';
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
import { degreesToRadians, radiansToDegrees } from '../helpers/Conversions';

const FILENAME = 'tools/ResetNorthTool.js';
const TOOL_BUTTON_CLASS = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    click: undefined,
    reset: undefined
});

class ResetNorthTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.compass.stroked,
            class: `${TOOL_BUTTON_CLASS}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: TOOL_BUTTON_CLASS,
            attributes: {
                type: 'button',
                'data-tippy-content': `Reset North (${ShortcutKeys.resetNorthTool})`
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

        ContextMenu.addItem({
            icon: icon, 
            name: 'Rotate map', 
            fn: this.onContextMenuSetRotation.bind(this)
        });

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.resetNorthTool)) {
            this.handleClick(event);
        }
    }

    onContextMenuSetRotation(map, coordinates, target) {
        const view = map.getView();

        const zoom = view.getZoom();
        const rotation = radiansToDegrees(view.getRotation());
        const normalizationMinLimit = 0;
        const normalizationMaxLimit = 360;
        const normalizedRotation = rotation < normalizationMinLimit 
            ? rotation + normalizationMaxLimit 
            : rotation;

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
                    const errorMessage = 'Only digits are allowed as input';
                    LogManager.logError(FILENAME, 'onContextMenuSetRotation', {
                        message: errorMessage,
                        result: result
                    });

                    Toast.error({
                        title: 'Error',
                        message: errorMessage
                    });
                }
            }
        });
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');

        // User defined callback from constructor
        if(this.options.click instanceof Function) {
            this.options.click();
        }
        
        this.momentaryActivation();
    }

    momentaryActivation() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const view = map.getView();
        const zoom = view.getZoom();
        const coordinates = toLonLat(view.getCenter());

        goToView(map, coordinates, zoom, 0);

        window.setTimeout(() => {
            // User defined callback from constructor
            if(this.options.reset instanceof Function) {
                this.options.reset();
            }
        }, Config.animationDuration.normal);
    }
}

export { ResetNorthTool };