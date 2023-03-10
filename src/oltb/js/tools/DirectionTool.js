import { DOM } from '../helpers/browser/DOM';
import { CONFIG } from '../core/Config';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { isHorizontal } from '../helpers/IsRowDirection';
import { StateManager } from '../core/managers/StateManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';

const FILENAME = 'tools/DirectionTool.js';
const DEFAULT_OPTIONS = Object.freeze({
    click: undefined,
    changed: undefined
});

const DIRECTION_DATA = Object.freeze({
    col: Object.freeze({
        class: 'col',
        tippyContent: 'Vertical toolbar',
        icon: getIcon({
            path: SVG_PATHS.SymmetryVertical.Mixed,
            class: 'oltb-tool-button__icon'
        })
    }),
    row: Object.freeze({
        class: 'row',
        tippyContent: 'Horizontal toolbar',
        icon: getIcon({
            path: SVG_PATHS.SymmetryHorizontal.Mixed,
            class: 'oltb-tool-button__icon'
        })
    })
});

const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.DirectionTool;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    direction: DIRECTION_DATA.col.class
});

class DirectionTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });

        const button = DOM.createElement({
            element: 'button',
            html: isHorizontal() 
                ? DIRECTION_DATA.col.icon
                : DIRECTION_DATA.row.icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `${(
                    isHorizontal() 
                        ? DIRECTION_DATA.col.tippyContent
                        : DIRECTION_DATA.row.tippyContent
                )} (${SHORTCUT_KEYS.ToolbarDirection})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        
        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME);
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        this.onWindowDeviceCheck();

        window.addEventListener(EVENTS.Browser.Resize, this.onWindowDeviceCheck.bind(this));
        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowSettingsCleared.bind(this));
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

    onWindowSettingsCleared() {
        const active = this.getActiveDirection();
        this.swithDirectionFromTo(active, DIRECTION_DATA.col);
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
        this.toggleDirection();

        const active = this.getActiveDirection();
        window.dispatchEvent(new CustomEvent(EVENTS.Custom.ToolbarDirectionChange, {
            detail: {
                direction: active.class
            }
        }));

        // User defined callback from constructor
        if(typeof this.options.changed === 'function') {
            this.options.changed(active.class);
        }
    }

    toggleDirection() {
        const active = this.getActiveDirection();
        const inActive = this.getInActiveDirection();

        this.swithDirectionFromTo(active, inActive);
    }

    swithDirectionFromTo(from, to) {
        this.localStorage.direction = to.class;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);

        const toolbarElement = ElementManager.getToolbarElement();
        
        toolbarElement.classList.remove(from.class);
        document.body.classList.remove(`oltb-${from.class}`);

        toolbarElement.classList.add(to.class);
        document.body.classList.add(`oltb-${to.class}`);

        // Update toolbar button
        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', from.icon);
        this.button._tippy.setContent(`${from.tippyContent} (${SHORTCUT_KEYS.ToolbarDirection})`);
    }

    getInActiveDirection() {
        return isHorizontal()
            ? DIRECTION_DATA.col
            : DIRECTION_DATA.row;
    }

    getActiveDirection() {
        return isHorizontal()
            ? DIRECTION_DATA.row
            : DIRECTION_DATA.col;
    }
}

export { DirectionTool };