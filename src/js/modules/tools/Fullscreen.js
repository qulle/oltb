import Toast from '../common/Toast';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { listen } from 'ol/events';
import { TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { SHORTCUT_KEYS } from '../helpers/Constants/ShortcutKeys';
import { EVENTS } from '../helpers/Constants/Events';
import {
    FULL_SCREEN_EVENTS,
    FULL_SCREEN_EVENT_TYPE,
    isFullScreenSupported,
    isFullScreen,
    requestFullScreen,
    requestFullScreenWithKeys,
    exitFullScreen
} from '../helpers/Browser/Fullscreen';

const DEFAULT_OPTIONS = {};

class Fullscreen extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });

        this.enterFullscreenIcon = getIcon({
            path: SVG_PATHS.EnterFullScreen,
            class: 'oltb-tool-button__icon'
        });

        this.exitFullscreenIcon = getIcon({
            path: SVG_PATHS.ExitFullScreen,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: isFullScreen() ? this.exitFullscreenIcon : this.enterFullscreenIcon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': (isFullScreen() ? 'Exit fullscreen' : 'Enter fullscreen') + ` (${SHORTCUT_KEYS.FullScreen})`
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
        this.handleFullscreen();
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

    handleFullscreen() {
        if(!isFullScreenSupported()) {
            Toast.info({text: 'Fullscreen is not supported'});
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

export default Fullscreen;