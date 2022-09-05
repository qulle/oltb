import 'ol/ol.css';
import Dialog from '../common/Dialog';
import Toast from '../common/Toast';
import Config from '../core/Config';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { easeOut } from 'ol/easing';
import { toolbarElement } from '../core/ElementReferences';
import { addContextMenuItem } from '../common/ContextMenu';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

class ResetNorth extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Compass,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': 'Reset rotation (N)'
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.options = options;

        addContextMenuItem('main.map.context.menu', {icon: icon, name: 'Set rotation by degrees', fn: function(map, coordinates, target) {
            const view = map.getView();

            // Get current rotation and convert to normalized degree value
            let rotation = view.getRotation() * (180 / Math.PI);
            rotation = rotation < 0 ? rotation + 360 : rotation;

            Dialog.prompt({
                text: 'Set rotation by degrees',
                value: Math.round(rotation),
                confirmText: 'Rotate map',
                onConfirm: result => {
                    if(result.isDigitsOnly()) {
                        view.animate({
                            rotation: result * (Math.PI / 180),
                            duration: Config.animationDuration,
                            easing: easeOut
                        });
                    }else {
                        Toast.error({text: 'Failed to rotate map, only digits are allowed', autoremove: 4000});
                    }
                }
            });
        }});

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'n')) {
                this.handleResetNorth();
            }
        });
    }

    handleClick() {
        this.handleResetNorth();
    }

    handleResetNorth() {
        const view = this.getMap().getView();

        if(view.getAnimating()) {
            view.cancelAnimations();
        }

        view.animate({
            rotation: 0,
            duration: Config.animationDuration,
            easing: easeOut
        });

        setTimeout(() => {
            // User defined callback from constructor
            if(typeof this.options.reset === 'function') {
                this.options.reset();
            }
        }, Config.animationDuration);
    }
}

export default ResetNorth;