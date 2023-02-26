import { DOM } from '../helpers/browser/DOM';
import { Toast } from '../common/Toast';
import { EVENTS } from '../helpers/constants/Events';
import { listen } from 'ol/events';
import { Control } from 'ol/control';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import {
    FULL_SCREEN_EVENTS,
    FULL_SCREEN_EVENT_TYPE,
    isFullScreenSupported,
    isFullScreen,
    requestFullScreen,
    requestFullScreenWithKeys,
    exitFullScreen
} from '../helpers/browser/Fullscreen';

const FILENAME = 'tools/FullscreenTool.js';
const DEFAULT_OPTIONS = Object.freeze({});

class FullscreenTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });

        this.enterFullscreenIcon = getIcon({
            path: SVG_PATHS.Fullscreen.Stroked,
            class: 'oltb-tool-button__icon'
        });

        this.exitFullscreenIcon = getIcon({
            path: SVG_PATHS.FullscreenExit.Stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: isFullScreen() ? this.exitFullscreenIcon : this.enterFullscreenIcon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `${(
                    isFullScreen() 
                        ? 'Exit fullscreen' 
                        : 'Enter fullscreen'
                )} (${SHORTCUT_KEYS.FullScreen})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        document.addEventListener(EVENTS.Browser.FullScreenChange, this.onFullScreenChange.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.FullScreen)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }

        this.momentaryActivation();
    }

    momentaryActivation() {
        if(!isFullScreenSupported()) {
            Toast.error({
                title: 'Error',
                message: 'Fullscreen is not supported by this browser'
            });
            
            return;
        }
        
        if(isFullScreen()) {
            exitFullScreen();
        }else {
            let element = this.getMap().getTargetElement();

            if(this.keys) {
                requestFullScreenWithKeys(element);
            }else {
                requestFullScreen(element);
            }
        }
    }

    onFullScreenChange(event) {
        if(document.fullscreenElement) {
            this.button._tippy.setContent(`Exit fullscreen (${SHORTCUT_KEYS.FullScreen})`);

            // User defined callback from constructor
            if(typeof this.options.enter === 'function') {
                this.options.enter(event);
            }
        }else {
            this.button._tippy.setContent(`Enter fullscreen (${SHORTCUT_KEYS.FullScreen})`);

            // User defined callback from constructor
            if(typeof this.options.leave === 'function') {
                this.options.leave(event);
            }
        }
    }

    handleFullScreenChange() {
        if(isFullScreen()) {
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.exitFullscreenIcon);
            this.dispatchEvent(FULL_SCREEN_EVENT_TYPE.EnterFullScreen);
        }else {
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.enterFullscreenIcon);
            this.dispatchEvent(FULL_SCREEN_EVENT_TYPE.LeaveFullScreen);
        }

        this.getMap().updateSize();

        this.active = !this.active;
        this.button.classList.toggle('oltb-tool-button--active');
    }

    setMap(map) {
        super.setMap(map);
        
        for(let i = 0, ii = FULL_SCREEN_EVENTS.length; i < ii; ++i) {
            this.listenerKeys.push(listen(
                document, 
                FULL_SCREEN_EVENTS[i], 
                this.handleFullScreenChange, 
                this
            ));
        }
    }
}

export { FullscreenTool };