import 'ol/ol.css';
import EventType from 'ol/events/EventType';
import StateManager from '../core/Managers/StateManager';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { isDarkTheme } from '../helpers/IsDarkTheme';

const LOCAL_STORAGE_NODE_NAME = 'theme';

class ThemeToggle extends Control {
    constructor(callbacksObj = {}) {
        super({
            element: toolbarElement
        });
        
        this.lightThemeIcon = getIcon({
            path: SVGPaths.LightOn,
            class: 'oltb-tool-button__icon'
        });

        this.darkThemeIcon = getIcon({
            path: SVGPaths.LightOff,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', isDarkTheme() ? 'Light theme' : 'Dark theme' + ' (T)');
        button.className = 'oltb-tool-button';
        button.innerHTML = isDarkTheme() ? this.lightThemeIcon : this.darkThemeIcon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.callbacksObj = callbacksObj;

        this.button = button;
        this.active = false;

        window.addEventListener('oltb.settings.cleared', this.clearTheme.bind(this));

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 't')) {
                this.handleClick(event);
            }
        });
    }

    handleClick(event) {
        event.preventDefault();
        this.handleThemeToggle();
    }

    clearTheme() {
        StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, 'light');
        toolbarElement.classList.remove('dark');
        document.body.classList.remove('oltb-dark');

        // Update toolbar icon
        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', this.darkThemeIcon);
        this.button._tippy.setContent('Dark theme (T)');
    }

    handleThemeToggle() {
        let theme = 'light';
        if(isDarkTheme()) {
            this.clearTheme();
        }else {
            theme = 'dark';

            StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, 'dark');
            toolbarElement.classList.add('dark');
            document.body.classList.add('oltb-dark');

            // Update toolbar icon
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.lightThemeIcon);
            this.button._tippy.setContent('Light theme (T)');
        }

        // User defined callback from constructor
        if(typeof this.callbacksObj.changed === 'function') {
            this.callbacksObj.changed(theme);
        }
    }
}

export default ThemeToggle;