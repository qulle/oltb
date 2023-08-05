import _ from 'lodash';
import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { listen } from 'ol/events';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { FullscreenEvents, FullscreenEventTypes, isFullScreenSupported, isFullScreen, requestFullScreen, exitFullScreen } from '../helpers/browser/Fullscreen';

const FILENAME = 'tools/FullscreenTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

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
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        this.exitFullscreenIcon = getIcon({
            path: SvgPaths.fullscreenExit.stroked,
            class: `${CLASS_TOOL_BUTTON}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: this.getToolIcon(),
            class: CLASS_TOOL_BUTTON,
            attributes: {
                'type': 'button',
                'data-tippy-content': `${this.getToolTippyContent()} (${ShortcutKeys.fullscreenTool})`
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
        document.addEventListener(Events.browser.fullScreenChange, this.onFullScreenChange.bind(this));

        // Note: Consumer callback
        if(this.options.onInitiated instanceof Function) {
            this.options.onInitiated();
        }
    }

    getName() {
        return FILENAME;
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool(event) {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        this.momentaryActivation();

        // Note: Consumer callback
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

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.fullscreenTool)) {
            this.onClickTool(event);
        }
    }

    onFullScreenChange(event) {
        if(document.fullscreenElement) {
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.exitFullscreenIcon);
            this.button.getTippy().setContent(`Exit fullscreen (${ShortcutKeys.fullscreenTool})`);

            // Note: Consumer callback
            if(this.options.onEnter instanceof Function) {
                this.options.onEnter(event);
            }
        }else {
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.enterFullscreenIcon);
            this.button.getTippy().setContent(`Enter fullscreen (${ShortcutKeys.fullscreenTool})`);

            // Note: Consumer callback
            if(this.options.onLeave instanceof Function) {
                this.options.onLeave(event);
            }
        }

        this.isActive = !this.isActive;
        this.button.classList.toggle(`${CLASS_TOOL_BUTTON}--active`);
    }

    // -------------------------------------------------------------------
    // # Section: Conversions/Validation
    // -------------------------------------------------------------------

    isFullScreenSupportedByBrowser() {
        const isSupported = isFullScreenSupported();

        if(!isSupported) {
            const errorMessage = 'Fullscreen is not supported by this browser';
            LogManager.logError(FILENAME, 'isFullScreenSupportedByBrowser', errorMessage);

            Toast.error({
                title: 'Error',
                message: errorMessage
            });
        }

        return isSupported;
    }

    // -------------------------------------------------------------------
    // # Section: Getters and Setters
    // -------------------------------------------------------------------

    getToolTippyContent() {
        return isFullScreen() 
            ? 'Exit Fullscreen' 
            : 'Enter Fullscreen';
    }

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

    // -------------------------------------------------------------------
    // # Section: Tool DoActions
    // -------------------------------------------------------------------

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
}

export { FullscreenTool };