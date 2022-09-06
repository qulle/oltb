import 'ol/ol.css';
import StateManager from '../core/Managers/StateManager';
import DOM from '../helpers/Browser/DOM';
import { Control } from 'ol/control';
import { toolbarElement } from '../core/ElementReferences';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { isDarkTheme } from '../helpers/IsDarkTheme';

const LOCAL_STORAGE_NODE_NAME = 'theme';

const DEFAULT_OPTIONS = {};

class ThemeToggle extends Control {
    constructor(options = {}) {
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
        
        const button = DOM.createElement({
            element: 'button',
            html: isDarkTheme() ? this.lightThemeIcon : this.darkThemeIcon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': (isDarkTheme() ? 'Light theme' : 'Dark theme') + ' (T)'
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        window.addEventListener('oltb.settings.cleared', this.clearTheme.bind(this));
        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 't')) {
                this.handleClick(event);
            }
        });
    }

    handleClick() {
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
        if(typeof this.options.changed === 'function') {
            this.options.changed(theme);
        }
    }
}

export default ThemeToggle;