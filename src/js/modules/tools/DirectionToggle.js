import StateManager from '../core/Managers/StateManager';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../core/Icons';
import { toolButtonsTippySingleton } from '../core/ToolbarTooltips';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { isHorizontal } from '../helpers/IsRowDirection';
import { SHORTCUT_KEYS } from '../helpers/Constants/ShortcutKeys';
import { EVENTS } from '../helpers/Constants/Events';

const LOCAL_STORAGE_NODE_NAME = 'direction';

const DEFAULT_OPTIONS = {};

class DirectionToggle extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });
        
        this.horizontalIcon = getIcon({
            path: SVG_PATHS.DirectionHorizontal,
            class: 'oltb-tool-button__icon'
        });

        this.verticalIcon = getIcon({
            path: SVG_PATHS.DirectionVertical,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: isHorizontal() ? this.verticalIcon : this.horizontalIcon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': (isHorizontal() ? 'Vertical toolbar' : 'Horizontal toolbar') + ` (${SHORTCUT_KEYS.ToolbarDirection})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        
        this.isSmallDevice();

        window.addEventListener(EVENTS.Browser.Resize, this.isSmallDevice.bind(this));
        window.addEventListener(EVENTS.Custom.SettingsCleared, this.clearDirection.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, (event) => {
            if(isShortcutKeyOnly(event, SHORTCUT_KEYS.ToolbarDirection)) {
                this.handleClick(event);
            }
        });
    }

    isSmallDevice(event) {
        if(window.innerWidth <= 576) {
            this.button.classList.add('oltb-tool-button--hidden');
        }else {
            this.button.classList.remove('oltb-tool-button--hidden');
        }
    }

    handleClick() {
        this.handleDirectionToggle();
    }

    clearDirection() {
        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, 'col');
        toolbarElement.classList.remove('row');
        document.body.classList.remove('oltb-row');

        // Update toolbar icon
        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', this.horizontalIcon);
        this.button._tippy.setContent(`Horizontal toolbar (${SHORTCUT_KEYS.ToolbarDirection})`);
        toolButtonsTippySingleton.setProps({placement: 'right'});
    }

    handleDirectionToggle() {
        let direction = 'col';
        let tooltipDirection = 'right';

        if(isHorizontal()) {
            this.clearDirection();
        }else {
            direction = 'row';
            tooltipDirection = 'bottom';

            StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, 'row');
            toolbarElement.classList.add('row');
            document.body.classList.add('oltb-row');

            // Update toolbar icon
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.verticalIcon);
            this.button._tippy.setContent(`Vertical  toolbar (${SHORTCUT_KEYS.ToolbarDirection})`);
            toolButtonsTippySingleton.setProps({placement: 'bottom'});
        }

        // This will trigger collision detection for the toolbar vs toolbox
        window.dispatchEvent(new CustomEvent('oltb.toolbar.direction.change', {
            detail: {
                direction: tooltipDirection
            }
        }));

        // User defined callback from constructor
        if(typeof this.options.changed === 'function') {
            this.options.changed(direction);
        }
    }
}

export default DirectionToggle;