import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../managers/LogManager';
import { isHorizontal } from '../helpers/IsRowDirection';
import { StateManager } from '../managers/StateManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ConfigManager } from '../managers/ConfigManager';
import { ElementManager } from '../managers/ElementManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { TranslationManager } from '../managers/TranslationManager';

const FILENAME = 'tools/DirectionTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const I18N_BASE = 'tools.directionTool';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onChanged: undefined
});

const DirectionData = Object.freeze({
    col: {
        class: 'col',
        icon: getIcon({
            path: SvgPaths.symmetryHorizontal.mixed,
            class: `${CLASS_TOOL_BUTTON}__icon`
        })
    },
    row: {
        class: 'row',
        icon: getIcon({
            path: SvgPaths.symmetryVertical.mixed,
            class: `${CLASS_TOOL_BUTTON}__icon`
        })
    }
});

const LocalStorageNodeName = LocalStorageKeys.directionTool;
const LocalStorageDefaults = Object.freeze({
    direction: DirectionData.col.class
});

/**
 * About:
 * Change direction of the Toolbar
 * 
 * Description:
 * The Toolbar is vertical by default, via this tool the Toolbar can be made horizontal.
 */
class DirectionTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: this.getToolIcon(),
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.directionTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.directionTool})`,
                'data-oltb-i18n': `${I18N_BASE}.title`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            },
            prototypes: {
                getTippy: function() {
                    return this._tippy;
                }
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);
        
        this.button = button;
        this.isActive = false;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        
        this.localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.shouldToolButtonBeHidden();

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.browser.resize, this.onWindowSizeCheck.bind(this));
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateCleared.bind(this));

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        this.momentaryActivation();

        // Note: 
        // @Consumer callback
        if(this.options.onClicked instanceof Function) {
            this.options.onClicked();
        }
    }

    momentaryActivation() {
        this.doToggleDirection();

        const active = this.getActiveDirection();
        window.dispatchEvent(new CustomEvent(Events.custom.toolbarDirectionChange, {
            detail: {
                direction: active.class
            }
        }));
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.directionTool)) {
            this.onClickTool(event);
        }
    }

    onWindowSizeCheck(event) {
        this.shouldToolButtonBeHidden();
    }

    onWindowBrowserStateCleared() {
        const active = this.getActiveDirection();
        this.doSwitchDirectionFromTo(active, DirectionData.col);

        // Note: 
        // @Consumer callback
        if(this.options.onBrowserStateCleared instanceof Function) {
            this.options.onBrowserStateCleared();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Conversions/Validation
    //--------------------------------------------------------------------
    shouldToolButtonBeHidden() {
        if(window.innerWidth <= ConfigManager.getConfig().deviceWidth.sm) {
            this.button.classList.add(`${CLASS_TOOL_BUTTON}--hidden`);
        }else {
            this.button.classList.remove(`${CLASS_TOOL_BUTTON}--hidden`);
        }
    }

    //--------------------------------------------------------------------
    // # Section: Getters and Setters
    //--------------------------------------------------------------------
    getToolIcon() {
        return isHorizontal() 
            ? DirectionData.row.icon
            : DirectionData.col.icon;
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

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doToggleDirection() {
        const active = this.getActiveDirection();
        const inActive = this.getInActiveDirection();

        this.doSwitchDirectionFromTo(active, inActive);

        // Note: 
        // @Consumer callback
        if(this.options.onChanged instanceof Function) {
            this.options.onChanged(inActive.class);
        }
    }

    doSwitchDirectionFromTo(from, to) {
        this.localStorage.direction = to.class;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        const uiRefToolbarElement = ElementManager.getToolbarElement();
        
        uiRefToolbarElement.classList.remove(from.class);
        window.document.body.classList.remove(`oltb-${from.class}`);

        uiRefToolbarElement.classList.add(to.class);
        window.document.body.classList.add(`oltb-${to.class}`);

        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', to.icon);
    }
}

export { DirectionTool };