import Dialog from '../common/Dialog';
import Toast from '../common/Toast';
import CONFIG from '../core/Config';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { easeOut } from 'ol/easing';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { addContextMenuItem } from '../common/ContextMenu';
import { SVG_PATHS, getIcon } from '../core/SVGIcons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { EVENTS } from '../helpers/constants/Events';
import { CONTEXT_MENUS } from '../helpers/constants/ContextMenus';

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
                'data-tippy-content': `Reset North (${SHORTCUT_KEYS.ResetNorth})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        addContextMenuItem(CONTEXT_MENUS.MainMap, {icon: icon, name: 'Set rotation by degrees', fn: this.onContextMenuSetRotation.bind(this)});

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.ResetNorth)) {
            this.handleClick(event);
        }
    }

    onContextMenuSetRotation(map, coordinates, target) {
        const view = map.getView();

        // Get current rotation and convert to normalized degree value
        let rotation = view.getRotation() * (180 / Math.PI);
        rotation = rotation < 0 ? rotation + 360 : rotation;

        Dialog.prompt({
            text: 'Set rotation by degrees',
            value: Math.round(rotation),
            confirmText: 'Rotate map',
            onConfirm: (result) => {
                if(result.isDigitsOnly()) {
                    view.animate({
                        rotation: result * (Math.PI / 180),
                        duration: CONFIG.animationDuration.normal,
                        easing: easeOut
                    });
                }else {
                    Toast.error({text: 'Failed to rotate map, only digits are allowed', autoremove: 4000});
                }
            }
        });
    }

    handleClick() {
        // Note: User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        this.handleResetNorth();
    }

    handleResetNorth() {
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
            // Note: User defined callback from constructor
            if(typeof this.options.reset === 'function') {
                this.options.reset();
            }
        }, CONFIG.animationDuration.normal);
    }
}

export default ResetNorthTool;