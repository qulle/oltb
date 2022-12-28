import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { Dialog } from '../common/Dialog';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { easeOut } from 'ol/easing';
import { ContextMenu } from '../common/ContextMenu';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { degreesToRadians, radiansToDegrees } from '../helpers/Conversions';

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

        const rotation = radiansToDegrees(view.getRotation());
        const normalizedRotation = rotation < 0 ? rotation + 360 : rotation;

        Dialog.prompt({
            title: 'Rotate map',
            message: 'Set map rotation by degrees',
            value: Math.round(normalizedRotation),
            confirmText: 'Rotate map',
            onConfirm: (result) => {
                if(result.isDigitsOnly()) {
                    view.animate({
                        rotation: degreesToRadians(result),
                        duration: CONFIG.AnimationDuration.Normal,
                        easing: easeOut
                    });
                }else {
                    Toast.error({text: 'Only digits are allowed', autoremove: 4000});
                }
            }
        });
    }

    handleClick() {
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        this.momentaryActivation();
    }

    momentaryActivation() {
        const view = this.getMap().getView();

        if(view.getAnimating()) {
            view.cancelAnimations();
        }

        view.animate({
            rotation: 0,
            duration: CONFIG.AnimationDuration.Normal,
            easing: easeOut
        });

        setTimeout(() => {
            // User defined callback from constructor
            if(typeof this.options.reset === 'function') {
                this.options.reset();
            }
        }, CONFIG.AnimationDuration.Normal);
    }
}

export { ResetNorthTool };