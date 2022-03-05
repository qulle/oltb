import 'ol/ol.css';
import Toast from '../common/Toast';
import EventType from 'ol/events/EventType';
import { Control } from 'ol/control';
import { listen } from 'ol/events';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import {
    events,
    FullScreenEventType,
    isFullScreenSupported,
    isFullScreen,
    requestFullScreen,
    requestFullScreenWithKeys,
    exitFullScreen
} from '../helpers/Fullscreen';

class Fullscreen extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });

        this.enterFullscreenIcon = getIcon({
            path: SVGPaths.EnterFullScreen,
            class: 'oltb-tool-button__icon'
        });

        this.exitFullscreenIcon = getIcon({
            path: SVGPaths.ExitFullScreen,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', isFullScreen() ? 'Exit fullscreen' : 'Enter fullscreen' + ' (F)');
        button.className = 'oltb-tool-button';
        button.innerHTML = isFullScreen() ? this.exitFullscreenIcon : this.enterFullscreenIcon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);

        this.button = button;
        this.active = false;

        document.addEventListener('fullscreenchange', (event) => {
            if(document.fullscreenElement) {
                this.button._tippy.setContent('Exit fullscreen (F)');

                // User defined callback from constructor
                if(typeof options.enter === 'function') {
                    options.enter(event);
                }
            }else {
                this.button._tippy.setContent('Enter fullscreen (F)');

                // User defined callback from constructor
                if(typeof options.leave === 'function') {
                    options.leave(event);
                }
            }
        });

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'f')) {
                this.handleFullscreen();
            }
        });
    }

    handleClick(event) {
        event.preventDefault();
        this.handleFullscreen();
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
            this.dispatchEvent(FullScreenEventType.ENTERFULLSCREEN);
        }else {
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.enterFullscreenIcon);
            this.dispatchEvent(FullScreenEventType.LEAVEFULLSCREEN);
        }

        this.getMap().updateSize();

        this.active = !this.active;
        this.button.classList.toggle('oltb-tool-button--active');
    }

    setMap(map) {
        super.setMap(map);
        
        for(let i = 0, ii = events.length; i < ii; ++i) {
            this.listenerKeys.push(listen(
                document, 
                events[i], 
                this.handleFullScreenChange, 
                this
            ));
        }
    }
}

export default Fullscreen;