import DOM from '../helpers/Browser/DOM';
import Toast from '../common/Toast';
import Dialog from '../common/Dialog';
import CONFIG from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { easeOut } from 'ol/easing';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { CONTEXT_MENUS } from '../helpers/constants/ContextMenus';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { addContextMenuItem } from '../common/ContextMenu';
import { SVG_PATHS, getIcon } from '../core/icons/SVGIcons';
import { degreesToRadians, radiansToDegrees } from '../helpers/Conversions';

const DEFAULT_OPTIONS = {};

class ResetNorthTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Compass,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Reset North (${SHORTCUT_KEYS.resetNorth})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        addContextMenuItem(CONTEXT_MENUS.mainMap, {
            icon: icon, 
            name: 'Set rotation by degrees', 
            fn: this.onContextMenuSetRotation.bind(this)
        });

        window.addEventListener(EVENTS.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.resetNorth)) {
            this.handleClick(event);
        }
    }

    onContextMenuSetRotation(map, coordinates, target) {
        const view = map.getView();

        const rotation = radiansToDegrees(view.getRotation());
        const normalizedRotation = rotation < 0 ? rotation + 360 : rotation;

        Dialog.prompt({
            text: 'Set rotation by degrees',
            value: Math.round(normalizedRotation),
            confirmText: 'Rotate map',
            onConfirm: (result) => {
                if(result.isDigitsOnly()) {
                    view.animate({
                        rotation: degreesToRadians(result),
                        duration: CONFIG.animationDuration.normal,
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
            duration: CONFIG.animationDuration.normal,
            easing: easeOut
        });

        setTimeout(() => {
            // User defined callback from constructor
            if(typeof this.options.reset === 'function') {
                this.options.reset();
            }
        }, CONFIG.animationDuration.normal);
    }
}

export default ResetNorthTool;