import { DOM } from '../helpers/browser/DOM';
import { Config } from '../core/Config';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { isHorizontal } from '../helpers/IsRowDirection';
import { StateManager } from '../core/managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';

const FILENAME = 'tools/DirectionTool.js';
const TOOL_BUTTON_CLASS = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    click: undefined,
    changed: undefined
});

// Note: The values are flipped
const DirectionData = Object.freeze({
    col: Object.freeze({
        class: 'col',
        tippyContent: 'Horizontal toolbar',
        icon: getIcon({
            path: SvgPaths.symmetryHorizontal.mixed,
            class: `${TOOL_BUTTON_CLASS}__icon`
        })
    }),
    row: Object.freeze({
        class: 'row',
        tippyContent: 'Vertical toolbar',
        icon: getIcon({
            path: SvgPaths.symmetryVertical.mixed,
            class: `${TOOL_BUTTON_CLASS}__icon`
        })
    })
});

const LocalStorageNodeName = LocalStorageKeys.directionTool;
const LocalStorageDefaults = Object.freeze({
    direction: DirectionData.col.class
});

class DirectionTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });

        const button = DOM.createElement({
            element: 'button',
            html: isHorizontal() 
                ? DirectionData.row.icon
                : DirectionData.col.icon,
            class: TOOL_BUTTON_CLASS,
            attributes: {
                type: 'button',
                'data-tippy-content': `${(
                    isHorizontal() 
                        ? DirectionData.row.tippyContent
                        : DirectionData.col.tippyContent
                )} (${ShortcutKeys.directionTool})`
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
        this.options = { ...DefaultOptions, ...options };
        
        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LocalStorageNodeName);
        this.localStorage = { ...LocalStorageDefaults, ...localStorageState };

        this.onWindowSizeCheck();

        window.addEventListener(Events.browser.resize, this.onWindowSizeCheck.bind(this));
        window.addEventListener(Events.custom.settingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.directionTool)) {
            this.handleClick(event);
        }
    }

    onWindowSizeCheck(event) {
        if(window.innerWidth <= Config.deviceWidth.sm) {
            this.button.classList.add(`${TOOL_BUTTON_CLASS}--hidden`);
        }else {
            this.button.classList.remove(`${TOOL_BUTTON_CLASS}--hidden`);
        }
    }

    onWindowSettingsCleared() {
        const active = this.getActiveDirection();
        this.swithDirectionFromTo(active, DirectionData.col);
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
        this.toggleDirection();

        const active = this.getActiveDirection();
        window.dispatchEvent(new CustomEvent(Events.custom.toolbarDirectionChange, {
            detail: {
                direction: active.class
            }
        }));

        // User defined callback from constructor
        if(this.options.changed instanceof Function) {
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
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        const toolbarElement = ElementManager.getToolbarElement();
        
        toolbarElement.classList.remove(from.class);
        document.body.classList.remove(`oltb-${from.class}`);

        toolbarElement.classList.add(to.class);
        document.body.classList.add(`oltb-${to.class}`);

        // Update toolbar button
        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', to.icon);
        this.button._tippy.setContent(`${to.tippyContent} (${ShortcutKeys.directionTool})`);
    }

    getInActiveDirection() {
        return isHorizontal()
            ? DirectionData.col
            : DirectionData.row;
    }

    getActiveDirection() {
        return isHorizontal()
            ? DirectionData.row
            : DirectionData.col;
    }
}

export { DirectionTool };