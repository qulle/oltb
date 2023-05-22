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
const TOOL_BUTTON_CLASS = 'oltb-tool-button';

const DefaultOptions = Object.freeze({
    click: undefined,
    enter: undefined,
    leave: undefined
});

class FullscreenTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });

        this.enterFullscreenIcon = getIcon({
            path: SvgPaths.fullscreen.stroked,
            class: `${TOOL_BUTTON_CLASS}__icon`
        });

        this.exitFullscreenIcon = getIcon({
            path: SvgPaths.fullscreenExit.stroked,
            class: `${TOOL_BUTTON_CLASS}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: isFullScreen() ? this.exitFullscreenIcon : this.enterFullscreenIcon,
            class: TOOL_BUTTON_CLASS,
            attributes: {
                type: 'button',
                'data-tippy-content': `${(
                    isFullScreen() 
                        ? 'Exit fullscreen' 
                        : 'Enter fullscreen'
                )} (${ShortcutKeys.fullscreenTool})`
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

        document.addEventListener(Events.browser.fullScreenChange, this.onFullScreenChange.bind(this));
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.fullscreenTool)) {
            this.handleClick(event);
        }
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
            if(!Boolean(map)) {
                return;
            }

            const element = map.getTargetElement();

            if(Boolean(this.keys)) {
                requestFullScreenWithKeys(element);
            }else {
                requestFullScreen(element);
            }
        }
    }

    onFullScreenChange(event) {
        if(Boolean(document.fullscreenElement)) {
            this.button._tippy.setContent(`Exit fullscreen (${ShortcutKeys.fullscreenTool})`);

            // User defined callback from constructor
            if(this.options.enter instanceof Function) {
                this.options.enter(event);
            }
        }else {
            this.button._tippy.setContent(`Enter fullscreen (${ShortcutKeys.fullscreenTool})`);

            // User defined callback from constructor
            if(this.options.leave instanceof Function) {
                this.options.leave(event);
            }
        }
    }

    handleFullScreenChange() {
        const map = this.getMap();
        if(!Boolean(map)) {
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
        this.button.classList.toggle(`${TOOL_BUTTON_CLASS}--active`);
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