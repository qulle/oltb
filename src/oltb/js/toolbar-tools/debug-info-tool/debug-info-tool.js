import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { UrlManager } from '../../toolbar-managers/url-manager/url-manager';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { DebugInfoModal } from '../../ui-extensions/debug-info-modal/debug-info-modal';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'debug-info-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const I18N__BASE = 'tools.debugInfoTool';

const DefaultOptions = Object.freeze({
    onlyWhenGetParameter: false,
    onInitiated: undefined,
    onClicked: undefined
});

/**
 * About:
 * Show debug information and event log
 * 
 * Description: 
 * Errors happen and when they do this tool is a good place to start. 
 * Check browser version, status in localStorage and a complete log of what happened in different parts of the Map.
 */
class DebugInfoTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });
        
        const icon = getSvgIcon({
            path: SvgPaths.bug.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.debugInfoTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.debugInfoTool})`,
                'data-oltb-i18n': `${I18N__BASE}.title`
            },
            listeners: {
                'click': this.onClickTool.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.debugInfoModal = undefined;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        
        this.#initDebugState();
        this.attachGlobalListeners();

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated) {
            this.options.onInitiated();
        }
    }

    attachGlobalListeners() {
        this.onWindowKeyUpBind = this.#onWindowKeyUp.bind(this);
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
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
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    #initDebugState() {
        const debugKey = ConfigManager.getConfig().urlParameter.debug;
        const isDebug = UrlManager.getParameter(debugKey) === 'true';

        if(!isDebug && this.options.onlyWhenGetParameter) {
            this.button.classList.add(`${CLASS__TOOL_BUTTON}--hidden`);
        }
    }

    //--------------------------------------------------------------------
    // # Section: Tool Control
    //--------------------------------------------------------------------
    momentaryActivation() {
        this.doShowDebugInfoModal();
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.debugInfoTool)) {
            this.onClickTool(event);
        }
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doShowDebugInfoModal() {
        if(this.debugInfoModal) {
            return;
        }
        
        const map = this.getMap();
        if(!map) {
            return;
        }

        this.debugInfoModal = new DebugInfoModal({
            map: map,
            onClose: () => {
                this.debugInfoModal = undefined;
            }
        });
    }
}

export { DebugInfoTool };