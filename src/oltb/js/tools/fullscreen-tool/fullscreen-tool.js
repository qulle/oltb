import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { Toast } from '../../common/toasts/toast';
import { listen } from 'ol/events';
import { Events } from '../../helpers/constants/events';
import { Control } from 'ol/control';
import { LogManager } from '../../managers/log-manager/log-manager';
import { ShortcutKeys } from '../../helpers/constants/shortcut-keys';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { SvgPaths, getIcon } from '../../icons/get-icon';
import { isShortcutKeyOnly } from '../../helpers/browser/is-shortcut-key-only';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';
import { FullscreenEvents, FullscreenEventTypes, isFullScreenSupported, isFullScreen, requestFullScreen, exitFullScreen } from '../../helpers/browser/fullscreen-handler';

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
class FullscreenTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });

        this.enterFullscreenIcon = getIcon({
            path: SvgPaths.fullscreen.stroked,
            class: `${CLASS__TOOL_BUTTON}__icon`
        });

        this.exitFullscreenIcon = getIcon({
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

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.document.addEventListener(Events.browser.fullScreenChange, this.onFullScreenChange.bind(this));

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
        if(!this.isFullScreenSupportedByBrowser()) {
            return;
        }
        
        if(isFullScreen()) {
            exitFullScreen();
        }else {
            this.doRequestFullScreen();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.fullscreenTool)) {
            this.onClickTool(event);
        }
    }

    onFullScreenChange(event) {
        this.doFullScreenChange(event);
    }

    //--------------------------------------------------------------------
    // # Section: Conversions/Validation
    //--------------------------------------------------------------------
    isFullScreenSupportedByBrowser() {
        const isSupported = isFullScreenSupported();

        if(!isSupported) {
            LogManager.logError(FILENAME, 'isFullScreenSupportedByBrowser', {
                title: 'Error',
                error: 'Fullscreen is not supported by this browser'
            });

            Toast.error({
                i18nKey: `${I18N__BASE}.toasts.errors.missingFullScreenSupport`
            });
        }

        return isSupported;
    }

    //--------------------------------------------------------------------
    // # Section: Getters and Setters
    //--------------------------------------------------------------------
    getToolIcon() {
        return isFullScreen() 
            ? this.exitFullscreenIcon 
            : this.enterFullscreenIcon;
    }

    setMap(map) {
        super.setMap(map);
        
        for(let i = 0, ii = FullscreenEvents.length; i < ii; ++i) {
            this.listenerKeys.push(listen(document, FullscreenEvents[i], this.doHandleFullScreenChange, this));
        }
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doRequestFullScreen() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        const element = map.getTargetElement();
        requestFullScreen(element);
    }

    doHandleFullScreenChange() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        if(isFullScreen()) {
            this.dispatchEvent(FullscreenEventTypes.enterFullScreen);
        }else {
            this.dispatchEvent(FullscreenEventTypes.leaveFullScreen);
        }

        map.updateSize();
    }

    doFullScreenChange(event) {
        if(window.document.fullscreenElement) {
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.exitFullscreenIcon);

            // Note: 
            // @Consumer callback
            if(this.options.onEnter instanceof Function) {
                this.options.onEnter(event);
            }
        }else {
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.enterFullscreenIcon);

            // Note: 
            // @Consumer callback
            if(this.options.onLeave instanceof Function) {
                this.options.onLeave(event);
            }
        }

        this.isActive = !this.isActive;
        this.button.classList.toggle(`${CLASS__TOOL_BUTTON}--active`);
    }
}

export { FullscreenTool };