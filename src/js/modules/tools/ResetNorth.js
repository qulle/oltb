import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import Dialog from '../common/Dialog';
import Toast from '../common/Toast';
import Config from '../core/Config';
import { Control } from 'ol/control';
import { easeOut } from 'ol/easing';
import { toolbarElement } from '../core/ElementReferences';
import { addContextMenuItem } from '../common/ContextMenu';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

class ResetNorth extends Control {
    constructor(callbacksObj = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Compass,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Reset rotation (N)');
        button.className = 'oltb-tool-button';
        button.innerHTML = icon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.callbacksObj = callbacksObj;

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

    handleClick(event) {
        event.preventDefault();
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
            if(typeof this.callbacksObj.reset === 'function') {
                this.callbacksObj.reset();
            }
        }, Config.animationDuration);
    }
}

export default ResetNorth;