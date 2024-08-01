import _ from 'lodash';
import screenfull from 'screenfull';
import { DOM } from '../../browser-helpers/dom-factory';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { LogManager } from '../../toolbar-managers/log-manager/log-manager';
import { ShortcutKeys } from '../../browser-constants/shortcut-keys';
import { isShortcutKeyOnly } from '../../browser-helpers/is-shortcut-key-only';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'fullscreen-tool.js';
const CLASS__TOOL_BUTTON = 'oltb-tool-button';
const I18N__BASE = 'tools.fullscreenTool';

const DefaultOptions = Object.freeze({
    onInitiated: undefined,
    onClicked: undefined,
    onEnter: undefined,
    onLeave: undefined
});

/**
 * About:
 * Use your entire screen and view the Map in full screen
 * 
 * Description:
 * The Map element is rendered in full screen and any other panels in an external application are not included in what is shown on the screen.
 */
class FullscreenTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });

        this.enterFullscreenIcon = getSvgIcon({
            path: SvgPaths.fullscreen.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        this.exitFullscreenIcon = getSvgIcon({
            path: SvgPaths.fullscreenExit.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        const i18n = TranslationManager.get(I18N__BASE);
        const button = DOM.createElement({
            element: 'button',
            html: this.getToolIcon(),
            class: CLASS__TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${i18n.title} (${ShortcutKeys.fullscreenTool})`,
                'data-tippy-content-post': `(${ShortcutKeys.fullscreenTool})`,
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
        this.listenerKeys = [];
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.attachGlobalListeners();

        // Note: 
        // @Consumer callback
        if(this.options.onInitiated) {
            this.options.onInitiated();
        }
    }

    attachGlobalListeners() {
        this.onWindowKeyUpBind = this.#onWindowKeyUp.bind(this);
        this.onFullScreenChangeBind = this.#onFullScreenChange.bind(this);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.document.addEventListener(Events.browser.fullScreenChange, this.onFullScreenChangeBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.browser.keyUp, this.onWindowKeyUpBind);
        window.document.removeEventListener(Events.browser.fullScreenChange, this.onFullScreenChangeBind);
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
        if(!this.isFullScreenSupportedByBrowser()) {
            return;
        }
        
        if(screenfull.isFullscreen) {
            this.doRequestExitFullScreen();
        }else {
            this.doRequestEnterFullScreen();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.fullscreenTool)) {
            this.onClickTool(event);
        }
    }

    #onFullScreenChange(event) {
        this.doFullScreenChange(event);
    }

    //--------------------------------------------------------------------
    // # Section: Conversions/Validation
    //--------------------------------------------------------------------
    isFullScreenSupportedByBrowser() {
        if(!screenfull.isEnabled) {
            LogManager.logError(FILENAME, 'isFullScreenSupportedByBrowser', {
                title: 'Error',
                error: 'Fullscreen is not supported by this browser'
            });

            Toast.error({
                i18nKey: `${I18N__BASE}.toasts.errors.missingFullScreenSupport`
            });
        }

        return screenfull.isEnabled;
    }

    //--------------------------------------------------------------------
    // # Section: Getters and Setters
    //--------------------------------------------------------------------
    getToolIcon() {
        return screenfull.isFullscreen 
            ? this.exitFullscreenIcon 
            : this.enterFullscreenIcon;
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doRequestExitFullScreen() {
        return screenfull.exit();
    }

    doRequestEnterFullScreen() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const element = map.getTargetElement();
        return screenfull.request(element);
    }
    
    doUpdateMapSize() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        map.updateSize();
    }

    doFullScreenChange(event) {
        if(window.document.fullscreenElement) {
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.exitFullscreenIcon);

            // Note: 
            // @Consumer callback
            if(this.options.onEnter) {
                this.options.onEnter(event);
            }
        }else {
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.enterFullscreenIcon);

            // Note: 
            // @Consumer callback
            if(this.options.onLeave) {
                this.options.onLeave(event);
            }
        }

        this.isActive = !this.isActive;
        this.button.classList.toggle(`${CLASS__TOOL_BUTTON}--active`);
    }
}

export { FullscreenTool };