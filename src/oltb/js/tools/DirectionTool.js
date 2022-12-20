import { DOM } from '../helpers/browser/DOM';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { isHorizontal } from '../helpers/IsRowDirection';
import { StateManager } from '../core/managers/StateManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';
import { toolButtonsTippySingleton } from '../core/Tooltips';

const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.DirectionTool;
const DEFAULT_OPTIONS = Object.freeze({});

class DirectionTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
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
                'data-tippy-content': `${(
                    isHorizontal() 
                        ? 'Vertical toolbar' 
                        : 'Horizontal toolbar'
                )} (${SHORTCUT_KEYS.ToolbarDirection})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        
        this.onWindowDeviceCheck();

        window.addEventListener(EVENTS.Browser.Resize, this.onWindowDeviceCheck.bind(this));
        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowClearDirection.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.ToolbarDirection)) {
            this.handleClick(event);
        }
    }

    onWindowDeviceCheck(event) {
        if(window.innerWidth <= CONFIG.DeviceWidth.SM) {
            this.button.classList.add('oltb-tool-button--hidden');
        }else {
            this.button.classList.remove('oltb-tool-button--hidden');
        }
    }

    onWindowClearDirection() {
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, 'col');
        TOOLBAR_ELEMENT.classList.remove('row');
        document.body.classList.remove('oltb-row');

        // Update toolbar icon
        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', this.horizontalIcon);
        this.button._tippy.setContent(`Horizontal toolbar (${SHORTCUT_KEYS.ToolbarDirection})`);
        toolButtonsTippySingleton.setProps({placement: 'right'});
    }

    handleClick() {
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        this.momentaryActivation();
    }

    momentaryActivation() {
        let direction = 'col';
        let tooltipDirection = 'right';

        if(isHorizontal()) {
            this.onWindowClearDirection();
        }else {
            direction = 'row';
            tooltipDirection = 'bottom';

            StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, 'row');
            TOOLBAR_ELEMENT.classList.add('row');
            document.body.classList.add('oltb-row');

            // Update toolbar icon
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.verticalIcon);
            this.button._tippy.setContent(`Vertical  toolbar (${SHORTCUT_KEYS.ToolbarDirection})`);
            toolButtonsTippySingleton.setProps({placement: 'bottom'});
        }

        // This will trigger collision detection for the toolbar vs toolbox
        window.dispatchEvent(new CustomEvent(EVENTS.Custom.ToolbarDirectionChange, {
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

export { DirectionTool };