import { DOM } from '../helpers/browser/DOM';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../core/managers/LogManager';
import { isDarkTheme } from '../helpers/IsDarkTheme';
import { StateManager } from '../core/managers/StateManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { TOOLBAR_ELEMENT } from '../core/elements/index';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';

const FILENAME = 'tools/ThemeTool.js';
const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.ThemeTool;
const DEFAULT_OPTIONS = Object.freeze({});

class ThemeTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        this.lightThemeIcon = getIcon({
            path: SVG_PATHS.Sun.Stroked,
            class: 'oltb-tool-button__icon'
        });

        this.darkThemeIcon = getIcon({
            path: SVG_PATHS.MoonStars.Stroked,
            class: 'oltb-tool-button__icon'
        });
        
        const button = DOM.createElement({
            element: 'button',
            html: isDarkTheme() ? this.lightThemeIcon : this.darkThemeIcon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `${(
                    isDarkTheme() 
                        ? 'Light theme' 
                        : 'Dark theme'
                )} (${SHORTCUT_KEYS.ToolbarTheme})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        window.addEventListener(EVENTS.Custom.SettingsCleared, this.onWindowClearTheme.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.ToolbarTheme)) {
            this.handleClick(event);
        }
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');

        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        this.momentaryActivation();
    }

    momentaryActivation() {
        let theme = 'light';
        
        if(isDarkTheme()) {
            this.onWindowClearTheme();
        }else {
            theme = 'dark';

            StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, 'dark');
            TOOLBAR_ELEMENT.classList.add('dark');
            document.body.classList.add('oltb-dark');

            // Update toolbar icon
            this.button.removeChild(this.button.firstElementChild);
            this.button.insertAdjacentHTML('afterbegin', this.lightThemeIcon);
            this.button._tippy.setContent(`Light theme (${SHORTCUT_KEYS.ToolbarTheme})`);
        }

        // User defined callback from constructor
        if(typeof this.options.changed === 'function') {
            this.options.changed(theme);
        }
    }

    onWindowClearTheme() {
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, 'light');
        TOOLBAR_ELEMENT.classList.remove('dark');
        document.body.classList.remove('oltb-dark');

        // Update toolbar icon
        this.button.removeChild(this.button.firstElementChild);
        this.button.insertAdjacentHTML('afterbegin', this.darkThemeIcon);
        this.button._tippy.setContent(`Dark theme (${SHORTCUT_KEYS.ToolbarTheme})`);
    }
}

export { ThemeTool };