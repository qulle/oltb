import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { Events } from '../../helpers/constants/events';
import { Control } from 'ol/control';
import { LogManager } from '../../managers/log-manager/log-manager';
import { UrlManager } from '../../managers/url-manager/url-manager';
import { ShortcutKeys } from '../../helpers/constants/shortcut-keys';
import { ConfigManager } from '../../managers/config-manager/config-manager';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { DebugInfoModal } from '../../modal-extensions/debug-info-modal';
import { SvgPaths, getIcon } from '../../icons/get-icon';
import { isShortcutKeyOnly } from '../../helpers/browser/is-shortcut-key-only';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';

const FILENAME = 'DebugInfoTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';
const I18N_BASE = 'tools.debugInfoTool';

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
class DebugInfoTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.bug.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N_BASE);
        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.debugInfoTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.debugInfoTool})`,
                'data-oltb-i18n': `${I18N_BASE}.title`
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
        
        this.initDebugState();

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));

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
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    initDebugState() {
        const debugKey = ConfigManager.getConfig().urlParameter.debug;
        const isDebug = UrlManager.getParameter(debugKey) === 'true';

        if(!isDebug && this.options.onlyWhenGetParameter) {
            this.button.classList.add(`${CLASS_TOOL_BUTTON}--hidden`);
        }
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
        this.doShowDebugInfoModal();
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onWindowKeyUp(event) {
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