import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { isHorizontal } from '../../ui-helpers/is-row-direction/is-row-direction';
import { StateManager } from '../../toolbar-managers/state-manager/state-manager';
import { EventManager } from '../../toolbar-managers/event-manager/event-manager';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { LocalStorageKeys } from '../../browser-constants/local-storage-keys';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'direction-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const I18N__BASE = 'tools.directionTool';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onBrowserStateCleared: undefined,
    onChanged: undefined
});

const DirectionData = Object.freeze({
    col: {
        class: 'col',
        icon: getSvgIcon({
            path: SvgPaths.symmetryHorizontal.mixed,
            class: `${CLASS__TOOL_BUTTON}__icon`
        })
    },
    row: {
        class: 'row',
        icon: getSvgIcon({
            path: SvgPaths.symmetryVertical.mixed,
            class: `${CLASS__TOOL_BUTTON}__icon`
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
class DirectionTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: this.getToolIcon(),
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.directionTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.directionTool})`,
                'data-oltb-i18n': `${I18N__BASE}.title`
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
        this.attachGlobalListeners();

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated) {
            this.options.onInitiated();
        }
    }

    attachGlobalListeners() {
        this.onWindowKeyUpBind = this.#onWindowKeyUp.bind(this);
        this.onWindowSizeCheckBind = this.#onWindowSizeCheck.bind(this);
        this.onWindowBrowserStateClearedBind = this.#onWindowBrowserStateCleared.bind(this);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.addEventListener(Events.browser.resize, this.onWindowSizeCheckBind);
        window.addEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.removeEventListener(Events.custom.ready, this.onWindowSizeCheckBind);
        window.removeEventListener(Events.custom.browserStateCleared, this.onWindowBrowserStateClearedBind);
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    onClickTool(event) {
        super.onClickTool(event);
        this.momentaryActivation();

        // Note: 
        // @Consumer callback
        if(this.options.onClicked) {
            this.options.onClicked();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    momentaryActivation() {
        this.doToggleDirection();
        
        const active = this.getActiveDirection();
        EventManager.dispatchCustomEvent([window], Events.custom.toolbarDirectionChange, {
            detail: {
                direction: active.class
            }
        });
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.directionTool)) {
            this.onClickTool(event);
        }
    }

    #onWindowSizeCheck(event) {
        this.shouldToolButtonBeHidden();
    }

    #onWindowBrowserStateCleared() {
        const active = this.getActiveDirection();
        this.doSwitchDirectionFromTo(active, DirectionData.col);

        // Note: 
        // @Consumer callback
        if(this.options.onBrowserStateCleared) {
            this.options.onBrowserStateCleared();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Conversions/Validation
    //--------------------------------------------------------------------
    shouldToolButtonBeHidden() {
        if(window.innerWidth <= ConfigManager.getConfig().deviceWidth.sm) {
            this.button.classList.add(`${CLASS__TOOL_BUTTON}--hidden`);
        }else {
            this.button.classList.remove(`${CLASS__TOOL_BUTTON}--hidden`);
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
        if(this.options.onChanged) {
            this.options.onChanged(inActive.class);
        }
    }

    doSwitchDirectionFromTo(from, to) {
        this.localStorage.direction = to.class;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);

        const baseClass = 'oltb';
        const uiRefToolbarElement = ElementManager.getToolbarElement();
        
        uiRefToolbarElement.classList.remove(from.class);
        window.document.body.classList.remove(`${baseClass}-${from.class}`);

        uiRefToolbarElement.classList.add(to.class);
        window.document.body.classList.add(`${baseClass}-${to.class}`);

        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', to.icon);
    }
}

export { DirectionTool };