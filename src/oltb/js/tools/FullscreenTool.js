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
import {
    FullscreenEvents,
    FullscreenEventTypes,
    isFullScreenSupported,
    isFullScreen,
    requestFullScreen,
    requestFullScreenWithKeys,
    exitFullScreen
} from '../helpers/browser/Fullscreen';

const FILENAME = 'tools/FullscreenTool.js';
const CLASS_TOOL_BUTTON = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    onClick: undefined,
    onEnter: undefined,
    onLeave: undefined
});

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

        document.addEventListener(Events.browser.fullScreenChange, this.onFullScreenChange.bind(this));
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    // -------------------------------------------------------------------
    // # Section: Tool Control
    // -------------------------------------------------------------------

    onClickTool() {
        LogManager.logDebug(FILENAME, 'onClickTool', 'User clicked tool');

        // Note: Consumer callback
        if(this.options.onClick instanceof Function) {
            this.options.onClick();
        }

        this.momentaryActivation();
    }

    momentaryActivation() {
        if(!isFullScreenSupported()) {
            const errorMessage = 'Fullscreen is not supported by this browser';
            LogManager.logError(FILENAME, 'momentaryActivation', errorMessage);

            Toast.error({
                title: 'Error',
                message: errorMessage
            });
            
            return;
        }
        
        if(isFullScreen()) {
            exitFullScreen();
        }else {
            const map = this.getMap();
            if(!map) {
                return;
            }

            const element = map.getTargetElement();

            if(this.keys) {
                requestFullScreenWithKeys(element);
            }else {
                requestFullScreen(element);
            }
        }
    }

    // -------------------------------------------------------------------
    // # Section: Window/Document Events
    // -------------------------------------------------------------------

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.fullscreenTool)) {
            this.onClickTool(event);
        }
    }

    onFullScreenChange(event) {
        if(document.fullscreenElement) {
            this.button.getTippy().setContent(`Exit fullscreen (${ShortcutKeys.fullscreenTool})`);

            // Note: Consumer callback
            if(this.options.onEnter instanceof Function) {
                this.options.onEnter(event);
            }
        }else {
            this.button.getTippy().setContent(`Enter fullscreen (${ShortcutKeys.fullscreenTool})`);

            // Note: Consumer callback
            if(this.options.onLeave instanceof Function) {
                this.options.onLeave(event);
            }
        }
    }

    // -------------------------------------------------------------------
    // # Section: Tool Specific
    // -------------------------------------------------------------------

    getToolTippyContent() {
        return isFullScreen() 
            ? 'Exit fullscreen' 
            : 'Enter fullscreen';
    }

    getToolIcon() {
        return isFullScreen() 
            ? this.exitFullscreenIcon 
            : this.enterFullscreenIcon;
    }

    handleFullScreenChange() {
        const map = this.getMap();
        if(!map) {
            return;
        }

        if(isFullScreen()) {
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.exitFullscreenIcon);
            this.dispatchEvent(FullscreenEventTypes.enterFullScreen);
        }else {
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.enterFullscreenIcon);
            this.dispatchEvent(FullscreenEventTypes.leaveFullScreen);
        }

        map.updateSize();

        this.active = !this.active;
        this.button.classList.toggle(`${CLASS_TOOL_BUTTON}--active`);
    }

    setMap(map) {
        super.setMap(map);
        
        for(let i = 0, ii = FullscreenEvents.length; i < ii; ++i) {
            this.listenerKeys.push(listen(
                document, 
                FullscreenEvents[i], 
                this.handleFullScreenChange, 
                this
            ));
        }
    }
}

export { FullscreenTool };