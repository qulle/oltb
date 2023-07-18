import _ from 'lodash';
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
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    onClick: undefined,
    onChanged: undefined
});

// Note: The values are flipped
const DirectionData = Object.freeze({
    col: Object.freeze({
        class: 'col',
        tippyContent: 'Horizontal toolbar',
        icon: getIcon({
            path: SvgPaths.symmetryHorizontal.mixed,
            class: `${CLASS_TOOL_BUTTON}__icon`
        })
    }),
    row: Object.freeze({
        class: 'row',
        tippyContent: 'Vertical toolbar',
        icon: getIcon({
            path: SvgPaths.symmetryVertical.mixed,
            class: `${CLASS_TOOL_BUTTON}__icon`
        })
    })
});

const LocalStorageNodeName = LocalStorageKeys.directionTool;
const LocalStorageDefaults = Object.freeze({
    direction: DirectionData.col.class
});

class DirectionTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });

        const button = DOM.createElement({
            element: 'button',
            html: isHorizontal() 
                ? DirectionData.row.icon
                : DirectionData.col.icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                type: 'button',
                'data-tippy-content': `${(
                    isHorizontal() 
                        ? DirectionData.row.tippyContent
                        : DirectionData.col.tippyContent
                )} (${ShortcutKeys.directionTool})`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            },
            prototypes:{
                getTippy: function() {
                    return this._tippy;
                }
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.active = false;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        
        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.onWindowSizeCheck();

        window.addEventListener(Events.browser.resize, this.onWindowSizeCheck.bind(this));
        window.addEventListener(Events.custom.settingsCleared, this.onWindowSettingsCleared.bind(this));
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.directionTool)) {
            this.onClickTool(event);
        }
    }

    onWindowSizeCheck(event) {
        if(window.innerWidth <= Config.deviceWidth.sm) {
            this.button.classList.add(`${CLASS_TOOL_BUTTON}--hidden`);
        }else {
            this.button.classList.remove(`${CLASS_TOOL_BUTTON}--hidden`);
        }
    }

    onWindowSettingsCleared() {
        const active = this.getActiveDirection();
        this.swithDirectionFromTo(active, DirectionData.col);
    }

    onClickTool() {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        // Note: Consumer callback
        if(this.options.onClick instanceof Function) {
            this.options.onClick();
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

        // Note: Consumer callback
        if(this.options.onChanged instanceof Function) {
            this.options.onChanged(active.class);
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

        const uiRefToolbarElement = ElementManager.getToolbarElement();
        
        uiRefToolbarElement.classList.remove(from.class);
        document.body.classList.remove(`oltb-${from.class}`);

        uiRefToolbarElement.classList.add(to.class);
        document.body.classList.add(`oltb-${to.class}`);

        // Update toolbar button
        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', to.icon);
        this.button.getTippy().setContent(`${to.tippyContent} (${ShortcutKeys.directionTool})`);
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